"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, FileDown, Loader2, PackageCheck, RotateCw, Truck, X } from "lucide-react";
import {
  fulfillOrderAction,
  adminCancelOrderAction,
  markShippedAction,
  markDeliveredAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLenisLock } from "@/components/providers/smooth-scroll-provider";
import { cn } from "@/lib/utils";

type Props = {
  orderId: string;
  status: string;
  awbCode: string | null;
  courierName: string | null;
  labelUrl: string | null;
  trackingUrl: string | null;
  /** Shiprocket isn't set up: the admin ships and delivers orders by hand. */
  manualShipping?: boolean;
  /** Side to line the buttons up on: "end" in the desktop table, "start" in phone cards. */
  align?: "start" | "end";
};

export function OrderActions({
  orderId,
  status,
  awbCode,
  courierName,
  labelUrl,
  trackingUrl,
  manualShipping = false,
  align = "end",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);

  const needsWork =
    !manualShipping && (status === "PAID" || (status === "FULFILLED" && (!awbCode || !labelUrl)));
  const canMarkShipped = manualShipping && (status === "PAID" || status === "FULFILLED");
  const canMarkDelivered = manualShipping && status === "SHIPPED";

  async function onDelivered() {
    setLoading(true);
    const res = await markDeliveredAction(orderId);
    setLoading(false);
    if (res.ok) {
      toast.success("Marked as delivered");
      router.refresh();
    } else {
      toast.error(res.error ?? "Couldn't mark as delivered");
    }
  }

  async function onCancel() {
    if (!confirm("Cancel this unpaid order? This can't be undone.")) return;
    setCancelling(true);
    const res = await adminCancelOrderAction(orderId);
    setCancelling(false);
    if (res.ok) {
      toast.success("Order cancelled");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to cancel");
    }
  }

  async function onClick() {
    setLoading(true);
    const res = await fulfillOrderAction(orderId);
    setLoading(false);
    if (res.ok) {
      if (res.warning) {
        toast.warning(res.warning, {
          description: "You can retry to complete the remaining steps.",
        });
      } else if (res.labelUrl) {
        toast.success("Order fulfilled — label ready to download");
      } else {
        toast.success("Order fulfilled");
      }
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to fulfill");
    }
  }

  const isRetry = status === "FULFILLED";

  return (
    <div className={cn("flex flex-col gap-1.5", align === "start" ? "items-start" : "items-end")}>
      {status === "PENDING" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={cancelling}
          className="rounded-full"
        >
          {cancelling ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <X className="size-3.5" />
          )}
          Cancel
        </Button>
      )}

      {needsWork && (
        <Button size="sm" onClick={onClick} disabled={loading} className="rounded-full">
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : isRetry ? (
            <RotateCw className="size-3.5" />
          ) : (
            <Truck className="size-3.5" />
          )}
          {isRetry ? "Retry" : "Fulfill"}
        </Button>
      )}

      {canMarkShipped && (
        <Button size="sm" onClick={() => setShipOpen(true)} className="rounded-full">
          <Truck className="size-3.5" /> Mark as shipped
        </Button>
      )}

      {canMarkDelivered && (
        <Button size="sm" onClick={onDelivered} disabled={loading} className="rounded-full">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <PackageCheck className="size-3.5" />}
          Mark as delivered
        </Button>
      )}

      {shipOpen && (
        <ShipDialog
          orderId={orderId}
          onClose={() => setShipOpen(false)}
          onDone={() => {
            setShipOpen(false);
            router.refresh();
          }}
        />
      )}

      {labelUrl && (
        <a
          href={labelUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <FileDown className="size-3.5" /> Download label
        </a>
      )}

      {awbCode && (
        <span className="text-xs text-muted-foreground">
          {courierName ? `${courierName} · ` : ""}AWB {awbCode}
        </span>
      )}

      {trackingUrl && (
        <a
          href={trackingUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-primary hover:underline"
        >
          Track shipment
        </a>
      )}
    </div>
  );
}

function ShipDialog({
  orderId,
  onClose,
  onDone,
}: {
  orderId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [busy, setBusy] = useState(false);
  useLenisLock(true);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    const res = await markShippedAction(orderId, { courierName, trackingNumber, trackingUrl });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Couldn't mark as shipped");
      return;
    }
    toast.success("Marked as shipped — the customer has been emailed");
    onDone();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Mark as shipped</DialogTitle>
            <DialogDescription>
              The customer gets a “your order has shipped” email. Tracking details are optional.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="ship-courier" className="mb-1.5 block">Courier</Label>
            <Input id="ship-courier" value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="e.g. India Post, Delhivery" maxLength={60} />
          </div>
          <div>
            <Label htmlFor="ship-number" className="mb-1.5 block">Tracking number</Label>
            <Input id="ship-number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} maxLength={60} />
          </div>
          <div>
            <Label htmlFor="ship-url" className="mb-1.5 block">Tracking link</Label>
            <Input id="ship-url" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://…" maxLength={300} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Check />}
              Mark as shipped
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
