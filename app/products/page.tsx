import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { getStoreCategories } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import { Reveal } from "@/components/motion/reveal";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import { ShopBrowser } from "./shop-browser";

export const metadata = { title: "Shop all" };
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
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

      <Suspense key={category ?? "all"} fallback={<ProductGridSkeleton className="mt-16" />}>
        <Browser category={category} categories={categories} />
      </Suspense>
    </div>
  );
}

async function Browser({ category, categories }: { category?: string; categories: { name: string; slug: string }[] }) {
  const products = await getProducts({ categorySlug: category });
  return <ShopBrowser products={products} categories={categories} activeCategory={category} />;
}
