import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiResponse, Product } from "@/types";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("cat") ?? undefined;
    const search   = searchParams.get("q")   ?? undefined;
    const page     = Number(searchParams.get("page")  ?? 1);
    const limit    = Number(searchParams.get("limit") ?? 24);

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { name:        { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({ ok: true, data: products as Product[] });
  } catch (err) {
    console.error("[products] GET error:", err);
    return NextResponse.json(
      { ok: false, error: "Impossible de récupérer les produits." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(
      { ok: true, data: product as Product },
      { status: 201 }
    );
  } catch (err) {
    console.error("[products] POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Impossible de créer le produit." },
      { status: 500 }
    );
  }
}