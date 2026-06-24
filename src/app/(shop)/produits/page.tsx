"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/shop/Navbar";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button, Badge, Skeleton, cn } from "@/components/ui";
import type { Product, Category, ApiResponse } from "@/types";

/* ── Static config ────────────────────────────────────── */
const CATEGORIES: Category[] = ["Artisanat", "Mode", "Alimentation", "Bijoux", "Déco"];

type SortKey = "recent" | "price-asc" | "price-desc" | "name-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent",     label: "Plus récents" },
  { value: "price-asc",  label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "name-asc",   label: "Nom (A → Z)" },
];

const PRICE_MAX_DEFAULT = 100000;

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX_DEFAULT);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ── Fetch (une fois, on filtre/trie côté client) ───── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products?limit=100");
      const json: ApiResponse<Product[]> = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Erreur inconnue");
      setAllProducts(json.data ?? []);
    } catch (e) {
      setError(
        "Impossible de charger les produits. Vérifie que ta base est bien connectée."
      );
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ── Filtrage + tri côté client ───────────────────────── */
  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (activeCategories.length > 0) {
      list = list.filter((p) => activeCategories.includes(p.category));
    }

    list = list.filter((p) => p.price <= maxPrice);

    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
      default:
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return list;
  }, [allProducts, search, activeCategories, maxPrice, inStockOnly, sort]);

  const activeFilterCount =
    activeCategories.length + (inStockOnly ? 1 : 0) + (maxPrice < PRICE_MAX_DEFAULT ? 1 : 0);

  function toggleCategory(cat: Category) {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function resetFilters() {
    setActiveCategories([]);
    setMaxPrice(PRICE_MAX_DEFAULT);
    setInStockOnly(false);
    setSearch("");
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* ── Header ────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-3xl sm:text-4xl text-[var(--text)] mb-2">
            Catalogue
          </h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base">
            {loading ? "Chargement…" : `${filtered.length} produit${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Search + sort bar ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            {/* Mobile filter toggle */}
            <Button
              variant="secondary"
              className="lg:hidden relative"
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none pr-9 pl-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-8">

          {/* ── Sidebar filtres (desktop) ───────────────── */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-6">
            <FilterPanel
              activeCategories={activeCategories}
              toggleCategory={toggleCategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              activeFilterCount={activeFilterCount}
              resetFilters={resetFilters}
            />
          </aside>

          {/* ── Sidebar filtres (mobile, drawer) ─────────── */}
          {filtersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="absolute inset-0 bg-black/40 animate-fade-in"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="relative ml-auto w-[85%] max-w-sm h-full bg-[var(--bg)] p-5 overflow-y-auto animate-fade-in">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-lg text-[var(--text)]">Filtres</h2>
                  <Button variant="ghost" size="icon" onClick={() => setFiltersOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <FilterPanel
                  activeCategories={activeCategories}
                  toggleCategory={toggleCategory}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  activeFilterCount={activeFilterCount}
                  resetFilters={resetFilters}
                />
                <Button className="w-full mt-6" onClick={() => setFiltersOpen(false)}>
                  Voir {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}

          {/* ── Grid ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="rounded-xl border border-ai-danger/30 bg-ai-dangerLight p-4 text-sm text-ai-danger mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-[var(--text)] font-medium mb-1">Aucun produit trouvé</p>
                <p className="text-[var(--text-muted)] text-sm mb-4">
                  Essaie d'élargir tes filtres.
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Filter panel (réutilisé desktop + mobile) ────────── */
function FilterPanel({
  activeCategories,
  toggleCategory,
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  activeFilterCount,
  resetFilters,
}: {
  activeCategories: Category[];
  toggleCategory: (c: Category) => void;
  maxPrice: number;
  setMaxPrice: (n: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (b: boolean) => void;
  activeFilterCount: number;
  resetFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="text-xs text-primary-600 hover:text-primary-500 font-medium flex items-center gap-1"
        >
          <X className="w-3 h-3" /> Réinitialiser ({activeFilterCount})
        </button>
      )}

      {/* Catégories */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Catégorie</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 text-sm cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={activeCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded border-[var(--border)] text-primary-600 focus:ring-primary-600 cursor-pointer"
              />
              <span className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text)] mb-3">
          Prix max
        </h3>
        <input
          type="range"
          min={1000}
          max={PRICE_MAX_DEFAULT}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary-600 cursor-pointer"
        />
        <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
          jusqu'à {new Intl.NumberFormat("fr-FR").format(maxPrice)} FCFA
        </p>
      </div>

      {/* Stock */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Disponibilité</h3>
        <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--border)] text-primary-600 focus:ring-primary-600 cursor-pointer"
          />
          <span className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
            En stock uniquement
          </span>
        </label>
      </div>
    </div>
  );
}
