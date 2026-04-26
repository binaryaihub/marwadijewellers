"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Banknote, Zap, Archive, ArchiveRestore, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatINR, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { OrderRow, OrderItemRow } from "@/lib/db/schema";
import { toast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_TONE: Record<OrderRow["status"], "neutral" | "gold" | "green" | "maroon"> = {
  awaiting_payment: "neutral",
  pending_verification: "gold",
  paid: "green",
  shipped: "green",
  delivered: "green",
  cancelled: "maroon",
};

const STATUS_LABEL: Record<OrderRow["status"], string> = {
  awaiting_payment: "Awaiting payment",
  pending_verification: "Verify UTR",
  paid: "Advance verified",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function AdminOrderRow({ order, items }: { order: OrderRow; items: OrderItemRow[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const isCod = order.paymentMethod === "cod";
  const isArchived = !!order.archivedAt;

  const updateStatus = async (status: OrderRow["status"], reason?: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast(`Order marked ${STATUS_LABEL[status]}`, "success");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to update", "error");
    } finally {
      setBusy(false);
    }
  };

  const cancelOrder = async () => {
    const reason = window.prompt(
      "Cancel this order — optional reason for the customer (refund instructions, out-of-stock, etc.):",
      "",
    );
    // Treat null (clicked Cancel in prompt) as "don't cancel".
    if (reason === null) return;
    const confirmed = window.confirm(
      `Cancel order #${order.id}?\n\n` +
        (order.status === "delivered"
          ? "This order is already marked Delivered. Cancelling it now is unusual but allowed."
          : "This is irreversible from the customer's perspective."),
    );
    if (!confirmed) return;
    await updateStatus("cancelled", reason || undefined);
  };

  const setArchived = async (archived: boolean) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/archive`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      toast(archived ? "Order archived" : "Order restored", "success");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to update", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("mj-card bg-white overflow-hidden", isArchived && "opacity-70")}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-mj-cream/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold">#{order.id}</span>
            <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
            <Badge tone={isCod ? "neutral" : "gold"}>
              {isCod ? (
                <>
                  <Banknote className="size-3" /> COD
                </>
              ) : (
                <>
                  <Zap className="size-3" /> UPI
                </>
              )}
            </Badge>
            {isArchived && <Badge tone="neutral">Archived</Badge>}
            <span className="text-xs text-mj-mute">{formatDate(order.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-mj-ink">
            {order.customerName} · {order.customerPhone} · {order.city}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg text-mj-maroon-800">{formatINR(order.amountTotal)}</p>
          <p className="text-xs text-mj-mute">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
          {isCod && order.balanceAmount > 0 && (
            <p className="text-[11px] text-mj-mute mt-0.5">
              Adv {formatINR(order.advanceAmount)} · Bal {formatINR(order.balanceAmount)}
            </p>
          )}
        </div>
        <ChevronDown className={cn("size-5 text-mj-mute transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-mj-line"
          >
            <div className="grid md:grid-cols-2 gap-6 p-5">
              <div>
                <h3 className="font-display text-base mb-2">Items</h3>
                <ul className="space-y-1.5 text-sm">
                  {items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-3">
                      <span className="text-mj-ink">
                        {it.productName} <span className="text-mj-mute">× {it.qty}</span>
                      </span>
                      <span className="font-medium">{formatINR(it.unitPrice * it.qty)}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="font-display text-base mt-5 mb-2">Shipping</h3>
                <p className="text-sm leading-relaxed text-mj-ink/85">
                  {order.customerName}
                  <br />
                  {order.addressLine1}
                  {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                  <br />
                  {order.landmark && (
                    <>
                      {order.landmark}
                      <br />
                    </>
                  )}
                  {order.city}, {order.state} – {order.pincode}
                  <br />
                  {order.customerPhone}
                  {order.customerEmail && (
                    <>
                      <br />
                      {order.customerEmail}
                    </>
                  )}
                </p>

                {order.status === "cancelled" && (
                  <div className="mt-5 rounded-xl border border-mj-maroon-700/30 bg-mj-maroon-700/5 p-3 text-sm">
                    <p className="font-semibold text-mj-maroon-800">Cancelled</p>
                    {order.cancelledAt && (
                      <p className="text-xs text-mj-mute">on {formatDate(order.cancelledAt)}</p>
                    )}
                    {order.cancellationReason && (
                      <p className="mt-1 text-mj-ink">{order.cancellationReason}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-display text-base mb-2">Payment</h3>
                <div className="rounded-xl bg-mj-cream p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-mj-mute">Method</span>
                    <span className="font-semibold">
                      {isCod ? "Cash on Delivery (advance via UPI)" : "Full UPI"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mj-mute">Order total</span>
                    <span className="font-semibold">{formatINR(order.amountTotal)}</span>
                  </div>
                  {isCod && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-mj-mute">Advance via UPI</span>
                        <span className="font-semibold text-mj-maroon-800">{formatINR(order.advanceAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-mj-mute">Balance on delivery</span>
                        <span className="font-semibold">{formatINR(order.balanceAmount)}</span>
                      </div>
                    </>
                  )}
                  <div className="mj-divider opacity-50" />
                  <div className="flex justify-between text-xs">
                    <span className="text-mj-mute">UTR</span>
                    <span className="font-mono font-medium text-right">{order.utr ?? "— not yet submitted —"}</span>
                  </div>
                  {order.utrSubmittedAt && (
                    <p className="text-[11px] text-mj-mute">Submitted {formatDate(order.utrSubmittedAt)}</p>
                  )}
                </div>

                <h3 className="font-display text-base mt-5 mb-2">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {order.status === "pending_verification" && (
                    <Button size="sm" variant="gold" onClick={() => updateStatus("paid")} disabled={busy}>
                      {isCod ? "Verify advance" : "Mark paid"}
                    </Button>
                  )}
                  {order.status === "paid" && (
                    <Button size="sm" onClick={() => updateStatus("shipped")} disabled={busy}>
                      Mark shipped
                    </Button>
                  )}
                  {order.status === "shipped" && (
                    <Button size="sm" onClick={() => updateStatus("delivered")} disabled={busy}>
                      {isCod ? `Mark delivered + ${formatINR(order.balanceAmount)} collected` : "Mark delivered"}
                    </Button>
                  )}
                  {order.status !== "cancelled" && (
                    <Button size="sm" variant="outline" onClick={cancelOrder} disabled={busy}>
                      <X className="size-3.5" /> Cancel order
                    </Button>
                  )}
                  {!isArchived ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setArchived(true)}
                      disabled={busy}
                      className="text-mj-mute"
                    >
                      <Archive className="size-3.5" /> Archive
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setArchived(false)} disabled={busy}>
                      <ArchiveRestore className="size-3.5" /> Restore
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
