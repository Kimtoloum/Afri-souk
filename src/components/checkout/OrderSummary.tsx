"use client";

import { Card, CardContent, PriceTag } from "@/components/ui";
import { DELIVERY_ZONES, type CartItem, type DeliveryCity } from "@/types";

interface OrderSummaryProps {
  items: CartItem[];
  city: DeliveryCity | "";
}

export function OrderSummary({ items, city }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const zone = DELIVERY_ZONES.find((z) => z.id === city);
  const deliveryFee = zone?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  return (
    <Card>
      <CardContent>
        <h2 className="font-medium text-[var(--text)] mb-4 text-sm">
          Récapitulatif
        </h2>

        {/* Items */}
        <div className="flex flex-col gap-3 mb-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-start gap-3">
              {/* Image ou emoji */}
              <div className="w-12 h-12 rounded-lg bg-[var(--surface)] flex items-center justify-center text-lg shrink-0 overflow-hidden border border-[var(--border)]">
                {item.product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{getCategoryEmoji(item.product.category)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text)] font-medium line-clamp-1">
                  {item.product.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">× {item.quantity}</p>
              </div>

              <PriceTag
                value={item.product.price * item.quantity}
                className="text-sm shrink-0"
              />
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">Sous-total</span>
            <PriceTag value={subtotal} className="text-sm" />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">
              Livraison {zone ? `— ${zone.flag} ${zone.label}` : ""}
            </span>
            {deliveryFee > 0 ? (
              <PriceTag value={deliveryFee} className="text-sm" />
            ) : (
              <span className="text-sm text-[var(--text-muted)]">
                {city ? "—" : "Choisir une ville"}
              </span>
            )}
          </div>

          {zone && (
            <p className="text-xs text-[var(--text-muted)]">
              Délai estimé : {zone.estimatedDays}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-[var(--border)] mt-3 pt-3 flex justify-between items-center">
          <span className="font-medium text-[var(--text)]">Total</span>
          <PriceTag value={total} className="text-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Artisanat: "🪘", Mode: "👗", Alimentation: "🌶️", Bijoux: "💎", Déco: "🏺",
  };
  return map[category] ?? "📦";
}
