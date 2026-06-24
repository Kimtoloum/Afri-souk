"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronRight,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/shop/Navbar";
import { ProductCard } from "@/components/shop/ProductCard";
import { Badge, Button, Card, PriceTag, Skeleton, cn } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import type { Product, StockStatus, ApiResponse } from "@/types";

/* ── Helpers ──────────────────────────────────────────── */
function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return "out";
  if (stock <= 5) return "low";
  return "ok";
}

const stockBadge: Record<
  StockStatus,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  ok:  { label: "En stock",     variant: "success" },
  low: { label: "Stock faible", variant: "warning" },
  out: { label: "Rupture",      variant: "danger" },
};

const CATEGORY_EMOJI: Record<string, string> = {
  Artisanat:    "🪘",
  Mode:         "👗",
  Alimentation: "🌶️",
  Bijoux:       "💎",
  Déco:         "🏺",
};

/* ── Component ────────────────────────────────────────── */
export default function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setQty(1);
      setActiveImage(0);

      try {
        const res = await fetch(`/api/products/${id}`);
        const json: ApiResponse<Product> = await res.json();

        if (cancelled) return;

        if (!json.ok) {
          setNotFound(true);
          setProduct(null);
          return;
        }

        setProduct(json.data);

        // Produits similaires (même catégorie, hors produit courant)
        const relRes = await fetch(
          `/api/products?cat=${encodeURIComponent(json.data.category)}&limit=8`
        );
        const relJson: ApiResponse<Product[]> = await relRes.json();
        if (!cancelled && relJson.ok) {
          setRelated(relJson.data.filter((p) => p.id !== json.data.id).slice(0, 4));
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ── Loading state ───────────────────────────────────── */
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ── Not found state ─────────────────────────────────── */
  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-4xl mb-4">📦</p>
          <h1 className="font-display text-2xl text-[var(--text)] mb-2">
            Produit introuvable
          </h1>
          <p className="text-[var(--text-muted)] mb-6">
            Ce produit n'existe plus ou l'identifiant est incorrect.
          </p>
          <Button asChild>
            <Link href="/produits">
              <ArrowLeft className="w-4 h-4" />
              Retour au catalogue
            </Link>
          </Button>
        </main>
      </>
    );
  }

  const status = getStockStatus(product.stock);
  const { label, variant } = stockBadge[status];
  const images = product.images.length > 0 ? product.images : [];

  function handleAddToCart() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">

        {/* ── Breadcrumb ──────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--text-muted)] mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">
            Accueil
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link href="/produits" className="hover:text-[var(--text)] transition-colors">
            Catalogue
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link
            href={`/produits?cat=${product.category}`}
            className="hover:text-[var(--text)] transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-[var(--text)] truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">

          {/* ── Galerie ───────────────────────────────────── */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
              {images.length > 0 ? (
                <Image
                  src={images[activeImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="text-7xl select-none">
                  {CATEGORY_EMOJI[product.category] ?? "📦"}
                </span>
              )}
              <div className="absolute top-3 right-3">
                <Badge variant={variant}>{label}</Badge>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0",
                      i === activeImage
                        ? "border-primary-600"
                        : "border-[var(--border)] hover:border-primary-300"
                    )}
                  >
                    <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Infos produit ─────────────────────────────── */}
          <div className="space-y-5">
            <div>
              <Link
                href={`/produits?cat=${product.category}`}
                className="text-xs font-medium text-primary-600 hover:text-primary-500 uppercase tracking-wide"
              >
                {product.category}
              </Link>
              <h1 className="font-display text-2xl sm:text-3xl text-[var(--text)] mt-1 leading-tight">
                {product.name}
              </h1>
            </div>

            <PriceTag value={product.price} className="text-2xl" />

            <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>

            {/* Stock info */}
            {status !== "out" && (
              <p className="text-xs text-[var(--text-muted)]">
                {status === "low"
                  ? `Plus que ${product.stock} en stock — commande vite.`
                  : `${product.stock} unités disponibles.`}
              </p>
            )}

            {/* Quantité + ajout panier */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex items-center border border-[var(--border)] rounded-lg w-fit">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={status === "out"}
                  className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-40 transition-colors"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium text-[var(--text)] font-mono">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={status === "out" || qty >= product.stock}
                  className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-40 transition-colors"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1"
                disabled={status === "out"}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-4 h-4" />
                {status === "out"
                  ? "Indisponible"
                  : added
                  ? "Ajouté ✓"
                  : "Ajouter au panier"}
              </Button>
            </div>

            {/* Réassurance */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Truck className="w-4 h-4 text-primary-600 shrink-0" />
                Livraison sous 5–10 jours
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0" />
                Artisan vérifié
              </div>
            </div>
          </div>
        </div>

        {/* ── Produits similaires ─────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16 sm:mt-20">
            <h2 className="font-display text-2xl text-[var(--text)] mb-5">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
