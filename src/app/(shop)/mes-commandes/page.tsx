"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search, Package, MapPin, CreditCard } from "lucide-react";
import { Button, Card, CardContent, Badge, cn } from "@/components/ui";
import type { Order } from "@/types";
import { PAYMENT_LABELS, CITY_INFO, STATUS_CONFIG, formatFCFA } from "@/lib/order-format";

const schema = z.object({
  email: z.string().email("Email invalide"),
  orderNumber: z.string().min(1, "Numéro de commande requis"),
});

type FormData = z.infer<typeof schema>;

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--text)]">{label}</label>
      {children}
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

function Input({ error, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border px-3 text-sm bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1",
        error ? "border-[#EF4444]" : "border-[var(--border)] hover:border-[var(--text-muted)]",
        className
      )}
      {...props}
    />
  );
}

export default function MesCommandesPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsSearching(true);
    setSearchError(null);
    setOrder(null);

    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!json.ok) {
        setSearchError(json.error ?? "Aucune commande trouvée.");
        return;
      }

      setOrder(json.data as Order);
    } catch {
      setSearchError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsSearching(false);
    }
  };

  const cityInfo = order ? CITY_INFO[order.city] ?? { label: order.city, flag: "📍", days: "À confirmer" } : null;
  const statusConfig = order ? STATUS_CONFIG[order.status] : null;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

        <div className="mb-8 text-center">
          <p className="text-xs text-[var(--text-muted)] mb-1">Afri-Souk</p>
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">Mes commandes</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Retrouvez le statut de votre commande avec votre email et son numéro (ex: AS-2026-0001).
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4 mb-6"
        >
          <Field label="Email" error={errors.email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="aicha@example.com"
              error={!!errors.email}
            />
          </Field>

          <Field label="Numéro de commande" error={errors.orderNumber?.message}>
            <Input
              {...register("orderNumber")}
              placeholder="AS-2026-0001"
              error={!!errors.orderNumber}
              className="uppercase placeholder:normal-case"
            />
          </Field>

          {searchError && (
            <div className="rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] px-4 py-3 text-sm text-[#991B1B]">
              {searchError}
            </div>
          )}

          <Button type="submit" size="lg" disabled={isSearching} className="w-full">
            {isSearching ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Recherche…</>
            ) : (
              <><Search className="w-4 h-4" /> Retrouver ma commande</>
            )}
          </Button>
        </form>

        {order && cityInfo && statusConfig && (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Commande <strong className="text-[var(--text)]">{order.orderNumber}</strong>
              </p>
            </div>

            <Card>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text)]">Statut de la commande</span>
                </div>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text)]">Livraison</span>
                </div>
                <div className="text-sm text-[var(--text-muted)] flex flex-col gap-1">
                  <span>{cityInfo.flag} {cityInfo.label} — {cityInfo.days}</span>
                  <span>{order.address}</span>
                  <span>{order.customerPhone}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-[var(--text-muted)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text)]">
                    {(order.paymentMethod && PAYMENT_LABELS[order.paymentMethod]) ?? "Paiement"}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {order.status === "PENDING" ? "En attente de confirmation" : "Confirmé"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h2 className="text-sm font-medium text-[var(--text)] mb-4">Articles commandés</h2>
                <div className="flex flex-col gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div>
                        <p className="text-[var(--text)]">{item.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">× {item.quantity}</p>
                      </div>
                      <span className="text-primary-600 font-medium shrink-0 ml-4">
                        {formatFCFA(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--border)] mt-4 pt-4 flex justify-between items-center">
                  <span className="font-medium text-[var(--text)]">Total</span>
                  <span className="text-lg font-semibold text-primary-600">
                    {formatFCFA(order.total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
