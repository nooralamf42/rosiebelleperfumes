import type { StoreProduct } from "./types";

/*
 * Rosiebelle catalogue: five categories, priced per 6 gm.
 *
 * Every product is sold in three sizes: 6 gm at the listed price, 12 gm at
 * double it and 3 gm at half. The 12 gm price is the product's own price
 * (the default size). This file is used as the demo catalogue when no
 * database is configured, and by prisma/seed.ts to fill a fresh store.
 *
 * Row format:  [name, price for 6 gm in rupees, bottle colour, scent family, scent notes, description]
 * A price of null means "not priced yet": it gets TEST_PRICE so it can still
 * be ordered while you set the real figure in Admin > Products.
 */

export const TEST_PRICE = 9000; // rupees per 6 gm, placeholder for unpriced items

type Row = [name: string, price6: number | null, accent: string, family: string, notes: string, desc: string];

export const DEMO_CATEGORIES = [
  { slug: "natural-oils", name: "Natural Oils" },
  { slug: "oud", name: "Oud" },
  { slug: "mukhallat", name: "Mukhallat" },
  { slug: "musk", name: "Musk" },
  { slug: "absolutes", name: "Absolutes" },
] as const;

export type DemoCategorySlug = (typeof DEMO_CATEGORIES)[number]["slug"];

const CATALOGUE: Record<DemoCategorySlug, Row[]> = {
  "natural-oils": [
    ["Shamamatul Oud", 2200, "brand-cherry", "Spicy", "Oud, saffron, warm spice", "A deep shamama built on oud: warm, spicy and long-lasting, in the classic Kannauj style."],
    ["Shamama Premium", 2000, "brand-peach", "Spicy", "Herbal, warm, resinous", "A premium shamama: dark, resinous and gently sweet, with saffron and spice."],
    ["Shamama Taj", 1500, "brand-tangerine", "Spicy", "Sweet, spicy, warm", "A lighter shamama with a sweet, spiced warmth. An easy everyday attar."],
    ["Mysore Sandalwood (Fresh)", 1500, "brand-lemon", "Woody", "Sandalwood, creamy, soft", "Fresh Mysore sandalwood oil: soft, creamy and woody, with a gentle sweetness."],
    ["Mysore Batch 2012", 1600, "brand-peach", "Woody", "Sandalwood, creamy, aged", "Aged Mysore sandalwood from the 2012 batch. Rounder and deeper than fresh oil."],
    ["Mysore Batch 2010", 2000, "brand-peach", "Woody", "Sandalwood, smooth, aged", "Aged Mysore sandalwood from the 2010 batch. Smooth, rich and long-lasting."],
    ["Mysore Batch 1982", 2500, "brand-peach", "Woody", "Sandalwood, deep, aged", "A long-aged Mysore sandalwood from the 1982 batch. Deep, smooth and richly woody."],
    ["Mysore Batch 1990", 2599, "brand-peach", "Woody", "Sandalwood, deep, aged", "Aged Mysore sandalwood from the 1990 batch. Full-bodied, creamy and warm."],
    ["Australian Sandalwood", 1000, "brand-lemon", "Woody", "Sandalwood, clean, soft", "A clean, soft sandalwood. Lighter on the nose and kinder on the budget than Mysore."],
    ["Sandali Zafran", 2000, "brand-tangerine", "Woody", "Sandalwood, saffron", "Sandalwood oil with saffron: creamy wood warmed by a honeyed, leathery spice."],
    ["Ruh Zafran", 2800, "brand-tangerine", "Spicy", "Saffron, honeyed, leathery", "Pure saffron attar: rich, honeyed and leathery."],
    ["Zafran Patti (Saffron Stigma)", 2200, "brand-tangerine", "Spicy", "Saffron, golden, warm", "Made from saffron stigma (zafran patti). Deep, golden and warm."],
    ["Sandali Gulab", 1500, "brand-berry", "Rose", "Rose, sandalwood, creamy", "Sandalwood with rose: soft, creamy and romantic."],
    ["Sandali Motia", 1500, "brand-lemon", "Floral", "Jasmine, sandalwood, creamy", "Sandalwood with motia (jasmine): creamy wood with a sweet white-floral lift."],
    ["Sandali Mitti", 1500, "brand-peach", "Earthy", "Earthy, sandalwood, rain", "Sandalwood with mitti (baked earth): the smell of the first rain on dry ground."],
    ["Sandali Mehndi (Henna)", 1000, "brand-mint", "Earthy", "Green, earthy, sweet", "Sandalwood with mehndi (henna): green, earthy and softly sweet."],
    ["Red Rose Oil", 4500, "brand-cherry", "Rose", "Rose, deep, velvety", "Red rose oil (Rosa indica): deep, velvety and classic rose."],
    ["Pink Rose Oil", 9500, "brand-berry", "Rose", "Rose, fresh, sweet", "Pink rose oil (Rosa damascena): bright, sweet and fresh-cut."],
    ["Afghani Rose Oil", 11000, "brand-berry", "Rose", "Rose, full, spicy", "Afghani rose oil (Rose Muhammadi): fuller and spicier than damascena."],
    ["Taif Rose Oil", 20500, "brand-cherry", "Rose", "Rose, honeyed, complex", "Taif rose oil: among the most prized roses. Deep, honeyed and complex."],
    ["Azerbaijan Rose Oil", 10000, "brand-berry", "Rose", "Rose, green, dewy", "Azerbaijan rose oil: a fresh, slightly green and dewy rose."],
    ["Ruh Motia (Kannauj)", 9500, "brand-lemon", "Floral", "Jasmine, creamy, heady", "Motia (jasmine) ruh from Kannauj: rich, creamy and heady white floral."],
    ["Ruh Motia (Hasayan)", 7200, "brand-lemon", "Floral", "Jasmine, sweet, soft", "Motia ruh in the hasayan quality: a sweeter, softer white floral."],
    ["Ruh Khus (Kannauj)", 700, "brand-mint", "Earthy", "Khus, cool, green", "Khus (vetiver) ruh from Kannauj: cool, earthy and green, like wet soil."],
    ["Ruh Khus (Hasayan)", 850, "brand-mint", "Earthy", "Khus, cooling, smooth", "Khus ruh in the hasayan quality: cooling, earthy and smooth."],
    ["Munjadh Khus (Hasayan)", 1000, "brand-mint", "Smoky", "Khus, deep, smoky", "Munjadh khus in the hasayan quality: a deeper, darker, smokier khus."],
  ],
  oud: [
    ["Assami Oud 1st Grade", 8000, "brand-cherry", "Oud", "Oud, sweet, woody", "First-grade Assam oud: deep, sweet and woody with a smooth, long finish."],
    ["Dehnul Oud Seufi", 6000, "brand-peach", "Oud", "Oud, smooth, refined", "Dehnul oud (seufi): smooth, balanced and refined."],
    ["Laos Oud Pure", 8000, "brand-grape", "Oud", "Oud, fruity, sweet", "Pure Laos oud: sweet, fruity and rounded."],
    ["Oud Tarat Thai", 8000, "brand-peach", "Oud", "Oud, woody, leathery", "Thai oud: woody and slightly leathery with a sweet finish."],
    ["Combodi King", 9500, "brand-cherry", "Oud", "Oud, sweet, honeyed", "Cambodi oud, king grade: rich, sweet and honeyed."],
    ["Combodi Moattaq", 20000, "brand-grape", "Oud", "Oud, aged, rich", "Aged (moattaq) Cambodi oud: deep, smooth and extremely long-lasting."],
    ["Silani Underwater", 25000, "brand-sky", "Oud", "Oud, damp wood, rare", "Silani underwater oud: a rare oud with a smooth, damp-wood character."],
    ["Kalakassi Oud 1st Grade", 10500, "brand-cherry", "Oud", "Oud, dark, bold", "First-grade Kalakassi oud: dark, bold and intense."],
    ["Manipur Oud", 11000, "brand-peach", "Oud", "Oud, sweet, woody", "Manipur oud: sweet, woody and gently animalic."],
    ["Nagaland Oud 1999 Batch", null, "brand-grape", "Oud", "Oud, aged, deep", "A Nagaland oud from the 1999 batch: aged, smooth and deep."],
  ],
  mukhallat: [
    ["Kiswat Al Kabah", 3000, "brand-grape", "Floral", "Floral, musky, resinous", "A revered Arabian mukhallat: rich, floral, musky and resinous."],
    ["Mukhallat Kannauj", 400, "brand-peach", "Floral", "Floral, woody, soft", "A classic Kannauj blend of florals and woods. Soft, smooth and easy to wear."],
    ["Mukhallat Oud", 1000, "brand-cherry", "Oud", "Oud, spicy, amber", "A blend built around oud, with warm spices and amber."],
    ["Mukhallat Qaboos", 700, "brand-peach", "Sweet", "Woody, sweet, resinous", "A smooth, sweet and resinous blend."],
    ["Mukhallat Sultania", 900, "brand-lavender", "Floral", "Floral, musky, rich", "A regal floral and musky blend with a rich, lasting trail."],
  ],
  musk: [
    ["Himalayan Musk Oil", 5200, "brand-peach", "Musky", "Musk, warm, animalic", "Himalayan musk oil: deep, warm and animalic with a smooth, clinging finish."],
    ["Siberian Musk Oil", 5000, "brand-lavender", "Musky", "Musk, powdery, soft", "Siberian musk oil: a soft, powdery, long-lasting musk."],
    ["Kashmiri Musk Oil", 5000, "brand-grape", "Musky", "Musk, sweet, creamy", "Kashmiri musk oil: a sweet, rounded musk with a creamy warmth."],
    ["Civet Musk Absolute", 3400, "brand-cherry", "Musky", "Animalic, sweet, rich", "Civet musk absolute: intensely rich and animalic. A touch adds depth to any blend."],
  ],
  absolutes: [
    ["Rose Absolute (Rosa Indica)", 5400, "brand-berry", "Rose", "Rose, rich, deep", "Rose absolute from Rosa indica: rich, deep and full-bodied."],
    ["Rose Absolute CG (Centifolia)", 1800, "brand-berry", "Rose", "Rose, honeyed, soft", "Rose absolute from Rosa centifolia: honeyed, soft and rounded."],
    ["Jasmine Auriculatum", 1600, "brand-lemon", "Floral", "Jasmine, sweet, fruity", "Jasmine auriculatum absolute: sweet, fruity and bright."],
    ["Jasmine Sambac", 3500, "brand-lemon", "Floral", "Jasmine, heady, rich", "Jasmine sambac absolute: heady, rich and intensely floral."],
    ["Jasmine Grandiflorum", 2600, "brand-lemon", "Floral", "Jasmine, green, sweet", "Jasmine grandiflorum absolute: sweet with a green, fresh edge."],
    ["Black Ambergris Absolute", 2400, "brand-grape", "Sweet", "Ambergris, marine, sweet", "Black ambergris absolute: warm, marine and softly sweet."],
    ["Castoreum Absolute", 2400, "brand-peach", "Smoky", "Leathery, animalic, warm", "Castoreum absolute: leathery, warm and animalic."],
    ["Frankincense Absolute", 700, "brand-lemon", "Resinous", "Resinous, lemony, clean", "Frankincense absolute: resinous, lemony and calm."],
    ["Labdanum Absolute", 650, "brand-peach", "Resinous", "Amber, resinous, sweet", "Labdanum absolute: amber, resinous and sweet."],
    ["Benzoin Siam Absolute", 500, "brand-tangerine", "Sweet", "Vanilla, balsamic, sweet", "Benzoin Siam absolute: vanilla-like, balsamic and sweet."],
    ["Coffee Absolute", 700, "brand-peach", "Sweet", "Roasted, bittersweet", "Coffee absolute: roasted, rich and bittersweet."],
    ["Cannabis (Hemp) Absolute", 3000, "brand-mint", "Earthy", "Green, herbal, resinous", "Cannabis (hemp) absolute: green, herbal and resinous."],
    ["Birch Tar Absolute", 400, "brand-grape", "Smoky", "Smoky, leathery, dark", "Birch tar absolute: smoky, leathery and dark."],
    ["Tobacco Absolute", 1600, "brand-peach", "Sweet", "Tobacco, sweet, hay", "Tobacco absolute: sweet, dry and hay-like."],
    ["Red Champaca Absolute", 4000, "brand-tangerine", "Floral", "Floral, fruity, rich", "Red champaca absolute: rich, fruity and floral."],
    ["Frangipani Absolute", 4800, "brand-lemon", "Floral", "Floral, creamy, sweet", "Frangipani absolute: creamy, sweet and tropical."],
    ["Cade Absolute", 2400, "brand-grape", "Smoky", "Smoky, woody, dark", "Cade absolute: smoky, woody and dark."],
    ["Tonka Bean Absolute", 4000, "brand-tangerine", "Sweet", "Sweet, almond, vanilla", "Tonka bean absolute: sweet, creamy, with almond and vanilla tones."],
    ["Blue Lotus Absolute", 1800, "brand-sky", "Floral", "Floral, watery, soft", "Blue lotus absolute: soft, watery and gently floral."],
    ["White Lotus Absolute", 3000, "brand-lavender", "Floral", "Floral, fresh, clean", "White lotus absolute: fresh, clean and delicate."],
    ["Pink Lotus Absolute", 2600, "brand-berry", "Floral", "Floral, delicate, sweet", "Pink lotus absolute: delicate, sweet and floral."],
    ["Cardamom Absolute CO2", 600, "brand-mint", "Spicy", "Spicy, fresh, warm", "Cardamom absolute (CO2): fresh, warm and spicy."],
    ["Carthamus Absolute", 1500, "brand-tangerine", "Spicy", "Warm, dry, herbal", "Carthamus absolute: warm, dry and herbal."],
    ["Oak Moss Absolute", 1400, "brand-mint", "Earthy", "Mossy, earthy, green", "Oak moss absolute: mossy, earthy and green."],
    ["Orange Flower Absolute", 1400, "brand-tangerine", "Floral", "Floral, citrus, sweet", "Orange flower absolute: sweet, floral and citrusy."],
    ["Lily of the Valley Absolute", 1250, "brand-lavender", "Floral", "Floral, green, fresh", "Lily of the valley absolute: green, fresh and floral."],
    ["Tuberose Absolute", 6000, "brand-lavender", "Floral", "Floral, creamy, heady", "Tuberose absolute: creamy, heady and intensely floral."],
    ["Orris Absolute (or Butter)", 7200, "brand-lavender", "Floral", "Powdery, floral, woody", "Orris absolute or butter: powdery, floral and softly woody."],
    ["Gardenia Flower Absolute", 7500, "brand-lemon", "Floral", "Floral, creamy, rich", "Gardenia flower absolute: creamy, rich and lush."],
    ["Cypriol Absolute (Nagarmotha)", 400, "brand-mint", "Earthy", "Earthy, woody, smoky", "Cypriol (nagarmotha) absolute: earthy, woody and slightly smoky."],
  ],
};

/** Flagship pieces shown on the homepage. */
const FEATURED = new Set([
  "shamamatul-oud",
  "mysore-sandalwood-fresh",
  "taif-rose-oil",
  "ruh-motia-kannauj",
  "kiswat-al-kabah",
  "assami-oud-1st-grade",
  "himalayan-musk-oil",
  "rose-absolute-rosa-indica",
]);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Entries for the three sizes, from the 6 gm price: 12 gm is double and 3 gm is half. */
export function sizeEntries(price6: number): string[] {
  return [`12 gm=${price6 * 2}`, `6 gm=${price6}`, `3 gm=${Math.round(price6 / 2)}`];
}

const categoryBySlug = new Map<string, DemoCategorySlug>();

export const demoProducts: StoreProduct[] = (Object.entries(CATALOGUE) as [DemoCategorySlug, Row[]][]).flatMap(([category, rows]) =>
  rows.map(([name, price6, accent, family, notes, desc]) => {
    const slug = slugify(name);
    categoryBySlug.set(slug, category);
    const unit6 = price6 ?? TEST_PRICE;
    return {
      id: `demo-${slug}`,
      name,
      slug,
      tagline: DEMO_CATEGORIES.find((c) => c.slug === category)!.name.replace(/s$/, ""),
      description: desc,
      type: "DRINK",
      price: unit6 * 2 * 100, // 12 gm, the default size
      compareAtPrice: null,
      images: [],
      accentColor: accent,
      flavor: notes,
      mood: family,
      sizes: sizeEntries(unit6),
      benefits: ["Sold in 12, 6 or 3 gm", "Glass bottle with screw cap", "Packed with care"],
      ingredients: "Perfume oil for external use only. Patch test before first use. Keep away from eyes, flame and children.",
      stock: 20,
      featured: FEATURED.has(slug),
    } satisfies StoreProduct;
  }),
);

/** Category a demo product belongs to (also used by prisma/seed.ts). */
export function demoCategoryOf(p: Pick<StoreProduct, "slug">): DemoCategorySlug {
  return categoryBySlug.get(p.slug) ?? "natural-oils";
}

/** Items with no price in the list: they get TEST_PRICE until the real one is set. */
export const UNPRICED = Object.values(CATALOGUE)
  .flat()
  .filter((r) => r[1] === null)
  .map((r) => r[0]);

export const demoReviews = [
  { author: "Ananya R.", rating: 5, comment: "The Mysore sandalwood is the real thing: creamy, soft, and it stays on my scarf for days.", images: [], verified: true },
  { author: "Kabir S.", rating: 5, comment: "Shamamatul Oud is my winter attar now. Deep and warm, and the 3 gm bottle is perfect for travel.", images: [], verified: true },
  { author: "Meera D.", rating: 4, comment: "Beautiful bottles and honest oils. I gifted the Ruh Motia to my mother and she loved it.", images: [], verified: true },
  { author: "Rohan T.", rating: 5, comment: "Ruh Khus smells exactly like the first rain on dry earth. So cooling in the summer.", images: [], verified: false },
];
