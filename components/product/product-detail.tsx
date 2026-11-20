"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Droplets, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { bottleBackdrop } from "./product-media";
import { BottlePhoto, bottleHeightRatio } from "./bottle-photo";
import { BottleStage } from "./bottle-stage";

import { AddToCartButton } from "./add-to-cart-button";
import { BuyNowButton } from "./buy-now-button";
import { accentCss } from "@/lib/perfume-colors";
import { imagesForSize } from "@/lib/product-images";
import { ReviewForm } from "./review-form";
import { formatPrice, discountPercent } from "@/lib/format";
import { noteChips, scentProfile } from "@/lib/scent";
import { bottleSizeOf, bottleSizesOf, compareAtForPrice, priceForSize, productSizes } from "@/lib/sizes";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { cn } from "@/lib/utils";
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

/** Folding sections for the details, so the page stays short on a phone. */
function Accordion({ items, defaultOpen = 0 }: { items: { title: string; body: ReactNode }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="divide-y divide-foreground/10 border-y border-foreground/10">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.title}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
            >
              <span className="text-xs font-medium uppercase tracking-[0.16em]">{it.title}</span>
              <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25 }} className="grid size-6 place-items-center">
                <Plus className="size-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 text-sm leading-relaxed text-muted-foreground">{it.body}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

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
  const sizeList = productSizes(product);
  // The first size is the default, so the price and bottle are always for a real choice.
  const [selectedSize, setSelectedSize] = useState<string | null>(sizeList[0]?.label ?? null);
  // Pictures of the chosen size, else the general set; the first is the primary one.
  const images = imagesForSize(product, selectedSize);
  const { commerce, identity } = useSiteSettings();
  const unitPrice = priceForSize(product, selectedSize);
  const unitCompare = compareAtForPrice(product, unitPrice);
  const bottleSizes = bottleSizesOf(product);
  const shownBottle = bottleSizeOf(selectedSize) ?? bottleSizes[0];
  const shippingNote = [freeShippingText(commerce), commerce.deliveryEstimate && `ships in ${commerce.deliveryEstimate}`]
    .filter(Boolean)
    .join(" · ");
  const off = discountPercent(product.price, product.compareAtPrice);
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const profile = scentProfile(product);
  const chips = noteChips(product);

  // The pinned buy bar (phones only) shows whenever the main buy section is off screen.
  const buyRef = useRef<HTMLDivElement>(null);
  const [buyVisible, setBuyVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const showBar = !buyVisible && !footerVisible;
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setBuyVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    // Step aside at the bottom of the page so the bar never covers the footer.
    const footer = document.querySelector("footer");
    const fo = footer ? new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.05 }) : null;
    if (footer && fo) fo.observe(footer);
    return () => {
      io.disconnect();
      fo?.disconnect();
    };
  }, []);

  const description = <p className="max-w-lg text-base leading-relaxed text-muted-foreground">{product.description}</p>;

  return (
    <div className="container-page pb-8 pt-3 sm:py-10 lg:py-12">
      {/* navigation: a quick back link on phones, a breadcrumb from tablet up */}
      <Link href="/products" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:hidden">
        <ChevronLeft className="size-4" /> {categoryName ?? "Shop"}
      </Link>
      <nav className="mb-6 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex" aria-label="Breadcrumb">
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

      {/*
       * One grid, three blocks. On a phone they stack as title, picture, buy
       * section so the Add to bag button is near the top. From tablet up the
       * picture takes the left column (sticky) and title + buy sit on the right.
       */}
      <div className="grid gap-y-5 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-x-8 md:gap-y-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-x-14">
        {/* title and price */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="order-1 md:order-none md:col-start-2 md:row-start-1"
        >
          {product.tagline && <p className="text-eyebrow">{product.tagline}</p>}
          <h1 className="mt-2 text-3xl leading-[1.05] sm:text-4xl lg:text-5xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 md:mt-5 md:justify-start">
            <div className="flex items-baseline gap-2.5">
              <span className="font-heading text-2xl md:text-3xl">{formatPrice(unitPrice)}</span>
              {unitCompare && <span className="text-sm text-muted-foreground line-through">{formatPrice(unitCompare)}</span>}
              {off && (
                <span className="rounded-full bg-amber px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">−{off}%</span>
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
                  {avgRating.toFixed(1)} · {reviews.length}
                </span>
              </a>
            )}
          </div>
        </motion.div>

        {/* picture */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease }}
          className="order-2 md:sticky md:top-24 md:order-none md:col-start-1 md:row-span-2 md:row-start-1 md:self-start"
        >
          <div
            className={cn(
              "group relative w-full overflow-hidden rounded-3xl bg-muted shadow-soft ring-1 ring-foreground/10 md:rounded-[2rem]",
              // short on a phone so the buy button stays near the top; tall and elegant on larger screens
              "aspect-square max-h-[40svh] md:aspect-[4/5] md:max-h-[calc(100svh-8rem)]",
            )}
          >
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
                  <Image src={images[active]} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex items-end justify-center px-[8%] pb-[6%] pt-[8%]" style={bottleBackdrop(product.accentColor)}>
                <BottleStage size={shownBottle} accent={product.accentColor} name={product.name} brand={identity.storeName} />
              </div>
            )}
            {product.mood && (
              <span className="glass pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] md:left-4 md:top-4">
                {product.mood}
              </span>
            )}
          </div>

          {/* bottle size thumbnails: tablet and up (on a phone the size buttons below do this job) */}
          {images.length === 0 && bottleSizes.length > 1 && (
            <ul className="mt-3 hidden grid-cols-3 gap-3 md:grid">
              {bottleSizes.map((b) => {
                const entry = sizeList.find((s) => bottleSizeOf(s.label) === b);
                const on = shownBottle === b;
                return (
                  <li key={b}>
                    <button
                      type="button"
                      onClick={() => {
                        if (entry) {
                          setSelectedSize(entry.label);
                          setActive(0);
                        }
                      }}
                      aria-label={`Show the ${b} gm bottle`}
                      aria-pressed={on}
                      className={`relative flex aspect-[4/3] w-full items-end justify-center overflow-hidden rounded-2xl px-3 pb-2 transition-all lg:aspect-square ${
                        on ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "opacity-65 hover:opacity-100"
                      }`}
                      style={bottleBackdrop(product.accentColor)}
                    >
                      <span className="flex h-full w-full items-end justify-center pt-5">
                        <BottlePhoto
                          size={b}
                          accent={product.accentColor}
                          name={product.name}
                          brand={identity.storeName}
                          style={{ height: `${(100 * bottleHeightRatio(b)).toFixed(1)}%` }}
                        />
                      </span>
                      <span className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]">{b} gm</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {images.length > 1 && (
            <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:grid md:grid-cols-5 md:gap-3 md:overflow-visible [&::-webkit-scrollbar]:hidden">
              {images.map((src, i) => (
                <li key={src} className="w-16 shrink-0 md:w-auto">
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

        {/* buy section and details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="order-3 flex flex-col md:order-none md:col-start-2 md:row-start-2 md:pt-6"
        >
          {/* on tablet and up the story comes first; on a phone it follows the buy button */}
          <div className="hidden md:block">{description}</div>

          <div ref={buyRef} className="md:mt-6">
            {/* size + quantity */}
            <div className="flex items-end justify-between gap-3">
              <p className="text-sm font-medium">{sizeList.length > 0 ? "Size" : "Quantity"}</p>
              <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-foreground/15 p-0.5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid size-8 place-items-center rounded-full hover:bg-muted"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-medium tabular-nums" aria-live="polite">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="grid size-8 place-items-center rounded-full hover:bg-muted"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
            {sizeList.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Size">
                {sizeList.map((s) => {
                  const on = selectedSize === s.label;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                          setSelectedSize(s.label);
                          setActive(0);
                        }}
                      className={
                        "rounded-2xl border px-2 py-2.5 text-center transition-all md:py-3 " +
                        (on ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-foreground/15 hover:border-foreground")
                      }
                    >
                      <span className="block text-sm font-medium">{s.label}</span>
                      <span className={"mt-0.5 block text-xs tabular-nums " + (on ? "opacity-85" : "text-muted-foreground")}>{formatPrice(s.price)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Add to bag (outlined) beside Buy now (solid, the main action) */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <AddToCartButton
                product={product}
                qty={qty}
                selectedSize={selectedSize}
                unitPrice={unitPrice}
                variant="outline"
                size="lg"
                className="h-12 min-w-0 border-foreground/25 px-3 text-sm"
              >
                Add to bag
              </AddToCartButton>
              <BuyNowButton
                product={product}
                qty={qty}
                selectedSize={selectedSize}
                unitPrice={unitPrice}
                className="h-12 min-w-0 px-3 text-sm shadow-soft"
              >
                Buy now · {formatPrice(unitPrice * qty)}
              </BuyNowButton>
            </div>

            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {shippingNote && (
                <li className="flex items-center gap-2 sm:col-span-2"><Truck className="size-4 shrink-0 text-primary" strokeWidth={1.7} />{shippingNote}</li>
              )}
              <li className="flex items-center gap-2"><ShieldCheck className="size-4 shrink-0 text-primary" strokeWidth={1.7} />Packed with care, tracked delivery</li>
              <li className="flex items-center gap-2"><Droplets className="size-4 shrink-0 text-primary" strokeWidth={1.7} />Glass bottle, screw-top cap</li>
            </ul>
          </div>

          {/* phones: the description follows the buy button */}
          <div className="mt-6 md:hidden">{description}</div>

          {chips.length > 0 && (
            <div className="mt-6">
              <p className="text-eyebrow">Aroma notes</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-foreground/10 px-3.5 py-1.5 text-xs capitalize"
                    style={{ background: `color-mix(in oklab, ${accentCss(product.accentColor)} 12%, transparent)` }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* scent profile */}
          <div className="mt-6 grid grid-cols-3 gap-x-5 gap-y-4 rounded-3xl border border-foreground/10 bg-card p-5 sm:grid-cols-6">
            {profile.map((a, i) => (
              <div key={a.label}>
                <div className="flex h-12 items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(8, a.value * 100)}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + i * 0.06, ease }}
                    className="w-full rounded-t-md"
                    style={{ background: `linear-gradient(to top, ${accentCss(product.accentColor)}, color-mix(in oklab, ${accentCss(product.accentColor)} 40%, white))` }}
                  />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{a.label}</p>
              </div>
            ))}
          </div>

          {/* details */}
          <div className="mt-8">
            <Accordion
              items={[
                {
                  title: "What's inside",
                  body: (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {(product.benefits.length ? product.benefits : ["Sold in 12, 6 or 3 gm"]).map((b) => (
                        <li key={b} className="flex items-center gap-2 text-foreground/85">
                          <Check className="size-3.5 shrink-0 text-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: "How to use",
                  body: (
                    <p>
                      <strong className="text-foreground">Wear it:</strong> a small dab on the wrists, behind the ears or on the neck. It warms and develops on your skin over the first hour.{" "}
                      <strong className="text-foreground">On clothing:</strong> dab a little on a scarf or the inside of a collar. It lasts for days on fabric, but test a hidden spot first.{" "}
                      <strong className="text-foreground">Store:</strong> keep the cap closed, in a cool, dark place away from heat.
                    </p>
                  ),
                },
                {
                  title: "Safety & care",
                  body: (
                    <p>
                      {product.ingredients ||
                        "For external and aromatic use only. Keep out of reach of children and pets. Patch test before use. Consult a doctor if pregnant or nursing."}
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="mt-16 scroll-mt-24 border-t border-foreground/10 pt-12 md:mt-20 md:pt-14">
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
            <div
              className="flex size-20 shrink-0 items-end justify-center overflow-hidden rounded-2xl px-2 pb-2 pt-2.5"
              style={bottleBackdrop(product.accentColor)}
            >
              <BottlePhoto size="12" accent={product.accentColor} name={product.name} brand={identity.storeName} className="h-full" />
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
                  {r.verified && <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">✓ Verified</span>}
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

      {/* pinned buy bar, phones only: appears once the main button has scrolled away */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            key="buy-bar"
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ duration: 0.3, ease }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur md:hidden"
          >
            <div className="container-page grid grid-cols-2 gap-2.5 py-2.5">
              <AddToCartButton
                product={product}
                qty={qty}
                selectedSize={selectedSize}
                unitPrice={unitPrice}
                variant="outline"
                size="lg"
                className="h-11 min-w-0 border-foreground/25 px-3 text-sm"
              >
                Add to bag
              </AddToCartButton>
              <BuyNowButton
                product={product}
                qty={qty}
                selectedSize={selectedSize}
                unitPrice={unitPrice}
                className="h-11 min-w-0 px-3 text-sm shadow-soft"
              >
                Buy now · {formatPrice(unitPrice * qty)}
              </BuyNowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
