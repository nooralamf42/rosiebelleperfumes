/**
 * Starter "Our Story" page. Lives in the database once seeded, so the owner
 * edits the words and swaps the photos in Admin → Pages → Our Story.
 *
 * The About page renders each "## heading" as its own section. A section with
 * an image gets the image beside the text (sides alternate); a section without
 * one is a centred text block; a lone quote becomes a pull quote. Replace the
 * placeholder photos by clicking an image in the editor and choosing a new one.
 */

const IMG = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const ABOUT_TITLE = "Our Story";

export const ABOUT_CONTENT = `{{storeName}} began with one bottle and a stubborn idea: a fragrance should smell like something real, not like a laboratory's idea of a flower.

![Amber bottle with a dropper, resting among leaves](${IMG("photo-1617897903246-719242758050")})

## Where it began

It started in a small kitchen, with a handful of oils and a lot of patience. Our founder spent a year learning how a single botanical changes from one farm to the next, and how little it takes to spoil it.

That year turned into a rule we still follow: if we can't trace it, we don't bottle it.

![Our founder at work with a dropper bottle](${IMG("photo-1620916297397-a4a5402a3c6c")})

## What we make

Natural oils, oud, mukhallat, musk and absolutes, sold by the gram in 12, 6 and 3 gm bottles. Each one is listed by name and, where we know it, its origin.

- **Natural.** Attars, ruh, oud and absolutes, named for what they are.
- **Sold by the gram.** 12, 6 or 3 gm, so you can start small.
- **Glass bottles.** Screw-top caps, packed with care.

![A flat lay of oils, stones and botanicals](${IMG("photo-1612817288484-6f916006741a")})

## What we believe

> Less, but better. A few honest ingredients, made with care.

## Come and smell for yourself

Start with a 3 gm bottle of something you have never tried, then build from there. [Explore the collection](/products) or [write to us](/contact). We read every message.`;
