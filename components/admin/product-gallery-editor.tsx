"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Plus, Star, Upload, X, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { discardUploadedImageAction } from "@/app/admin/actions";
import { uploadImage } from "@/lib/upload-image";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-images";
import { cn } from "@/lib/utils";

/*
 * Product pictures: up to 4 per set. The first picture is the primary one.
 * Drag a picture onto another to reorder (on a phone use the arrows).
 * "All sizes" is the general set; each size can have a set of its own, and a
 * size without one shows the general set. Replacing or removing a picture
 * deletes the old file from Cloudinary (right away if it was uploaded in this
 * same edit, otherwise when the product is saved).
 */
export function ProductGalleryEditor({
  sizes,
  images,
  sizeImages,
  onImages,
  onSizeImages,
}: {
  sizes: string[];
  images: string[];
  sizeImages: Record<string, string[]>;
  onImages: (v: string[]) => void;
  onSizeImages: (v: Record<string, string[]>) => void;
}) {
  const [tab, setTab] = useState("all");
  const current = tab === "all" || sizes.includes(tab) ? tab : "all";
  // Files uploaded during this edit that no saved product uses yet.
  const fresh = useRef<Set<string>>(new Set());

  const list = current === "all" ? images : (sizeImages[current] ?? []);
  const setList = (next: string[]) => {
    if (current === "all") onImages(next);
    else onSizeImages({ ...sizeImages, [current]: next });
  };

  /** A picture leaves the set: if it was only just uploaded, delete the file now. */
  function dropped(url: string) {
    if (fresh.current.delete(url)) void discardUploadedImageAction(url);
  }

  const tabs = [{ key: "all", label: "All sizes", count: images.length }, ...sizes.map((s) => ({ key: s, label: s, count: sizeImages[s]?.length ?? 0 }))];

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="Pictures for" className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={current === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              current === t.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {t.label}
            <span className={cn("ml-1.5 text-xs", current === t.key ? "opacity-80" : "text-muted-foreground")}>{t.count}/{MAX_PRODUCT_IMAGES}</span>
          </button>
        ))}
      </div>

      <Slots
        key={current}
        list={list}
        onChange={setList}
        onAdded={(url) => fresh.current.add(url)}
        onDropped={dropped}
      />

      <p className="text-xs text-muted-foreground">
        {current === "all"
          ? "Shown for every size that has no pictures of its own. Leave empty to use the bottle illustration."
          : `Shown when ${current} is chosen. Leave empty to show the “All sizes” pictures.`}{" "}
        The first picture is the main one: drag pictures to change the order.
      </p>
    </div>
  );
}

function Slots({
  list,
  onChange,
  onAdded,
  onDropped,
}: {
  list: string[];
  onChange: (v: string[]) => void;
  onAdded: (url: string) => void;
  onDropped: (url: string) => void;
}) {
  const [busy, setBusy] = useState<number | "new" | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [link, setLink] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const target = useRef<number | "new">("new");

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= list.length) return;
    const next = [...list];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };

  function pick(index: number | "new") {
    target.current = index;
    file.current?.click();
  }

  async function onFile(f: File | undefined) {
    if (file.current) file.current.value = "";
    if (!f) return;
    const where = target.current;
    setBusy(where);
    try {
      const url = await uploadImage(f, "product");
      onAdded(url);
      if (where === "new") onChange([...list, url].slice(0, MAX_PRODUCT_IMAGES));
      else {
        const old = list[where];
        onChange(list.map((u, i) => (i === where ? url : u)));
        if (old) onDropped(old); // the replaced picture is deleted
      }
      toast.success(where === "new" ? "Picture added" : "Picture replaced");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    if (!/^https:\/\//i.test(url)) {
      toast.error("Use a full https:// link");
      return;
    }
    onChange([...list, url].slice(0, MAX_PRODUCT_IMAGES));
    setLink("");
  }

  const full = list.length >= MAX_PRODUCT_IMAGES;

  return (
    <div>
      <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {list.map((src, i) => (
          <li
            key={src}
            draggable
            onDragStart={(e) => {
              setDragFrom(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(i);
            }}
            onDragLeave={() => setDragOver((d) => (d === i ? null : d))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
              setDragOver(null);
            }}
            onDragEnd={() => {
              setDragFrom(null);
              setDragOver(null);
            }}
            className={cn(
              "group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-muted active:cursor-grabbing",
              dragOver === i && dragFrom !== i && "ring-2 ring-primary",
              dragFrom === i && "opacity-50",
              i === 0 && "border-primary",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Picture ${i + 1}`} className="size-full object-cover" draggable={false} />
            {busy === i && (
              <span className="absolute inset-0 grid place-items-center bg-background/70">
                <Loader2 className="size-5 animate-spin" />
              </span>
            )}
            <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {i === 0 ? <><Star className="size-3 fill-current" /> Primary</> : <><GripVertical className="size-3" /> {i + 1}</>}
            </span>
            <button
              type="button"
              onClick={() => {
                onChange(list.filter((_, j) => j !== i));
                onDropped(src);
              }}
              className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/65 text-white hover:bg-black"
              aria-label={`Remove picture ${i + 1}`}
            >
              <X className="size-3.5" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-6">
              <div className="flex gap-1">
                <TileButton label="Move left" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <ArrowLeft className="size-3.5" />
                </TileButton>
                <TileButton label="Move right" disabled={i === list.length - 1} onClick={() => move(i, i + 1)}>
                  <ArrowRight className="size-3.5" />
                </TileButton>
                {i !== 0 && (
                  <TileButton label="Make primary" onClick={() => move(i, 0)}>
                    <Star className="size-3.5" />
                  </TileButton>
                )}
              </div>
              <TileButton label="Replace this picture" onClick={() => pick(i)} disabled={busy !== null}>
                <Upload className="size-3.5" />
              </TileButton>
            </div>
          </li>
        ))}

        {!full && (
          <li>
            <button
              type="button"
              onClick={() => pick("new")}
              disabled={busy !== null}
              className="grid aspect-square w-full place-items-center rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary"
            >
              {busy === "new" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <span className="flex flex-col items-center gap-1 text-xs font-medium">
                  <Plus className="size-5" /> Add picture
                </span>
              )}
            </button>
          </li>
        )}
      </ul>

      {!full && (
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="…or paste a picture link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
            }}
            className="rounded-xl"
          />
          <Button type="button" variant="secondary" onClick={addLink} className="rounded-xl">
            <Plus className="size-4" /> Add
          </Button>
        </div>
      )}
    </div>
  );
}

function TileButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-7 place-items-center rounded-full bg-white/90 text-black transition-colors hover:bg-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
