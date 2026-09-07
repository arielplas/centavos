import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { organizationJsonLd, websiteJsonLd, SITE } from "@/lib/seo";
import { getAppLinks } from "@/lib/store-links";
import "./globals.css";

// Fuentes auto-hospedadas (mismos tipos que Google Fonts, sin descarga en build).
// Los .woff2 viven en app/fonts para que el sitio compile 100% offline.
// Solo se cargan los pesos que el CSS usa: cada archivo se preload-ea en producción.
const bricolage = localFont({
  src: [
    { path: "./fonts/Bricolage-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Bricolage-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = localFont({
  src: [
    { path: "./fonts/Manrope-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Manrope-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Manrope-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Manrope-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

const caveat = localFont({
  src: [{ path: "./fonts/Caveat-500.woff2", weight: "500", style: "normal" }],
  variable: "--font-caveat",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf3e3",
};

const ROOT_TITLE = "Centavos · App para anotar gastos sin conectar tu banco";
const ROOT_DESCRIPTION =
  "App gratis para anotar tus gastos y armar presupuestos, sin conectar tu banco. Suscripciones, meses sin intereses y gastos compartidos. iOS y Android.";

// La imagen social (og:image / twitter:image) sale de app/opengraph-image.png
// por file convention y aplica a todas las rutas; no se declara aquí.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: ROOT_TITLE,
    template: "%s · Centavos",
  },
  description: ROOT_DESCRIPTION,
  keywords: [
    "app para anotar gastos", "control de gastos", "app de presupuesto personal",
    "app de finanzas personales", "gastos hormiga", "control de suscripciones",
    "meses sin intereses", "dividir gastos", "México",
  ],
  authors: [{ name: "Centavos", url: SITE.url }],
  creator: "Centavos",
  publisher: "Centavos",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: SITE.name,
    title: ROOT_TITLE,
    description: ROOT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: ROOT_TITLE,
    description: "Anota lo que gastas en segundos, sin conectar tu banco. Gratis en iOS y Android.",
    // site: "@centavo_mx",
    // creator: "@centavo_mx",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "Finance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { storeUrl, playUrl } = getAppLinks();

  return (
    <html lang="es-MX" className={`${bricolage.variable} ${manrope.variable} ${caveat.variable}`}>
      <body className="bg-bg text-ink antialiased">
        {children}
        <Analytics />
        <SpeedInsights />

        {/* JSON-LD raíz: organización + sitio */}
        <Script id="ld-organization" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd({ storeUrl, playUrl })) }} />
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      </body>
    </html>
  );
}
