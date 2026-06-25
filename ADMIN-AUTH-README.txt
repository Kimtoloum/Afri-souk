FICHIERS À PLACER — Authentification admin
=============================================

NOUVEAUX FICHIERS (à créer, mêmes chemins que dans le zip) :
  src/lib/admin-auth.ts
  src/app/api/admin/login/route.ts
  src/app/api/admin/logout/route.ts
  src/middleware.ts                      <- DOIT être à la racine de src/, pas dans app/
  src/app/(admin)/login/page.tsx

⚠️ ÉTAPE OBLIGATOIRE — ajoute dans ton .env :

ADMIN_PASSWORD="choisis-un-mot-de-passe-fort"
ADMIN_SESSION_SECRET="colle-ici-une-longue-chaine-aleatoire"

Pour générer un secret aléatoire fort, lance dans le terminal :
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Copie le résultat affiché et colle-le comme valeur de ADMIN_SESSION_SECRET.

Ensuite :
  npm run dev

Test :
1. Va sur /dashboard SANS être connecté -> tu dois être redirigé vers /login
2. Connecte-toi avec ton ADMIN_PASSWORD -> tu dois arriver sur /dashboard
3. Le cookie de session dure 7 jours
