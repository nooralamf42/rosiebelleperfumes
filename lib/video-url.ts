/**
 * Smallest sensible version of a Cloudinary video: best format and low quality
 * picked per browser, capped at 720px wide. Other hosts' links are left as is.
 */
export function optimizedVideoUrl(url: string): string {
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+)$/);
  if (!m || /^(?:[a-z]{1,3}_[^/]+,?)+\//.test(m[2])) return url;
  return `${m[1]}f_auto:video,q_auto:low,w_720,c_limit/${m[2]}`;
}
