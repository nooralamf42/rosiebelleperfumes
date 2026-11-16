import ContentPage, { generateMetadata as contentMetadata } from "../[slug]/page";

/*
 * /about gets its own route (instead of the generic [slug] one) so it can have
 * its own loading skeleton that matches the editorial layout. The page content
 * and SEO still come from the "about" page in Admin > Pages.
 */
const params = Promise.resolve({ slug: "about" });

export const generateMetadata = () => contentMetadata({ params });

export default function AboutPage() {
  return ContentPage({ params });
}
