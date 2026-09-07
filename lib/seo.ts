// SEO helpers — JSON-LD schema builders y Open Graph por página.
// Inserta el output de los *JsonLd como <script type="application/ld+json">.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://centavos.mx";
const SITE_NAME = "Centavos";

export const SITE = { url: SITE_URL, name: SITE_NAME };

/**
 * Open Graph completo para una página. Next.js NO hace merge profundo de
 * `openGraph` entre layout y página: si una página define `openGraph`, pierde
 * `siteName`, `locale` y `type` del layout. Este helper los repone y fija el
 * `og:url` correcto de la página (sin él, todas heredan la URL raíz).
 * La imagen viene de app/opengraph-image.png (file convention) y no hace
 * falta declararla aquí.
 */
export function pageOpenGraph(args: { title: string; description: string; path: string }) {
  return {
    type: "website" as const,
    locale: "es_MX",
    siteName: SITE_NAME,
    url: `${SITE_URL}${args.path}`,
    title: args.title,
    description: args.description,
  };
}

export function organizationJsonLd(args: { storeUrl?: string; playUrl?: string } = {}) {
  const sameAs = [args.storeUrl, args.playUrl].filter(Boolean) as string[];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    ...(sameAs.length ? { "sameAs": sameAs } : {}),
    "description":
      "App gratuita para anotar gastos y controlar tu presupuesto sin conectar tu banco, hecha en México.",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "inLanguage": "es-MX",
  };
}

/**
 * Schema de la app (rich results de descarga en Google).
 * Sin aggregateRating hasta tener reseñas reales — Google penaliza cifras inventadas.
 */
export function mobileApplicationJsonLd(args: { storeUrl?: string; playUrl?: string }) {
  const sameAs = [args.storeUrl, args.playUrl].filter(Boolean) as string[];
  return {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": SITE_NAME,
    "description":
      "App para anotar tus gastos, armar presupuestos por categoría y llevar tus suscripciones. Sin conectar tu banco. Gratis para iOS y Android.",
    "url": SITE_URL,
    "image": `${SITE_URL}/logo.png`,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "iOS, Android",
    "inLanguage": "es-MX",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "MXN" },
    "featureList": [
      "Anotar gastos en segundos",
      "Presupuestos por categoría",
      "Control de suscripciones",
      "Compras a meses sin intereses",
      "Gastos compartidos y ajuste de cuentas",
      "Recordatorios configurables",
    ],
    ...(args.storeUrl ? { "installUrl": args.storeUrl } : {}),
    ...(args.playUrl ? { "downloadUrl": args.playUrl } : {}),
    ...(sameAs.length ? { "sameAs": sameAs } : {}),
    "author": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
    "publisher": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
  };
}

/** Preguntas frecuentes (rich result FAQPage). Las respuestas deben ser texto plano. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((it) => ({
      "@type": "Question",
      "name": it.q,
      "acceptedAnswer": { "@type": "Answer", "text": it.a },
    })),
  };
}

/** Saca el ID numérico de una URL de App Store (…/app/id1234567890) para el Smart App Banner. */
export function appStoreId(storeUrl: string | undefined): string | undefined {
  return storeUrl?.match(/\/id(\d+)/)?.[1];
}
