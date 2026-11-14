# Essentia — essential oils storefront

A full-stack D2C store for essential oils, built on the animated storefront template:
Next.js 16 (App Router) · Tailwind v4 · Motion + GSAP + Lenis · Three.js hero · Prisma + Neon
Postgres · Clerk · Cloudinary · Razorpay · Shiprocket · Resend.

Four starter collections (Pure Essential Oils, Signature Blends, Carrier Oils, Rituals &
Roll-ons) and sixteen products are seeded. Everything else (brand, colours, homepage copy,
shipping rules, pages, catalogue) is edited in `/admin`, no redeploy needed.

## Run it

```bash
npm install
cp .env.example .env      # fill in the services below, or leave empty for demo mode
npm run dev               # http://localhost:3001
```

Database setup (Neon):

```bash
npm run db:push
npx tsx prisma/seed-settings.ts --preset=essentia   # brand, theme, homepage, policy pages
npm run db:seed                                      # 4 categories + 16 products
```

## What's where

| Area | Files |
|------|-------|
| Theme (Botanical preset, amber/forest/bone) | `lib/settings/schema.ts`, `app/globals.css` |
| Preloader, word reveals, magnetic buttons | `components/motion/*` |
| Three.js glass-droplet hero backdrop | `components/three/aroma-scene.tsx`, `components/home/hero.tsx` |
| Homepage sections | `components/home/*`, `app/page.tsx` |
| Illustrated amber bottle (no-photo fallback) | `components/product/product-graphic.tsx` |
| Scent profile / aroma-note chips | `lib/scent.ts`, `components/product/product-detail.tsx` |
| Shop filters, sort, animated grid | `app/products/*` |
| Skeleton loaders | `app/**/loading.tsx`, `components/product/product-skeleton.tsx` |
| Starter catalogue & preset | `lib/demo-data.ts`, `prisma/seed.ts`, `prisma/presets/essentia.ts` |

Admin fields map to the storefront like this: **Aroma notes** → chips on the product page,
**Mood badge** → ribbon on cards, **Benefits** → "What's inside", **Ingredients & safety** →
Safety tab. Products without photos show the illustrated bottle tinted by their accent colour.

## Services

See `.env.example`. Razorpay and Shiprocket are optional and can also be configured from
**Admin → Settings → Integrations**; without them checkout places offline orders and shipping is
marked by hand.
