import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { demoProducts, demoCategoryOf, DEMO_CATEGORIES } from "../lib/demo-data";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

/*
 * Starter catalogue: four categories and sixteen essential-oil products.
 * Re-running is safe (upsert by slug). Edit or delete anything in
 * /admin/products before launch. No reviews are seeded: reviews on a live
 * store must come from real customers.
 */
async function main() {
  const categoryIds: Record<string, string> = {};
  for (const c of DEMO_CATEGORIES) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
    categoryIds[c.slug] = cat.id;
  }

  for (const p of demoProducts) {
    const data = {
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      type: p.type,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      accentColor: p.accentColor,
      flavor: p.flavor,
      mood: p.mood,
      benefits: p.benefits,
      ingredients: p.ingredients,
      sizes: p.sizes,
      stock: p.stock,
      featured: p.featured,
      categoryId: categoryIds[demoCategoryOf(p)],
    };
    await db.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { ...data, slug: p.slug },
    });
  }

  console.log(`Seeded ${DEMO_CATEGORIES.length} categories and ${demoProducts.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
