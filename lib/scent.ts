import type { StoreProduct } from "./types";

/*
 * Scent presentation helpers. Products carry free-text fields the admin
 * already edits (flavor → "aroma notes", mood → "best for"); these turn them
 * into the chips and profile bars the storefront draws. The profile is
 * derived deterministically from the product so it never flickers.
 */

export type ScentProfile = { label: string; value: number }[];

const AXES = ["Fresh", "Floral", "Woody", "Herbal", "Citrus", "Warm"] as const;

const KEYWORDS: Record<(typeof AXES)[number], string[]> = {
  Fresh: ["mint", "eucalyptus", "tea tree", "camphor", "clean", "cool", "peppermint"],
  Floral: ["lavender", "rose", "geranium", "ylang", "jasmine", "neroli", "chamomile", "floral"],
  Woody: ["cedar", "sandalwood", "vetiver", "frankincense", "patchouli", "wood", "resin"],
  Herbal: ["rosemary", "basil", "thyme", "sage", "herb", "green", "clary"],
  Citrus: ["lemon", "orange", "bergamot", "grapefruit", "lime", "citrus", "zest"],
  Warm: ["vanilla", "cinnamon", "clove", "ginger", "amber", "spice", "warm", "sweet"],
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

export function scentProfile(p: Pick<StoreProduct, "name" | "flavor" | "tagline" | "description" | "slug">): ScentProfile {
  const text = `${p.name} ${p.flavor ?? ""} ${p.tagline ?? ""} ${p.description}`.toLowerCase();
  return AXES.map((axis, i) => {
    const hits = KEYWORDS[axis].filter((k) => text.includes(k)).length;
    const base = 0.15 + hash(`${p.slug}:${i}`) * 0.3;
    const value = Math.min(1, base + hits * 0.3);
    return { label: axis, value: Math.round(value * 100) / 100 };
  });
}

/** "Lavender, bergamot · soft" → ["Lavender", "bergamot", "soft"] */
export function noteChips(p: Pick<StoreProduct, "flavor" | "benefits">): string[] {
  const fromFlavor = (p.flavor ?? "")
    .split(/[,·•|/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return (fromFlavor.length ? fromFlavor : p.benefits).slice(0, 4);
}

/** Primary mood word for the card ribbon. */
export function moodLabel(p: Pick<StoreProduct, "mood">): string | null {
  return p.mood?.trim() || null;
}
