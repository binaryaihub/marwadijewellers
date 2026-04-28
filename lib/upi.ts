import QRCode from "qrcode";

interface UpiArgs {
  amount: number;
  orderId: string;
}

const MERCHANT_NAME = "Marwadi Jewellers";
const DEFAULT_MC = "5944";

const APP_SCHEMES = {
  generic: "upi://pay",
  phonepe: "phonepe://pay",
  paytm: "paytmmp://pay",
  gpay: "tez://upi/pay",
} as const;

export type UpiApp = keyof typeof APP_SCHEMES;
export type UpiUrls = Record<UpiApp, string>;

function buildUpiParams({ amount, orderId }: UpiArgs): string {
  const pa = (process.env.NEXT_PUBLIC_UPI_ID ?? "yourupi@okicici").trim().toLowerCase();
  const mc = process.env.NEXT_PUBLIC_UPI_MC ?? DEFAULT_MC;
  const tr = orderId;
  const tn = `MJ-${orderId}`;
  const am = amount.toFixed(2);
  return new URLSearchParams({ pa, pn: MERCHANT_NAME, am, cu: "INR", tn, tr, mc }).toString();
}

export function buildUpiUrl(args: UpiArgs, app: UpiApp = "generic"): string {
  return `${APP_SCHEMES[app]}?${buildUpiParams(args)}`;
}

export function buildUpiUrls(args: UpiArgs): UpiUrls {
  const params = buildUpiParams(args);
  return {
    generic: `${APP_SCHEMES.generic}?${params}`,
    phonepe: `${APP_SCHEMES.phonepe}?${params}`,
    paytm: `${APP_SCHEMES.paytm}?${params}`,
    gpay: `${APP_SCHEMES.gpay}?${params}`,
  };
}

export async function generateQrDataUrl(upiUrl: string): Promise<string> {
  return QRCode.toDataURL(upiUrl, {
    width: 360,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#4A0F1A", light: "#FBF7EF" },
  });
}
