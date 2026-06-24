import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, Product } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Produit introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: product as Product });
  } catch (err) {
    console.error("[products/[id]] GET error:", err);
    return NextResponse.json(
      { ok: false, error: "Impossible de récupérer le produit." },
      { status: 500 }
    );
  }
}
