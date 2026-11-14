"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ProductCard } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/lib/types";

export function ShopGrid({ products }: { products: StoreProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center rounded-[2rem] border border-dashed border-foreground/15 px-6 py-20 text-center">
        <p className="font-heading text-2xl">Nothing distilled here yet</p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This collection is still being bottled. Browse everything else in the meantime.
        </p>
        <Link href="/products" className={cn(buttonVariants(), "mt-6 h-11 rounded-full px-6")}>
          Shop all
        </Link>
      </div>
    );
  }

  return (
    <motion.div layout className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard product={p} priority={i < 4} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
