// Badges oficiales de descarga (App Store / Google Play).
//
// Se usan los artworks oficiales servidos por Apple y Google (los que generan
// sus propias herramientas de marketing): el usuario los reconoce al instante
// y las guías de marca de ambas tiendas exigen el badge oficial. Si algún día
// se prefiere servirlos desde /public, descárgalos desde:
//   https://developer.apple.com/app-store/marketing/guidelines/
//   https://play.google.com/intl/es_mx/badges/
// Las URLs vienen de lib/store-links.ts; un badge sin URL no se muestra.

const APPLE_BADGE_SRC =
  "https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/es-mx?size=250x83";
const GOOGLE_BADGE_SRC =
  "https://play.google.com/intl/es_mx/badges/static/images/badges/es_badge_web_generic.png";

// Alturas visuales equivalentes: el PNG de Google trae ~8 % de margen
// transparente alrededor del badge, por eso se renderiza un poco más alto.
const APPLE_H = 48;
const GOOGLE_H = 56;

type Props = {
  className?: string;
  storeUrl?: string;
  playUrl?: string;
  /** Carga prioritaria (hero). */
  priority?: boolean;
};

export function AppStoreBadges({ className = "", storeUrl, playUrl, priority = false }: Props) {
  if (!storeUrl && !playUrl) return null;
  const loading = priority ? "eager" : "lazy";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {storeUrl && (
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex card-hover rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- artwork oficial de Apple, servido por Apple */}
          <img
            src={APPLE_BADGE_SRC}
            alt="Descárgala en el App Store"
            width={Math.round((APPLE_H * 250) / 83)}
            height={APPLE_H}
            loading={loading}
            decoding="async"
          />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      )}
      {playUrl && (
        <a href={playUrl} target="_blank" rel="noopener noreferrer" className="inline-flex card-hover rounded-lg -mx-1">
          {/* eslint-disable-next-line @next/next/no-img-element -- artwork oficial de Google, servido por Google */}
          <img
            src={GOOGLE_BADGE_SRC}
            alt="Disponible en Google Play"
            width={Math.round((GOOGLE_H * 646) / 250)}
            height={GOOGLE_H}
            loading={loading}
            decoding="async"
          />
          <span className="sr-only">(se abre en una pestaña nueva)</span>
        </a>
      )}
    </div>
  );
}

/**
 * Enlaces de texto a las tiendas para cerrar un bloque de función sin
 * competir con los badges del hero y del cierre.
 */
export function InlineStoreLinks({
  storeUrl,
  playUrl,
  label = "Empieza a anotar:",
  className = "text-ink-soft",
}: {
  storeUrl?: string;
  playUrl?: string;
  label?: string;
  /** Incluye el color del texto (p. ej. `text-ink/75` sobre fondos de color). */
  className?: string;
}) {
  if (!storeUrl && !playUrl) return null;
  const link = "font-bold text-ink underline underline-offset-4 decoration-mandarina hover:decoration-ink py-2";
  return (
    <p className={`text-[14px] ${className}`}>
      {label}{" "}
      {storeUrl && (
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className={link}>
          App Store<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      )}
      {storeUrl && playUrl && <span aria-hidden> · </span>}
      {playUrl && (
        <a href={playUrl} target="_blank" rel="noopener noreferrer" className={link}>
          Google Play<span className="sr-only"> (se abre en una pestaña nueva)</span>
        </a>
      )}
    </p>
  );
}
