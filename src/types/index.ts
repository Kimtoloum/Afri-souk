export type Category = "Artisanat" | "Mode" | "Alimentation" | "Bijoux" | "Déco";
export type StockStatus = "ok" | "low" | "out";

export interface Product {
  id: string; name: string; description: string; price: number;
  stock: number; category: Category; images: string[]; createdAt: Date;
}
export interface Sale { id: string; productId: string; product?: Product; quantity: number; date: Date; }
export interface CartItem { product: Product; quantity: number; }

export type PaymentMethod = "wave" | "flooz" | "tmoney" | "airtel_money" | "carte_bancaire" | "crypto" | "livraison";

export interface PaymentMethodConfig {
  id: PaymentMethod; label: string; description: string;
  icon: string; requiresPhone: boolean; available: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: "wave",           label: "Wave",               description: "Paiement instantané Wave",      icon: "🌊", requiresPhone: true,  available: true },
  { id: "flooz",          label: "Flooz (Moov)",        description: "Mobile money Moov Africa",      icon: "📱", requiresPhone: true,  available: true },
  { id: "tmoney",         label: "T-Money (Togocom)",   description: "Mobile money Togocom",          icon: "💚", requiresPhone: true,  available: true },
  { id: "airtel_money",   label: "Airtel Money",        description: "Mobile money Airtel",           icon: "🔴", requiresPhone: true,  available: true },
  { id: "carte_bancaire", label: "Carte bancaire",      description: "Visa / Mastercard",             icon: "💳", requiresPhone: false, available: true },
  { id: "crypto",         label: "Crypto",              description: "USDT, BTC, ETH acceptés",       icon: "₿",  requiresPhone: false, available: true },
  { id: "livraison",      label: "À la livraison",      description: "Payer en cash à la réception",  icon: "🚚", requiresPhone: false, available: true },
];

export type DeliveryCity = "lome" | "ndjamena";

export interface DeliveryZone {
  id: DeliveryCity; label: string; country: string;
  flag: string; deliveryFee: number; estimatedDays: string;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "lome",     label: "Lomé",      country: "Togo",  flag: "🇹🇬", deliveryFee: 1500, estimatedDays: "24–48h"      },
  { id: "ndjamena", label: "N'Djaména", country: "Tchad", flag: "🇹🇩", deliveryFee: 3500, estimatedDays: "3–5 jours"   },
];

export interface CheckoutFormData {
  customerName: string; customerEmail: string; customerPhone: string;
  address: string; city: DeliveryCity;
  paymentMethod: PaymentMethod; paymentPhone?: string;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem { id: string; productId: string; name: string; price: number; quantity: number; }
export interface Order {
  id: string; orderNumber: string; status: OrderStatus; total: number;
  customerName: string; customerEmail: string; customerPhone: string;
  address: string; city: string; paymentMethod?: string | null; createdAt: Date; items: OrderItem[];
}

/** Saisie du formulaire "Mes commandes" (email + n° de commande, sans compte client). */
export interface OrderLookupInput {
  email: string;
  orderNumber: string;
}

export type TrendDirection = "up" | "down" | "stable";
export interface CategoryPrediction { category: Category; predictedDelta: number; confidence: number; trend: TrendDirection; }
export interface StockAlert { productId: string; productName: string; currentStock: number; daysUntilOut: number; severity: "critical" | "warning" | "ok"; }
export interface WeeklySalePoint { week: string; actual: number | null; predicted: number; }
export interface PredictionReport { generatedAt: Date; categoryPredictions: CategoryPrediction[]; stockAlerts: StockAlert[]; weeklySales: WeeklySalePoint[]; }

export interface ApiSuccess<T> { data: T; ok: true; }
export interface ApiError { error: string; ok: false; }
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
