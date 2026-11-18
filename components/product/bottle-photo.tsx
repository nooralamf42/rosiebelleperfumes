import layout from "@/lib/bottle-layout.json";
import { bottleImageUrl } from "@/lib/perfume-colors";
import type { BottleSize } from "@/lib/sizes";
import { cn } from "@/lib/utils";

/*
 * Product bottle pictures. One real studio photo of the 12, 6 and 3 gm bottles
 * (blank labels) is cut out and recoloured for every perfume colour by
 * scripts/build-bottle-photos.ts, so a perfume's bottle matches its colour.
 * The name, brand and place are printed onto the blank label here, in code,
 * so every product gets its own label without a new photo.
 */

type Rect = { x: number; y: number; w: number; h: number };
type Single = { w: number; h: number; label: Rect; heightPx: number };

const SINGLE = layout.single as Record<BottleSize, Single>;
const TALLEST = SINGLE["12"].heightPx;

/** How tall a bottle is compared with the 12 gm one (1, ~0.86, ~0.71). */
export const bottleHeightRatio = (size: BottleSize) => SINGLE[size].heightPx / TALLEST;

type LabelProps = { name?: string; brand?: string; origin?: string };

/** Text printed on the blank label. Sizes are relative to the label box, so it scales with the picture. */
function LabelText({ rect, name = "", brand = "Rosiebelle Perfumes", origin = "KANNAUJ", visible = true }: LabelProps & { rect: Rect; visible?: boolean }) {
  const brandText = brand.toUpperCase().replace(/\s+/g, "");
  const nameFit = Math.max(name.length, 5) * 0.56; // average glyph width in em
  const brandFit = Math.max(brandText.length, 6) * 0.66;
  return (
    <div
      aria-hidden
      className="absolute mix-blend-multiply transition-opacity duration-500 [container-type:size]"
      style={{ opacity: visible ? 1 : 0, left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.w * 100}%`, height: `${rect.h * 100}%` }}
    >
      <div className="flex h-full flex-col items-center justify-evenly px-[9cqw] text-center text-[#1a1a1a]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <span className="block max-w-full whitespace-nowrap font-bold leading-none" style={{ fontSize: `min(13cqw, calc(76cqw / ${nameFit.toFixed(2)}))` }}>
          {name}
        </span>
        <span
          className="block whitespace-nowrap border-b-[0.7cqw] border-[#2a2a2a] pb-[1.6cqw] font-semibold leading-none"
          style={{ fontSize: `min(5.4cqw, calc(78cqw / ${brandFit.toFixed(2)}))` }}
        >
          {brandText}
        </span>
        <span className="block font-extrabold leading-none tracking-[0.06em]" style={{ fontSize: "8.8cqw" }}>
          {origin}
        </span>
      </div>
    </div>
  );
}

/**
 * One bottle. Give it a height (it keeps its own proportions) or a width.
 * `scaled` sizes it relative to the 12 gm bottle, for showing sizes together.
 */
export function BottlePhoto({
  size = "12",
  accent,
  name,
  brand,
  origin,
  className,
  style,
  priority,
  labelVisible = true,
}: LabelProps & { size?: BottleSize; accent: string; className?: string; style?: React.CSSProperties; priority?: boolean; labelVisible?: boolean }) {
  const s = SINGLE[size];
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ aspectRatio: `${s.w} / ${s.h}`, ...style }}
      role="img"
      aria-label={name ? `${name}, ${size} gm bottle` : `${size} gm bottle`}
    >
      {/* Plain <img>: the files are already small webp cut-outs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bottleImageUrl(accent, size)}
        alt=""
        width={s.w}
        height={s.h}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full select-none object-contain drop-shadow-[0_14px_14px_rgba(40,22,10,0.22)]"
      />
      <LabelText rect={s.label} name={name} brand={brand} origin={origin} visible={labelVisible} />
    </div>
  );
}

/**
 * Several sizes standing in a row, bottoms aligned and heights true to life
 * (12 gm tallest). Fits itself inside its parent: give the parent a size.
 */
export function BottleRow({
  sizes,
  accent,
  name,
  brand,
  origin,
  className,
  priority,
}: LabelProps & { sizes: BottleSize[]; accent: string; className?: string; priority?: boolean }) {
  const tallest = Math.max(...sizes.map(bottleHeightRatio));
  // Total width of the row in units of the tallest bottle's height, plus gaps.
  const gapUnits = 0.05;
  const widthUnits = sizes.reduce((sum, b) => sum + (SINGLE[b].w / SINGLE[b].h) * (bottleHeightRatio(b) / tallest), 0) + (sizes.length - 1) * gapUnits;
  return (
    <div className={cn("flex items-end justify-center [container-type:size]", className)} style={{ gap: "0" }}>
      <div
        className="flex items-end justify-center"
        style={{
          // As tall as the space allows, but never wider than it.
          height: `min(100cqh, calc(100cqw / ${widthUnits.toFixed(3)}))`,
          gap: `${((gapUnits / widthUnits) * 100).toFixed(2)}%`,
        }}
      >
        {sizes.map((b) => (
          <BottlePhoto
            key={b}
            size={b}
            accent={accent}
            name={name}
            brand={brand}
            origin={origin}
            priority={priority}
            style={{ height: `${((bottleHeightRatio(b) / tallest) * 100).toFixed(2)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
