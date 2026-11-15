/**
 * Rosiebelle Perfumes store settings:
 *   npx tsx prisma/seed-settings.ts --preset=rosiebelle
 */
import type { SettingsSection } from "../../lib/settings/schema";

export const settings: Record<SettingsSection, unknown> = {
  identity: {
    storeName: "Rosiebelle Perfumes",
    tagline: "Pure botanicals, bottled.",
    seoTitle: "Rosiebelle Perfumes — Pure Essential Oils, Blends & Carrier Oils",
    seoDescription:
      "Single-origin essential oils, small-batch blends and cold-pressed carrier oils, GC/MS tested and delivered across India. From ₹399.",
    footerNote: "Distilled with care in India",
    shopHeading: "The apothecary",
    shopDescription: "Every oil we bottle, from single botanicals to ready-to-diffuse blends.",
    contactEmail: "hello@rosiebelle.in",
    contactPhone: "+91 98765 43210",
    whatsapp: "9876543210",
    address: "Rosiebelle Perfumes, India",
    socials: { instagram: "https://instagram.com/rosiebelleperfumes", facebook: "", youtube: "", x: "" },
  },
  theme: {
    preset: "botanical",
    primary: "#1e4d3a",
    secondary: "#e9e2d3",
    background: "#f6f2ea",
    foreground: "#16211b",
  },
  commerce: {
    shippingFee: 6900,
    freeShippingEnabled: true,
    freeShippingThreshold: 99900,
    tiers: [
      { minSubtotal: 199900, discount: 15000, freeShipping: true },
      { minSubtotal: 349900, discount: 40000, freeShipping: true },
    ],
    deliveryEstimate: "3–5 business days",
    returnWindowDays: 7,
  },
  homepage: {
    hero: {
      badge: "Single origin · GC/MS tested",
      headline: "Nature, distilled to its",
      highlight: "essence",
      subtext:
        "Pure essential oils, small-batch blends and cold-pressed carrier oils. Sourced from the farms that grow them, bottled in amber glass, delivered across India.",
      primaryCta: { label: "Shop the apothecary", href: "/products" },
      secondaryCta: { label: "Find your blend", href: "/products?category=blends" },
      ratingText: "4.9 from 2,000+ rituals",
      videoUrl: "",
    },
    marquee: [
      "Lavender",
      "Peppermint",
      "Frankincense",
      "Sweet orange",
      "Eucalyptus",
      "Tea tree",
      "Sandalwood",
      "Bergamot",
      "Vetiver",
      "Cedarwood",
    ],
    products: {
      eyebrow: "Most loved",
      title: "The oils people come back for",
      description: "Bestsellers from the apothecary, chosen by the people who diffuse them every day.",
    },
    features: {
      eyebrow: "Why Rosiebelle",
      title: "Honest oils, no shortcuts",
      items: [
        { icon: "leaf", title: "Single origin", copy: "Each oil names its botanical and the region it was grown in." },
        { icon: "badge-check", title: "GC/MS tested", copy: "Every batch is lab-tested for purity. Reports on request." },
        { icon: "shield-check", title: "Amber glass only", copy: "UV-protected bottles with orifice reducers, never plastic." },
        { icon: "truck", title: "Pan-India delivery", copy: "Free shipping over ₹999, carefully packed in recycled paper." },
      ],
    },
    // Placeholder videos (Cloudinary demo cloud). Replace in Admin > Settings > Homepage > Social reels.
    reels: {
      eyebrow: "Follow along",
      title: "Seen on social",
      subtitle: "Short films from our feed. Tap one to play.",
      items: [
        { videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4", posterUrl: "", handle: "@rosiebelle", caption: "Sunday ritual: three drops, one deep breath.", link: "" },
        { videoUrl: "https://res.cloudinary.com/demo/video/upload/elephants.mp4", posterUrl: "", handle: "@rosiebelle", caption: "Where our frankincense comes from.", link: "" },
        { videoUrl: "https://res.cloudinary.com/demo/video/upload/samples/sea-turtle.mp4", posterUrl: "", handle: "@rosiebelle", caption: "Slow mornings with Morning Light.", link: "" },
        { videoUrl: "https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4", posterUrl: "", handle: "@rosiebelle", caption: "Behind the scenes: bottling day.", link: "" },
      ],
    },
    testimonials: {
      title: "From the diffusers of India",
      subtitle: "Real words from real rituals.",
    },
    promo: {
      title: "Build your ritual, we'll cover the rest",
      subtitle: "Spend more, save more. Free shipping unlocks at ₹999.",
      cta: { label: "Shop all oils", href: "/products" },
    },
    faq: {
      title: "Good questions",
      items: [
        {
          q: "Are your oils really 100% pure?",
          a: "Yes. Every single oil is one botanical, one origin, nothing added. Blends are made only from those oils. Each batch is GC/MS tested by an independent lab, and we'll send you the report if you ask.",
        },
        {
          q: "How do I use essential oils safely?",
          a: "Diffuse 4–6 drops in water, or dilute to 1–3% in a carrier oil before applying to skin (that's 6–18 drops per 30 ml). Never apply undiluted, never ingest, and keep away from pets' reach. Our roll-ons are already diluted for you.",
        },
        {
          q: "How long does an oil last?",
          a: "Citrus oils are best within a year of opening; most others keep for two to three years in a cool, dark place. Every bottle carries a batch date.",
        },
        {
          q: "What's your return policy?",
          a: "If something arrives damaged or isn't right, write to us within 7 days and we'll replace it or refund you. Opened oils can't be resold, so we simply ask you to tell us what went wrong.",
        },
      ],
    },
  },
};
