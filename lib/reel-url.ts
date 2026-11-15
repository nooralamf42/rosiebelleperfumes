/**
 * Sources for a social reel. A video uploaded to Cloudinary is served as a
 * 9:16 vertical crop at phone width (small file, any source orientation), with
 * a cover image taken from its first second unless the owner set one. Links
 * from any other host are used exactly as given.
 */
export function reelSources(videoUrl: string, posterUrl: string): { video: string; poster: string } {
  const m = videoUrl.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.+)$/);
  // Already carries transformations: respect the owner's choice.
  if (!m || /^(?:[a-z]{1,3}_[^/]+,?)+\//.test(m[2])) return { video: videoUrl, poster: posterUrl };
  const base = m[2];
  const withoutExt = base.replace(/\.[a-z0-9]+$/i, "");
  return {
    video: `${m[1]}c_fill,ar_9:16,w_540,f_auto:video,q_auto:low/${base}`,
    poster: posterUrl || `${m[1]}c_fill,ar_9:16,w_540,so_1,f_jpg,q_auto/${withoutExt}.jpg`,
  };
}
