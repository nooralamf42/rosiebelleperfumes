"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "A to Z" },
];

export function ShopFilters({
  categories,
  active,
  sort,
}: {
  categories: { name: string; slug: string }[];
  active?: string;
  sort?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const hrefFor = (slug?: string) => {
    const p = new URLSearchParams(params.toString());
    if (slug) p.set("category", slug);
    else p.delete("category");
    const q = p.toString();
    return q ? `/products?${q}` : "/products";
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 mt-8 border-y border-foreground/10 bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="mask-fade-x flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Pill href={hrefFor()} label="All" active={!active} />
          {categories.map((c) => (
            <Pill key={c.slug} href={hrefFor(c.slug)} label={c.name} active={active === c.slug} />
          ))}
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sort ?? ""}
            onChange={(e) => {
              const p = new URLSearchParams(params.toString());
              if (e.target.value) p.set("sort", e.target.value);
              else p.delete("sort");
              const q = p.toString();
              router.push(q ? `/products?${q}` : "/products");
            }}
            className="rounded-full border border-foreground/15 bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-foreground"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function Pill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "relative shrink-0 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-colors",
        active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="shop-pill"
          className="absolute inset-0 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative">{label}</span>
    </Link>
  );
}
