/**
 * Rosiebelle Perfumes store settings:
 *   npx tsx prisma/seed-settings.ts --preset=rosiebelle
 */
import type { SettingsSection } from "../../lib/settings/schema";

export const settings: Record<SettingsSection, unknown> = {
  identity: {
    storeName: "Rosiebelle Perfumes",
    tagline: "Natural attars, oud and absolutes.",
    seoTitle: "Rosiebelle Perfumes — Natural Attars, Oud, Musk & Absolutes",
    seoDescription:
      "Natural oils, oud, mukhallat, musk and absolutes from Kannauj, sold in 12, 6 and 3 gm bottles and delivered across India.",
    footerNote: "Crafted in Kannauj, India",
    shopHeading: "The collection",
    shopDescription: "Natural oils, oud, mukhallat, musk and absolutes, in 12, 6 and 3 gm bottles.",
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
      badge: "Natural attars · Kannauj",
      headline: "Nature, distilled to its",
      highlight: "essence",
      subtext:
        "Natural oils, oud, mukhallat, musk and absolutes from Kannauj. Sold by the gram in 12, 6 and 3 gm bottles, delivered across India.",
      primaryCta: { label: "Shop the collection", href: "/products" },
      secondaryCta: { label: "Explore oud", href: "/products?category=oud" },
      ratingText: "",
      videoUrl: "",
    },
    marquee: [
      "Shamama",
      "Mysore sandalwood",
      "Taif rose",
      "Oud",
      "Mukhallat",
      "Musk",
      "Ruh khus",
      "Jasmine",
      "Ambergris",
      "Saffron",
    ],
    products: {
      eyebrow: "Signature pieces",
      title: "The ones we reach for",
      description: "A few of our finest oils, from Mysore sandalwood to Taif rose.",
    },
    features: {
      eyebrow: "Why Rosiebelle",
      title: "Rare oils, honestly sold",
      items: [
        { icon: "leaf", title: "Natural oils", copy: "Attars, ruh, oud and absolutes, listed by name and origin." },
        { icon: "badge-check", title: "Sold by the gram", copy: "Choose 12, 6 or 3 gm. Try a rare oil in the small bottle first." },
        { icon: "shield-check", title: "Packed with care", copy: "Glass bottles with screw caps, wrapped securely for the journey." },
        { icon: "truck", title: "Pan-India delivery", copy: "Free shipping over ₹999, carefully packed and tracked." },
      ],
    },
    // Placeholder videos (Cloudinary demo cloud). Replace in Admin > Settings > Homepage > Social reels.
    reels: {
      eyebrow: "Follow along",
      title: "Seen on social",
      subtitle: "Short films from our feed. Tap one to play.",
      items: [
        { videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4", posterUrl: "", handle: "@rosiebelle", caption: "Sunday ritual: one dab, one deep breath.", link: "" },
        { videoUrl: "https://res.cloudinary.com/demo/video/upload/elephants.mp4", posterUrl: "", handle: "@rosiebelle", caption: "Where our oils come from.", link: "" },
        { videoUrl: "https://res.cloudinary.com/demo/video/upload/samples/sea-turtle.mp4", posterUrl: "", handle: "@rosiebelle", caption: "Slow mornings with a little attar.", link: "" },
        { videoUrl: "https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4", posterUrl: "", handle: "@rosiebelle", caption: "Behind the scenes: bottling day.", link: "" },
      ],
    },
    testimonials: {
      title: "Worn and loved",
      subtitle: "Words from our customers.",
    },
    promo: {
      title: "Build your ritual, we'll cover the rest",
      subtitle: "Spend more, save more. Free shipping unlocks at ₹999.",
      cta: { label: "Shop the collection", href: "/products" },
    },
    faq: {
      title: "Good questions",
      items: [
        {
          q: "What is an attar?",
          a: "An attar, or ruh, is a traditional perfume oil, usually worn without alcohol. A small dab on the pulse points is enough, and it develops on your skin through the day.",
        },
        {
          q: "How do I wear it?",
          a: "Dab a little on your wrists, neck or clothing. Start small, because these oils are concentrated. Patch test first, and keep away from eyes, flame and children.",
        },
        {
          q: "Why are there three sizes?",
          a: "Every oil comes in 12, 6 or 3 gm. The 6 gm price is our base, 12 gm is double and 3 gm is half, so you can try a rare oil in the small bottle before committing.",
        },
        {
          q: "How fast is shipping?",
          a: "Most orders arrive in 3–5 business days. You'll get tracking details as soon as your order ships.",
        },
        {
          q: "What's your return policy?",
          a: "If something arrives damaged or isn't right, write to us within 7 days and we'll replace it or refund you. Opened oils can't be resold, so please tell us what went wrong.",
        },
      ],
    },
  },
};
