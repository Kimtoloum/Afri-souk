"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button, cn } from "@/components/ui";
import { useCartStore } from "@/store/cart";

const CATEGORY_EMOJI: Record<string, string> = {
  Artisanat:    "🪘",
  Mode:         "👗",
  Alimentation: "🌶️",
  Bijoux:       "💎",
  Déco:         "🏺",
};

export function CartDrawer() {
  const isOpen      = useCartStore((s) => s.isOpen);
  const items       = useCartStore((s) => s.items);
  const closeCart   = useCartStore((s) => s.closeCart);
  const removeItem  = useCartStore((s) => s.removeItem);
  const updateQty   = useCartStore((s) => s.updateQty);
  const totalItems  = useCartStore((s) => s.totalItems());
  const totalPrice  = useCartStore((s) => s.totalPrice());

  // Empêche le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Ferme avec la touche Échap
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        className="relative w-full sm:w-[420px] h-full bg-[var(--bg)] flex flex-col animate-fade-in shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-display text-lg text-[var(--text)] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-600" />
            Panier
            {totalItems > 0 && (
              <span className="text-sm font-mono text-[var(--text-muted)]">
                ({totalItems})
              </span>
            )}
          </h2>
          <Button variant="ghost" size="icon" onClick={closeCart} aria-label="Fermer le panier">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="stripe-band" aria-hidden="true" />

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
            <p className="text-5xl">🛍️</p>
            <p className="text-[var(--text)] font-medium">Ton panier est vide</p>
            <p className="text-sm text-[var(--text-muted)] max-w-xs">
              Découvre l'artisanat et les saveurs d'Afrique dans notre catalogue.
            </p>
            <Button className="mt-2" onClick={closeCart} asChild>
              <Link href="/produits">Explorer le catalogue</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
                >
                  {/* Image / emoji */}
                  <Link
                    href={`/produit/${product.id}`}
                    onClick={closeCart}
                    className="relative w-16 h-16 shrink-0 rounded-lg bg-[var(--surface)] border border-[var(--border)] overflow-hidden flex items-center justify-center"
                  >
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-2xl select-none">
                        {CATEGORY_EMOJI[product.category] ?? "📦"}
                      </span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produit/${product.id}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-[var(--text)] hover:text-primary-600 transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="font-mono text-xs text-primary-600 mt-0.5">
                      {new Intl.NumberFormat("fr-FR").format(product.price)} FCFA
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantité */}
                      <div className="flex items-center border border-[var(--border)] rounded-md">
                        <button
                          onClick={() => updateQty(product.id, quantity - 1)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                          aria-label="Diminuer la quantité"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-mono text-[var(--text)]">
                          {quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(
                              product.id,
                              Math.min(product.stock, quantity + 1)
                            )
                          }
                          disabled={quantity >= product.stock}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 transition-colors"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Supprimer */}
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-[var(--text-muted)] hover:text-ai-danger transition-colors p-1"
                        aria-label={`Retirer ${product.name} du panier`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-[var(--border)] px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">Sous-total</span>
                <span className="font-mono font-semibold text-[var(--text)]">
                  {new Intl.NumberFormat("fr-FR").format(totalPrice)} FCFA
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Frais de livraison calculés à l'étape suivante.
              </p>
              <Button size="lg" className="w-full" asChild onClick={closeCart}>
                <Link href="/checkout">
                  Passer la commande
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
