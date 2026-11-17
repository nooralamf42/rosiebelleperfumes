"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronDown, Loader2, Mail, RotateCcw, Ban } from "lucide-react";
import { cancelShippingAction, refundOrderAction, sendOrderEmailAction } from "@/app/admin/actions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLenisLock } from "@/components/providers/smooth-scroll-provider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderEmailKind } from "@/lib/email/order-email";

type Props = {
  orderId: string;
  orderNumber: number;
  status: string;
  total: number;
  refundedAmount: number;
  refundStatus: string | null;
  hasPayment: boolean;
  emailsSent: string[];
  emailError: string | null;
  /** Booked with Shiprocket but not picked up yet. */
  canCancelShipping?: boolean;
  align?: "start" | "end";
};

const EMAIL_LABELS: Record<OrderEmailKind, string> = {
  confirmed: "Order confirmation",
  shipped: "Shipped",
  delivered: "Delivered",
  refunded: "Refund",
};

/** Emails the admin may (re)send for an order in this state. */
function availableEmails(status: string, refundedAmount: number): OrderEmailKind[] {
  if (status === "PENDING") return [];
  const kinds: OrderEmailKind[] = ["confirmed"];
  if (status === "SHIPPED" || status === "DELIVERED") kinds.push("shipped");
  if (status === "DELIVERED") kinds.push("delivered");
  if (refundedAmount > 0) kinds.push("refunded");
  return kinds;
}

/** Refund status and email/refund controls under each admin order. */
export function OrderExtras({
  orderId,
  orderNumber,
  status,
  total,
  refundedAmount,
  refundStatus,
  hasPayment,
  emailsSent,
  emailError,
  canCancelShipping = false,
  align = "end",
}: Props) {
  const router = useRouter();
  const [sending, setSending] = useState<OrderEmailKind | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const emails = availableEmails(status, refundedAmount);
  const refundable = Math.max(0, total - refundedAmount);
  const canRefund = hasPayment && status !== "PENDING" && refundable > 0 && refundStatus !== "requesting";

  async function send(kind: OrderEmailKind) {
    setSending(kind);
    const res = await sendOrderEmailAction(orderId, kind);
    setSending(null);
    if (res.ok) toast.success(`${EMAIL_LABELS[kind]} email sent`);
    else toast.error(res.error ?? "Email failed");
    router.refresh();
  }

  async function cancelShip() {
    if (!confirm("Cancel the shipping for this order? The courier booking is cancelled in Shiprocket and the order goes back to “Order confirmed” so you can Fulfill it again.")) return;
    setCancelling(true);
    const res = await cancelShippingAction(orderId);
    setCancelling(false);
    if (res.ok) {
      toast.success("Shipping cancelled — the order is ready to fulfill again");
      if (res.warning) toast.warning(res.warning, { duration: Infinity, closeButton: true });
      router.refresh();
    } else {
      toast.error(res.error ?? "Couldn't cancel the shipping", { duration: Infinity, closeButton: true });
    }
  }

  if (emails.length === 0 && !canRefund && !canCancelShipping && refundedAmount === 0 && !emailError) return null;

  return (
    <div className={cn("mt-2 flex flex-col gap-1.5", align === "start" ? "items-start" : "items-end")}>
      {refundedAmount > 0 && (
        <span className="text-xs font-semibold text-rose-700">
          Refunded {formatPrice(refundedAmount)}
          {refundedAmount < total ? ` of ${formatPrice(total)}` : ""}
          {refundStatus && refundStatus !== "processed" ? ` · ${refundStatus}` : ""}
        </span>
      )}
      {emailError && (
        <span className="max-w-64 text-xs text-destructive" title={emailError}>
          Email failed: {emailError.split(": ")[0]}
        </span>
      )}

      {/* one tidy group: every button the same height, thin dividers between them */}
      <div className="inline-flex max-w-full flex-wrap divide-x overflow-hidden rounded-lg border bg-background">
        {emails.length > 0 && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="ghost" className="h-8 rounded-none px-3 text-xs" disabled={sending !== null}>
                  {sending ? <Loader2 className="animate-spin" /> : <Mail />}
                  Email <ChevronDown className="size-3.5 opacity-60" />
                </Button>
              }
            />
            <DropdownMenuContent align={align} className="w-60">
              {emails.map((kind) => (
                <DropdownMenuItem key={kind} onClick={() => send(kind)}>
                  <span className="flex-1">
                    {emailsSent.includes(kind) ? "Resend" : "Send"} {EMAIL_LABELS[kind].toLowerCase()}
                  </span>
                  {emailsSent.includes(kind) && <Check className="text-emerald-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {canCancelShipping && (
          <Button size="sm" variant="ghost" className="h-8 rounded-none px-3 text-xs" onClick={cancelShip} disabled={cancelling}>
            {cancelling ? <Loader2 className="animate-spin" /> : <Ban />}
            Cancel shipping
          </Button>
        )}

        {canRefund && (
          <Button size="sm" variant="ghost" className="h-8 rounded-none px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setRefundOpen(true)}>
            <RotateCcw /> Refund
          </Button>
        )}
      </div>

      {refundOpen && (
        <RefundDialog
          orderId={orderId}
          orderNumber={orderNumber}
          status={status}
          refundable={refundable}
          onClose={() => setRefundOpen(false)}
          onDone={() => {
            setRefundOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function RefundDialog({
  orderId,
  orderNumber,
  status,
  refundable,
  onClose,
  onDone,
}: {
  orderId: string;
  orderNumber: number;
  status: string;
  refundable: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rupees, setRupees] = useState(String(refundable / 100));
  const [busy, setBusy] = useState(false);
  useLenisLock(true);

  const amount = Math.round(Number(rupees) * 100);
  const valid = Number.isFinite(amount) && amount >= 100 && amount <= refundable;
  const isFull = amount === refundable;
  const willCancel = isFull && (status === "PAID" || status === "FULFILLED");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    const res = await refundOrderAction(orderId, amount);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Refund failed");
      return;
    }
    toast.success(
      `Refunded ${formatPrice(res.refunded ?? amount)}${res.cancelled ? " and cancelled the order" : ""}`,
    );
    if (res.warning) toast.warning(res.warning);
    onDone();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Refund order #{orderNumber}</DialogTitle>
            <DialogDescription>
              The money goes back to the customer&apos;s original payment method through Razorpay.
              This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label htmlFor="refund-amount" className="mb-1.5 block">
              Amount (up to {formatPrice(refundable)})
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                ₹
              </span>
              <Input
                id="refund-amount"
                type="number"
                inputMode="decimal"
                min={1}
                max={refundable / 100}
                step="0.01"
                value={rupees}
                onChange={(e) => setRupees(e.target.value)}
                className="pl-7"
                autoFocus
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {willCancel
                ? "Full refund before shipping: the order will also be cancelled (and its Shiprocket order, if any)."
                : isFull
                  ? "Full refund. The order status stays as it is."
                  : "Partial refund — you can refund the rest later."}{" "}
              The customer gets a refund email.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!valid || busy}>
              {busy && <Loader2 className="animate-spin" />}
              Refund {valid ? formatPrice(amount) : ""}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
