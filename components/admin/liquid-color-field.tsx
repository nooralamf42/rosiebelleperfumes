"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, ImageIcon, Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLenisLock } from "@/components/providers/smooth-scroll-provider";
import { PERFUME_ACCENTS, bottleImageUrl, isHexAccent, liquidColor } from "@/lib/perfume-colors";
import { cn } from "@/lib/utils";

const MAX_SIDE = 1200; // photos are shrunk to this on screen; nothing is uploaded
const SAMPLE_RADIUS = 4; // the colour is the average of a 9 x 9 patch, so one stray pixel can't skew it
const LOUPE_RADIUS = 8; // the magnifier shows 17 x 17 pixels

const toHex = (r: number, g: number, b: number) =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/**
 * Perfume colour: the nine presets, or any colour. A custom colour can be typed,
 * chosen on a colour wheel, or picked from a photo of the real bottle (taken
 * with the phone camera or chosen from the gallery). The photo is only read in
 * the browser to pick a pixel: it is never uploaded or saved.
 */
export function LiquidColorField({ value, onChange }: { value: string; onChange: (accent: string) => void }) {
  const custom = isHexAccent(value);
  const hex = liquidColor(value);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, setDraft] = useState(hex);

  // A short wait before the preview picture is fetched, so dragging the colour wheel doesn't send a request per pixel.
  const [previewFor, setPreviewFor] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setPreviewFor(value), 350);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="flex flex-wrap items-start gap-5">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap gap-2">
          {PERFUME_ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                onChange(a);
                setDraft(liquidColor(a));
              }}
              className={cn("size-8 rounded-full border-2", value === a ? "border-foreground" : "border-transparent")}
              style={{ backgroundColor: liquidColor(a) }}
              aria-label={a.replace("brand-", "")}
              title={a.replace("brand-", "")}
            />
          ))}
          {custom && (
            <span
              className="grid size-8 place-items-center rounded-full border-2 border-foreground text-white"
              style={{ backgroundColor: hex }}
              title={`Custom colour ${hex}`}
            >
              <Check className="size-4 drop-shadow" />
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Camera /> Match from a photo
          </Button>
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="color"
              value={hex}
              onChange={(e) => {
                onChange(e.target.value.toLowerCase());
                setDraft(e.target.value.toLowerCase());
              }}
              className="size-9 cursor-pointer rounded-md border bg-transparent p-0.5"
              aria-label="Choose a colour"
            />
            or
          </label>
          <Input
            value={draft}
            onChange={(e) => {
              const v = e.target.value.trim();
              setDraft(v);
              const withHash = v.startsWith("#") ? v : `#${v}`;
              if (isHexAccent(withHash)) onChange(withHash.toLowerCase());
            }}
            onBlur={() => setDraft(hex)}
            placeholder="#a01818"
            maxLength={7}
            className="h-9 w-28 font-mono text-sm"
            aria-label="Colour code"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          The colour of the liquid in the bottle picture, and the tint behind it. Point your phone camera at the real bottle and tap the exact colour you want; the
          photo stays on your device.
        </p>
      </div>

      {/* what the customer will see */}
      <div className="flex w-24 shrink-0 flex-col items-center gap-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={previewFor} src={bottleImageUrl(previewFor, "12")} alt="Bottle preview" className="h-32 w-auto" draggable={false} />
        <span className="text-[11px] text-muted-foreground">Preview</span>
      </div>

      {pickerOpen && (
        <PhotoColorPicker
          onClose={() => setPickerOpen(false)}
          onPick={(c) => {
            onChange(c);
            setDraft(c);
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PhotoColorPicker({ onPick, onClose }: { onPick: (hex: string) => void; onClose: () => void }) {
  useLenisLock(true);
  const canvas = useRef<HTMLCanvasElement>(null);
  const loupe = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 }); // 0..1 across the photo
  const [picked, setPicked] = useState("#808080");

  /** Read the colour under (px, py) in canvas pixels and redraw the magnifier. */
  function sample(px: number, py: number) {
    const c = canvas.current;
    const ctx = c?.getContext("2d", { willReadFrequently: true });
    if (!c || !ctx) return;
    const x = Math.min(c.width - 1, Math.max(0, Math.round(px)));
    const y = Math.min(c.height - 1, Math.max(0, Math.round(py)));
    setPos({ x: x / c.width, y: y / c.height });

    const x0 = Math.max(0, x - SAMPLE_RADIUS);
    const y0 = Math.max(0, y - SAMPLE_RADIUS);
    const w = Math.min(c.width, x + SAMPLE_RADIUS + 1) - x0;
    const h = Math.min(c.height, y + SAMPLE_RADIUS + 1) - y0;
    const d = ctx.getImageData(x0, y0, w, h).data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      g += d[i + 1];
      b += d[i + 2];
    }
    const n = d.length / 4;
    setPicked(toHex(r / n, g / n, b / n));

    const lc = loupe.current;
    const lctx = lc?.getContext("2d");
    if (lc && lctx) {
      const size = LOUPE_RADIUS * 2 + 1;
      lctx.imageSmoothingEnabled = false;
      lctx.clearRect(0, 0, lc.width, lc.height);
      lctx.drawImage(c, x - LOUPE_RADIUS, y - LOUPE_RADIUS, size, size, 0, 0, lc.width, lc.height);
      const mid = lc.width / 2;
      const cell = lc.width / size;
      lctx.strokeStyle = "#fff";
      lctx.lineWidth = 2;
      lctx.strokeRect(mid - cell / 2, mid - cell / 2, cell, cell);
      lctx.strokeStyle = "#000";
      lctx.lineWidth = 1;
      lctx.strokeRect(mid - cell / 2 - 1.5, mid - cell / 2 - 1.5, cell + 3, cell + 3);
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
      const c = canvas.current;
      if (!c) return;
      c.width = Math.round(bmp.width * scale);
      c.height = Math.round(bmp.height * scale);
      c.getContext("2d", { willReadFrequently: true })!.drawImage(bmp, 0, 0, c.width, c.height);
      bmp.close();
      setLoaded(true);
      // start in the middle of the photo, where the bottle usually is
      requestAnimationFrame(() => sample(c.width / 2, c.height / 2));
    } catch {
      setError("That file couldn't be opened as a picture. Try another photo.");
    }
  }

  function fromPointer(e: React.PointerEvent<HTMLElement>) {
    const c = canvas.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    sample(((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height);
  }

  function onKey(e: React.KeyboardEvent) {
    const c = canvas.current;
    if (!c) return;
    const step = e.shiftKey ? 10 : 1;
    const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
    const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    sample(pos.x * c.width + dx, pos.y * c.height + dy);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick the colour from a photo</DialogTitle>
          <DialogDescription>
            Take a picture of the real bottle (or choose one), then drag the crosshair onto the liquid. The picture stays on this device and is not uploaded.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {/* "capture" opens the phone's camera app; on a computer it opens the file picker */}
          <label className="inline-flex">
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground">
              <Camera className="size-4" /> {loaded ? "Take another photo" : "Take a photo"}
            </span>
          </label>
          <label className="inline-flex">
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            <span className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-sm font-medium hover:bg-muted">
              <ImageIcon className="size-4" /> Choose from gallery
            </span>
          </label>
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <div className={cn("relative mx-auto w-fit max-w-full select-none", !loaded && "hidden")}>
          <canvas
            ref={canvas}
            tabIndex={0}
            aria-label="Photo: drag the crosshair, or use the arrow keys, to choose a colour"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              fromPointer(e);
            }}
            onPointerMove={(e) => e.buttons > 0 && fromPointer(e)}
            onKeyDown={onKey}
            className="block max-h-[55svh] max-w-full cursor-crosshair touch-none rounded-lg outline-offset-2"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.7),inset_0_0_0_1.5px_rgba(0,0,0,0.7)]"
            style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
          >
            <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.8)]" />
          </span>
        </div>

        {loaded && (
          <div className="flex items-center gap-4">
            <canvas ref={loupe} width={102} height={102} className="size-[102px] shrink-0 rounded-lg border bg-muted" aria-hidden />
            <div className="flex items-center gap-3">
              <span className="size-12 rounded-full border shadow-inner" style={{ backgroundColor: picked }} />
              <div>
                <p className="font-mono text-sm font-semibold">{picked}</p>
                <p className="text-xs text-muted-foreground">Average of the small patch under the crosshair</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!loaded} onClick={() => onPick(picked)}>
            <Pipette /> Use this colour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
