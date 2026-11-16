import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { getStoreCategories } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import { ShopBrowser } from "./shop-browser";

export const metadata = { title: "Shop all" };

/*
 * Static page: built once and served from the CDN, refreshed when the admin
 * changes products (cache tags) or after an hour. Category and filters live in
 * the URL and are applied in the browser, so no request ever reaches the
 * server just to filter a list.
 */
export const revalidate = 3600;

export default async function ProductsPage() {
  const [categories, { identity }, products] = await Promise.all([
    getStoreCategories(),
    getSettings(),
    getProducts(),
  ]);

  return (
    <div className="container-page py-10 sm:py-14">
      <Suspense fallback={<ProductGridSkeleton className="mt-16" />}>
        <ShopBrowser
          products={products}
          categories={categories}
          heading={identity.shopHeading}
          description={identity.shopDescription}
        />
      </Suspense>
    </div>
  );
}
