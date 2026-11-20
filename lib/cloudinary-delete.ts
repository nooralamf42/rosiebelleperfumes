import { cloudinary, cloudinaryEnabled } from "./cloudinary";

/**
 * The Cloudinary file name behind one of our own product picture URLs, or null
 * for anything else (a link pasted from another site, a picture of another
 * Cloudinary account, a file outside store/products). Only our own product
 * pictures are ever deleted.
 */
export function productImagePublicId(url: string): string | null {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const m = url.match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(store\/products\/[^.?#/]+)\.[A-Za-z0-9]+(?:[?#].*)?$/);
  return m && cloud && m[1] === cloud ? m[2] : null;
}

/** Delete product pictures from Cloudinary. Never throws: a failed delete must not break a save. */
export async function deleteProductImages(urls: string[]): Promise<void> {
  if (!cloudinaryEnabled) return;
  const ids = [...new Set(urls.map(productImagePublicId).filter((x): x is string => Boolean(x)))];
  await Promise.all(
    ids.map((id) =>
      cloudinary.uploader.destroy(id, { resource_type: "image", invalidate: true }).catch((err) => {
        console.error(`Could not delete product picture ${id}`, err);
      }),
    ),
  );
}
