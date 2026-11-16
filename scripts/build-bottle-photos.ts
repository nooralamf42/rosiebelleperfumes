/**
 * Builds the bottle photos used across the store from ONE source photo.
 *
 *   npx tsx scripts/build-bottle-photos.ts
 *
 * Source: scripts/assets/bottles-source.webp, a studio photo of the 12, 6 and
 * 3 gm bottles with BLANK labels on a white background (generated from the
 * Rosiebelle reference photo). The script:
 *   1. cuts the bottles out of the white background (transparent webp),
 *   2. finds the blank label on each bottle (so the site can print the real
 *      name on it in code),
 *   3. recolours the perfume liquid for every colour in lib/perfume-colors.ts,
 *      leaving the black cap, white label and glass alone,
 *   4. writes public/bottles/<accent>/{12,6,3}.webp and
 *      lib/bottle-layout.json (label positions as fractions of each image).
 * To use a different photo, replace the source file and run it again.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PERFUME_COLORS } from "../lib/perfume-colors";

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "scripts/assets/bottles-source.webp");
const OUT = path.join(ROOT, "public/bottles");
const SCALE = 0.6; // output px per source px
const PAD = 26; // transparent margin around each cut-out, in source px
const BG_MIN = 242; // a pixel at least this bright (and grey) is background
const ORIGINAL_ACCENT = "brand-cherry"; // the photo's own deep red: left untouched

type Rect = { x: number; y: number; w: number; h: number };
type Band = { key: "12" | "6" | "3"; x0: number; x1: number };

// ---- colour helpers ----
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

async function main() {
  const { data: src, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const px = (p: number) => [src[p * 3], src[p * 3 + 1], src[p * 3 + 2]] as const;

  // ---------- 1. find the three bottles (dark columns) ----------
  const cols = new Array(W).fill(0);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      if (Math.min(src[i], src[i + 1], src[i + 2]) < 150) cols[x]++;
    }
  const segs: [number, number][] = [];
  let start = -1;
  for (let x = 0; x < W; x++) {
    const on = cols[x] > 3;
    if (on && start < 0) start = x;
    if (!on && start >= 0) { if (x - start > 60) segs.push([start, x - 1]); start = -1; }
  }
  if (start >= 0) segs.push([start, W - 1]);
  if (segs.length !== 3) throw new Error(`Expected 3 bottles, found ${segs.length}`);
  const keys: Band["key"][] = ["12", "6", "3"];
  const bands: Band[] = segs.map(([a, b], i) => ({ key: keys[i], x0: Math.max(0, a - 24), x1: Math.min(W - 1, b + 24) }));

  // ---------- 2. cut out: flood-fill the white background from the border ----------
  const bg = new Uint8Array(W * H);
  const isBg = (p: number) => {
    const [r, g, b] = px(p);
    return Math.min(r, g, b) >= BG_MIN && Math.max(r, g, b) - Math.min(r, g, b) < 18;
  };
  const stack: number[] = [];
  const seed = (x: number, y: number) => {
    const p = y * W + x;
    if (!bg[p] && isBg(p)) { bg[p] = 1; stack.push(p); }
  };
  for (let x = 0; x < W; x++) { seed(x, 0); seed(x, H - 1); }
  for (let y = 0; y < H; y++) { seed(0, y); seed(W - 1, y); }
  while (stack.length) {
    const p = stack.pop()!;
    const x = p % W, y = (p / W) | 0;
    if (x > 0) seed(x - 1, y);
    if (x < W - 1) seed(x + 1, y);
    if (y > 0) seed(x, y - 1);
    if (y < H - 1) seed(x, y + 1);
  }

  // Remove the floor shadow: nothing outside a bottle's columns, nothing below its glass base.
  const bottom: Record<string, number> = {};
  for (const band of bands) {
    let yb = 0;
    for (let y = H - 1; y >= 0; y--) {
      let n = 0;
      for (let x = band.x0 + 24; x <= band.x1 - 24; x++) {
        const [r, g, b] = px(y * W + x);
        if (Math.min(r, g, b) < 190) n++;
      }
      if (n >= 14) { yb = y; break; }
    }
    bottom[band.key] = yb - 2;
  }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const band = bands.find((b) => x >= b.x0 && x <= b.x1);
      if (!band || y > bottom[band.key]) bg[y * W + x] = 1;
    }
  // Also trim to the bottle's own width: off-white floor reflections at the foot of the glass
  // (the corners beside the base) would otherwise show as a pale box on coloured backgrounds.
  for (const band of bands) {
    let top = H, bot = 0;
    for (let y = 0; y < H; y++)
      for (let x = band.x0; x <= band.x1; x++)
        if (!bg[y * W + x]) { top = Math.min(top, y); bot = Math.max(bot, y); }
    const lefts: number[] = [], rights: number[] = [];
    for (let y = top + Math.round((bot - top) * 0.45); y <= top + Math.round((bot - top) * 0.6); y++) {
      let l = -1, r = -1;
      for (let x = band.x0; x <= band.x1; x++) if (!bg[y * W + x]) { if (l < 0) l = x; r = x; }
      if (l >= 0) { lefts.push(l); rights.push(r); }
    }
    lefts.sort((a, b) => a - b); rights.sort((a, b) => a - b);
    const minX = lefts[Math.floor(lefts.length / 2)] - 1, maxX = rights[Math.floor(rights.length / 2)] + 1;
    for (let y = 0; y < H; y++)
      for (let x = band.x0; x <= band.x1; x++) if (x < minX || x > maxX) bg[y * W + x] = 1;
  }
  // Erode the cut-out by 2px so no white halo survives on a coloured background.
  for (let pass = 0; pass < 2; pass++) {
    const grow: number[] = [];
    for (let y = 1; y < H - 1; y++)
      for (let x = 1; x < W - 1; x++) {
        const p = y * W + x;
        if (!bg[p] && (bg[p - 1] || bg[p + 1] || bg[p - W] || bg[p + W])) grow.push(p);
      }
    for (const p of grow) bg[p] = 1;
  }

  // ---------- 3. bottle extents + blank label ----------
  const labelWhite = (p: number) => {
    const [r, g, b] = px(p);
    return Math.min(r, g, b) >= 205 && Math.max(r, g, b) - Math.min(r, g, b) < 30;
  };
  const geo: Record<string, { box: Rect; label: Rect }> = {};
  for (const band of bands) {
    let top = H, left = W, right = 0;
    for (let y = 0; y <= bottom[band.key]; y++)
      for (let x = band.x0; x <= band.x1; x++)
        if (!bg[y * W + x]) {
          top = Math.min(top, y); left = Math.min(left, x); right = Math.max(right, x);
        }
    const bot = bottom[band.key];
    // label rows: the middle half of the bottle is almost entirely label-white
    const cx0 = left + Math.round((right - left) * 0.25), cx1 = right - Math.round((right - left) * 0.25);
    const rowsOn: boolean[] = [];
    for (let y = top; y <= bot; y++) {
      let n = 0;
      for (let x = cx0; x <= cx1; x++) if (labelWhite(y * W + x)) n++;
      rowsOn.push(n / (cx1 - cx0 + 1) > 0.9);
    }
    let best: [number, number] = [0, 0], cur = -1, gap = 0;
    rowsOn.forEach((on, i) => {
      if (on) { if (cur < 0) cur = i; gap = 0; if (i - cur > best[1] - best[0]) best = [cur, i]; }
      else if (cur >= 0 && ++gap > 6) cur = -1;
    });
    const ly0 = top + best[0], ly1 = top + best[1];
    const mid = Math.round((ly0 + ly1) / 2);
    let lx0 = Math.round((left + right) / 2), lx1 = lx0;
    while (lx0 > left && labelWhite(mid * W + lx0 - 1)) lx0--;
    while (lx1 < right && labelWhite(mid * W + lx1 + 1)) lx1++;
    geo[band.key] = {
      box: { x: left, y: top, w: right - left + 1, h: bot - top + 1 },
      label: { x: lx0, y: ly0, w: lx1 - lx0 + 1, h: ly1 - ly0 + 1 },
    };
  }

  // ---------- 4. liquid mask + its median lightness ----------
  const liquidWeight = new Float32Array(W * H);
  const lightnesses: number[] = [];
  for (let p = 0; p < W * H; p++) {
    if (bg[p]) continue;
    const [r, g, b] = px(p);
    const [h, s, l] = rgbToHsl(r, g, b);
    const red = h < 0.06 || h > 0.92;
    if (red && s > 0.13 && l > 0.04 && l < 0.92) {
      const w = Math.min(1, (s - 0.13) / 0.2);
      liquidWeight[p] = w;
      if (w > 0.9 && p % 7 === 0) lightnesses.push(l);
    }
  }
  lightnesses.sort((a, b) => a - b);
  const medianL = lightnesses[Math.floor(lightnesses.length / 2)] || 0.2;
  console.log("bottles:", JSON.stringify(geo), "| liquid median lightness", medianL.toFixed(3));

  // ---------- 5. render every colour ----------
  fs.rmSync(OUT, { recursive: true, force: true });
  const layout: Record<string, unknown> = { single: {} };

  for (const [accent, { hex }] of Object.entries(PERFUME_COLORS)) {
    const [tr, tg, tb] = hexToRgb(hex);
    const [th, ts, tl] = rgbToHsl(tr, tg, tb);
    const rgba = Buffer.alloc(W * H * 4);
    for (let p = 0; p < W * H; p++) {
      let [r, g, b]: number[] = [src[p * 3], src[p * 3 + 1], src[p * 3 + 2]];
      const w = liquidWeight[p];
      if (w > 0 && accent !== ORIGINAL_ACCENT) {
        const [, , l0] = rgbToHsl(r, g, b);
        // keep the photo's light and shade, re-centred on the new colour's lightness
        const l = Math.min(0.94, Math.max(0.03, tl * Math.pow(l0 / medianL, 0.85)));
        const [nr, ng, nb] = hslToRgb(th, ts, l);
        r += (nr - r) * w; g += (ng - g) * w; b += (nb - b) * w;
      }
      rgba[p * 4] = r; rgba[p * 4 + 1] = g; rgba[p * 4 + 2] = b;
      rgba[p * 4 + 3] = bg[p] ? 0 : 255;
    }
    // soften the alpha edge a touch
    const full = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
    const alpha = await sharp(full).extractChannel(3).blur(0.9).raw().toBuffer();
    const soft = Buffer.from(rgba);
    for (let p = 0; p < W * H; p++) soft[p * 4 + 3] = alpha[p];
    const base = sharp(soft, { raw: { width: W, height: H, channels: 4 } });

    const dir = path.join(OUT, accent);
    fs.mkdirSync(dir, { recursive: true });

    const writeCrop = async (name: string, region: Rect, rects: Record<string, Rect>) => {
      const left = Math.max(0, region.x - PAD), top = Math.max(0, region.y - PAD);
      const right = Math.min(W, region.x + region.w + PAD), bottomY = Math.min(H, region.y + region.h + PAD);
      const cw = right - left, ch = bottomY - top;
      const ow = Math.round(cw * SCALE), oh = Math.round(ch * SCALE);
      await base.clone().extract({ left, top, width: cw, height: ch }).resize(ow, oh).webp({ quality: 88, alphaQuality: 100 }).toFile(path.join(dir, `${name}.webp`));
      return {
        w: ow,
        h: oh,
        labels: Object.fromEntries(
          Object.entries(rects).map(([k, r]) => [k, { x: +((r.x - left) / cw).toFixed(4), y: +((r.y - top) / ch).toFixed(4), w: +(r.w / cw).toFixed(4), h: +(r.h / ch).toFixed(4) }]),
        ),
      };
    };

    for (const band of bands) {
      const g = geo[band.key];
      const info1 = await writeCrop(band.key, g.box, { [band.key]: g.label });
      if (accent === Object.keys(PERFUME_COLORS)[0]) {
        (layout.single as Record<string, unknown>)[band.key] = { w: info1.w, h: info1.h, label: info1.labels[band.key], heightPx: g.box.h };
      }
    }
    console.log("built", accent);
  }

  fs.writeFileSync(path.join(ROOT, "lib/bottle-layout.json"), JSON.stringify(layout, null, 2) + "\n");
  console.log("layout:", JSON.stringify(layout));
}

main().catch((e) => { console.error(e); process.exit(1); });
