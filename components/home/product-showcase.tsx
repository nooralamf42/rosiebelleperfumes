import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import type { StoreProduct } from "@/lib/types";

export function ProductShowcase({
  id,
  eyebrow,
  title,
  description,
  products,
  ctaHref = "/products",
  ctaLabel = "Shop all",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  products: StoreProduct[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section id={id} className="container-page py-20 sm:py-28">
      <Reveal>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
            <h2 className="mt-3 max-w-xl text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
            {description && (
              <p className="mt-4 max-w-lg text-base text-muted-foreground">{description}</p>
            )}
          </div>
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-1.5 border-b border-foreground pb-1 text-xs uppercase tracking-[0.14em] transition-opacity hover:opacity-60"
          >
            {ctaLabel}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>

      <StaggerGroup className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4" amount={0.1}>
        {products.map((p, i) => (
          <StaggerItem key={p.id}>
            <ProductCard product={p} priority={i < 4} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
