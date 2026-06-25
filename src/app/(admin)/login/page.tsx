"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Button, Card, cn } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.error ?? "Mot de passe incorrect.");
        setIsSubmitting(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessaie.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display text-xl text-[var(--text)] mt-1">
            Accès admin
          </h1>
          <p className="text-sm text-[var(--text-muted)] text-center">
            Connecte-toi pour accéder au dashboard Afri-Souk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className={cn(
                "w-full h-10 px-3 rounded-lg border bg-[var(--bg)] text-sm text-[var(--text)]",
                "focus:outline-none focus:ring-2 focus:ring-primary-600",
                error ? "border-ai-danger" : "border-[var(--border)]"
              )}
            />
            {error && <p className="text-xs text-ai-danger mt-1.5">{error}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Connexion…
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
