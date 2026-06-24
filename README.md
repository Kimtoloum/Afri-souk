# Afri-Souk — E-commerce IA

Marché africain multi-catégories avec prédictions IA intégrées.

## Stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** avec palette "Modern Commerce"
- **Prisma** + PostgreSQL (Supabase / Neon recommandé)
- **Recharts** pour les graphiques
- **Zustand** pour le panier client
- **Framer Motion** pour les animations
- **react-hook-form + zod** pour les formulaires

## Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Variables d'environnement

Copie `.env.example` → `.env.local` et remplis :

```env
DATABASE_URL="postgresql://user:password@host:5432/ecommerce"
```

> Recommandé : [Neon](https://neon.tech) ou [Supabase](https://supabase.com) (gratuit)

### 3. Base de données

```bash
npx prisma migrate dev --name init
npx prisma db seed        # optionnel : données de démo
```

### 4. Lancer le dev server

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── app/
│   ├── (shop)/           # Vitrine publique
│   │   └── page.tsx      # Accueil
│   ├── (admin)/
│   │   └── dashboard/    # Dashboard IA
│   └── api/
│       ├── products/     # CRUD produits
│       └── predictions/  # Endpoint prédictif
├── components/
│   ├── ui/               # Button, Badge, Card, Skeleton
│   ├── shop/             # ProductCard, Navbar
│   └── dashboard/        # SalesChart, CategoryPredictionPanel, StockAlerts
├── lib/
│   ├── prisma.ts         # Client Prisma singleton
│   └── predictions.ts    # Algorithme WMA + alertes stock
├── store/
│   └── cart.ts           # Zustand (persisté)
└── types/
    └── index.ts          # Types partagés
```

## Module prédictions IA

`src/lib/predictions.ts` implémente :

- **Weighted Moving Average (WMA)** — ventes des 8 dernières semaines
- **Détection de tendance** — up / down / stable
- **Alertes stock** — vélocité de vente → jours avant rupture
- **Forecast hebdo** — 2 semaines prédites au-delà de l'historique

En production, remplace les données mock par des requêtes Prisma réelles.

## Routes API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Liste produits (filtres: `cat`, `q`, `page`, `limit`) |
| POST | `/api/products` | Créer un produit |
| GET | `/api/predictions` | Rapport de prédictions complet |

## Prochaines étapes

- [ ] Page catalogue `/produits` avec filtres dynamiques
- [ ] Page produit `/produit/[id]`
- [ ] Drawer panier
- [ ] Checkout + Stripe
- [ ] Auth admin (NextAuth.js)
- [ ] Notifications email (Resend)
- [ ] Seed Prisma avec vraies données
