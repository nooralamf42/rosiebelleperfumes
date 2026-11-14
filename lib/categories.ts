import { unstable_cache } from "next/cache";
import { db, hasDatabase } from "./db";
import { demoProducts, demoCategoryOf, DEMO_CATEGORIES } from "./demo-data";
import { CACHE_TAGS } from "./cache-tags";

export type StoreCategory = { name: string; slug: string };

/** Categories that currently have at least one active product. */
export async function getStoreCategories(): Promise<StoreCategory[]> {
  if (!hasDatabase) {
    const seen = new Set(demoProducts.map(demoCategoryOf));
    return DEMO_CATEGORIES.filter((c) => seen.has(c.slug)).map((c) => ({ name: c.name, slug: c.slug }));
  }
  try {
    return await loadStoreCategories();
  } catch (err) {
    console.error("getStoreCategories failed", err);
    return [];
  }
}

// Read by the root layout on every page — cached; throws so errors aren't cached.
const loadStoreCategories = unstable_cache(
  async (): Promise<StoreCategory[]> => {
    const cats = await db.category.findMany({
      where: { products: { some: { isActive: true } } },
      orderBy: { name: "asc" },
    });
    // Keep the storefront's preferred order for the known starter categories,
    // then anything the owner added, alphabetically.
    const rank = new Map<string, number>(DEMO_CATEGORIES.map((c, i) => [c.slug, i]));
    return cats
      .map((c) => ({ name: c.name, slug: c.slug }))
      .sort((a, b) => (rank.get(a.slug) ?? 99) - (rank.get(b.slug) ?? 99) || a.name.localeCompare(b.name));
  },
  ["categories:store:v2"],
  { tags: [CACHE_TAGS.catalog], revalidate: 3600 },
);

/** All categories (for the admin selector). */
export async function getAllCategories() {
  if (!hasDatabase) return [];
  try {
    return await db.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

/** Demo-mode filtering: products whose demo category matches the slug. */
export function demoProductsInCategory(slug: string) {
  return demoProducts.filter((p) => demoCategoryOf(p) === slug);
}
