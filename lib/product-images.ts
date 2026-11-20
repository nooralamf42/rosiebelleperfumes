/*
 * Product pictures. Every product has a general set (shown for every size) and,
 * optionally, a set of its own for each size (3 gm, 6 gm...). Each set holds up
 * to 4 pictures; the first one is the primary picture and the order is the
 * order shown. A size without pictures of its own shows the general set, and a
 * product with none at all shows the bottle illustration.
 */
export const MAX_PRODUCT_IMAGES = 4;

export type SizeImages = Record<string, string[]>;

type WithImages = { images: string[]; sizeImages?: SizeImages | null };

/** The pictures to show for a size (or for the product when no size is chosen). */
export function imagesForSize(p: WithImages, size: string | null | undefined): string[] {
  const own = size ? p.sizeImages?.[size] : undefined;
  return own && own.length > 0 ? own : p.images;
}

/** One picture for a card, the cart or an email: the chosen size's primary, else any primary. */
export function primaryImage(p: WithImages, size?: string | null): string | null {
  const first = imagesForSize(p, size)[0];
  if (first) return first;
  for (const list of Object.values(p.sizeImages ?? {})) if (list[0]) return list[0];
  return null;
}

/** Every picture a product uses (for cleaning up files that are no longer used). */
export function allProductImages(p: WithImages): string[] {
  return [...p.images, ...Object.values(p.sizeImages ?? {}).flat()];
}

/** Reads the stored JSON safely. */
export function parseSizeImages(raw: unknown): SizeImages {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: SizeImages = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === "string").slice(0, MAX_PRODUCT_IMAGES);
  }
  return out;
}
