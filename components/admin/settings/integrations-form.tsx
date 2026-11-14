"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Copy, Loader2, Plug, Sparkles } from "lucide-react";
import { saveIntegrationAction, testIntegrationAction } from "@/app/admin/settings/actions";
import type { FieldStatus, IntegrationsStatus } from "@/lib/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, SettingsCard } from "./fields";
import { cn } from "@/lib/utils";

function StatusPill({ on, offText }: { on: boolean; offText: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        on ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground",
      )}
    >
      {on ? "On" : offText}
    </span>
  );
}

function secretHint(s: FieldStatus) {
  if (s.source === "settings") return "Saved. Leave blank to keep it, or type a new one to replace it.";
  if (s.source === "environment") return "Currently set in your hosting environment. Leave blank to keep using that.";
  return undefined;
}

function secretPlaceholder(s: FieldStatus) {
  return s.set ? "••••••••••••" : "";
}

function CopyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-2">
        <Input readOnly value={value} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              toast.error("Couldn't copy — select the text and copy it.");
            }
          }}
        >
          {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </Field>
  );
}

function IntegrationActions({
  which,
  busy,
  setBusy,
  getFields,
  canTest,
  canRemove,
  onSaved,
  setErrors,
}: {
  which: "razorpay" | "shiprocket";
  busy: string | null;
  setBusy: (v: string | null) => void;
  getFields: () => Record<string, string>;
  canTest: boolean;
  canRemove: boolean;
  onSaved: () => void;
  setErrors: (e: Record<string, string>) => void;
}) {
  async function save() {
    setBusy("save");
    const res = await saveIntegrationAction(which, getFields());
    setBusy(null);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
      return;
    }
    setErrors({});
    toast.success("Saved");
    onSaved();
  }
  async function test() {
    setBusy("test");
    const res = await testIntegrationAction(which);
    setBusy(null);
    if (res.ok) toast.success("Connection works");
    else toast.error(res.error);
  }
  async function remove() {
    if (!confirm("Remove these credentials? The integration turns off.")) return;
    setBusy("remove");
    const res = await saveIntegrationAction(which, null);
    setBusy(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Removed");
    onSaved();
  }

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <Button type="button" onClick={save} disabled={busy !== null} className="rounded-full">
        {busy === "save" && <Loader2 className="animate-spin" />}
        Save
      </Button>
      <Button type="button" variant="outline" onClick={test} disabled={busy !== null || !canTest} className="rounded-full">
        {busy === "test" ? <Loader2 className="animate-spin" /> : <Plug />}
        Test connection
      </Button>
      {canRemove && (
        <Button type="button" variant="ghost" onClick={remove} disabled={busy !== null} className="rounded-full text-destructive">
          {busy === "remove" && <Loader2 className="animate-spin" />}
          Remove
        </Button>
      )}
    </div>
  );
}

export function IntegrationsForm({
  status,
  siteUrl,
  canStoreSecrets,
}: {
  status: IntegrationsStatus;
  siteUrl: string;
  canStoreSecrets: boolean;
}) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const rz = status.razorpay;
  const [rzKeyId, setRzKeyId] = useState(rz.keyId);
  const [rzSecret, setRzSecret] = useState("");
  const [rzWebhook, setRzWebhook] = useState("");
  const [rzErrors, setRzErrors] = useState<Record<string, string>>({});

  const sr = status.shiprocket;
  const [srEmail, setSrEmail] = useState(sr.email);
  const [srPassword, setSrPassword] = useState("");
  const [srPickup, setSrPickup] = useState(sr.pickupLocation);
  const [srToken, setSrToken] = useState("");
  const [srErrors, setSrErrors] = useState<Record<string, string>>({});

  const [busy, setBusy] = useState<string | null>(null);

  const afterSave = (reset: () => void) => () => {
    reset();
    refresh();
  };

  return (
    <div className="space-y-5">
      {!canStoreSecrets && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Secrets can&apos;t be stored until your hosting environment has <code>CLERK_SECRET_KEY</code> (or{" "}
          <code>INTEGRATIONS_SECRET</code>). It is used to encrypt them.
        </p>
      )}

      <SettingsCard
        title="Online payments — Razorpay"
        description="Off until you add your keys. While it's off, customers place orders without paying online (cash on delivery or as arranged with you)."
      >
        <div className="flex items-center gap-2">
          <StatusPill on={rz.active} offText="Off — orders are confirmed without online payment" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Key ID" error={rzErrors.keyId} hint="Razorpay dashboard → Account & Settings → API keys. Starts with rzp_test_ or rzp_live_.">
            <Input value={rzKeyId} onChange={(e) => setRzKeyId(e.target.value)} placeholder="rzp_live_…" autoComplete="off" />
          </Field>
          <Field label="Key secret" error={rzErrors.keySecret} hint={secretHint(rz.keySecret)}>
            <Input
              type="password"
              value={rzSecret}
              onChange={(e) => setRzSecret(e.target.value)}
              placeholder={secretPlaceholder(rz.keySecret)}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <Field
          label="Webhook secret"
          error={rzErrors.webhookSecret}
          hint={secretHint(rz.webhookSecret) ?? "Any secret you invent here; enter the same one in Razorpay's webhook."}
        >
          <Input
            type="password"
            value={rzWebhook}
            onChange={(e) => setRzWebhook(e.target.value)}
            placeholder={secretPlaceholder(rz.webhookSecret)}
            autoComplete="new-password"
          />
        </Field>
        <CopyField
          label="Webhook URL"
          value={`${siteUrl}/api/webhooks/razorpay`}
          hint="Razorpay → Settings → Webhooks → Add. Tick payment.captured, order.paid, payment.failed, refund.processed and refund.failed. It confirms payments even if a customer closes the page early."
        />
        <IntegrationActions
          which="razorpay"
          busy={busy}
          setBusy={setBusy}
          getFields={() => ({ keyId: rzKeyId, keySecret: rzSecret, webhookSecret: rzWebhook })}
          canTest={rz.active}
          canRemove={rz.keySecret.source === "settings" || rz.webhookSecret.source === "settings"}
          onSaved={afterSave(() => {
            setRzSecret("");
            setRzWebhook("");
          })}
          setErrors={setRzErrors}
        />
      </SettingsCard>

      <SettingsCard
        title="Shipping — Shiprocket"
        description="Off until you add your login. While it's off, you ship orders yourself and tap “Mark as shipped” on each order."
      >
        <div className="flex items-center gap-2">
          <StatusPill on={sr.active} offText="Off — you ship orders by hand" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Shiprocket email" error={srErrors.email}>
            <Input type="email" value={srEmail} onChange={(e) => setSrEmail(e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Password" error={srErrors.password} hint={secretHint(sr.password)}>
            <Input
              type="password"
              value={srPassword}
              onChange={(e) => setSrPassword(e.target.value)}
              placeholder={secretPlaceholder(sr.password)}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <Field
          label="Pickup location"
          error={srErrors.pickupLocation}
          hint='The pickup address nickname in Shiprocket (Settings → Pickup addresses). Leave empty to use "Primary".'
        >
          <Input value={srPickup} onChange={(e) => setSrPickup(e.target.value)} placeholder="Primary" />
        </Field>
        <Field
          label="Webhook token"
          error={srErrors.webhookToken}
          hint={secretHint(sr.webhookToken) ?? "Optional. Makes order status update the moment a parcel moves."}
        >
          <div className="flex gap-2">
            <Input
              type="password"
              value={srToken}
              onChange={(e) => setSrToken(e.target.value)}
              placeholder={secretPlaceholder(sr.webhookToken)}
              autoComplete="new-password"
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                setSrToken(crypto.randomUUID() + crypto.randomUUID().slice(0, 8));
                toast.message("Token generated — save, then copy it into Shiprocket");
              }}
            >
              <Sparkles /> Generate
            </Button>
          </div>
        </Field>
        {srToken && (
          <CopyField label="Token to paste into Shiprocket" value={srToken} hint="Shown only until you save; Shiprocket asks for it as the x-api-key." />
        )}
        <CopyField
          label="Webhook URL"
          value={`${siteUrl}/api/webhooks/courier`}
          hint="Shiprocket → Settings → API → Webhooks. Auth token type: x-api-key. (Shiprocket rejects URLs containing “shiprocket”, which is why this one says “courier”.)"
        />
        <IntegrationActions
          which="shiprocket"
          busy={busy}
          setBusy={setBusy}
          getFields={() => ({ email: srEmail, password: srPassword, pickupLocation: srPickup, webhookToken: srToken })}
          canTest={sr.active}
          canRemove={sr.password.source === "settings" || sr.webhookToken.source === "settings"}
          onSaved={afterSave(() => {
            setSrPassword("");
            setSrToken("");
          })}
          setErrors={setSrErrors}
        />
      </SettingsCard>
    </div>
  );
}
