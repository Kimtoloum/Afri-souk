/**
 * predictions.ts — Afri-Souk Prediction Engine
 *
 * Algorithme : moyenne mobile pondérée (WMA) + détection de tendance
 * + alertes de rupture de stock basées sur la vélocité de vente.
 *
 * En production, connecte-le à Prisma pour des données réelles.
 * En dev, des données simulées sont utilisées si Prisma n'est pas dispo.
 */

import type {
  Category,
  CategoryPrediction,
  StockAlert,
  WeeklySalePoint,
  PredictionReport,
  TrendDirection,
} from "@/types";

/* ── Weighted Moving Average ──────────────────────────── */

/**
 * Calcule une moyenne mobile pondérée des N dernières valeurs.
 * Les valeurs récentes ont un poids plus élevé.
 */
function weightedMovingAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const n = values.length;
  let weightedSum = 0;
  let totalWeight = 0;
  values.forEach((v, i) => {
    const weight = i + 1; // poids linéaire : 1, 2, 3 … n
    weightedSum += v * weight;
    totalWeight += weight;
  });
  return weightedSum / totalWeight;
}

/* ── Trend Detection ──────────────────────────────────── */

function detectTrend(values: number[]): TrendDirection {
  if (values.length < 2) return "stable";
  const recent = values.slice(-3);
  const slope =
    recent.reduce((acc, v, i) => acc + v * (i + 1), 0) /
    recent.reduce((acc, _, i) => acc + (i + 1), 0);
  const baseline = recent[0];
  const pct = (slope - baseline) / (baseline || 1);
  if (pct > 0.05) return "up";
  if (pct < -0.05) return "down";
  return "stable";
}

/* ── Category Prediction ──────────────────────────────── */

interface RawCategoryData {
  category: Category;
  weeklySales: number[]; // last 8 weeks, oldest first
}

function predictCategory(data: RawCategoryData): CategoryPrediction {
  const { category, weeklySales } = data;
  const n = weeklySales.length;
  if (n < 2) {
    return { category, predictedDelta: 0, confidence: 0, trend: "stable" };
  }

  const wma = weightedMovingAverage(weeklySales);
  const lastWeek = weeklySales[n - 1];
  const predictedDelta = (wma - lastWeek) / (lastWeek || 1);
  const trend = detectTrend(weeklySales);

  // Confidence = inversely proportional to variance
  const mean = weeklySales.reduce((a, b) => a + b, 0) / n;
  const variance =
    weeklySales.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const cv = Math.sqrt(variance) / (mean || 1); // coefficient of variation
  const confidence = Math.max(0, Math.min(1, 1 - cv));

  return { category, predictedDelta, confidence, trend };
}

/* ── Stock Alert ──────────────────────────────────────── */

interface RawProductStock {
  productId: string;
  productName: string;
  currentStock: number;
  avgDailySales: number; // units sold per day on average
}

function predictStockAlert(p: RawProductStock): StockAlert {
  const daysUntilOut =
    p.avgDailySales > 0
      ? Math.floor(p.currentStock / p.avgDailySales)
      : 999;

  const severity: StockAlert["severity"] =
    daysUntilOut <= 3 ? "critical" : daysUntilOut <= 7 ? "warning" : "ok";

  return {
    productId: p.productId,
    productName: p.productName,
    currentStock: p.currentStock,
    daysUntilOut,
    severity,
  };
}

/* ── Weekly Sales Forecast ────────────────────────────── */

function forecastWeeklySales(historicalSales: number[]): WeeklySalePoint[] {
  const weeks = historicalSales.map((_, i) => `S${i + 1}`);
  const result: WeeklySalePoint[] = historicalSales.map((v, i) => ({
    week: weeks[i],
    actual: v,
    predicted: v,
  }));

  // Predict next 2 weeks
  const wma = weightedMovingAverage(historicalSales.slice(-4));
  const trend = detectTrend(historicalSales);
  const growth = trend === "up" ? 1.07 : trend === "down" ? 0.95 : 1.0;

  for (let i = 1; i <= 2; i++) {
    result.push({
      week: `S${historicalSales.length + i}`,
      actual: null,
      predicted: Math.round(wma * growth ** i),
    });
  }

  return result;
}

/* ── Main Report Builder ──────────────────────────────── */

/**
 * Données simulées — remplace par des vraies requêtes Prisma en production.
 *
 * Exemple avec Prisma :
 * const sales = await prisma.sale.groupBy({
 *   by: ['productId'],
 *   _sum: { quantity: true },
 *   where: { date: { gte: subWeeks(new Date(), 8) } },
 * });
 */
function getMockData() {
  const categoryData: RawCategoryData[] = [
    { category: "Artisanat",    weeklySales: [120, 135, 142, 158, 172, 168, 185, 201] },
    { category: "Mode",         weeklySales: [80,  92,  88,  101, 95,  110, 118, 125] },
    { category: "Alimentation", weeklySales: [60,  65,  70,  72,  68,  75,  80,  88]  },
    { category: "Bijoux",       weeklySales: [30,  28,  32,  25,  29,  27,  24,  22]  },
    { category: "Déco",         weeklySales: [45,  42,  40,  38,  41,  37,  34,  30]  },
  ];

  const stockData: RawProductStock[] = [
    { productId: "p1", productName: "Boubou brodé",    currentStock: 2,  avgDailySales: 1.2 },
    { productId: "p2", productName: "Robe wax Kente",  currentStock: 8,  avgDailySales: 1.5 },
    { productId: "p3", productName: "Djembé artisanal",currentStock: 24, avgDailySales: 0.8 },
    { productId: "p4", productName: "Épices du Sahel", currentStock: 45, avgDailySales: 3.0 },
    { productId: "p5", productName: "Vase Berbère",    currentStock: 12, avgDailySales: 0.5 },
  ];

  const totalWeeklySales = [335, 362, 372, 394, 405, 417, 441, 466];

  return { categoryData, stockData, totalWeeklySales };
}

export async function generatePredictionReport(): Promise<PredictionReport> {
  // In production: fetch real data from Prisma here
  const { categoryData, stockData, totalWeeklySales } = getMockData();

  const categoryPredictions = categoryData.map(predictCategory);
  const stockAlerts = stockData.map(predictStockAlert);
  const weeklySales = forecastWeeklySales(totalWeeklySales);

  return {
    generatedAt: new Date(),
    categoryPredictions,
    stockAlerts,
    weeklySales,
  };
}

/* ── Utilities ────────────────────────────────────────── */

export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${Math.round(delta * 100)}%`;
}

export function stockSeverityLabel(severity: StockAlert["severity"]): string {
  switch (severity) {
    case "critical": return "Rupture imminente";
    case "warning":  return "Stock faible";
    case "ok":       return "Stock suffisant";
  }
}
