import type { StoreProduct } from "./types";

/*
 * Starter catalogue: 16 essential-oil products across four categories.
 * Used as the demo catalogue when no database is configured, and by
 * `prisma/seed.ts` to populate a fresh store. Images are intentionally empty
 * so the illustrated amber bottle is shown until real photos are uploaded
 * in Admin → Products.
 *
 *   type DRINK  → Pure essential oils (single botanicals)
 *   type GUMMY  → Signature blends
 *   type BUNDLE → Carrier oils (slug-mapped) and ritual sets
 */
const rawDemoProducts: Omit<StoreProduct, "sizes">[] = [
  // ---- Pure essential oils ----
  {
    id: "demo-lavender",
    name: "Lavender",
    slug: "lavender-essential-oil",
    tagline: "Lavandula angustifolia · Bulgaria",
    description:
      "Steam-distilled from high-altitude Bulgarian lavender, this is the oil most people reach for first: soft, powdery and quietly floral. A few drops on a pillow or in the diffuser before bed is the whole ritual.",
    type: "DRINK",
    price: 59900,
    compareAtPrice: 74900,
    images: [],
    accentColor: "brand-lavender",
    flavor: "Lavender, soft herb, faint honey",
    mood: "Calm",
    benefits: ["100% pure, single origin", "Steam distilled", "GC/MS tested", "12, 6 or 3 ml glass bottle"],
    ingredients: "Lavandula angustifolia (lavender) flower oil. For aromatic and diluted topical use. Keep away from eyes.",
    stock: 120,
    featured: true,
  },
  {
    id: "demo-peppermint",
    name: "Peppermint",
    slug: "peppermint-essential-oil",
    tagline: "Mentha piperita · India",
    description:
      "Cold, bright and immediately awake. Our peppermint is grown in the Uttar Pradesh plains and distilled within hours of harvest, which is why the menthol hit is this clean.",
    type: "DRINK",
    price: 49900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-mint",
    flavor: "Peppermint, cool mint, green",
    mood: "Focus",
    benefits: ["100% pure", "Steam distilled", "High menthol", "12, 6 or 3 ml glass bottle"],
    ingredients: "Mentha piperita (peppermint) oil. Dilute before applying to skin. Not for children under 6.",
    stock: 90,
    featured: true,
  },
  {
    id: "demo-tea-tree",
    name: "Tea Tree",
    slug: "tea-tree-essential-oil",
    tagline: "Melaleuca alternifolia · Australia",
    description:
      "Sharp, medicinal and honest. Tea tree is the one to keep in the bathroom cabinet: a drop in a face steam, a dab on a blemish, a capful in the mop bucket.",
    type: "DRINK",
    price: 54900,
    compareAtPrice: 64900,
    images: [],
    accentColor: "brand-sky",
    flavor: "Tea tree, camphor, fresh green",
    mood: "Clarify",
    benefits: ["100% pure", "Terpinen-4-ol rich", "GC/MS tested", "12, 6 or 3 ml glass bottle"],
    ingredients: "Melaleuca alternifolia (tea tree) leaf oil. External use only; patch test first.",
    stock: 110,
    featured: false,
  },
  {
    id: "demo-sweet-orange",
    name: "Sweet Orange",
    slug: "sweet-orange-essential-oil",
    tagline: "Citrus sinensis · Brazil",
    description:
      "Cold-pressed from the peel, which is exactly what it smells like: a just-peeled orange on a sunny counter. The cheerful one. Pairs with everything.",
    type: "DRINK",
    price: 39900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-tangerine",
    flavor: "Orange peel, sweet citrus, zest",
    mood: "Uplift",
    benefits: ["100% pure", "Cold pressed", "Food-grade peel", "12, 6 or 3 ml glass bottle"],
    ingredients: "Citrus sinensis (sweet orange) peel oil. Mildly photosensitising; avoid sun after topical use.",
    stock: 150,
    featured: true,
  },
  {
    id: "demo-eucalyptus",
    name: "Eucalyptus",
    slug: "eucalyptus-essential-oil",
    tagline: "Eucalyptus globulus · Nilgiris",
    description:
      "Grown in the blue hills of the Nilgiris. Camphorous and clearing, it is the oil for a steamy shower on a heavy-headed morning.",
    type: "DRINK",
    price: 44900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-mint",
    flavor: "Eucalyptus, camphor, cool green",
    mood: "Breathe",
    benefits: ["100% pure", "Steam distilled", "High cineole", "12, 6 or 3 ml glass bottle"],
    ingredients: "Eucalyptus globulus leaf oil. Not for children under 10. Dilute before topical use.",
    stock: 80,
    featured: false,
  },
  {
    id: "demo-frankincense",
    name: "Frankincense",
    slug: "frankincense-essential-oil",
    tagline: "Boswellia serrata · Rajasthan",
    description:
      "Resinous, slightly lemony, deeply still. Indian frankincense has been burned in temples for three thousand years; this is that scent, without the smoke.",
    type: "DRINK",
    price: 99900,
    compareAtPrice: 119900,
    images: [],
    accentColor: "brand-grape",
    flavor: "Resin, soft lemon, dry wood",
    mood: "Ground",
    benefits: ["100% pure", "Wild-harvested resin", "Steam distilled", "12, 6 or 3 ml glass bottle"],
    ingredients: "Boswellia serrata (frankincense) resin oil. For aromatic and diluted topical use.",
    stock: 45,
    featured: true,
  },
  // ---- Signature blends ----
  {
    id: "demo-blend-deep-sleep",
    name: "Deep Sleep",
    slug: "deep-sleep-blend",
    tagline: "Lavender · Cedarwood · Roman chamomile",
    description:
      "Our most-ordered blend. Lavender does the soothing, cedarwood adds a warm wooden floor to lie on, and a whisper of chamomile makes it feel like the end of the day.",
    type: "GUMMY",
    price: 79900,
    compareAtPrice: 89900,
    images: [],
    accentColor: "brand-lavender",
    flavor: "Lavender, cedarwood, chamomile",
    mood: "Sleep",
    benefits: ["Diffuser-ready blend", "No synthetic fragrance", "Blended in small batches", "12, 6 or 3 ml glass bottle"],
    ingredients: "Lavandula angustifolia, Cedrus atlantica, Anthemis nobilis oils.",
    stock: 70,
    featured: true,
  },
  {
    id: "demo-blend-morning-light",
    name: "Morning Light",
    slug: "morning-light-blend",
    tagline: "Bergamot · Grapefruit · Rosemary",
    description:
      "Bright citrus with a green, herbal edge that keeps it from turning into candy. Diffuse while the kettle boils.",
    type: "GUMMY",
    price: 74900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-lemon",
    flavor: "Bergamot, grapefruit, rosemary",
    mood: "Energise",
    benefits: ["Diffuser-ready blend", "No synthetic fragrance", "Blended in small batches", "12, 6 or 3 ml glass bottle"],
    ingredients: "Citrus bergamia, Citrus paradisi, Rosmarinus officinalis oils. Photosensitising.",
    stock: 65,
    featured: true,
  },
  {
    id: "demo-blend-clear-head",
    name: "Clear Head",
    slug: "clear-head-blend",
    tagline: "Eucalyptus · Peppermint · Lemon",
    description:
      "The blend for monsoon colds and long desk days. Cool, sharp and clean, with lemon to lift the whole thing.",
    type: "GUMMY",
    price: 69900,
    compareAtPrice: 79900,
    images: [],
    accentColor: "brand-sky",
    flavor: "Eucalyptus, peppermint, lemon",
    mood: "Breathe",
    benefits: ["Diffuser-ready blend", "No synthetic fragrance", "Blended in small batches", "12, 6 or 3 ml glass bottle"],
    ingredients: "Eucalyptus globulus, Mentha piperita, Citrus limon oils. Not for young children.",
    stock: 60,
    featured: false,
  },
  {
    id: "demo-blend-temple",
    name: "Temple",
    slug: "temple-blend",
    tagline: "Frankincense · Sandalwood · Vetiver",
    description:
      "Resin, sacred wood and damp earth. Meditative and slow, this is the blend we reach for on Sunday evenings.",
    type: "GUMMY",
    price: 129900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-peach",
    flavor: "Frankincense, sandalwood, vetiver",
    mood: "Ground",
    benefits: ["Diffuser-ready blend", "Mysore sandalwood", "Blended in small batches", "12, 6 or 3 ml glass bottle"],
    ingredients: "Boswellia serrata, Santalum album, Vetiveria zizanioides oils.",
    stock: 30,
    featured: true,
  },
  // ---- Carrier oils ----
  {
    id: "demo-jojoba",
    name: "Golden Jojoba",
    slug: "golden-jojoba-carrier-oil",
    tagline: "Simmondsia chinensis · Cold pressed",
    description:
      "Technically a liquid wax, which is why it sits so lightly on skin and never goes rancid. The ideal base for diluting any essential oil for face or body.",
    type: "BUNDLE",
    price: 64900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-lemon",
    flavor: "Unscented, light, non-greasy",
    mood: "Dilute",
    benefits: ["Cold pressed, unrefined", "Non-comedogenic", "Long shelf life", "12, 6 or 3 ml glass bottle"],
    ingredients: "Simmondsia chinensis (jojoba) seed oil.",
    stock: 85,
    featured: false,
  },
  {
    id: "demo-sweet-almond",
    name: "Sweet Almond",
    slug: "sweet-almond-carrier-oil",
    tagline: "Prunus dulcis · Cold pressed",
    description:
      "Soft, nourishing and faintly nutty. The classic massage base: it glides for a long time and leaves skin feeling fed, not coated.",
    type: "BUNDLE",
    price: 44900,
    compareAtPrice: 54900,
    images: [],
    accentColor: "brand-peach",
    flavor: "Faintly nutty, soft, nourishing",
    mood: "Massage",
    benefits: ["Cold pressed", "Rich in vitamin E", "Massage base", "12, 6 or 3 ml glass bottle"],
    ingredients: "Prunus amygdalus dulcis (sweet almond) oil. Contains tree nuts.",
    stock: 95,
    featured: false,
  },
  {
    id: "demo-fractionated-coconut",
    name: "Fractionated Coconut",
    slug: "fractionated-coconut-carrier-oil",
    tagline: "Cocos nucifera · Stays liquid",
    description:
      "Coconut oil with the heavy fats removed, so it stays clear and liquid in any weather and absorbs in seconds. Our roll-ons are built on it.",
    type: "BUNDLE",
    price: 39900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-sky",
    flavor: "Odourless, clear, fast-absorbing",
    mood: "Dilute",
    benefits: ["Odourless", "Never solidifies", "Roll-on base", "12, 6 or 3 ml glass bottle"],
    ingredients: "Caprylic/capric triglyceride (fractionated coconut oil).",
    stock: 100,
    featured: false,
  },
  // ---- Ritual sets & roll-ons ----
  {
    id: "demo-set-starter",
    name: "The Starter Six",
    slug: "starter-six-set",
    tagline: "Six 5 ml essentials in a linen box",
    description:
      "Lavender, peppermint, tea tree, sweet orange, eucalyptus and frankincense in 5 ml bottles, plus a guide to blending them. Where almost everyone begins.",
    type: "BUNDLE",
    price: 149900,
    compareAtPrice: 189900,
    images: [],
    accentColor: "brand-tangerine",
    flavor: "Six single oils, 5 ml each",
    mood: "Gift",
    benefits: ["6 × 5 ml pure oils", "Linen gift box", "Blending guide", "Saves ₹400"],
    ingredients: "See each oil for botanical names and cautions.",
    stock: 40,
    featured: true,
  },
  {
    id: "demo-rollon-calm",
    name: "Calm Roll-on",
    slug: "calm-roll-on",
    tagline: "Pre-diluted · Ready for pulse points",
    description:
      "Deep Sleep blend, already diluted to 5% in fractionated coconut oil, in a steel roller. Wrists, temples, the back of the neck.",
    type: "BUNDLE",
    price: 49900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-berry",
    flavor: "Lavender, cedarwood, chamomile",
    mood: "Calm",
    benefits: ["Pre-diluted 5%", "Steel roller ball", "Travel size", "12, 6 or 3 ml glass bottle"],
    ingredients: "Caprylic/capric triglyceride, lavender, cedarwood and chamomile oils.",
    stock: 75,
    featured: false,
  },
  {
    id: "demo-rollon-focus",
    name: "Focus Roll-on",
    slug: "focus-roll-on",
    tagline: "Pre-diluted · Ready for pulse points",
    description:
      "Rosemary, peppermint and lemon at a skin-safe dilution. Keep it beside the laptop.",
    type: "BUNDLE",
    price: 49900,
    compareAtPrice: null,
    images: [],
    accentColor: "brand-cherry",
    flavor: "Rosemary, peppermint, lemon",
    mood: "Focus",
    benefits: ["Pre-diluted 5%", "Steel roller ball", "Travel size", "12, 6 or 3 ml glass bottle"],
    ingredients: "Caprylic/capric triglyceride, rosemary, peppermint and lemon oils.",
    stock: 75,
    featured: false,
  },
];

/** Round to a friendly "…9" rupee price, e.g. 359.4 → 359. */
const friendly = (n: number) => Math.max(9, Math.round(n / 10) * 10 - 1);

/**
 * Every perfume comes in three bottle sizes with their own prices: the listed
 * price is the 12 ml bottle, 6 ml is about 60% of it and 3 ml about 35%.
 * Gift sets are sold as one size.
 */
export function bottleSizeEntries(price: number): string[] {
  const rupees = Math.round(price / 100);
  return [`12 ml=${rupees}`, `6 ml=${friendly(rupees * 0.6)}`, `3 ml=${friendly(rupees * 0.35)}`];
}

export const demoProducts: StoreProduct[] = rawDemoProducts.map((p) => ({
  ...p,
  sizes: p.slug.endsWith("-set") ? [] : bottleSizeEntries(p.price),
}));

/** Category each demo product belongs to (also used by prisma/seed.ts). */
export const DEMO_CATEGORIES = [
  { slug: "pure-oils", name: "Pure Essential Oils" },
  { slug: "blends", name: "Signature Blends" },
  { slug: "carrier-oils", name: "Carrier Oils" },
  { slug: "rituals", name: "Rituals & Roll-ons" },
] as const;

export type DemoCategorySlug = (typeof DEMO_CATEGORIES)[number]["slug"];

export function demoCategoryOf(p: Pick<StoreProduct, "type" | "slug">): DemoCategorySlug {
  if (p.type === "DRINK") return "pure-oils";
  if (p.type === "GUMMY") return "blends";
  return p.slug.includes("carrier") ? "carrier-oils" : "rituals";
}

export const demoReviews = [
  { author: "Ananya R.", rating: 5, comment: "The lavender is the real thing. My bedroom smells like a field in Provence and I am asleep in ten minutes.", images: [], verified: true },
  { author: "Kabir S.", rating: 5, comment: "Temple blend in the diffuser on Sunday evening has become a non-negotiable ritual. Worth every rupee.", images: [], verified: true },
  { author: "Meera D.", rating: 4, comment: "Beautiful packaging, honest oils. The Starter Six was the perfect gift for my sister.", images: [], verified: true },
  { author: "Rohan T.", rating: 5, comment: "Peppermint is so clean it almost stings. Exactly what I wanted for afternoon slumps.", images: [], verified: false },
];
