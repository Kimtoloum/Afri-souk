"use client";

import { useEffect, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ChevronDown } from "lucide-react";
import { Button, cn } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { PaymentSelector } from "@/components/checkout/PaymentSelector";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { DELIVERY_ZONES, PAYMENT_METHODS, type DeliveryCity, type PaymentMethod } from "@/types";

/* ── Validation schema ────────────────────────────────── */
const schema = z
  .object({
    customerName:  z.string().min(2, "Nom requis (min 2 caractères)"),
    customerEmail: z.string().email("Email invalide"),
    customerPhone: z.string().min(8, "Numéro de téléphone invalide"),
    address:       z.string().min(5, "Adresse requise"),
    city: z.string().min(2, "Veuillez saisir votre ville"),
    paymentMethod: z.enum(
      ["wave", "flooz", "tmoney", "airtel_money", "carte_bancaire", "crypto", "livraison"],
      { required_error: "Choisissez un mode de paiement" }
    ),
    paymentPhone: z.string().optional(),
  })
  .refine(
    (data) => {
      const method = PAYMENT_METHODS.find((m) => m.id === data.paymentMethod);
      if (method?.requiresPhone && !data.paymentPhone) return false;
      return true;
    },
    { message: "Numéro mobile money requis", path: ["paymentPhone"] }
  );

type FormData = z.infer<typeof schema>;

/* ── Field component ──────────────────────────────────── */
function Field({
  label, error, required, children,
}: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--text)]">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

import { forwardRef } from "react";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border px-3 text-sm bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1",
        error ? "border-[#EF4444]" : "border-[var(--border)] hover:border-[var(--text-muted)]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }>(
  ({ error, className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border px-3 pr-9 text-sm bg-[var(--bg)] text-[var(--text)] transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1",
          error ? "border-[#EF4444]" : "border-[var(--border)] hover:border-[var(--text-muted)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
    </div>
  )
);
Select.displayName = "Select";

/* ── Page ─────────────────────────────────────────────── */
export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedCity = watch("city") as DeliveryCity | undefined;
  const selectedPayment = watch("paymentMethod") as PaymentMethod | undefined;
  const selectedPaymentConfig = PAYMENT_METHODS.find((m) => m.id === selectedPayment);

  // Redirige si panier vide
  useEffect(() => {
    if (items.length === 0) router.push("/produits");
  }, [items, router]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });

      const json = await res.json();

      if (!json.ok) throw new Error(json.error);

      clearCart();
      router.push(`/commande/${json.data.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-[var(--text-muted)] mb-1">Afri-Souk</p>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Finaliser la commande</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

            {/* ── Formulaire gauche ───────────────────── */}
            <div className="flex flex-col gap-6">

              {/* Infos personnelles */}
              <section className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4">
                <h2 className="font-medium text-[var(--text)] text-sm">Vos informations</h2>

                <Field label="Nom complet" error={errors.customerName?.message} required>
                  <Input
                    {...register("customerName")}
                    placeholder="Aïcha Koné"
                    error={!!errors.customerName}
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email" error={errors.customerEmail?.message} required>
                    <Input
                      {...register("customerEmail")}
                      type="email"
                      placeholder="aicha@example.com"
                      error={!!errors.customerEmail}
                    />
                  </Field>
                  <Field label="Téléphone" error={errors.customerPhone?.message} required>
                    <Input
                      {...register("customerPhone")}
                      type="tel"
                      placeholder="+228 90 00 00 00"
                      error={!!errors.customerPhone}
                    />
                  </Field>
                </div>
              </section>

              {/* Livraison */}
              <section className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4">
                <h2 className="font-medium text-[var(--text)] text-sm">Adresse de livraison</h2>

               <Field label="Ville" error={errors.city?.message} required>
                  <Input
                    {...register("city")}
                    placeholder="Ex : Lomé"
                    error={!!errors.city}
                  />
                </Field>

                <Field label="Adresse complète" error={errors.address?.message} required>
                  <Input
                    {...register("address")}
                    placeholder="12 Rue des Tisserands, Quartier Kodjoviakopé"
                    error={!!errors.address}
                  />
                </Field>
              </section>

              {/* Paiement */}
              <section className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4">
                <h2 className="font-medium text-[var(--text)] text-sm">Mode de paiement</h2>

                <PaymentSelector
                  value={selectedPayment ?? ""}
                  onChange={(m) => setValue("paymentMethod", m, { shouldValidate: true })}
                  error={errors.paymentMethod?.message}
                />

                {/* Numéro mobile money */}
                {selectedPaymentConfig?.requiresPhone && (
                  <Field
                    label={`Numéro ${selectedPaymentConfig.label}`}
                    error={errors.paymentPhone?.message}
                    required
                  >
                    <Input
                      {...register("paymentPhone")}
                      type="tel"
                      placeholder="+228 90 00 00 00"
                      error={!!errors.paymentPhone}
                    />
                  </Field>
                )}

                {/* Info crypto */}
                {selectedPayment === "crypto" && (
                  <div className="text-xs text-[var(--text-muted)] bg-[var(--surface)] rounded-lg p-3">
                    Les instructions de paiement crypto seront envoyées par email après confirmation de la commande.
                  </div>
                )}
              </section>

              {/* Erreur submit */}
              {submitError && (
                <div className="rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] px-4 py-3 text-sm text-[#991B1B]">
                  {submitError}
                </div>
              )}

              {/* Bouton */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Traitement en cours…</>
                ) : (
                  "Confirmer la commande"
                )}
              </Button>
            </div>

            {/* ── Résumé droite ───────────────────────── */}
            <div className="lg:sticky lg:top-24">
              <OrderSummary items={items} city={selectedCity ?? ""} />
            </div>

          </div>
        </form>
      </div>
    </main>
  );
}
