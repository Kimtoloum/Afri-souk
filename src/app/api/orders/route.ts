import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { ApiResponse, Order, CheckoutFormData } from "@/types";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Order>>> {
  try {
    const body: CheckoutFormData & { items: { productId: string; quantity: number }[] } =
      await req.json();

    const { customerName, customerEmail, customerPhone, address, city, paymentMethod, paymentPhone, items } = body;

    if (!items?.length) {
      return NextResponse.json({ ok: false, error: "Panier vide." }, { status: 400 });
    }

    // Récupère les produits pour calculer le total
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== items.length) {
      return NextResponse.json({ ok: false, error: "Certains produits sont introuvables." }, { status: 400 });
    }

    // Frais de livraison
    const deliveryFees: Record<string, number> = { lome: 1500, ndjamena: 3500 };
    const deliveryFee = deliveryFees[city] ?? 0;

    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    const total = subtotal + deliveryFee;

    // Crée la commande en base
    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        total,
        customerName,
        customerEmail,
        customerPhone,
        address,
        city,
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
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

    // Enregistre les ventes
    await prisma.sale.createMany({
      data: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        date: new Date(),
      })),
    });

    // Envoie email de confirmation (non bloquant)
    sendOrderConfirmationEmail({
      to: customerEmail,
      customerName,
      orderId: order.id,
      total,
      city,
      paymentMethod,
      items: order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
    }).catch(console.error);

    return NextResponse.json({ ok: true, data: order as unknown as Order }, { status: 201 });
  } catch (err) {
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
