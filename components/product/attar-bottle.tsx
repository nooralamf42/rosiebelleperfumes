import { useId } from "react";
import type { BottleSize } from "@/lib/sizes";

/*
 * Illustrated attar bottle, drawn from the Rosiebelle reference photo: a black
 * ribbed cap and neck on an octagonal glass body filled with coloured perfume,
 * a thick glass base, and a white label wrapped around the body.
 *
 * Three sizes share one design (12 ml tallest, 6 ml, 3 ml smallest). The
 * liquid colour comes from the product's accent colour, so every perfume
 * looks like itself. Pure SVG: crisp at any size, no image files.
 */

type Dims = { w: number; h: number; neckW: number; neckH: number; capW: number; capH: number };

// Proportions measured from the reference photo (px). The 3 ml follows the same ratios.
const DIMS: Record<BottleSize, Dims> = {
  "12": { w: 205, h: 385, neckW: 128, neckH: 122, capW: 150, capH: 58 },
  "6": { w: 175, h: 295, neckW: 122, neckH: 112, capW: 144, capH: 56 },
  "3": { w: 150, h: 225, neckW: 106, neckH: 98, capW: 126, capH: 50 },
};

const totalHeight = (d: Dims) => d.h + d.neckH + d.capH;

/** Perfume colours. Saturated, like real attar, and keyed by the product accent token. */
const LIQUIDS: Record<string, string> = {
  "brand-berry": "#8a1f66", // plum
  "brand-cherry": "#a01818", // deep red
  "brand-tangerine": "#f2760f", // orange
  "brand-grape": "#4d2a85", // violet
  "brand-mint": "#1c8f5e", // green
  "brand-sky": "#1b7fb0", // blue
  "brand-lemon": "#f3c400", // yellow
  "brand-lavender": "#8d6bd6", // lilac
  "brand-peach": "#c47a45", // amber-brown
};

export function liquidColor(accent: string): string {
  return LIQUIDS[accent] ?? "#b5651d";
}

function mix(hex: string, to: "white" | "black", t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = to === "white" ? 255 : 0;
  const ch = (v: number) => Math.round(v + (target - v) * t);
  return `rgb(${ch((n >> 16) & 255)}, ${ch((n >> 8) & 255)}, ${ch(n & 255)})`;
}

export type BottleLabel = {
  /** Product name printed on the label. */
  name?: string;
  /** Brand line under the name. Spaces are removed, like the printed label. */
  brand?: string;
  /** Place line at the bottom of the label. */
  origin?: string;
};

type Common = BottleLabel & { accent: string };

/** One bottle drawn around x = 0 with its base on y = 0 (it grows upwards, towards negative y). */
function Bottle({ size, accent, name = "", brand = "Rosiebelle Perfumes", origin = "KANNAUJ", uid }: Common & { size: BottleSize; uid: string }) {
  const d = DIMS[size];
  const { w, h, neckW, neckH, capW, capH } = d;
  const liquid = liquidColor(accent);
  const half = w / 2;
  const shoulder = Math.round(w * 0.13);
  const topW = neckW / 2 + 10;
  const face = w * 0.27; // facet edge of the octagon, seen from the front

  const body = `M ${-half + 9} 0 L ${half - 9} 0 L ${half} -9 L ${half} ${-h + shoulder} L ${topW} ${-h} L ${-topW} ${-h} L ${-half} ${-h + shoulder} L ${-half} -9 Z`;

  // label
  const lt = -h * 0.7;
  const lb = -h * 0.14;
  const lh = lb - lt;
  const nameSize = w * 0.15;
  const nameMax = w * 0.84;
  const nameFits = name.length * nameSize * 0.56 <= nameMax;
  const brandText = brand.toUpperCase().replace(/\s+/g, "");
  // Size the brand line to fit the label width (capitals average ~0.68em wide), never stretched.
  const brandSize = Math.min(w * 0.075, (w * 0.84) / (Math.max(brandText.length, 1) * 0.68));

  const id = (k: string) => `${uid}-${k}`;

  return (
    <g>
      <defs>
        <clipPath id={id("clip")}>
          <path d={body} />
        </clipPath>
        <linearGradient id={id("liquid")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(liquid, "white", 0.1)} />
          <stop offset="0.55" stopColor={liquid} />
          <stop offset="1" stopColor={mix(liquid, "black", 0.3)} />
        </linearGradient>
        <linearGradient id={id("cap")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#09090a" />
          <stop offset="0.28" stopColor="#2b2b2f" />
          <stop offset="0.5" stopColor="#141416" />
          <stop offset="1" stopColor="#060607" />
        </linearGradient>
        <linearGradient id={id("label")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e4d3d3" />
          <stop offset="0.12" stopColor="#fbf1f1" />
          <stop offset="0.55" stopColor="#fffafa" />
          <stop offset="1" stopColor="#e9dada" />
        </linearGradient>
        <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.2" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id("shadow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.32" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floor shadow */}
      <ellipse cx="0" cy="4" rx={w * 0.62} ry="11" fill={`url(#${id("shadow")})`} />

      {/* glass + perfume */}
      <g clipPath={`url(#${id("clip")})`}>
        <rect x={-half} y={-h} width={w} height={h} fill={`url(#${id("liquid")})`} />
        {/* octagon faces */}
        <rect x={-half} y={-h} width={half - face} height={h} fill="#000" opacity="0.26" />
        <rect x={face} y={-h} width={half - face} height={h} fill="#000" opacity="0.15" />
        <rect x={-face} y={-h} width={face * 2} height={h} fill="#fff" opacity="0.06" />
        {/* shoulder shade */}
        <rect x={-half} y={-h} width={w} height={shoulder + 6} fill="#000" opacity="0.18" />
        {/* thick glass base */}
        <rect x={-half} y="-19" width={w} height="19" fill="#fff" opacity="0.3" />
        <line x1={-half} y1="-19" x2={half} y2="-19" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" />
        {/* glossy highlights */}
        <rect x={-face + w * 0.04} y={-h + 38} width={w * 0.07} height={h - 76} rx={w * 0.035} fill={`url(#${id("gloss")})`} />
        <rect x={half - w * 0.1} y={-h + 50} width={w * 0.025} height={h - 100} rx={w * 0.012} fill="#fff" opacity="0.22" />
      </g>
      {/* facet edges + outline */}
      <g stroke="#fff" strokeOpacity="0.32" strokeWidth="1.5">
        <line x1={-face} y1={-h + shoulder} x2={-face} y2="-9" />
        <line x1={face} y1={-h + shoulder} x2={face} y2="-9" />
      </g>
      <path d={body} fill="none" stroke={mix(liquid, "black", 0.5)} strokeOpacity="0.7" strokeWidth="2" strokeLinejoin="round" />

      {/* label */}
      <rect x={-half + 1} y={lt} width={w - 2} height={lh} rx="3" fill={`url(#${id("label")})`} />
      <text
        x={-half + w * 0.075}
        y={lt + lh * 0.32}
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize={nameSize}
        fill="#161616"
        {...(nameFits ? {} : { textLength: nameMax, lengthAdjust: "spacingAndGlyphs" as const })}
      >
        {name}
      </text>
      <text
        x="0"
        y={lt + lh * 0.585}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="600"
        fontSize={brandSize}
        fill="#2a2a2a"
      >
        {brandText}
      </text>
      <line x1={-w * 0.42} y1={lt + lh * 0.64} x2={w * 0.42} y2={lt + lh * 0.64} stroke="#333" strokeWidth={Math.max(1.2, w * 0.008)} />
      <text
        x="0"
        y={lt + lh * 0.88}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize={w * 0.1}
        letterSpacing={w * 0.008}
        fill="#161616"
      >
        {origin}
      </text>

      {/* neck */}
      <rect x={-neckW / 2} y={-h - neckH} width={neckW} height={neckH + 4} rx="5" fill={`url(#${id("cap")})`} />
      <rect x={-neckW / 2 - 7} y={-h - 12} width={neckW + 14} height="16" rx="5" fill="#0c0c0d" />
      <rect x={-neckW / 2 - 7} y={-h - 12} width={neckW + 14} height="4" rx="2" fill="#fff" opacity="0.1" />
      <line x1={-neckW / 2} y1={-h - neckH * 0.46} x2={neckW / 2} y2={-h - neckH * 0.46} stroke="#3a3a3e" strokeWidth="2.5" />
      <line x1={-neckW / 2} y1={-h - neckH * 0.58} x2={neckW / 2} y2={-h - neckH * 0.58} stroke="#000" strokeOpacity="0.6" strokeWidth="2" />

      {/* cap */}
      <rect x={-capW / 2} y={-h - neckH - capH} width={capW} height={capH + 2} rx="13" fill={`url(#${id("cap")})`} />
      <rect x={-capW / 2 + 4} y={-h - neckH - capH + 4} width={capW * 0.1} height={capH - 12} rx={capW * 0.05} fill="#fff" opacity="0.13" />
      <ellipse cx="0" cy={-h - neckH - capH + 7} rx={capW / 2 - 7} ry="6" fill="#2a2a2e" opacity="0.8" />
      <line x1={-capW / 2 + 3} y1={-h - neckH - 6} x2={capW / 2 - 3} y2={-h - neckH - 6} stroke="#3a3a3e" strokeWidth="2" />
    </g>
  );
}

/** A single bottle, framed tightly. Use `className` to size it (height or width). */
export function AttarBottle({ size = "12", className, ...label }: Common & { size?: BottleSize; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const d = DIMS[size];
  const total = totalHeight(d);
  const pad = 18;
  return (
    <svg
      viewBox={`${-d.w / 2 - pad} ${-total - pad} ${d.w + pad * 2} ${total + pad * 2 + 8}`}
      className={className}
      style={{ textRendering: "geometricPrecision" }}
      role="img"
      aria-label={label.name ? `${label.name}, ${size} ml bottle` : `${size} ml bottle`}
    >
      <Bottle size={size} uid={uid} {...label} />
    </svg>
  );
}

const GAP = 34;

/** The three sizes standing side by side (12 ml, 6 ml, 3 ml), like the product photo. */
export function AttarLineup({ className, sizes = ["12", "6", "3"], ...label }: Common & { sizes?: BottleSize[]; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const pad = 22;
  // Left edge of each bottle: previous edges plus the widths and gaps before it.
  const lefts = sizes.map((_, i) => sizes.slice(0, i).reduce((sum, prev) => sum + DIMS[prev].w + GAP, pad));
  const placed = sizes.map((s, i) => ({ s, cx: lefts[i] + DIMS[s].w / 2 }));
  const width = lefts[sizes.length - 1] + DIMS[sizes[sizes.length - 1]].w + pad;
  const tallest = Math.max(...sizes.map((s) => totalHeight(DIMS[s])));
  return (
    <svg
      viewBox={`0 ${-tallest - pad} ${width} ${tallest + pad * 2 + 8}`}
      className={className}
      style={{ textRendering: "geometricPrecision" }}
      role="img"
      aria-label={label.name ? `${label.name}, available in ${sizes.join(", ")} ml` : `Bottles in ${sizes.join(", ")} ml`}
    >
      {placed.map(({ s, cx }) => (
        <g key={s} transform={`translate(${cx} 0)`}>
          <Bottle size={s} uid={`${uid}${s}`} {...label} />
        </g>
      ))}
    </svg>
  );
}
