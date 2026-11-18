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

/*
 * A product's accent is either one of the preset tokens above ("brand-cherry")
 * or a custom colour picked in the admin, stored as "#rrggbb". Custom colours
 * are painted onto the bottle photo by /api/bottle (cached after the first use).
 */
export const isHexAccent = (accent: string) => /^#[0-9a-fA-F]{6}$/.test(accent);

/** The liquid colour as #rrggbb. */
export function liquidColor(accent: string): string {
  if (isHexAccent(accent)) return accent.toLowerCase();
  return (PERFUME_COLORS[accent] ?? PERFUME_COLORS[DEFAULT_ACCENT]).hex;
}

/** For CSS: the colour itself, or the theme variable of a preset. */
export function accentCss(accent: string): string {
  return isHexAccent(accent) ? accent.toLowerCase() : `var(--${accent})`;
}

/** The preset whose photos exist, falling back to the original deep red. */
export function bottleAccent(accent: string): string {
  return accent in PERFUME_COLORS ? accent : DEFAULT_ACCENT;
}

/** Bottle photo for an accent and size (12, 6, 3): a prebuilt file, or the recolouring route for a custom colour. */
export function bottleImageUrl(accent: string, size: string): string {
  return isHexAccent(accent)
    ? `/api/bottle/${size}/${accent.slice(1).toLowerCase()}.webp`
    : `/bottles/${bottleAccent(accent)}/${size}.webp`;
}

/** Small square PNG of the bottle for order emails (mail apps can't show WebP). */
export function emailBottleUrl(origin: string, accent: string, size: string): string {
  return isHexAccent(accent)
    ? `${origin}/api/bottle/${size}/${accent.slice(1).toLowerCase()}.png?e=1`
    : `${origin}/email-bottles/${bottleAccent(accent)}/${size}.png`;
}
