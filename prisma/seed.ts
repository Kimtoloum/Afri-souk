import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const PRODUCTS = [
  { name: "Djembé artisanal", description: "Djembé fait main en bois de lenké, peau de chèvre tendue à la main.", price: 52000, stock: 12, category: "Artisanat", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"] },
  { name: "Vase Berbère", description: "Poterie traditionnelle marocaine, peinte à la main avec des motifs géométriques.", price: 28500, stock: 8, category: "Artisanat", images: ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80"] },
  { name: "Panier tressé Wolof", description: "Panier en raphia tressé à la main au Sénégal. Multiusage.", price: 16500, stock: 20, category: "Artisanat", images: ["https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=600&q=80"] },
  { name: "Masque Baoulé", description: "Réplique artisanale d'un masque Baoulé de Côte d'Ivoire, sculpté en bois d'iroko.", price: 38000, stock: 5, category: "Artisanat", images: ["https://images.unsplash.com/photo-1571119069-76c4c0d37efc?w=600&q=80"] },
  { name: "Robe wax Kente", description: "Tissu wax 100% coton, imprimé Kente authentique de Côte d'Ivoire.", price: 19000, stock: 4, category: "Mode", images: ["https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80"] },
  { name: "Boubou brodé homme", description: "Grand boubou en bazin riche, broderie col et manches faite à la main à Dakar.", price: 45000, stock: 0, category: "Mode", images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80"] },
  { name: "Ankara wrap skirt", description: "Jupe portefeuille en tissu Ankara, imprimé géométrique coloré.", price: 12500, stock: 15, category: "Mode", images: ["https://images.unsplash.com/photo-1583846717393-dc2412c95ed7?w=600&q=80"] },
  { name: "Sneakers cuir Sahara", description: "Chaussures artisanales en cuir tanné au Maroc, finition daim naturel.", price: 55000, stock: 7, category: "Mode", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"] },
  { name: "Épices du Sahel", description: "Mélange artisanal : cumin, coriandre, cardamome, poivre de Selim. 200g.", price: 4500, stock: 32, category: "Alimentation", images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80"] },
  { name: "Café Éthiopien Yirgacheffe", description: "Grains arabica single origin, torréfaction claire. 250g.", price: 7500, stock: 50, category: "Alimentation", images: ["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80"] },
  { name: "Huile d'argan pure", description: "Huile d'argan alimentaire pressée à froid, coopérative féminine de Tiznit. 250ml.", price: 9800, stock: 18, category: "Alimentation", images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80"] },
  { name: "Thé à la menthe du Rif", description: "Thé vert gunpowder avec menthe fraîche séchée des montagnes du Rif. 100g.", price: 3200, stock: 40, category: "Alimentation", images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80"] },
  { name: "Collier Touareg argent", description: "Collier en argent 925 avec gravures berbères traditionnelles. Fait à Agadez.", price: 32000, stock: 9, category: "Bijoux", images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80"] },
  { name: "Bracelets en laiton Ghana", description: "Set de 3 bracelets en laiton moulés à cire perdue, motifs Adinkra.", price: 18500, stock: 14, category: "Bijoux", images: ["https://images.unsplash.com/photo-1573408301185-9519f94f7ef1?w=600&q=80"] },
  { name: "Boucles d'oreilles coquillages", description: "Boucles légères en coquillages cauri montés sur anneau doré.", price: 8500, stock: 25, category: "Bijoux", images: ["https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&q=80"] },
  { name: "Peinture sur batik", description: "Tableau batik peint à la cire chaude et teinture naturelle, 40×60cm. Signé.", price: 42000, stock: 3, category: "Déco", images: ["https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=600&q=80"] },
  { name: "Coussin Kuba", description: "Coussin en tissu Kuba du Congo, motifs géométriques au raphia. 45×45cm.", price: 14000, stock: 11, category: "Déco", images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"] },
  { name: "Lampe en céramique", description: "Lampe de chevet en terre cuite émaillée, découpes géométriques. Câble inclus.", price: 35000, stock: 6, category: "Déco", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80"] },
  { name: "Miroir en métal ciselé", description: "Miroir rond Ø50cm avec cadre en laiton ciselé façon artisanat marocain.", price: 62000, stock: 4, category: "Déco", images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80"] },
  { name: "Tapis berbère Azilal", description: "Tapis laine fait main, village d'Azilal (Haut Atlas). 120×80cm.", price: 115000, stock: 2, category: "Déco", images: ["https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80"] },
];

function generateSales(productId: string, baseVolume: number) {
  const sales = [];
  const now = new Date();
  for (let week = 7; week >= 0; week--) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - week * 7);
    const trend = 1 + (7 - week) * 0.03;
    const noise = 0.8 + Math.random() * 0.4;
    const qty = Math.max(1, Math.round(baseVolume * trend * noise));
    const numOrders = Math.ceil(qty / 3);
    for (let i = 0; i < numOrders; i++) {
      const saleDate = new Date(weekDate);
      saleDate.setDate(saleDate.getDate() + Math.floor(Math.random() * 7));
      sales.push({ productId, quantity: Math.ceil(qty / numOrders), date: saleDate });
    }
  }
  return sales;
}

const BASE_VOLUMES: Record<string, number> = {
  Artisanat: 5, Mode: 4, Alimentation: 8, Bijoux: 3, Déco: 2,
};

async function main() {
  console.log("🌍 Seeding Afri-Souk...\n");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  console.log("🗑️  Tables vidées\n");

  let totalSales = 0;
  for (const p of PRODUCTS) {
    const product = await prisma.product.create({ data: p });
    const sales = generateSales(product.id, BASE_VOLUMES[p.category] ?? 3);
    await prisma.sale.createMany({ data: sales });
    totalSales += sales.length;
    console.log(`✅ ${product.name} — ${new Intl.NumberFormat("fr-FR").format(p.price)} F CFA`);
  }

  console.log(`\n🎉 Terminé : ${PRODUCTS.length} produits, ${totalSales} ventes`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
