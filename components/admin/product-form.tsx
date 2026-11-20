"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatSizeEntry } from "@/lib/sizes";
import { saveProduct, deleteProduct } from "@/app/admin/actions";
import { ProductGalleryEditor } from "./product-gallery-editor";
import { LiquidColorField } from "./liquid-color-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toPaise } from "@/lib/format";
import type { AdminProduct } from "@/lib/admin-data";

type SizeRow = { label: string; price: string };

/** "12 gm=1299" → { label: "12 gm", price: "1299" }; "S" → { label: "S", price: "" }. */
function rowFromEntry(raw: string): SizeRow {
  const i = raw.lastIndexOf("=");
  return i > 0 ? { label: raw.slice(0, i).trim(), price: raw.slice(i + 1).trim() } : { label: raw.trim(), price: "" };
}


/** Rows of size + price (₹). The first size is the default one. */
function SizesEditor({ rows, onChange, basePrice }: { rows: SizeRow[]; onChange: (r: SizeRow[]) => void; basePrice: number }) {
  const update = (i: number, patch: Partial<SizeRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const presetDisabled = basePrice <= 0;

  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No sizes: the product is sold as a single item at the price above.</p>
      )}
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_8rem_auto] items-center gap-2">
          <Input placeholder="e.g. 12 gm" value={r.label} onChange={(e) => update(i, { label: e.target.value.replace(/[=,]/g, "") })} aria-label="Size name" />
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
            <Input
              type="number"
              min="0"
              placeholder="price"
              value={r.price}
              onChange={(e) => update(i, { price: e.target.value })}
              className="pl-7"
              aria-label={`Price for ${r.label || "this size"}`}
            />
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label="Remove size" className="text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { label: "", price: "" }])}>
          <Plus className="size-4" /> Add size
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={presetDisabled}
          title={presetDisabled ? "Enter the price above first" : undefined}
          onClick={() =>
            onChange([
              { label: "12 gm", price: String(basePrice) },
              { label: "6 gm", price: String(Math.round(basePrice / 2)) },
              { label: "3 gm", price: String(Math.round(basePrice / 4)) },
            ])
          }
        >
          Use 12 / 6 / 3 gm
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        The first size is the default. Leave a price empty to use the product price. Sizes in gm (or ml) show the matching bottle picture. The preset prices 6 gm at half and 3 gm at a quarter of the 12 gm price.
      </p>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function ProductForm({
  product,
  categories = [],
}: {
  product?: AdminProduct;
  categories?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [sizeImages, setSizeImages] = useState<Record<string, string[]>>(product?.sizeImages ?? {});
  const [sizeRows, setSizeRows] = useState<SizeRow[]>(() => (product?.sizes ?? []).map(rowFromEntry));
  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    description: product?.description ?? "",
    type: product?.type ?? "DRINK",
    price: product ? String(product.price / 100) : "",
    compareAtPrice: product?.compareAtPrice ? String(product.compareAtPrice / 100) : "",
    flavor: product?.flavor ?? "",
    mood: product?.mood ?? "",
    accentColor: product?.accentColor ?? "brand-berry",
    benefits: (product?.benefits ?? []).join("\n"),
    ingredients: product?.ingredients ?? "",
    stock: product ? String(product.stock) : "0",
    featured: product?.featured ?? false,
    isActive: product?.isActive ?? true,
    categoryId: product?.categoryId ?? "",
    newCategory: "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await saveProduct({
      id: product?.id,
      name: form.name,
      slug: form.slug || slugify(form.name),
      tagline: form.tagline,
      description: form.description,
      type: form.type as AdminProduct["type"],
      price: toPaise(Number(form.price) || 0),
      compareAtPrice: form.compareAtPrice ? toPaise(Number(form.compareAtPrice)) : null,
      images,
      sizeImages,
      accentColor: form.accentColor,
      flavor: form.flavor,
      mood: form.mood,
      sizes: sizeRows.filter((r) => r.label.trim()).map((r) => formatSizeEntry(r.label, r.price)),
      benefits: form.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
      ingredients: form.ingredients,
      stock: Number(form.stock) || 0,
      featured: form.featured,
      isActive: form.isActive,
      categoryId: form.categoryId || null,
      newCategory: form.newCategory,
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Product saved");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to save");
    }
  }

  async function onDelete() {
    if (!product) return;
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const res = await deleteProduct(product.id);
    if (res.ok) {
      toast.success("Product deleted");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to delete");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <Field label="Pictures">
        <ProductGalleryEditor
          sizes={sizeRows.map((r) => r.label.trim()).filter(Boolean)}
          images={images}
          sizeImages={sizeImages}
          onImages={setImages}
          onSizeImages={setSizeImages}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input
            required
            value={form.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!product) set("slug", slugify(e.target.value));
            }}
          />
        </Field>
        <Field label="Slug">
          <Input required value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </Field>
      </div>

      <Field label="Tagline">
        <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </Field>

      <Field label="Description">
        <Textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (₹)">
          <Input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            With sizes, this is the price of the first size. Each size can have its own price below.
          </p>
        </Field>
        <Field label="Compare at (₹)">
          <Input
            type="number"
            min="0"
            value={form.compareAtPrice}
            onChange={(e) => set("compareAtPrice", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            disabled={!!form.newCategory}
            className="h-9 w-full rounded-md border bg-transparent px-3 text-sm disabled:opacity-50"
          >
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="…or create a new category">
          <Input
            placeholder="e.g. Accessories"
            value={form.newCategory}
            onChange={(e) => set("newCategory", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Aroma notes (e.g. Lavender, cedarwood)">
          <Input value={form.flavor} onChange={(e) => set("flavor", e.target.value)} />
        </Field>
        <Field label="Mood badge (e.g. Calm, Focus)">
          <Input value={form.mood} onChange={(e) => set("mood", e.target.value)} />
        </Field>
        <Field label="Stock">
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Perfume colour">
        <LiquidColorField value={form.accentColor} onChange={(accentColor) => set("accentColor", accentColor)} />
      </Field>

      <Field label="Sizes and prices">
        <SizesEditor rows={sizeRows} onChange={setSizeRows} basePrice={Number(form.price) || 0} />
      </Field>

      <Field label="Highlights (one per line)">
        <Textarea
          rows={3}
          value={form.benefits}
          onChange={(e) => set("benefits", e.target.value)}
        />
      </Field>

      <Field label="Ingredients & safety">
        <Textarea
          rows={2}
          value={form.ingredients}
          onChange={(e) => set("ingredients", e.target.value)}
        />
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="size-4"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="size-4"
          />
          Active (visible in store)
        </label>
      </div>

      <div className="flex items-center gap-3 border-t pt-5">
        <Button type="submit" disabled={saving} className="rounded-full">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {product ? "Save changes" : "Create product"}
        </Button>
        {product && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            className="rounded-full"
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
