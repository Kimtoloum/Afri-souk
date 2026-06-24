"use client";

import { ThemeProvider } from "next-themes";
import { CartDrawer } from "@/components/shop/CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
      <CartDrawer />
    </ThemeProvider>
  );
}
