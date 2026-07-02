import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, Order } from "@/types";

/**
 * Limiteur de tentatives très simple, en mémoire, pour ralentir les essais
 * automatisés de numéros de commande sur /mes-commandes (pas de compte
 * client = pas de session pour s'appuyer dessus).
 *
 * Limite connue : ce compteur est local à l'instance du process. Sur un
 * déploiement multi-instances ou serverless, il ne protège que
 * partiellement. Suffisant pour le MVP ; à remplacer par un store partagé
 * (Redis, Upstash…) si le trafic ou les abus le justifient.
 */
const ATTEMPTS_WINDOW_MS = 60_000;
const MAX_ATTEMPTS_PER_WINDOW = 10;
const attemptsByIp = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attemptsByIp.get(ip);

  if (!entry || now - entry.windowStart > ATTEMPTS_WINDOW_MS) {
    attemptsByIp.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS_PER_WINDOW;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Trop de tentatives. Réessayez dans une minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const orderNumber = typeof body?.orderNumber === "string" ? body.orderNumber.trim().toUpperCase() : "";

    if (!email || !orderNumber) {
      return NextResponse.json(
        { ok: false, error: "Email et numéro de commande requis." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    // Message volontairement générique (que ce soit le numéro ou l'email qui
    // ne correspond pas) pour ne pas laisser deviner qu'un numéro de
    // commande existe en base par essais successifs.
    if (!order || order.customerEmail.toLowerCase() !== email) {
      return NextResponse.json(
        { ok: false, error: "Aucune commande trouvée avec cet email et ce numéro de commande." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: order as unknown as Order });
  } catch (err) {
    console.error("[orders/lookup] POST error:", err);
    return NextResponse.json({ ok: false, error: "Impossible de rechercher la commande." }, { status: 500 });
  }
}
