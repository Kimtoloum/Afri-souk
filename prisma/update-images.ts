/**
 * prisma/update-images.ts — Afri-Souk
 *
 * Met à jour UNIQUEMENT les images des produits (sans toucher aux ventes,
 * commandes, stock...). Utile pour remplacer les placeholders Unsplash
 * par de vraies photos sans devoir tout reseed.
 *
 * 1. Renseigne tes URLs d'images ci-dessous (une ou plusieurs par produit)
 * 2. Lance : npx tsx prisma/update-images.ts
 *
 * Sources recommandées (libres de droits, usage commercial autorisé) :
 *   - https://unsplash.com  (clique sur une photo → "Download" → clic droit
 *     sur l'image affichée en grand → "Copier l'adresse de l'image")
 *   - https://pexels.com   (même principe)
 *
 * ⚠️ Ne copie jamais une URL d'image depuis Etsy, Amazon, ou un site
 * marchand — ce sont des photos protégées par le droit d'auteur du vendeur,
 * pas libres d'usage commercial.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Associe le NOM EXACT du produit (tel qu'en base) à une ou plusieurs URLs.
// Laisse vide []  pour les produits que tu n'as pas encore traités —
// ils garderont leur image actuelle.
const IMAGE_UPDATES: Record<string, string[]> = {
  "Djembé artisanal": [],
  "Vase Berbère": [],
  "Panier tressé Wolof": [],
  "Masque Baoulé": [],
  "Robe wax Kente": [],
  "Boubou brodé homme": [],
  "Ankara wrap skirt": [],
  "Sneakers cuir Sahara": [],
  "Épices du Sahel": [],
  "Café Éthiopien Yirgacheffe": [],
  "Huile d'argan pure": [],
  "Thé à la menthe du Rif": [],
  "Collier Touareg argent": [],
  "Bracelets en laiton Ghana": [],
  "Boucles d'oreilles coquillages": [],
  "Peinture sur batik": [],
  "Coussin Kuba": [],
  "Lampe en céramique": [],
  "Miroir en métal ciselé": [],
  "Tapis berbère Azilal": [],
};

async function main() {
  console.log("🖼️  Mise à jour des images produits...\n");

  let updated = 0;
  let skipped = 0;

  for (const [name, images] of Object.entries(IMAGE_UPDATES)) {
    if (images.length === 0) {
      skipped++;
      continue;
    }

    const result = await prisma.product.updateMany({
      where: { name },
      data: { images },
    });

    if (result.count > 0) {
      console.log(`✅ ${name} — ${images.length} image(s)`);
      updated++;
    } else {
      console.log(`⚠️  ${name} — produit introuvable en base (nom différent ?)`);
    }
  }

  console.log(`\n🎉 Terminé : ${updated} mis à jour, ${skipped} ignorés (pas d'URL fournie)`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
