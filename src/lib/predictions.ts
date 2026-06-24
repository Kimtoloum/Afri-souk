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

import { prisma } from "@/lib/prisma";

/* ── Data fetching (Prisma) ───────────────────────────── */

const WEEKS_OF_HISTORY = 8;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

/** Renvoie l'index de semaine (0 = il y a WEEKS_OF_HISTORY semaines, dernier = semaine en cours) */
function weekIndexFromNow(date: Date, now: Date): number {
  const diffMs = now.getTime() - date.getTime();
  const weeksAgo = Math.floor(diffMs / MS_PER_WEEK);
  return WEEKS_OF_HISTORY - 1 - weeksAgo; // 0..WEEKS_OF_HISTORY-1
}

async function getRealData() {
  const now = new Date();
  const since = new Date(now.getTime() - WEEKS_OF_HISTORY * MS_PER_WEEK);

  // Toutes les ventes des 8 dernières semaines, avec la catégorie du produit
  const sales = await prisma.sale.findMany({
    where: { date: { gte: since } },
    select: {
      quantity: true,
      date: true,
      productId: true,
      product: { select: { name: true, category: true, stock: true } },
    },
  });

  /* ── Agrégation par catégorie × semaine ─────────────── */
  const categoryBuckets = new Map<Category, number[]>();
  const totalBuckets: number[] = new Array(WEEKS_OF_HISTORY).fill(0);

  for (const sale of sales) {
    const wi = weekIndexFromNow(sale.date, now);
    if (wi < 0 || wi >= WEEKS_OF_HISTORY) continue;

    const cat = sale.product.category as Category;
    if (!categoryBuckets.has(cat)) {
      categoryBuckets.set(cat, new Array(WEEKS_OF_HISTORY).fill(0));
    }
    categoryBuckets.get(cat)![wi] += sale.quantity;
    totalBuckets[wi] += sale.quantity;
  }

  const categoryData: RawCategoryData[] = Array.from(categoryBuckets.entries()).map(
    ([category, weeklySales]) => ({ category, weeklySales })
  );

  /* ── Agrégation par produit (stock + vélocité de vente) ──── */
  const productSalesMap = new Map<
    string,
    { name: string; stock: number; totalQty: number; daysSpan: number }
  >();

  for (const sale of sales) {
    const existing = productSalesMap.get(sale.productId);
    if (existing) {
      existing.totalQty += sale.quantity;
    } else {
      productSalesMap.set(sale.productId, {
        name: sale.product.name,
        stock: sale.product.stock,
        totalQty: sale.quantity,
        daysSpan: WEEKS_OF_HISTORY * 7,
      });
    }
  }

  // Inclut aussi les produits sans aucune vente récente (vélocité = 0, pas d'urgence)
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, stock: true },
  });
  for (const p of allProducts) {
    if (!productSalesMap.has(p.id)) {
      productSalesMap.set(p.id, { name: p.name, stock: p.stock, totalQty: 0, daysSpan: WEEKS_OF_HISTORY * 7 });
    } else {
      // garde le stock le plus à jour (table Product, pas Sale)
      productSalesMap.get(p.id)!.stock = p.stock;
    }
  }

  const stockData: RawProductStock[] = Array.from(productSalesMap.entries()).map(
    ([productId, d]) => ({
      productId,
      productName: d.name,
      currentStock: d.stock,
      avgDailySales: d.totalQty / d.daysSpan,
    })
  );

  return { categoryData, stockData, totalWeeklySales: totalBuckets };
}

export async function generatePredictionReport(): Promise<PredictionReport> {
  const { categoryData, stockData, totalWeeklySales } = await getRealData();

  // Pas encore de données de vente en base (projet flambant neuf) : renvoie un rapport vide
  // plutôt que de planter — le dashboard affichera un état "pas encore de données".
  if (categoryData.length === 0 && stockData.length === 0) {
    return {
      generatedAt: new Date(),
      categoryPredictions: [],
      stockAlerts: [],
      weeklySales: [],
    };
  }

  const categoryPredictions = categoryData.map(predictCategory);
  const stockAlerts = stockData
    .map(predictStockAlert)
    .sort((a, b) => a.daysUntilOut - b.daysUntilOut); // les plus urgents en premier
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
