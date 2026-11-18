import sharp from "sharp";

/*
 * Bottle photo in any perfume colour: GET /api/bottle/12/a01818.webp
 *
 * The prebuilt photos in /public/bottles are the same studio shot recoloured
 * for nine presets. For a colour picked in the admin, this paints that colour
 * onto the original deep-red photo: only the liquid changes (found by its red
 * hue), the cap, glass and label stay. The same photo-shading maths as
 * scripts/build-bottle-photos.ts is used, so custom colours match the presets.
 *
 * Each colour/size is generated once, then served from the CDN for a year.
 * `?e=1` with .png gives the small square picture used in order emails.
 */

export const runtime = "nodejs";

const SIZES = new Set(["12", "6", "3"]);
const EMAIL_BOX = 128;
const EMAIL_SCALE: Record<string, number> = { "12": 1, "6": 0.86, "3": 0.72 };

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
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

export async function GET(req: Request, { params }: { params: Promise<{ size: string; file: string }> }) {
  const { size, file } = await params;
  const m = file.match(/^([0-9a-f]{6})\.(webp|png)$/i);
  if (!SIZES.has(size) || !m) return new Response("Not found", { status: 404 });
  const hex = m[1].toLowerCase();
  const ext = m[2].toLowerCase();
  const email = new URL(req.url).searchParams.get("e") === "1" && ext === "png";

  // The original red photo is a normal static file of the site.
  const baseRes = await fetch(new URL(`/bottles/brand-cherry/${size}.webp`, req.url));
  if (!baseRes.ok) return new Response("Bottle photo unavailable", { status: 502 });
  const { data, info } = await sharp(Buffer.from(await baseRes.arrayBuffer()))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Liquid weight per pixel (red hue, enough colour), and the liquid's typical lightness.
  const weight = new Float32Array(W * H);
  const lights: number[] = [];
  for (let p = 0; p < W * H; p++) {
    if (data[p * 4 + 3] < 128) continue;
    const [h, s, l] = rgbToHsl(data[p * 4], data[p * 4 + 1], data[p * 4 + 2]);
    const red = h < 0.06 || h > 0.92;
    if (red && s > 0.13 && l > 0.04 && l < 0.92) {
      const w = Math.min(1, (s - 0.13) / 0.2);
      weight[p] = w;
      if (w > 0.9 && p % 7 === 0) lights.push(l);
    }
  }
  lights.sort((a, b) => a - b);
  const medianL = lights[Math.floor(lights.length / 2)] || 0.2;

  const n = parseInt(hex, 16);
  const [th, ts, tl] = rgbToHsl((n >> 16) & 255, (n >> 8) & 255, n & 255);
  for (let p = 0; p < W * H; p++) {
    const w = weight[p];
    if (w <= 0) continue;
    let r = data[p * 4];
    let g = data[p * 4 + 1];
    let b = data[p * 4 + 2];
    const [, , l0] = rgbToHsl(r, g, b);
    const l = Math.min(0.94, Math.max(0.03, tl * Math.pow(l0 / medianL, 0.85)));
    const [nr, ng, nb] = hslToRgb(th, ts, l);
    r += (nr - r) * w;
    g += (ng - g) * w;
    b += (nb - b) * w;
    data[p * 4] = r;
    data[p * 4 + 1] = g;
    data[p * 4 + 2] = b;
  }

  let img = sharp(data, { raw: { width: W, height: H, channels: 4 } });
  let body: Buffer;
  if (email) {
    const bottle = await img.resize({ height: Math.round((EMAIL_BOX - 12) * EMAIL_SCALE[size]) }).png().toBuffer();
    body = await sharp({ create: { width: EMAIL_BOX, height: EMAIL_BOX, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: bottle, gravity: "south" }])
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
  } else {
    img = ext === "png" ? img.png() : img.webp({ quality: 88, alphaQuality: 100 });
    body = await img.toBuffer();
  }

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": ext === "png" ? "image/png" : "image/webp",
      // The result only depends on the URL, so it can be kept for good.
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
