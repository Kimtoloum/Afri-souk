import { Brain, TrendingUp, Package, ShoppingBag, Users } from "lucide-react";
import { Card, CardHeader, CardContent, Badge } from "@/components/ui";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CategoryPredictionPanel } from "@/components/dashboard/CategoryPredictionPanel";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { generatePredictionReport } from "@/lib/predictions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard IA" };
export const dynamic = "force-dynamic";

/* ── Metric card ──────────────────────────────────────── */
function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaPositive,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <div className="rounded-lg bg-primary-100 dark:bg-primary-900/30 p-2.5">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
          <p className="text-2xl font-semibold text-[var(--text)]">{value}</p>
          {delta && (
            <p
              className={`text-xs mt-0.5 ${
                deltaPositive ? "text-[#10B981]" : "text-[#EF4444]"
              }`}
            >
              {delta}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Page ─────────────────────────────────────────────── */
export default async function DashboardPage() {
  const report = await generatePredictionReport();

  const criticalAlerts = report.stockAlerts.filter(
    (a) => a.severity === "critical"
  ).length;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
            AS
          </div>
          <span className="font-medium text-[var(--text)]">Afri-Souk</span>
          <span className="text-[var(--border)]">/</span>
          <span className="text-sm text-[var(--text-muted)]">Dashboard IA</span>
          <div className="ml-auto">
            <Badge variant="default">
              <Brain className="w-3 h-3" />
              Prédictions actives
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Alert banner */}
        {criticalAlerts > 0 && (
          <div className="rounded-xl border border-[#EF4444]/30 bg-[#FEE2E2] dark:bg-[#450A0A] px-4 py-3 flex items-center gap-3 text-sm text-[#991B1B] dark:text-[#FCA5A5]">
            <Package className="w-4 h-4 shrink-0" />
            <strong>{criticalAlerts} produit{criticalAlerts > 1 ? "s" : ""}</strong> en rupture imminente — réapprovisionnement recommandé.
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={ShoppingBag} label="Ventes du jour"     value="842 €"   delta="+12% vs hier"  deltaPositive />
          <MetricCard icon={TrendingUp}  label="Commandes"          value="37"      delta="+5 aujourd'hui" deltaPositive />
          <MetricCard icon={Package}     label="Produits actifs"    value="124"     delta={`${criticalAlerts} alertes`} deltaPositive={criticalAlerts === 0} />
          <MetricCard icon={Users}       label="Clients actifs"     value="892"     delta="+47 ce mois"   deltaPositive />
        </div>

        {/* Chart + Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-[var(--text)]">
                  Ventes hebdomadaires
                </h2>
                <Badge variant="success">
                  <Brain className="w-3 h-3" />
                  +2 semaines prédites
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SalesChart data={report.weeklySales} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-medium text-[var(--text)]">
                Prédictions par catégorie
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                7 prochains jours — basé sur WMA
              </p>
            </CardHeader>
            <CardContent>
              <CategoryPredictionPanel
                predictions={report.categoryPredictions}
              />
            </CardContent>
          </Card>
        </div>

        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[var(--text)]">
                Alertes de stock prédites
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Généré le{" "}
                {report.generatedAt.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <StockAlerts alerts={report.stockAlerts} />
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
