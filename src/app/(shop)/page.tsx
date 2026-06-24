import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/shop/Navbar";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button, Badge } from "@/components/ui";
import type { Product, Category } from "@/types";

/* ── Mock data — remplace par un fetch Prisma ─────────── */
const MOCK_PRODUCTS: Product[] = [
  { id:"p1", name:"Djembé artisanal", description:"Djembé fait main, bois de lenké", price:65000, stock:12, category:"Artisanat", images:[], createdAt:new Date() },
  { id:"p2", name:"Robe wax Kente",   description:"Tissu wax authentique de Côte d'Ivoire", price:32000, stock:4, category:"Mode", images:[], createdAt:new Date() },
  { id:"p3", name:"Épices du Sahel",  description:"Mélange d'épices artisanal", price:8500, stock:32, category:"Alimentation", images:[], createdAt:new Date() },
  { id:"p4", name:"Vase Berbère",     description:"Poterie traditionnelle marocaine", price:18000, stock:8, category:"Artisanat", images:[], createdAt:new Date() },
  { id:"p5", name:"Boubou brodé",     description:"Boubou homme brodé à la main", price:45000, stock:0, category:"Mode", images:[], createdAt:new Date() },
  { id:"p6", name:"Café Arabica",     description:"Café arabica single origin", price:5500, stock:50, category:"Alimentation", images:[], createdAt:new Date() },
];

const CATEGORIES: { label: Category; emoji: string }[] = [
  { label: "Artisanat",    emoji: "🪘" },
  { label: "Mode",         emoji: "👗" },
  { label: "Alimentation", emoji: "🌶️" },
  { label: "Bijoux",       emoji: "💎" },
  { label: "Déco",         emoji: "🏺" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-[var(--border)]">
          {/* halo décoratif discret */}
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-200/40 dark:bg-primary-900/20 blur-3xl"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center space-y-6 animate-fade-in-up">
            <Badge variant="default" className="mx-auto">
              <Sparkles className="w-3 h-3" />
              +500 artisans africains
            </Badge>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold text-[var(--text)] leading-[1.1] max-w-3xl mx-auto">
              Le marché africain,{" "}
              <span className="text-primary-600">partout en Europe</span>
            </h1>
            <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-xl mx-auto">
              Artisanat authentique, mode wax, épices et saveurs d'Afrique —
              directement chez vous.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" asChild>
                <Link href="/produits">
                  Explorer le catalogue
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/admin/dashboard">Dashboard IA</Link>
              </Button>
            </div>
          </div>
          <div className="stripe-band" aria-hidden="true" />
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-14 sm:space-y-20">

          {/* ── Categories ────────────────────────────────── */}
          <section>
            <h2 className="font-display text-2xl text-[var(--text)] mb-5">
              Parcourir par catégorie
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORIES.map(({ label, emoji }) => (
                <Link
                  key={label}
                  href={`/produits?cat=${label}`}
                  className="relative flex flex-col items-center gap-2 p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200 group overflow-hidden"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                    {emoji}
                  </span>
                  <span className="text-sm font-medium text-[var(--text)] group-hover:text-primary-600 transition-colors">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Featured Products ──────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl text-[var(--text)]">
                Produits vedettes
              </h2>
              <Link
                href="/produits"
                className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1 font-medium shrink-0"
              >
                Voir tout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {MOCK_PRODUCTS.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
