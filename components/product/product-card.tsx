"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ProductMedia } from "./product-media";
import { AddToCartButton } from "./add-to-cart-button";
import { QuickAddSize } from "./quick-add-size";
import { formatPrice, discountPercent } from "@/lib/format";
import { moodLabel } from "@/lib/scent";
import type { StoreProduct } from "@/lib/types";

export function ProductCard({
  product,
  priority,
}: {
  product: StoreProduct;
  priority?: boolean;
}) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const mood = moodLabel(product);

  return (
    <motion.article
      whileHover="hover"
      initial="rest"
      animate="rest"
      className="group relative flex flex-col"
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-soft ring-1 ring-foreground/5"
      >
        <ProductMedia product={product} priority={priority} />

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {mood ? (
            <span className="glass rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]">
              {mood}
            </span>
          ) : (
            <span />
          )}
          {off && (
            <span className="rounded-full bg-amber px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              −{off}%
            </span>
          )}
        </div>

        <motion.span
          variants={{ rest: { opacity: 0, y: 6 }, hover: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-foreground text-background"
        >
          <ArrowUpRight className="size-4" />
        </motion.span>
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-lg leading-tight">
              <Link href={`/products/${product.slug}`} className="transition-opacity hover:opacity-70">
                {product.name}
              </Link>
            </h3>
            {(product.tagline || product.flavor) && (
              <p className="mt-1 truncate text-xs text-muted-foreground">{product.tagline || product.flavor}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end text-sm">
            <span className="font-medium">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
          {product.sizes.length > 0 ? (
            <QuickAddSize product={product} />
          ) : (
            <AddToCartButton
              product={product}
              variant="outline"
              className="h-10 w-full rounded-full border-foreground/15 bg-transparent text-xs font-medium uppercase tracking-[0.14em] transition-all hover:border-foreground hover:bg-foreground hover:text-background"
            >
              Add to bag
            </AddToCartButton>
          )}
        </div>
      </div>
    </motion.article>
  );
}
