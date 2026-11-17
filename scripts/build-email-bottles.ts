/**
 * Small square PNG copies of the bottle photos for order emails (Outlook and
 * some mail apps can't show WebP, and ignore object-fit, so each file is a
 * ready-made 128 px square with the bottle centred on a transparent background).
 *
 *   npx tsx scripts/build-email-bottles.ts
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(process.cwd(), "public", "bottles");
const OUT = path.join(process.cwd(), "public", "email-bottles");
const BOX = 128;

async function main() {
  let n = 0;
  for (const accent of fs.readdirSync(SRC)) {
    const dir = path.join(SRC, accent);
    if (!fs.statSync(dir).isDirectory()) continue;
    fs.mkdirSync(path.join(OUT, accent), { recursive: true });
    for (const size of ["12", "6", "3"]) {
      const file = path.join(dir, `${size}.webp`);
      if (!fs.existsSync(file)) continue;
      // Keep true relative heights: the 12 gm bottle fills the box, smaller ones are shorter.
      const scale = { "12": 1, "6": 0.86, "3": 0.72 }[size]!;
      const h = Math.round((BOX - 12) * scale);
      const bottle = await sharp(file).resize({ height: h }).png().toBuffer();
      await sharp({ create: { width: BOX, height: BOX, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: bottle, gravity: "south" }])
        .png({ compressionLevel: 9, palette: true })
        .toFile(path.join(OUT, accent, `${size}.png`));
      n++;
    }
  }
  console.log(`Wrote ${n} images to public/email-bottles`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
