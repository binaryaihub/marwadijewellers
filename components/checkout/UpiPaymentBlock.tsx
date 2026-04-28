"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Loader2, Banknote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { toast } from "@/components/ui/Toast";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n/Provider";
import { formatINR } from "@/lib/format";
import type { PaymentMethod } from "@/lib/pricing";

interface Props {
  orderId: string;
  amount: number; // amount being paid via UPI right now (full or advance)
  balance: number; // amount due on delivery (0 for full UPI orders)
  paymentMethod: PaymentMethod;
  upiId: string;
  qrDataUrl: string;
}

export function UpiPaymentBlock({ orderId, amount, balance, paymentMethod, upiId, qrDataUrl }: Props) {
  const { t } = useT();
  const isCod = paymentMethod === "cod";
  const [copied, setCopied] = useState(false);
  const [utr, setUtr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      toast(t("pay.copied"), "success");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast(t("pay.copyFail"), "error");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{10,22}$/.test(utr.trim())) {
      setError(t("valid.utr"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/utr`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ utr: utr.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit UTR");
      router.push(`/orders/${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <>
      {isCod && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-mj-gold-300 bg-mj-gold-100/40 p-4"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mj-maroon-700 text-mj-gold-200">
            <Banknote className="size-4" />
          </span>
          <div className="text-sm">
            <p className="font-display text-base text-mj-ink">{t("pay.cod.banner.title")}</p>
            <p className="text-mj-mute">
              {t("pay.cod.banner.advance")} <strong className="text-mj-maroon-800">{formatINR(amount)}</strong>
              {" · "}
              {t("pay.cod.banner.balance")} <strong className="text-mj-ink">{formatINR(balance)}</strong>
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mj-card bg-white p-6 md:p-8 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mj-gold-600">
            {isCod ? t("pay.step1.cod") : t("pay.step1")}
          </p>
          <h2 className="font-display text-2xl mt-2">{t("pay.scan.title")}</h2>
          <p className="mt-1 text-sm text-mj-mute">{t("pay.scan.desc")}</p>

          <div className="mt-5 inline-block rounded-2xl border-2 border-mj-gold-300 p-3 bg-mj-ivory">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`UPI QR for order ${orderId}`} className="block h-64 w-64" />
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm bg-mj-cream px-3 py-1.5 rounded-full text-mj-maroon-800">{upiId}</span>
              <button
                onClick={copyUpi}
                type="button"
                aria-label={t("pay.copy")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-mj-cream hover:bg-mj-gold-200 text-mj-maroon-800"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>

            <div className="md:hidden w-full mt-2 rounded-xl border border-mj-gold-300 bg-mj-gold-100/50 p-3 text-left">
              <p className="text-sm text-mj-ink leading-relaxed">
                {t("pay.qrOnly.note")}
              </p>
            </div>
          </div>

          <div className="mj-divider mt-7 mb-5 opacity-60" />
          <div className="text-sm text-left space-y-1.5">
            <Row label={t("pay.orderId")} value={orderId} mono />
            <Row label={isCod ? t("pay.amount.advance") : t("pay.amount")} value={formatINR(amount)} bold />
            {isCod && balance > 0 && (
              <Row label={t("pay.amount.balance")} value={formatINR(balance)} muted />
            )}
            <Row label={t("pay.note")} value={`MJ-${orderId}`} mono />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mj-card bg-white p-6 md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mj-gold-600">{t("pay.step2")}</p>
          <h2 className="font-display text-2xl mt-2">{t("pay.confirm.title")}</h2>
          <p className="mt-1 text-sm text-mj-mute">{t("pay.confirm.desc")}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="utr">{t("pay.utr.label")}</Label>
              <Input
                id="utr"
                inputMode="numeric"
                placeholder={t("pay.utr.placeholder")}
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
              />
              <FieldError message={error ?? undefined} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitting ? t("pay.confirm.submitting") : t("pay.confirm.cta")}
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-mj-cream p-4 text-xs text-mj-mute leading-relaxed">
            <strong className="text-mj-ink">{t("pay.help.title")}</strong>
            <br />
            {t("pay.help.gpay")}
            <br />
            {t("pay.help.phonepe")}
            <br />
            {t("pay.help.paytm")}
          </div>
        </motion.div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  mono,
  bold,
  muted,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-mj-mute uppercase text-xs tracking-wider">{label}</span>
      <span
        className={
          mono
            ? "font-mono text-mj-ink font-medium"
            : bold
              ? "font-display text-lg text-mj-maroon-800"
              : muted
                ? "text-mj-mute font-medium"
                : "text-mj-ink font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}
