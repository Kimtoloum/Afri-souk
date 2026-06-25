/**
 * Session admin minimaliste pour un MVP mono-utilisateur.
 *
 * Principe : pas de base d'utilisateurs — un seul mot de passe admin
 * défini en variable d'environnement (ADMIN_PASSWORD). À la connexion,
 * on pose un cookie httpOnly contenant un token signé par HMAC avec
 * ADMIN_SESSION_SECRET. Le middleware vérifie la signature à chaque
 * requête vers /dashboard — impossible à falsifier sans connaître le secret.
 *
 * Implémenté avec la Web Crypto API (et non le module `crypto` de Node)
 * car le middleware Next.js tourne par défaut sur le runtime Edge, qui ne
 * supporte pas `node:crypto`. Web Crypto fonctionne dans les deux runtimes.
 *
 * Pour un vrai multi-admin avec rôles, migrer vers NextAuth + table User.
 */

const COOKIE_NAME = "afri_souk_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET manquant dans .env — génère-en un avec `openssl rand -hex 32`."
    );
  }
  return secret;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSecret();
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(payload: string): Promise<string> {
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return toHex(signature);
}

/** Construit la valeur de cookie : "expiry.signature" */
export async function createSessionToken(): Promise<string> {
  const expiry = (Date.now() + SESSION_DURATION_MS).toString();
  const signature = await sign(expiry);
  return `${expiry}.${signature}`;
}

/** Vérifie un token de session : expiration + signature valide */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (!expiry || !signature) return false;

  if (Date.now() > Number(expiry)) return false; // expiré

  const expectedSignature = await sign(expiry);

  // Comparaison à temps constant (évite les attaques de timing)
  if (signature.length !== expectedSignature.length) return false;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyPassword(input: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD manquant dans .env");
  }
  if (input.length !== adminPassword.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ adminPassword.charCodeAt(i);
  }
  return diff === 0;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;
