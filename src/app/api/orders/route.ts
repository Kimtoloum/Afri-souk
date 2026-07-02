import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { generateOrderNumber } from "@/lib/order-number";
import type { ApiResponse, Order, CheckoutFormData } from "@/types";

/** Erreur métier avec un statut HTTP explicite, distincte des erreurs techniques. */
class OrderError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const body: CheckoutFormData & { items: { productId: string; quantity: number }[] } =
      await req.json();

    const { customerName, customerEmail, customerPhone, address, city, paymentMethod, paymentPhone, items } = body;

    // ── Cas limite : panier vide ────────────────────────────
    if (!items?.length) {
      return NextResponse.json({ ok: false, error: "Panier vide." }, { status: 400 });
    }

    // Regroupe les lignes en double par sécurité (ex: appel API rejoué ou
    // manipulé côté client) pour ne jamais décrémenter deux fois le même id.
    const quantitiesByProductId = new Map<string, number>();
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { ok: false, error: "Ligne de panier invalide." },
          { status: 400 }
        );
      }
      quantitiesByProductId.set(
        item.productId,
        (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity
      );
    }
    const mergedItems = Array.from(quantitiesByProductId.entries()).map(
      ([productId, quantity]) => ({ productId, quantity })
    );

    // Frais de livraison
    const deliveryFees: Record<string, number> = { lome: 1500, ndjamena: 3500 };
    const deliveryFee = deliveryFees[city] ?? 0;

    const order = await prisma.$transaction(
      async (tx) => {
        const products = await tx.product.findMany({
          where: { id: { in: mergedItems.map((i) => i.productId) } },
        });
        const productById = new Map(products.map((p) => [p.id, p]));

        // ── Cas limite : produit devenu indisponible (supprimé) ──
        const missing = mergedItems.filter((i) => !productById.has(i.productId));
        if (missing.length > 0) {
          throw new OrderError(
            "Un ou plusieurs produits de votre panier ne sont plus disponibles. Merci de retourner à votre panier.",
            409
          );
        }

        // ── Décrément atomique du stock ──────────────────────
        // UPDATE conditionné sur stock >= quantité demandée : sous Postgres,
        // cette instruction est atomique au niveau de la ligne. Deux
        // commandes concurrentes sur le même produit ne peuvent donc jamais
        // survendre le stock, même sans verrou explicite.
        for (const item of mergedItems) {
          const result = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });

          if (result.count === 0) {
            const product = productById.get(item.productId)!;
            // ── Cas limite : produit épuisé (stock = 0) ──────
            if (product.stock <= 0) {
              throw new OrderError(`"${product.name}" n'est plus en stock.`, 409);
            }
            // ── Cas limite : quantité demandée > stock disponible ──
            throw new OrderError(
              `Stock insuffisant pour "${product.name}" (disponible : ${product.stock}, demandé : ${item.quantity}).`,
              409
            );
          }
        }

        const subtotal = mergedItems.reduce((sum, item) => {
          const product = productById.get(item.productId)!;
          return sum + product.price * item.quantity;
        }, 0);
        const total = subtotal + deliveryFee;

        const orderNumber = await generateOrderNumber(tx);

        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            status: "PENDING",
            total,
            customerName,
            customerEmail,
            customerPhone,
            address,
            city,
            paymentMethod,
            items: {
              create: mergedItems.map((item) => {
                const product = productById.get(item.productId)!;
                return {
                  productId: item.productId,
                  name: product.name,
                  price: product.price,
                  quantity: item.quantity,
                };
              }),
            },
          },
          include: { items: true },
        });

        await tx.sale.createMany({
          data: mergedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            date: new Date(),
          })),
        });

        return createdOrder;
      },
      { timeout: 10_000 } // marge pour un panier avec plusieurs articles
    );

    // Envoie email de confirmation (non bloquant)
    sendOrderConfirmationEmail({
      to: customerEmail,
      customerName,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      city,
      paymentMethod,
      items: order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
    }).catch(console.error);

    return NextResponse.json({ ok: true, data: order as unknown as Order }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
    }
    console.error("[orders] POST error:", err);
    return NextResponse.json({ ok: false, error: "Impossible de créer la commande." }, { status: 500 });
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Order[]>>> {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const orders = await prisma.order.findMany({
      where: status ? { status: status as Order["status"] } : undefined,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ ok: true, data: orders as unknown as Order[] });
  } catch (err) {
    console.error("[orders] GET error:", err);
    return NextResponse.json({ ok: false, error: "Impossible de récupérer les commandes." }, { status: 500 });
  }
}
