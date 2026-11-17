"use client";

import type { CommerceSettings, PackagingSettings } from "@/lib/settings/schema";
import { computeParcel } from "@/lib/shipping-package";
import { computeTotals } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { useSectionForm } from "./use-section-form";
import { ListEditor } from "./list-editor";
import { Field, RupeeField, SaveBar, SettingsCard, TextField, Toggle } from "./fields";

export function CommerceForm({ initial }: { initial: CommerceSettings }) {
  const { value: v, patch, errors, saving, dirty, save, reset } = useSectionForm("commerce", initial);
  const tierError = (i: number) => errors[`tiers.${i}.minSubtotal`] ?? errors[`tiers.${i}.discount`];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-5"
    >
      <SettingsCard
        title="Shipping"
        description="Charged at checkout. Changes apply to new orders right away."
      >
        <RupeeField
          label="Shipping fee"
          hint="Set to 0 to always ship free."
          value={v.shippingFee}
          onChange={(shippingFee) => patch({ shippingFee })}
          error={errors.shippingFee}
        />
        <Toggle
          label="Free shipping above an order amount"
          checked={v.freeShippingEnabled}
          onChange={(freeShippingEnabled) => patch({ freeShippingEnabled })}
        />
        {v.freeShippingEnabled && (
          <RupeeField
            label="Free shipping from"
            value={v.freeShippingThreshold}
            onChange={(freeShippingThreshold) => patch({ freeShippingThreshold })}
            error={errors.freeShippingThreshold}
          />
        )}
      </SettingsCard>

      <SettingsCard
        title="Spend more, save more"
        description="Automatic discounts when the cart reaches an amount. Shown on the homepage and in the cart. Order from smallest to largest."
      >
        <ListEditor
          items={v.tiers}
          onChange={(tiers) => patch({ tiers })}
          max={5}
          addLabel="Add discount tier"
          emptyText="No discount tiers — customers pay the full price."
          newItem={() => {
            const last = v.tiers.at(-1);
            return { minSubtotal: (last?.minSubtotal ?? 99900) + 50000, discount: 10000, freeShipping: false };
          }}
          renderItem={(tier, update, i) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <RupeeField
                  label="When the cart reaches"
                  value={tier.minSubtotal}
                  onChange={(minSubtotal) => update({ ...tier, minSubtotal })}
                />
                <RupeeField
                  label="Take off"
                  value={tier.discount}
                  onChange={(discount) => update({ ...tier, discount })}
                />
              </div>
              <Toggle
                label="Also ship free"
                checked={tier.freeShipping}
                onChange={(freeShipping) => update({ ...tier, freeShipping })}
              />
              {tierError(i) && <p className="text-xs font-medium text-destructive">{tierError(i)}</p>}
            </div>
          )}
        />
        {errors.tiers && <p className="text-xs font-medium text-destructive">{errors.tiers}</p>}
      </SettingsCard>

      <SettingsCard
        title="Parcel size & weight"
        description="Sent to Shiprocket with every order, so the courier charge matches your real parcel. Each bottle size has a weight and takes up room in the box; the smallest box with enough room is used."
      >
        <PackagingEditor value={v.packaging} onChange={(packaging) => patch({ packaging })} errors={errors} />
      </SettingsCard>

      <SettingsCard title="What customers will pay" description="Examples using your current (unsaved) rules.">
        <RulesPreview rules={v} />
      </SettingsCard>

      <SettingsCard title="Delivery & returns" description="Shown on product pages and policy pages.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Delivery time"
            hint='e.g. "3–6 business days"'
            value={v.deliveryEstimate}
            onChange={(deliveryEstimate) => patch({ deliveryEstimate })}
            error={errors.deliveryEstimate}
            maxLength={40}
          />
          <TextField
            label="Checkout note when there's no online payment"
            hint="Shown under the “Place order” button if Razorpay isn't set up."
            value={v.offlinePaymentNote}
            onChange={(offlinePaymentNote) => patch({ offlinePaymentNote })}
            error={errors.offlinePaymentNote}
            maxLength={160}
          />
          <Field label="Return window (days)" error={errors.returnWindowDays}>
            <Input
              type="number"
              min={0}
              max={365}
              step={1}
              value={v.returnWindowDays}
              onChange={(e) => patch({ returnWindowDays: Math.round(Number(e.target.value) || 0) })}
            />
          </Field>
        </div>
      </SettingsCard>

      <SaveBar dirty={dirty} saving={saving} onReset={reset} />
    </form>
  );
}

/** Totals at a few cart amounts around each threshold, computed exactly like checkout. */
function RulesPreview({ rules }: { rules: CommerceSettings }) {
  const points = new Set<number>([49900]);
  if (rules.freeShippingEnabled) points.add(rules.freeShippingThreshold);
  for (const t of rules.tiers) points.add(t.minSubtotal);
  const amounts = [...points].filter((n) => n > 0).sort((a, b) => a - b).slice(0, 7);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="py-2 pr-4 font-medium">Cart</th>
            <th className="py-2 pr-4 font-medium">Discount</th>
            <th className="py-2 pr-4 font-medium">Shipping</th>
            <th className="py-2 font-medium">Customer pays</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {amounts.map((amount) => {
            const t = computeTotals([{ price: amount, quantity: 1 }], rules);
            return (
              <tr key={amount}>
                <td className="py-2 pr-4 font-medium">{formatPrice(amount)}</td>
                <td className="py-2 pr-4">{t.discount ? `−${formatPrice(t.discount)}` : "—"}</td>
                <td className="py-2 pr-4">{t.shipping ? formatPrice(t.shipping) : "Free"}</td>
                <td className="py-2 font-bold">{formatPrice(t.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SIZE_ROWS: { key: keyof PackagingSettings["sizes"]; label: string }[] = [
  { key: "s3", label: "3 gm bottle" },
  { key: "s6", label: "6 gm bottle" },
  { key: "s12", label: "12 gm bottle" },
  { key: "other", label: "Anything else" },
];

function Num({ value, onChange, min = 0, max, step = 1, ariaLabel }: { value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; ariaLabel: string }) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      aria-label={ariaLabel}
      className="h-9 w-full min-w-0"
    />
  );
}

function PackagingEditor({ value, onChange, errors }: { value: PackagingSettings; onChange: (p: PackagingSettings) => void; errors: Record<string, string> }) {
  const setSize = (key: keyof PackagingSettings["sizes"], patch: Partial<PackagingSettings["sizes"]["s3"]>) =>
    onChange({ ...value, sizes: { ...value.sizes, [key]: { ...value.sizes[key], ...patch } } });
  const setBox = (i: number, patch: Partial<PackagingSettings["boxes"][number]>) =>
    onChange({ ...value, boxes: value.boxes.map((b, j) => (j === i ? { ...b, ...patch } : b)) });
  const lastBox = value.boxes.at(-1);

  const examples: { label: string; items: { size: string | null; quantity: number }[] }[] = [
    { label: "1 × 3 gm", items: [{ size: "3 gm", quantity: 1 }] },
    { label: "1 × 12 gm", items: [{ size: "12 gm", quantity: 1 }] },
    { label: "2 × 12 gm", items: [{ size: "12 gm", quantity: 2 }] },
    { label: "3 × 6 gm", items: [{ size: "6 gm", quantity: 3 }] },
    { label: "1 × 12 gm + 2 × 6 gm", items: [{ size: "12 gm", quantity: 1 }, { size: "6 gm", quantity: 2 }] },
    { label: "5 × 12 gm", items: [{ size: "12 gm", quantity: 5 }] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium">Each bottle</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Weight is the filled bottle with its own wrapping. Room is how much space it takes in a box (a small bottle is 1).</p>
        <div className="mt-3 overflow-x-auto">
          <div className="grid min-w-[22rem] grid-cols-[1fr_7rem_6rem] items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-xs text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Weight (grams)</span>
            <span className="text-xs text-muted-foreground">Room</span>
            {SIZE_ROWS.map((r) => (
              <div key={r.key} className="contents">
                <span className="font-medium">{r.label}</span>
                <Num value={value.sizes[r.key].weightG} min={1} max={10000} ariaLabel={`${r.label} weight in grams`} onChange={(weightG) => setSize(r.key, { weightG: Math.round(weightG) })} />
                <Num value={value.sizes[r.key].slots} min={1} max={50} ariaLabel={`${r.label} room`} onChange={(slots) => setSize(r.key, { slots: Math.round(slots) })} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Your boxes, smallest first</p>
        <p className="mt-0.5 text-xs text-muted-foreground">An order uses the first box whose room is enough. Size in centimetres; packing weight is the empty box plus filler.</p>
        <div className="mt-3 space-y-2">
          {value.boxes.map((b, i) => (
            <div key={i} className="rounded-xl border bg-background p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] sm:items-end">
                <label className="text-xs text-muted-foreground">
                  Holds up to (room)
                  <Num value={b.upToSlots} min={1} max={500} ariaLabel={`Box ${i + 1} room`} onChange={(n) => setBox(i, { upToSlots: Math.round(n) })} />
                </label>
                <label className="text-xs text-muted-foreground">
                  Length (cm)
                  <Num value={b.length} min={1} max={200} step={0.5} ariaLabel={`Box ${i + 1} length`} onChange={(n) => setBox(i, { length: n })} />
                </label>
                <label className="text-xs text-muted-foreground">
                  Width (cm)
                  <Num value={b.breadth} min={1} max={200} step={0.5} ariaLabel={`Box ${i + 1} width`} onChange={(n) => setBox(i, { breadth: n })} />
                </label>
                <label className="text-xs text-muted-foreground">
                  Height (cm)
                  <Num value={b.height} min={1} max={200} step={0.5} ariaLabel={`Box ${i + 1} height`} onChange={(n) => setBox(i, { height: n })} />
                </label>
                <label className="text-xs text-muted-foreground">
                  Packing (grams)
                  <Num value={b.packWeightG} min={0} max={10000} ariaLabel={`Box ${i + 1} packing weight`} onChange={(n) => setBox(i, { packWeightG: Math.round(n) })} />
                </label>
                <button
                  type="button"
                  disabled={value.boxes.length <= 1}
                  onClick={() => onChange({ ...value, boxes: value.boxes.filter((_, j) => j !== i) })}
                  className="h-9 rounded-lg px-3 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
              {errors[`packaging.boxes.${i}.upToSlots`] && <p className="mt-1.5 text-xs font-medium text-destructive">{errors[`packaging.boxes.${i}.upToSlots`]}</p>}
            </div>
          ))}
        </div>
        {errors["packaging.boxes"] && <p className="mt-2 text-xs font-medium text-destructive">{errors["packaging.boxes"]}</p>}
        <button
          type="button"
          disabled={value.boxes.length >= 8}
          onClick={() =>
            onChange({
              ...value,
              boxes: [...value.boxes, { upToSlots: (lastBox?.upToSlots ?? 0) + 10, length: lastBox?.length ?? 20, breadth: lastBox?.breadth ?? 15, height: lastBox?.height ?? 10, packWeightG: lastBox?.packWeightG ?? 150 }],
            })
          }
          className="mt-3 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-40"
        >
          Add a box
        </button>
      </div>

      <div>
        <p className="text-sm font-medium">What gets sent to Shiprocket</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">Order</th>
                <th className="py-2 pr-4 font-medium">Box (cm)</th>
                <th className="py-2 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {examples.map((e) => {
                const p = computeParcel(e.items, value);
                return (
                  <tr key={e.label}>
                    <td className="py-2 pr-4 font-medium">{e.label}</td>
                    <td className="py-2 pr-4">{p.length} × {p.breadth} × {p.height}</td>
                    <td className="py-2">{p.weightKg.toFixed(2)} kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
