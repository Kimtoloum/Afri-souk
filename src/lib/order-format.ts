// Helpers d'affichage partagés entre /commande/[id] et /mes-commandes,
// pour éviter que les deux pages divergent silencieusement dans le temps.

export const PAYMENT_LABELS: Record<string, string> = {
  wave: "Wave",
  flooz: "Flooz (Moov)",
  tmoney: "T-Money (Togocom)",
  airtel_money: "Airtel Money",
  carte_bancaire: "Carte bancaire",
  crypto: "Crypto",
  livraison: "À la livraison",
};

export const CITY_INFO: Record<string, { label: string; flag: string; days: string }> = {
  lome: { label: "Lomé", flag: "🇹🇬", days: "24–48h" },
  ndjamena: { label: "N'Djaména", flag: "🇹🇩", days: "3–5 jours" },
};

export const STATUS_CONFIG = {
  PENDING: { label: "En attente", variant: "warning" as const },
  PROCESSING: { label: "En préparation", variant: "default" as const },
  SHIPPED: { label: "En livraison", variant: "default" as const },
  DELIVERED: { label: "Livré", variant: "success" as const },
  CANCELLED: { label: "Annulé", variant: "danger" as const },
};

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " F CFA";
}
