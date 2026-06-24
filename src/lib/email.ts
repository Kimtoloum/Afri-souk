/**
 * lib/email.ts — Afri-Souk
 *
 * Utilise Resend (gratuit jusqu'à 3000 emails/mois).
 * Installation : npm install resend
 * Puis ajoute dans .env : RESEND_API_KEY=re_xxxxx
 *
 * Pour créer un compte gratuit : https://resend.com
 */

interface OrderEmailParams {
  to: string;
  customerName: string;
  orderId: string;
  total: number;
  city: string;
  paymentMethod: string;
  items: { name: string; price: number; quantity: number }[];
}

const CITY_INFO: Record<string, { label: string; flag: string; days: string }> = {
  lome:     { label: "Lomé",      flag: "🇹🇬", days: "24–48h" },
  ndjamena: { label: "N'Djaména", flag: "🇹🇩", days: "3–5 jours" },
};

const PAYMENT_LABELS: Record<string, string> = {
  wave:           "Wave",
  flooz:          "Flooz (Moov)",
  tmoney:         "T-Money (Togocom)",
  airtel_money:   "Airtel Money",
  carte_bancaire: "Carte bancaire",
  crypto:         "Crypto",
  livraison:      "Paiement à la livraison",
};

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " F CFA";
}

function buildEmailHTML(params: OrderEmailParams): string {
  const { customerName, orderId, total, city, paymentMethod, items } = params;
  const cityInfo = CITY_INFO[city] ?? { label: city, flag: "📍", days: "À confirmer" };
  const paymentLabel = PAYMENT_LABELS[paymentMethod] ?? paymentMethod;
  const shortId = orderId.slice(-8).toUpperCase();

  const itemsHTML = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6B7280;text-align:center;">×${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#4F46E5;text-align:right;font-weight:500;">${formatFCFA(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">

        <!-- Header -->
        <tr>
          <td style="background:#4F46E5;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-flex;align-items:center;gap:10px;">
                    <div style="width:32px;height:32px;background:rgba(255,255,255,0.2);border-radius:8px;display:inline-block;text-align:center;line-height:32px;font-weight:700;color:#fff;font-size:13px;">AS</div>
                    <span style="color:#fff;font-size:18px;font-weight:600;margin-left:10px;">Afri-Souk</span>
                  </div>
                </td>
                <td align="right">
                  <span style="color:rgba(255,255,255,0.7);font-size:12px;">Commande #${shortId}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">

            <p style="font-size:22px;font-weight:600;color:#111827;margin:0 0 8px;">Merci ${customerName} ! 🎉</p>
            <p style="font-size:15px;color:#6B7280;margin:0 0 28px;line-height:1.6;">
              Votre commande a bien été reçue. Nous vous contacterons dès qu'elle sera prête pour la livraison.
            </p>

            <!-- Delivery info -->
            <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="font-size:12px;font-weight:500;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Livraison</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:14px;color:#111827;">${cityInfo.flag} ${cityInfo.label}</td>
                  <td align="right" style="font-size:14px;color:#6B7280;">Délai estimé : ${cityInfo.days}</td>
                </tr>
              </table>
            </div>

            <!-- Payment info -->
            <div style="background:#EEF2FF;border-radius:8px;padding:16px;margin-bottom:24px;">
              <p style="font-size:12px;font-weight:500;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Mode de paiement</p>
              <p style="font-size:14px;color:#3730A3;font-weight:500;margin:0;">${paymentLabel}</p>
              ${paymentMethod === "livraison" ? '<p style="font-size:12px;color:#6B7280;margin:4px 0 0;">Le paiement s\'effectuera à la réception de votre commande.</p>' : ""}
            </div>

            <!-- Items -->
            <p style="font-size:12px;font-weight:500;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Récapitulatif</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              ${itemsHTML}
            </table>

            <!-- Total -->
            <div style="border-top:2px solid #4F46E5;padding-top:16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:16px;font-weight:600;color:#111827;">Total</td>
                  <td align="right" style="font-size:20px;font-weight:700;color:#4F46E5;">${formatFCFA(total)}</td>
                </tr>
              </table>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:20px 32px;border-top:1px solid #E5E7EB;">
            <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center;line-height:1.6;">
              Des questions ? Contactez-nous à <a href="mailto:support@afri-souk.com" style="color:#4F46E5;">support@afri-souk.com</a><br>
              © 2025 Afri-Souk — Le marché africain en ligne
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(
  params: OrderEmailParams
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY manquant — email non envoyé (mode dev)");
    console.log("[email] Destinataire:", params.to);
    console.log("[email] Commande #", params.orderId.slice(-8).toUpperCase());
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Afri-Souk <noreply@afri-souk.com>",
    to: params.to,
    subject: `Confirmation de commande #${params.orderId.slice(-8).toUpperCase()} — Afri-Souk`,
    html: buildEmailHTML(params),
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }

  console.log("[email] Confirmation envoyée à", params.to);
}
