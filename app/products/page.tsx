import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { getStoreCategories } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/motion/reveal";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import { ShopGrid } from "./shop-grid";
import { ShopFilters } from "./shop-filters";

export const metadata = { title: "Shop all" };
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const [categories, { identity }] = await Promise.all([getStoreCategories(), getSettings()]);
  const current = categories.find((c) => c.slug === category);

  return (
    <div className="container-page py-10 sm:py-14">
      <Reveal>
        <p className="text-eyebrow">{current ? "Collection" : "Shop"}</p>
        <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl lg:text-6xl">{current?.name ?? identity.shopHeading}</h1>
        {identity.shopDescription && !current && (
          <p className="mt-4 max-w-lg text-muted-foreground">{identity.shopDescription}</p>
        )}
      </Reveal>

      <ShopFilters categories={categories} active={category} sort={sort} />

      <Suspense key={`${category}-${sort}`} fallback={<ProductGridSkeleton className="mt-10" />}>
        <Grid category={category} sort={sort} />
      </Suspense>
    </div>
  );
}

async function Grid({ category, sort }: { category?: string; sort?: string }) {
  let products = await getProducts({ categorySlug: category });
  if (sort === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") products = [...products].sort((a, b) => b.price - a.price);
  if (sort === "name") products = [...products].sort((a, b) => a.name.localeCompare(b.name));
  return <ShopGrid products={products} />;
}
