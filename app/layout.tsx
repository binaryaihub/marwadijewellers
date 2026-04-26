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
import { organizationJsonLd, websiteJsonLd, jsonLdScript } from "@/lib/seo/jsonld";

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

const SITE_URL = "https://marwadijewellers.com";
const DEFAULT_DESC =
  "Heritage-inspired imitation jewellery for women & men — kundan, polki, mangalsutra, jhumkas, chains. Shop online with UPI or COD. Always free shipping across India.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${brand} — Heritage-inspired imitation jewellery`,
    template: `%s · ${brand}`,
  },
  description: DEFAULT_DESC,
  applicationName: brand,
  keywords: [
    "imitation jewellery",
    "kundan jewellery online",
    "polki necklace",
    "mangalsutra online",
    "jhumka earrings",
    "rajasthani jewellery",
    "marwadi jewellers",
    "indian bridal jewellery",
    "ranihaar",
    "ponchi",
    "tevta",
    "rakhdi",
    "online jewellery india",
    "UPI jewellery checkout",
  ],
  authors: [{ name: brand }],
  creator: brand,
  publisher: brand,
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${brand} — Heritage-inspired imitation jewellery`,
    description: DEFAULT_DESC,
    siteName: brand,
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand} — Heritage-inspired imitation jewellery`,
    description: DEFAULT_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
  // Once you verify the site in Google Search Console, paste the meta-tag value
  // here (or set NEXT_PUBLIC_GSC_VERIFICATION). Until then, leave undefined.
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
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
      <head>
        {/* Site-wide structured data — Organization (Knowledge Panel) +
            WebSite (sitelinks search box on brand SERPs). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd())}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(websiteJsonLd())} />
      </head>
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
