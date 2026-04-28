import QRCode from "qrcode";

interface UpiArgs {
  amount: number;
  orderId: string;
}

const MERCHANT_NAME = "Marwadi Jewellers";
const DEFAULT_MC = "5944";

export function buildUpiUrl({ amount, orderId }: UpiArgs): string {
  const pa = (process.env.NEXT_PUBLIC_UPI_ID ?? "yourupi@okicici").trim().toLowerCase();
  const mc = process.env.NEXT_PUBLIC_UPI_MC ?? DEFAULT_MC;
  const tr = orderId;
  const tn = `MJ-${orderId}`;
  const am = amount.toFixed(2);
  const params = new URLSearchParams({ pa, pn: MERCHANT_NAME, am, cu: "INR", tn, tr, mc });
  return `upi://pay?${params.toString()}`;
}

export async function generateQrDataUrl(upiUrl: string): Promise<string> {
  return QRCode.toDataURL(upiUrl, {
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#4A0F1A", light: "#FBF7EF" },
  });
}
