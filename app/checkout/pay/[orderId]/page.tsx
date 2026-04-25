import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getOrder } from "@/lib/orders";
import { buildUpiUrl, generateQrDataUrl } from "@/lib/upi";
import { UpiPaymentBlock } from "@/components/checkout/UpiPaymentBlock";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pay via UPI" };

export default async function PayPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const result = await getOrder(orderId);
  if (!result) return notFound();
  const { t } = await getT();

  const { order } = result;
  const isCod = order.paymentMethod === "cod";
  const upiAmount = order.advanceAmount > 0 ? order.advanceAmount : order.amountTotal;

  const upiUrl = buildUpiUrl({ amount: upiAmount, orderId });
  const qrDataUrl = await generateQrDataUrl(upiUrl);
  const upiId = process.env.NEXT_PUBLIC_UPI_ID ?? "yourupi@okicici";

  return (
    <Container className="py-10 md:py-14">
      <h1 className="font-display text-3xl md:text-5xl text-mj-ink mb-2">
        {isCod ? t("pay.title.cod", { n: upiAmount }) : t("pay.title")}
      </h1>
      <p className="text-mj-mute mb-10">{isCod ? t("pay.sub.cod", { n: order.balanceAmount }) : t("pay.sub")}</p>

      <UpiPaymentBlock
        orderId={order.id}
        amount={upiAmount}
        balance={order.balanceAmount}
        paymentMethod={order.paymentMethod}
        upiId={upiId}
        upiUrl={upiUrl}
        qrDataUrl={qrDataUrl}
      />
    </Container>
  );
}
