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

Pure essential oils, small-batch blends and cold-pressed carrier oils. Each one names its botanical, its origin and its batch.

- **Single origin.** Grown on farms we know, distilled soon after harvest.
- **Lab tested.** Every batch is GC/MS tested for purity.
- **Amber glass.** UV-protected bottles, never plastic.

![A flat lay of oils, stones and botanicals](${IMG("photo-1612817288484-6f916006741a")})

## What we believe

> Less, but better. A few honest ingredients, made with care.

## Come and smell for yourself

Start with a single oil you already love, then build from there. [Explore the collection](/products) or [write to us](/contact). We read every message.`;
