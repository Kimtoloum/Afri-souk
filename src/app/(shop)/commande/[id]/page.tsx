import Link from "next/link";
import { CheckCircle, Package, Mail, MapPin, CreditCard, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, Badge } from "@/components/ui";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PAYMENT_LABELS, CITY_INFO, STATUS_CONFIG, formatFCFA } from "@/lib/order-format";

export const metadata: Metadata = { title: "Commande confirmée" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  const cityInfo = CITY_INFO[order.city] ?? { label: order.city, flag: "📍", days: "À confirmer" };
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D1FAE5] mb-5">
            <CheckCircle className="w-8 h-8 text-[#10B981]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text)] mb-2">
            Commande confirmée !
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Merci <strong className="text-[var(--text)]">{order.customerName}</strong> — votre commande <strong className="text-[var(--text)]">{order.orderNumber}</strong> a bien été reçue.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Un email de confirmation a été envoyé à {order.customerEmail}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Réf. technique : {order.id}
          </p>
        </div>

        <div className="flex flex-col gap-4">

          {/* Statut */}
          <Card>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text)]">Statut de la commande</span>
              </div>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </CardContent>
          </Card>

          {/* Infos livraison */}
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

          {/* Paiement */}
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

          {/* Articles */}
          <Card>
            <CardContent>
              <h2 className="text-sm font-medium text-[var(--text)] mb-4">
                Articles commandés
              </h2>
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

          {/* Email */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)]">
            <Mail className="w-4 h-4 shrink-0" />
            Confirmation envoyée à <strong className="text-[var(--text)]">{order.customerEmail}</strong>
          </div>

          {/* Suivi de commande */}
          <p className="text-center text-xs text-[var(--text-muted)]">
            Retrouvez cette commande à tout moment sur{" "}
            <Link href="/mes-commandes" className="text-primary-600 hover:underline">
              Mes commandes
            </Link>{" "}
            avec votre email et le numéro {order.orderNumber}.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/produits"
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            >
              Continuer mes achats
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 h-10 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors"
            >
              Retour à l'accueil <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
