import type { ProductType } from "@/lib/types";

/**
 * Illustrated amber dropper bottle, used when a product has no photo yet.
 * `accent` is a brand token (e.g. "brand-lavender") that tints the liquid,
 * the label band and the botanical sprig, so every oil looks like itself.
 * Deterministic: the same product always renders the same bottle.
 */
export function ProductGraphic({
  type,
  accent,
  className,
  initials,
  label,
}: {
  type?: ProductType;
  accent: string;
  className?: string;
  initials?: string;
  /** Short label printed on the bottle (defaults to initials). */
  label?: string;
}) {
  const color = `var(--${accent})`;
  const id = `${accent}-${(label ?? initials ?? "x").replace(/[^a-z0-9]/gi, "")}`;
  const isSet = type === "BUNDLE" && /set|six|kit|box/i.test(label ?? "");
  const isRoller = /roll/i.test(label ?? "");

  return (
    <svg viewBox="0 0 240 300" className={className} role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`amber-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6b3a10" />
          <stop offset="28%" stopColor="#a65f1d" />
          <stop offset="55%" stopColor="#c8842f" />
          <stop offset="80%" stopColor="#8f4f16" />
          <stop offset="100%" stopColor="#5a2f0c" />
        </linearGradient>
        <linearGradient id={`liquid-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`halo-${id}`} cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* halo */}
      <ellipse cx="120" cy="190" rx="110" ry="90" fill={`url(#halo-${id})`} />
      {/* shadow */}
      <ellipse cx="122" cy="282" rx="52" ry="7" fill="#000" opacity="0.14" />

      {isSet ? (
        <g>
          {/* three small bottles in a row */}
          {[-1, 0, 1].map((k) => (
            <g key={k} transform={`translate(${120 + k * 56} 0) scale(0.62)`} style={{ transformOrigin: "0 280px" }}>
              <g transform="translate(-120 0)">
                <Bottle id={`${id}-${k}`} color={color} />
              </g>
            </g>
          ))}
          <rect x="38" y="262" width="164" height="14" rx="3" fill={color} opacity="0.35" />
        </g>
      ) : (
        <g>
          <Bottle id={id} color={color} roller={isRoller} />
          {/* label text */}
          <text
            x="120"
            y="207"
            textAnchor="middle"
            fontFamily="var(--font-display), Georgia, serif"
            fontSize={labelSize(label ?? initials ?? "")}
            fill="#2b1a0b"
            letterSpacing="0.3"
            {...((label ?? "").length > 9 ? { textLength: 62, lengthAdjust: "spacingAndGlyphs" as const } : {})}
          >
            {label ?? initials ?? ""}
          </text>
          <text
            x="120"
            y="224"
            textAnchor="middle"
            fontFamily="var(--font-body), system-ui, sans-serif"
            fontSize="7"
            letterSpacing="2.2"
            fill="#5a3a1a"
          >
            PURE ESSENTIAL OIL
          </text>
        </g>
      )}

      {/* botanical sprig */}
      <g transform="translate(176 64) rotate(18)" opacity="0.9">
        <path d="M0 0 C 2 -30, 2 -60, 0 -90" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
        {[-78, -62, -46, -30, -14].map((y, i) => (
          <g key={y}>
            <path d={`M0 ${y} q -14 -6 -18 -20 q 14 2 18 20`} fill={color} opacity={0.85 - i * 0.08} />
            <path d={`M0 ${y + 8} q 14 -6 18 -20 q -14 2 -18 20`} fill={color} opacity={0.75 - i * 0.08} />
          </g>
        ))}
      </g>
    </svg>
  );
}

function labelSize(text: string): number {
  const n = text.length;
  if (n <= 6) return 17;
  if (n <= 9) return 14;
  if (n <= 13) return 11;
  return 9;
}

function Bottle({ id, color, roller = false }: { id: string; color: string; roller?: boolean }) {
  return (
    <g>
      {/* cap */}
      <rect x="96" y="22" width="48" height="36" rx="6" fill="#1f1a16" />
      <rect x="100" y="26" width="40" height="28" rx="4" fill="#2b2420" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={102 + i * 8} y="28" width="2" height="24" fill="#14100d" opacity="0.8" />
      ))}
      {/* neck */}
      <rect x="106" y="56" width="28" height="22" fill="#6b3a10" />
      {/* dropper pipette (visible through glass) */}
      {!roller && <rect x="118" y="60" width="4" height="150" rx="2" fill="#f6ead6" opacity="0.65" />}
      {/* body */}
      <path
        d="M78 96 Q78 78 96 78 L144 78 Q162 78 162 96 L162 258 Q162 276 144 276 L96 276 Q78 276 78 258 Z"
        fill={`url(#amber-${id})`}
      />
      {/* liquid */}
      <path d="M84 150 L156 150 L156 258 Q156 270 144 270 L96 270 Q84 270 84 258 Z" fill={`url(#liquid-${id})`} opacity="0.75" />
      {/* label */}
      <rect x="84" y="178" width="72" height="60" rx="3" fill="#fbf7ef" />
      <rect x="84" y="178" width="72" height="5" rx="1" fill={color} />
      <rect x="84" y="233" width="72" height="5" rx="1" fill={color} opacity="0.6" />
      {/* shine */}
      <rect x="88" y="90" width="12" height="176" rx="6" fill={`url(#shine-${id})`} opacity="0.9" />
      <rect x="148" y="100" width="4" height="160" rx="2" fill="white" opacity="0.18" />
      {/* roller ball */}
      {roller && <circle cx="120" cy="64" r="10" fill="#d6d0c6" stroke="#9a948b" strokeWidth="1" />}
    </g>
  );
}
