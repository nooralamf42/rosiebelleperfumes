"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Heart, MessageCircle, Pause, Play, Send, Volume2, VolumeX } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { reelSources } from "@/lib/reel-url";
import { cn } from "@/lib/utils";
import type { HomepageSettings } from "@/lib/settings/schema";

type Reel = HomepageSettings["reels"]["items"][number];

/**
 * Social reels: a swipeable row of vertical videos inside phone frames.
 * Nothing plays on its own. Tapping a phone plays that video (sound on),
 * tapping again pauses it, and starting another one stops the first.
 * Videos use preload="none" with a cover image, so the section costs almost
 * no data until someone presses play.
 */
export function Reels({ content }: { content: HomepageSettings["reels"] }) {
  const items = content.items.filter((r) => r.videoUrl.startsWith("https://"));
  const rail = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [active, setActive] = useState<number | null>(null);
  const stop = useCallback(() => setActive(null), []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const update = () =>
      setEdge({
        start: el.scrollLeft < 8,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
      });
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update); // also fires once on observe
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [items.length]);

  if (items.length === 0) return null;

  const slide = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector<HTMLElement>("[data-reel]");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: "smooth" });
  };

  return (
    <section id="reels" className="overflow-hidden py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            {content.eyebrow && <p className="text-eyebrow">{content.eyebrow}</p>}
            <h2 className="mt-3 max-w-xl text-3xl sm:text-4xl lg:text-5xl">{content.title}</h2>
            {content.subtitle && <p className="mt-4 max-w-lg text-muted-foreground">{content.subtitle}</p>}
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => slide(-1)}
              disabled={edge.start}
              aria-label="Previous reel"
              className="grid size-11 place-items-center rounded-full border border-foreground/15 transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => slide(1)}
              disabled={edge.end}
              aria-label="Next reel"
              className="grid size-11 place-items-center rounded-full border border-foreground/15 transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </Reveal>

        <div
          ref={rail}
          role="list"
          aria-label="Social reels"
          className="-mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-4 px-4 pb-6 [scrollbar-width:none] sm:-mx-6 sm:scroll-pl-6 sm:px-6 lg:-mx-8 lg:scroll-pl-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((reel, i) => (
            <ReelPhone
              key={`${reel.videoUrl}-${i}`}
              reel={reel}
              playing={active === i}
              onToggle={() => setActive(active === i ? null : i)}
              onStop={stop}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReelPhone({ reel, playing, onToggle, onStop }: { reel: Reel; playing: boolean; onToggle: () => void; onStop: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const src = reelSources(reel.videoUrl, reel.posterUrl);

  // Drive the <video> from the `playing` flag the parent owns.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (playing) v.play().catch(onStop);
    else v.pause();
  }, [playing, onStop]);

  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted]);

  // Pause when scrolled mostly out of view.
  useEffect(() => {
    const el = frame.current;
    if (!el || !playing) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && onStop(), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [playing, onStop]);

  const handle = reel.handle.trim();

  return (
    <div role="listitem" data-reel className="w-[68vw] max-w-[280px] shrink-0 snap-center sm:w-[260px] sm:snap-start">
      {/* phone body */}
      <div className="rounded-[2.4rem] bg-[#16161a] p-[7px] shadow-soft ring-1 ring-black/30">
        <div ref={frame} className="relative aspect-[9/16] overflow-hidden rounded-[2rem] bg-black">
          <video
            ref={video}
            src={src.video}
            poster={src.poster || undefined}
            preload={src.poster ? "none" : "metadata"}
            playsInline
            loop
            className="absolute inset-0 size-full object-cover"
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              setProgress(v.duration ? v.currentTime / v.duration : 0);
            }}
            onEnded={onStop}
          />

          {/* tap target */}
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? `Pause video${handle ? ` by ${handle}` : ""}` : `Play video${handle ? ` by ${handle}` : ""}`}
            className="absolute inset-0 z-10 cursor-pointer"
          >
            <span
              className={cn(
                "absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/25 text-white ring-1 ring-white/40 backdrop-blur-md transition-all duration-300",
                playing ? "scale-75 opacity-0" : "scale-100 opacity-100",
              )}
            >
              <Play className="ml-0.5 size-7 fill-current" />
            </span>
          </button>

          {/* dynamic island */}
          <span className="pointer-events-none absolute left-1/2 top-2.5 z-20 h-[18px] w-16 -translate-x-1/2 rounded-full bg-black" aria-hidden />

          {/* top gradient + sound */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/45 to-transparent" />
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            className={cn(
              "absolute right-3 top-9 z-30 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-opacity",
              playing ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>

          {/* side actions (decorative, like a reel) */}
          <div className="pointer-events-none absolute bottom-20 right-3 z-20 flex flex-col items-center gap-4 text-white" aria-hidden>
            <Heart className="size-6 drop-shadow" strokeWidth={1.8} />
            <MessageCircle className="size-6 drop-shadow" strokeWidth={1.8} />
            <Send className="size-6 drop-shadow" strokeWidth={1.8} />
          </div>

          {/* caption */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3.5 pb-4 pt-16 text-white">
            <div className="flex items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-1 ring-white/40">
                {(handle.replace("@", "")[0] ?? "R").toUpperCase()}
              </span>
              {handle && <span className="truncate text-sm font-medium">{handle}</span>}
              {reel.link && (
                <a
                  href={reel.link}
                  target={reel.link.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Open the original post"
                  className="pointer-events-auto ml-auto inline-flex items-center gap-1 rounded-full border border-white/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                >
                  View <ArrowUpRight className="size-3" />
                </a>
              )}
            </div>
            {reel.caption && <p className="mt-2 line-clamp-2 pr-10 text-[13px] leading-snug text-white/90">{reel.caption}</p>}
          </div>

          {/* progress */}
          <div className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/25">
            <div className="h-full bg-white transition-[width] duration-200 ease-linear" style={{ width: `${progress * 100}%` }} />
          </div>

          {playing && (
            <span className="pointer-events-none absolute left-3 top-9 z-30 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
              <Pause className="size-3 fill-current" /> Playing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
