# Tests manuels — Phase 1 (checkout & cas limites)

Prérequis : `npx prisma migrate dev`, `npx prisma db seed`, puis `npm run dev`.
Pour modifier le stock d'un produit pendant les tests (pas d'UI admin pour
ça), utilise `npx prisma studio` → table `Product` → colonne `stock`.

---

## 1. Panier vide au checkout

**But** : vérifier qu'on ne peut pas arriver sur `/checkout` avec un panier vide,
et que l'API refuse aussi une commande sans articles.

1. Panier vide, aller directement sur `/checkout` (URL tapée à la main).
   - **Attendu** : redirection automatique vers `/produits` (géré par le
     `useEffect` de `checkout/page.tsx`), aucun formulaire affiché.
2. Avec les devtools réseau, envoyer directement `POST /api/orders` avec
   `{ "items": [], ...restant du payload valide }`.
   - **Attendu** : `400 { ok: false, error: "Panier vide." }`, aucune ligne
     créée dans `Order`.

---

## 2. Produit devenu indisponible entre l'ajout au panier et la commande

**But** : vérifier qu'une commande ne peut pas être créée pour un produit
supprimé après son ajout au panier (le panier est persisté en localStorage,
donc il ne "sait" pas qu'un produit a disparu côté serveur).

1. Ajouter un produit au panier (ex: "Djembé artisanal").
2. Dans un autre onglet, supprimer ce produit en base (via Prisma Studio,
   supprimer la ligne dans `Product` — ou `DELETE FROM "Product" WHERE ...`).
3. Retourner sur l'onglet panier, aller jusqu'à `/checkout`, remplir le
   formulaire et valider.
   - **Attendu** : message d'erreur affiché sous le formulaire
     ("...ne sont plus disponibles..."), réponse `409`, **aucune commande
     créée** (vérifier dans Prisma Studio que la table `Order` n'a pas
     grandi), le panier reste inchangé côté client (pas de `clearCart()`
     car l'exception est levée avant le `router.push`).

---

## 3. Quantité demandée supérieure au stock disponible

**But** : vérifier qu'on ne peut pas survendre un produit, y compris si le
stock a diminué après l'ajout au panier (ex: un autre client a acheté
entre-temps).

1. Choisir un produit à faible stock dans le seed (ex: "Tapis berbère
   Azilal", stock = 2).
2. L'ajouter au panier avec la quantité maximum autorisée par la page
   produit (2).
3. Dans Prisma Studio, réduire son stock à 1 (simulateur d'une vente
   concurrente entre-temps).
4. Aller sur `/checkout`, remplir le formulaire, valider.
   - **Attendu** : message d'erreur explicite ("Stock insuffisant pour
     ... disponible : 1, demandé : 2"), réponse `409`, aucune commande
     créée, le stock du produit reste à 1 (pas de décrément partiel).
5. Variante — rupture totale : remettre le stock à 0 avant de valider.
   - **Attendu** : message "... n'est plus en stock.", même comportement
     (aucune commande, aucun effet de bord).

---

## Tests de non-régression à faire en même temps

- **Commande valide** : ajouter 1-2 produits en stock suffisant, aller au
  bout du checkout. Vérifier : redirection vers `/commande/[id]`, le
  numéro affiché est au format `AS-2026-000X`, le stock des produits
  achetés a bien diminué de la quantité commandée, une ligne `Sale` a été
  créée par article.
- **Numéros de commande uniques et croissants** : passer 2-3 commandes à la
  suite, vérifier dans Prisma Studio que `orderNumber` est bien
  `AS-2026-0001`, `AS-2026-0002`, etc., sans doublon.
- **Mes commandes — succès** : sur `/mes-commandes`, saisir l'email et le
  numéro d'une commande qui vient d'être passée → le détail (statut,
  livraison, articles, total) s'affiche.
- **Mes commandes — email correct mais mauvais numéro / inverse** : vérifier
  que le message d'erreur est le même dans les deux cas (pas d'indice sur
  quel champ est faux).
- **Mes commandes — casse** : numéro de commande saisi en minuscules
  (`as-2026-0001`) ou email avec majuscules → doit quand même trouver la
  commande (normalisation `toUpperCase`/`toLowerCase` côté API).
- **Mode de paiement affiché correctement** : passer une commande en
  choisissant un mode de paiement mobile money (ex: Wave) avec son numéro,
  puis vérifier sur `/commande/[id]` ET `/mes-commandes` que le libellé
  affiché est bien "Wave" (et non "Paiement" par défaut — c'était un bug
  pré-existant, corrigé au passage, voir PHASE1-README.txt).
- **Commandes pré-existantes** : recharger une URL `/commande/[id]` d'une
  commande créée avant cette migration suppose que la colonne
  `orderNumber` a bien été backfillée (voir PHASE1-README.txt) — sinon
  `prisma migrate dev` aura déjà bloqué la migration avant d'arriver ici.
