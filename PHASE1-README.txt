FICHIERS À PLACER — Phase 1 MVP (numéro de commande + Mes commandes)
======================================================================

NOUVEAUX FICHIERS :
  src/lib/order-number.ts
  src/lib/order-format.ts
  src/app/api/orders/lookup/route.ts
  src/app/(shop)/mes-commandes/page.tsx

FICHIERS REMPLACÉS/MODIFIÉS :
  prisma/schema.prisma               <- ajout de Order.orderNumber, Order.paymentMethod (nullable)
                                         + modèle OrderSequence
  src/types/index.ts                 <- ajout de Order.orderNumber, Order.paymentMethod
                                         + OrderLookupInput
  src/app/api/orders/route.ts        <- transaction : validation/décrément de stock atomique
                                         + génération du numéro de commande
                                         + enregistrement du paymentMethod choisi au checkout
  src/app/(shop)/commande/[id]/page.tsx  <- affiche order.orderNumber, lien vers /mes-commandes,
                                             corrige l'affichage du mode de paiement
  src/lib/email.ts                   <- utilise orderNumber dans le sujet/corps de l'email

BUG CORRIGÉ AU PASSAGE :
  La page de confirmation lisait `PAYMENT_LABELS[order.city]` au lieu du
  mode de paiement réellement choisi — comme `Order` ne stockait pas du
  tout le mode de paiement, le libellé affiché était toujours "Paiement"
  par défaut. Order.paymentMethod (nullable) a été ajouté et est
  maintenant renseigné à la création de la commande.

⚠️ APRÈS avoir remplacé prisma/schema.prisma, lance OBLIGATOIREMENT :
  npx prisma migrate dev --name add_order_number
  npx prisma generate

Cette migration est additive : aucune colonne existante n'est supprimée ou
renommée. La colonne Order.orderNumber est déclarée obligatoire (unique) ;
si votre base de dev contient déjà des commandes, `prisma migrate dev` vous
demandera comment remplir les lignes existantes (vous pouvez répondre par
une valeur générée manuellement, ex: "AS-2026-LEGACY-1", ou vider la table
Order en dev si son contenu n'a pas d'importance).

Pas de changement nécessaire côté .env : aucune nouvelle variable
d'environnement n'est requise pour cette phase.
