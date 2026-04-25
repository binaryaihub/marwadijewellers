import QRCode from "qrcode";

interface UpiArgs {
  amount: number;
  orderId: string;
}

export function buildUpiUrl({ amount, orderId }: UpiArgs): string {
  const pa = process.env.NEXT_PUBLIC_UPI_ID ?? "yourupi@okicici";
  const pn = "Marwadi Jewellers";
  const tn = `MJ-${orderId}`;
  const am = amount.toFixed(2);
  const params = new URLSearchParams({ pa, pn, am, cu: "INR", tn });
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
