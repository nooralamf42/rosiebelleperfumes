/**
 * Perfume liquid colours, keyed by a product's accent token (the swatches in
 * Admin > Products). The bottle photos in public/bottles are generated from
 * one photo by scripts/build-bottle-photos.ts, which recolours the liquid to
 * each of these. Change a colour here and re-run that script.
 */
export const PERFUME_COLORS: Record<string, { label: string; hex: string }> = {
  "brand-cherry": { label: "Deep red", hex: "#a01818" },
  "brand-tangerine": { label: "Orange", hex: "#f2760f" },
  "brand-lemon": { label: "Yellow", hex: "#f3c400" },
  "brand-peach": { label: "Amber", hex: "#c47a45" },
  "brand-berry": { label: "Plum", hex: "#8a1f66" },
  "brand-grape": { label: "Violet", hex: "#4d2a85" },
  "brand-lavender": { label: "Lilac", hex: "#8d6bd6" },
  "brand-mint": { label: "Green", hex: "#1c8f5e" },
  "brand-sky": { label: "Blue", hex: "#1b7fb0" },
};

export const PERFUME_ACCENTS = Object.keys(PERFUME_COLORS);

/** The colour used when a product's accent isn't one of the known ones. */
export const DEFAULT_ACCENT = "brand-cherry";

export function liquidColor(accent: string): string {
  return (PERFUME_COLORS[accent] ?? PERFUME_COLORS[DEFAULT_ACCENT]).hex;
}

/** The accent whose photos exist, falling back to the original deep red. */
export function bottleAccent(accent: string): string {
  return accent in PERFUME_COLORS ? accent : DEFAULT_ACCENT;
}
