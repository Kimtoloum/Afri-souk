"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { ShoppingCart, Sun, Moon, Search, Menu, X } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Catalogue", href: "/produits" },
  { label: "Artisanat", href: "/produits?cat=Artisanat" },
  { label: "Mode", href: "/produits?cat=Mode" },
  { label: "Alimentation", href: "/produits?cat=Alimentation" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-2 sm:gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-display font-semibold text-sm select-none">
              AS
            </div>
            <span className="font-display font-semibold text-[var(--text)] text-lg hidden sm:inline">
              Afri-Souk
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <Button variant="ghost" size="icon" aria-label="Rechercher" className="hidden sm:inline-flex">
            <Search className="w-4 h-4" />
          </Button>

          {/* Dark mode */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Basculer le thème"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Panier — ${totalItems} article${totalItems !== 1 ? "s" : ""}`}
            onClick={toggleCart}
            className="relative"
          >
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-primary-600 text-white text-[10px] font-medium flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu mobile"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Bandeau signature */}
      <div className="stripe-band" aria-hidden="true" />

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] px-3 py-2.5 rounded-lg hover:bg-[var(--surface)] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
