FICHIERS À PLACER — Checkout
================================

NOUVEAUX FICHIERS (à créer) :
  src/app/api/orders/route.ts
  src/app/api/orders/[id]/route.ts
  src/app/(shop)/checkout/page.tsx
  src/app/(shop)/commande/[id]/page.tsx

FICHIERS À REMPLACER (déjà existants) :
  prisma/schema.prisma     <- ajout des champs client sur Order
  prisma/seed.ts           <- mis à jour pour les nouveaux champs
  src/types/index.ts       <- ajout des types Order/OrderItem/OrderInput

⚠️ APRÈS avoir remplacé prisma/schema.prisma, lance OBLIGATOIREMENT :
  npx prisma migrate dev --name add_order_customer_fields
  npx prisma db seed

Sinon l'API /api/orders plantera (colonnes manquantes en base).
