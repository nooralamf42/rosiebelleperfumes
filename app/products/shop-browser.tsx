"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StoreProduct } from "@/lib/types";

const SORTS = [
  { value: "", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "A to Z" },
];

const STEP = 10000; // ₹100 in paise

const roundDown = (p: number) => Math.floor(p / STEP) * STEP;
const roundUp = (p: number) => Math.ceil(p / STEP) * STEP;

/**
 * Shop browser: category pills + a filter row (price range, mood, on sale)
 * + sort, applied instantly on the client. Filters live in the URL so a
 * filtered view can be shared or refreshed.
 */
export function ShopBrowser({
  products,
  categories,
  activeCategory,
}: {
  products: StoreProduct[];
  categories: { name: string; slug: string }[];
  activeCategory?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const floor = products.length ? roundDown(Math.min(...products.map((p) => p.price))) : 0;
  const ceil = products.length ? roundUp(Math.max(...products.map((p) => p.price))) : STEP;

  const sort = params.get("sort") ?? "";
  const sale = params.get("sale") === "1";
  const moods = useMemo(() => (params.get("mood") ?? "").split(",").filter(Boolean), [params]);
  const urlMin = Number(params.get("min")) || floor;
  const urlMax = Number(params.get("max")) || ceil;

  const [range, setRange] = useState<[number, number]>([urlMin, urlMax]);
  const [open, setOpen] = useState(false);
  // Re-sync the slider when the URL changes (back button, Clear filters).
  const [seen, setSeen] = useState([urlMin, urlMax]);
  if (seen[0] !== urlMin || seen[1] !== urlMax) {
    setSeen([urlMin, urlMax]);
    setRange([urlMin, urlMax]);
  }

  const allMoods = useMemo(
    () => Array.from(new Set(products.map((p) => p.mood?.trim()).filter((m): m is string => Boolean(m)))).sort(),
    [products],
  );

  const setParams = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    const q = p.toString();
    router.replace(q ? `/products?${q}` : "/products", { scroll: false });
  };

  const commitRange = (next: [number, number]) => {
    setParams({
      min: next[0] > floor ? String(next[0]) : null,
      max: next[1] < ceil ? String(next[1]) : null,
    });
  };

  const hrefForCategory = (slug?: string) => {
    const p = new URLSearchParams(params.toString());
    p.delete("min");
    p.delete("max");
    if (slug) p.set("category", slug);
    else p.delete("category");
    const q = p.toString();
    return q ? `/products?${q}` : "/products";
  };

  const visible = useMemo(() => {
    let list = products.filter(
      (p) =>
        p.price >= urlMin &&
        p.price <= urlMax &&
        (!sale || (p.compareAtPrice ?? 0) > p.price) &&
        (moods.length === 0 || (p.mood && moods.includes(p.mood.trim()))),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, urlMin, urlMax, sale, moods, sort]);

  const activeCount = (urlMin > floor || urlMax < ceil ? 1 : 0) + (sale ? 1 : 0) + moods.length;

  return (
    <>
      {/* category pills + toolbar */}
      <div className="sticky top-[var(--nav-offset,4rem)] z-30 -mx-4 mt-8 border-y border-foreground/10 bg-background px-4 transition-[top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-start justify-between gap-4 py-3">
          <div className="flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
            <Pill href={hrefForCategory()} label="All" active={!activeCategory} />
            {categories.map((c) => (
              <Pill key={c.slug} href={hrefForCategory(c.slug)} label={c.name} active={activeCategory === c.slug} />
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-xs font-medium uppercase tracking-[0.12em] transition-colors",
                open || activeCount > 0 ? "border-foreground bg-foreground text-background" : "border-foreground/15 hover:border-foreground",
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              Filters
              {activeCount > 0 && <span className="grid size-4 place-items-center rounded-full bg-amber text-[10px] text-white">{activeCount}</span>}
            </button>
            <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <select
                value={sort}
                onChange={(e) => setParams({ sort: e.target.value || null })}
                aria-label="Sort products"
                className="h-9 rounded-full border border-foreground/15 bg-background px-3 text-xs text-foreground outline-none focus:border-foreground"
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

        {/* filter drawer */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="grid gap-8 border-t border-foreground/10 py-6 md:grid-cols-[1.2fr_1fr_auto] md:items-start">
                {/* price range */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-eyebrow">Price</p>
                    <p className="text-sm tabular-nums">
                      {formatPrice(range[0])} – {formatPrice(range[1])}
                    </p>
                  </div>
                  <RangeSlider
                    min={floor}
                    max={ceil}
                    step={STEP}
                    value={range}
                    onChange={setRange}
                    onCommit={commitRange}
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>{formatPrice(floor)}</span>
                    <span>{formatPrice(ceil)}</span>
                  </div>
                </div>

                {/* mood */}
                {allMoods.length > 0 && (
                  <div>
                    <p className="text-eyebrow">Mood</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {allMoods.map((m) => {
                        const on = moods.includes(m);
                        return (
                          <button
                            key={m}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              const next = on ? moods.filter((x) => x !== m) : [...moods, m];
                              setParams({ mood: next.join(",") || null });
                            }}
                            className={cn(
                              "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                              on ? "border-primary bg-primary text-primary-foreground" : "border-foreground/15 hover:border-foreground",
                            )}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* toggles + clear */}
                <div className="flex flex-col gap-3">
                  <p className="text-eyebrow">More</p>
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <span
                      role="switch"
                      aria-checked={sale}
                      tabIndex={0}
                      onClick={() => setParams({ sale: sale ? null : "1" })}
                      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setParams({ sale: sale ? null : "1" })}
                      className={cn("relative h-6 w-10 rounded-full transition-colors", sale ? "bg-primary" : "bg-foreground/15")}
                    >
                      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", sale ? "translate-x-[18px]" : "translate-x-0.5")} />
                    </span>
                    On sale only
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
                    Sort
                    <select
                      value={sort}
                      onChange={(e) => setParams({ sort: e.target.value || null })}
                      className="h-9 flex-1 rounded-full border border-foreground/15 bg-background px-3 text-xs text-foreground"
                    >
                      {SORTS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {activeCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setParams({ min: null, max: null, sale: null, mood: null })}
                      className="inline-flex items-center gap-1 self-start text-xs uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" /> Clear filters
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        {visible.length} {visible.length === 1 ? "product" : "products"}
        {activeCount > 0 && ` · ${activeCount} ${activeCount === 1 ? "filter" : "filters"} applied`}
      </p>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[2rem] border border-dashed border-foreground/15 px-6 py-20 text-center">
          <p className="font-heading text-2xl">Nothing matches those filters</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">Widen the price range or clear a mood to see more oils.</p>
          <button
            type="button"
            onClick={() => setParams({ min: null, max: null, sale: null, mood: null })}
            className={cn(buttonVariants(), "mt-6 h-11 rounded-full px-6")}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div layout className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p, i) => (
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
      )}
    </>
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
        <motion.span layoutId="shop-pill" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
      )}
      <span className="relative">{label}</span>
    </Link>
  );
}

/** Two native range inputs stacked on one track: accessible, touch-friendly, no dependency. */
function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  onCommit,
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  onCommit: (v: [number, number]) => void;
}) {
  const span = Math.max(1, max - min);
  const left = ((value[0] - min) / span) * 100;
  const right = ((value[1] - min) / span) * 100;
  return (
    <div className="relative mt-4 h-6">
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/10" />
      <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${left}%`, right: `${100 - right}%` }} />
      {[0, 1].map((i) => (
        <input
          key={i}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[i]}
          aria-label={i === 0 ? "Minimum price" : "Maximum price"}
          onChange={(e) => {
            const v = Number(e.target.value);
            const next: [number, number] = i === 0 ? [Math.min(v, value[1] - step), value[1]] : [value[0], Math.max(v, value[0] + step)];
            onChange(next);
          }}
          onPointerUp={() => onCommit(value)}
          onKeyUp={() => onCommit(value)}
          onTouchEnd={() => onCommit(value)}
          className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
        />
      ))}
    </div>
  );
}
