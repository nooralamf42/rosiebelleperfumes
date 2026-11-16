import type { StoreProduct } from "./types";

/*
 * Product sizes with their own prices.
 *
 * Sizes are stored as plain strings in the existing `sizes` field, so no
 * database change is needed. An entry is either just a label ("2.4") or a
 * label with a price in rupees ("12 ml=1299"). Entries without a price use
 * the product's own price. The first size is the default one, and the
 * product's own price should match it.
 */

export type ProductSize = {
  label: string;
  /** Unit price in paise. */
  price: number;
};

export type BottleSize = "12" | "6" | "3";

type SizedProduct = Pick<StoreProduct, "sizes" | "price">;

/** "12 ml=1299" → { label: "12 ml", price: 129900 }. */
export function parseSizeEntry(raw: string, fallbackPrice: number): ProductSize {
  const i = raw.lastIndexOf("=");
  if (i > 0) {
    const label = raw.slice(0, i).trim();
    const rupees = Number(raw.slice(i + 1).trim());
    if (label && Number.isFinite(rupees) && rupees > 0) {
      return { label, price: Math.round(rupees * 100) };
    }
    if (label) return { label, price: fallbackPrice };
  }
  return { label: raw.trim(), price: fallbackPrice };
}

/** The product's sizes with resolved prices (empty when it has no sizes). */
export function productSizes(p: SizedProduct): ProductSize[] {
  return p.sizes.map((s) => parseSizeEntry(s, p.price)).filter((s) => s.label);
}

/**
 * Authoritative unit price for a size. Used by checkout, so an unknown or
 * missing size never undercharges: it falls back to the default (first) size.
 */
export function priceForSize(p: SizedProduct, size: string | null | undefined): number {
  const sizes = productSizes(p);
  if (sizes.length === 0) return p.price;
  const wanted = (size ?? "").trim().toLowerCase();
  return (sizes.find((s) => s.label.toLowerCase() === wanted) ?? sizes[0]).price;
}

/** Lowest price across sizes, for "From ₹…" labels, sorting and filtering. */
export function startingPrice(p: SizedProduct): number {
  const sizes = productSizes(p);
  return sizes.length ? Math.min(...sizes.map((s) => s.price)) : p.price;
}

/** True when sizes carry different prices. */
export function hasSizePricing(p: SizedProduct): boolean {
  const prices = new Set(productSizes(p).map((s) => s.price));
  return prices.size > 1;
}

/**
 * Strike-through price for a size, scaled from the product's compare-at price
 * so the discount percentage is the same for every size.
 */
export function compareAtForPrice(p: Pick<StoreProduct, "price" | "compareAtPrice">, unitPrice: number): number | null {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return null;
  return Math.round((unitPrice * p.compareAtPrice) / p.price / 100) * 100;
}

/** "12 ml" → "12", "6ML" → "6", anything else → null. */
export function bottleSizeOf(label: string | null | undefined): BottleSize | null {
  const m = (label ?? "").match(/(\d+(?:\.\d+)?)\s*ml/i);
  if (!m) return null;
  const n = Math.round(Number(m[1]));
  return n >= 9 ? "12" : n >= 5 ? "6" : "3";
}

/** Bottle sizes a product comes in, largest first. Defaults to a single 12 ml bottle. */
export function bottleSizesOf(p: Pick<StoreProduct, "sizes">): BottleSize[] {
  const found = new Set<BottleSize>();
  for (const raw of p.sizes) {
    const b = bottleSizeOf(raw.split("=")[0]);
    if (b) found.add(b);
  }
  const ordered = (["12", "6", "3"] as BottleSize[]).filter((b) => found.has(b));
  return ordered.length ? ordered : ["12"];
}

/** Raw entry for the admin editor: ("12 ml", 1299) → "12 ml=1299". */
export function formatSizeEntry(label: string, rupees: number | string): string {
  const r = Number(rupees);
  return Number.isFinite(r) && r > 0 ? `${label.trim()}=${r}` : label.trim();
}
