"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, Droplets, Leaf, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { ProductMedia } from "./product-media";
import { ProductGraphic } from "./product-graphic";
import { AddToCartButton } from "./add-to-cart-button";
import { ReviewForm } from "./review-form";
import { formatPrice, discountPercent } from "@/lib/format";
import { noteChips, scentProfile } from "@/lib/scent";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import type { StoreProduct, ReviewView } from "@/lib/types";

/** Lowest cart value that unlocks free shipping, from the store's rules. */
function freeShippingText(rules: {
  shippingFee: number;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  tiers: { minSubtotal: number; freeShipping: boolean }[];
}): string {
  if (rules.shippingFee === 0) return "Free shipping";
  const mins = rules.tiers.filter((t) => t.freeShipping).map((t) => t.minSubtotal);
  if (rules.freeShippingEnabled) mins.push(rules.freeShippingThreshold);
  if (mins.length === 0) return "";
  return `Free shipping over ${formatPrice(Math.min(...mins))}`;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductDetail({
  product,
  reviews,
  categoryName,
}: {
  product: StoreProduct;
  reviews: ReviewView[];
  categoryName?: string | null;
}) {
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [tab, setTab] = useState<"about" | "use" | "safety">("about");
  const images = product.images ?? [];
  const { commerce } = useSiteSettings();
  const shippingNote = [freeShippingText(commerce), commerce.deliveryEstimate && `ships in ${commerce.deliveryEstimate}`]
    .filter(Boolean)
    .join(" · ");
  const off = discountPercent(product.price, product.compareAtPrice);
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const profile = scentProfile(product);
  const chips = noteChips(product);

  return (
    <div className="container-page py-8 sm:py-12">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3" />
        <Link href="/products" className="hover:text-foreground">Shop</Link>
        {categoryName && (
          <>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{categoryName}</span>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* Media */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted shadow-soft ring-1 ring-foreground/10">
            {images.length > 0 ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={images[active]}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image src={images[active]} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            ) : (
              <ProductMedia product={product} priority sizes="(max-width: 1024px) 100vw, 50vw" />
            )}
            <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
              {product.mood && (
                <span className="glass rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]">{product.mood}</span>
              )}
              {off && (
                <span className="rounded-full bg-amber px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">−{off}%</span>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <ul className="mt-3 grid grid-cols-5 gap-2 sm:gap-3">
              {images.map((src, i) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === active}
                    className={`relative block aspect-square w-full overflow-hidden rounded-xl bg-muted transition-all ${
                      i === active ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="flex flex-col"
        >
          {product.tagline && <p className="text-eyebrow">{product.tagline}</p>}
          <h1 className="mt-3 text-4xl leading-[1.02] sm:text-5xl">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-2xl">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>
            {reviews.length > 0 && (
              <a href="#reviews" className="flex items-center gap-2 text-sm">
                <span className="flex text-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={i < Math.round(avgRating) ? "size-3.5 fill-current" : "size-3.5 text-foreground/20"} />
                  ))}
                </span>
                <span className="text-muted-foreground">
                  {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </a>
            )}
          </div>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">{product.description}</p>

          {/* aroma notes */}
          {chips.length > 0 && (
            <div className="mt-6">
              <p className="text-eyebrow">Aroma notes</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-foreground/10 px-3.5 py-1.5 text-xs capitalize"
                    style={{ background: `color-mix(in oklab, var(--${product.accentColor}) 12%, transparent)` }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* scent profile */}
          <div className="mt-7 grid grid-cols-3 gap-x-6 gap-y-4 rounded-3xl border border-foreground/10 bg-card p-5 sm:grid-cols-6">
            {profile.map((a, i) => (
              <div key={a.label}>
                <div className="flex h-14 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(8, a.value * 100)}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.06, ease }}
                    className="w-full rounded-t-md"
                    style={{ background: `linear-gradient(to top, var(--${product.accentColor}), color-mix(in oklab, var(--${product.accentColor}) 40%, white))` }}
                  />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{a.label}</p>
              </div>
            ))}
          </div>

          {product.sizes.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Size {selectedSize && <span className="text-primary">· {selectedSize}</span>}
                </span>
                {!selectedSize && <span className="text-xs text-muted-foreground">Select a size</span>}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={
                      "min-w-14 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.1em] transition-colors " +
                      (selectedSize === s ? "border-primary bg-primary text-primary-foreground" : "border-foreground/15 hover:border-foreground")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + add */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 self-start rounded-full border border-foreground/15 p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid size-10 place-items-center rounded-full hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid size-10 place-items-center rounded-full hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <AddToCartButton
              product={product}
              qty={qty}
              selectedSize={selectedSize}
              size="lg"
              className="h-12 w-full rounded-full text-sm shadow-soft sm:w-auto sm:flex-1 sm:px-10"
            >
              Add to bag · {formatPrice(product.price * qty)}
            </AddToCartButton>
          </div>

          <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {shippingNote && (
              <li className="flex items-center gap-2"><Truck className="size-4 text-primary" strokeWidth={1.7} />{shippingNote}</li>
            )}
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" strokeWidth={1.7} />GC/MS tested, batch dated</li>
            <li className="flex items-center gap-2"><Leaf className="size-4 text-primary" strokeWidth={1.7} />No synthetic fragrance</li>
            <li className="flex items-center gap-2"><Droplets className="size-4 text-primary" strokeWidth={1.7} />Amber glass, orifice reducer</li>
          </ul>

          {/* Tabs */}
          <div className="mt-9 border-t border-foreground/10">
            <div className="flex gap-6">
              {(
                [
                  ["about", "What's inside"],
                  ["use", "How to use"],
                  ["safety", "Safety"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`relative py-4 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${tab === k ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                  {tab === k && <motion.span layoutId="pd-tab" className="absolute inset-x-0 -top-px h-0.5 bg-amber" />}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="pb-2 text-sm leading-relaxed text-muted-foreground"
              >
                {tab === "about" && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {(product.benefits.length ? product.benefits : ["100% pure", "Small batch"]).map((b) => (
                      <li key={b} className="flex items-center gap-2 text-foreground/85">
                        <Check className="size-3.5 shrink-0 text-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {tab === "use" && (
                  <p>
                    <strong className="text-foreground">Diffuse:</strong> 4–6 drops in water, 30–60 minutes at a time.{" "}
                    <strong className="text-foreground">On skin:</strong> dilute to 1–3% in a carrier oil (6–18 drops per 30 ml) and apply to pulse points.{" "}
                    <strong className="text-foreground">Bath:</strong> mix 5 drops with a tablespoon of carrier oil before adding to water.
                  </p>
                )}
                {tab === "safety" && (
                  <p>
                    {product.ingredients ||
                      "For external and aromatic use only. Keep out of reach of children and pets. Patch test before use. Consult a doctor if pregnant or nursing."}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="mt-20 scroll-mt-24 border-t border-foreground/10 pt-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-eyebrow">Reviews</p>
            <h2 className="mt-2 text-3xl">What customers say</h2>
          </div>
          {reviews.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {avgRating.toFixed(1)} average from {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>
        {reviews.length === 0 && (
          <div className="mt-8 flex items-center gap-4 rounded-3xl border border-dashed border-foreground/15 p-6">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl">
              <ProductGraphic accent={product.accentColor} label={product.name} className="size-full" />
            </div>
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to tell us how {product.name} found its way into your day.</p>
          </div>
        )}
        {reviews.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="rounded-3xl border border-foreground/10 bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-amber">
                    {[...Array(r.rating)].map((_, s) => (
                      <Star key={s} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  {r.verified && (
                    <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">✓ Verified</span>
                  )}
                </div>
                <blockquote className="mt-3 font-heading text-lg leading-snug">“{r.comment}”</blockquote>
                {r.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.images.map((src, k) => (
                      <div key={k} className="relative size-16 overflow-hidden rounded-xl border">
                        <Image src={src} alt="Customer photo" fill sizes="64px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <figcaption className="mt-4 text-xs font-medium uppercase tracking-[0.14em]">{r.author}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <ReviewForm productId={product.id} />
      </section>
    </div>
  );
}
