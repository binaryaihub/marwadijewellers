import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Mukta, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastViewport } from "@/components/ui/Toast";
import { LocaleProvider } from "@/lib/i18n/Provider";
import { LanguagePicker } from "@/components/i18n/LanguagePicker";
import { getLocale } from "@/lib/i18n/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "@/lib/i18n/types";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  variable: "--font-mukta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const tiro = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  variable: "--font-tiro",
  display: "swap",
  weight: ["400"],
});

const brand = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Marwadi Jewellers";

export const metadata: Metadata = {
  title: {
    default: `${brand} — Heritage-inspired imitation jewellery`,
    template: `%s · ${brand}`,
  },
  description:
    "Hand-curated imitation jewellery for men and women — kundan, polki, temple, and contemporary designs. Pay securely via UPI.",
  keywords: ["imitation jewellery", "kundan", "polki", "marwadi jewellers", "MJ", "online jewellery", "UPI"],
  openGraph: {
    title: `${brand} — Heritage-inspired imitation jewellery`,
    description: "Shop kundan, polki, temple & modern imitation jewellery. Pay via UPI.",
    siteName: brand,
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://marwadijewellers.example"),
};

export const viewport: Viewport = {
  themeColor: "#7B1E2B",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const jar = await cookies();
  const hasChosen = !!jar.get(LOCALE_COOKIE);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${mukta.variable} ${tiro.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <LocaleProvider initialLocale={locale} initialChosen={hasChosen}>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileBottomNav />
          <CartDrawer />
          <ToastViewport />
          <LanguagePicker />
        </LocaleProvider>
      </body>
    </html>
  );
}
