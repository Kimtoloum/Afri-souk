import type { Prisma } from "@prisma/client";

/**
 * Génère un numéro de commande lisible et unique, ex: "AS-2026-0001".
 *
 * Doit être appelé À L'INTÉRIEUR d'une transaction Prisma (le paramètre `tx`
 * est le client de transaction, pas `prisma` directement), pour que
 * l'incrémentation du compteur soit annulée si le reste de la commande échoue
 * (ex: rupture de stock détectée juste après).
 *
 * Concurrence : on utilise un INSERT ... ON CONFLICT DO UPDATE ... RETURNING
 * en SQL brut plutôt qu'un "lire le compteur puis écrire +1" en deux temps.
 * Postgres verrouille la ligne du compteur pendant l'opération, donc deux
 * commandes créées en même temps ne peuvent jamais recevoir le même numéro,
 * même sous forte charge.
 */
export async function generateOrderNumber(
  tx: Prisma.TransactionClient,
  date: Date = new Date()
): Promise<string> {
  const year = date.getFullYear();

  const rows = await tx.$queryRaw<{ lastValue: number }[]>`
    INSERT INTO "OrderSequence" ("year", "lastValue")
    VALUES (${year}, 1)
    ON CONFLICT ("year")
    DO UPDATE SET "lastValue" = "OrderSequence"."lastValue" + 1
    RETURNING "lastValue"
  `;

  const sequence = rows[0]?.lastValue;

  if (!sequence) {
    // Ne devrait jamais arriver (RETURNING garantit une ligne), mais on
    // évite de générer un numéro invalide type "AS-2026-undefined".
    throw new Error("Impossible de générer le numéro de commande.");
  }

  const padded = String(sequence).padStart(4, "0");
  return `AS-${year}-${padded}`;
}
