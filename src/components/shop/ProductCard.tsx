"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge, Button, Card, PriceTag, cn } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import type { Product, StockStatus } from "@/types";

/* ── Stock helpers ────────────────────────────────────── */
function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return "out";
  if (stock <= 5) return "low";
  return "ok";
}

const stockBadge: Record<
  StockStatus,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  ok:  { label: "En stock",  variant: "success" },
  low: { label: "Stock faible", variant: "warning" },
  out: { label: "Rupture",   variant: "danger" },
};

/* ── Category emoji ───────────────────────────────────── */
const CATEGORY_EMOJI: Record<string, string> = {
  Artisanat:    "🪘",
  Mode:         "👗",
  Alimentation: "🌶️",
  Bijoux:       "💎",
  Déco:         "🏺",
};

/* ── Component ────────────────────────────────────────── */
interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const status = getStockStatus(product.stock);
  const { label, variant } = stockBadge[status];

  return (
    <Card
      className={cn(
        "group overflow-hidden hover:shadow-card-hover hover:-translate-y-1 hover:border-primary-200",
        className
      )}
    >
      {/* Image / emoji placeholder */}
      <Link href={`/produit/${product.id}`} className="block">
        <div className="relative aspect-[4/3] bg-[var(--surface)] flex items-center justify-center overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-5xl select-none">
              {CATEGORY_EMOJI[product.category] ?? "📦"}
            </span>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={variant}>{label}</Badge>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-0.5">
            {product.category}
          </p>
          <Link href={`/produit/${product.id}`}>
            <h3 className="font-medium text-sm sm:text-base text-[var(--text)] hover:text-primary-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2">
          <PriceTag value={product.price} />
          <Button
            size="sm"
            variant={status === "out" ? "secondary" : "primary"}
            disabled={status === "out"}
            onClick={() => addItem(product)}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {status === "out" ? "Indisponible" : "Ajouter"}
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
