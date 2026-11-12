# Centavos

Landing page de la app **Centavos** (control de gastos para México), hecha con
**Next.js 16 + React 19 + TypeScript + Tailwind v4**. App Router, Server
Components por default, 100% estática. Mobile-first.

## Stack

- **Framework:** Next.js 16 (App Router, Server Components)
- **Lenguaje:** TypeScript (strict)
- **Estilos:** Tailwind v4 (config en CSS via `@theme`)
- **Fuentes:** `next/font` (Bricolage Grotesque, Manrope, Caveat)
- **SEO:** Metadata API + JSON-LD + sitemap + robots

## Estructura

```
app/
  layout.tsx                 → fuentes, metadata raíz, JSON-LD Organización + WebSite
  page.tsx                   → home (landing de la app) en español
  en/page.tsx                → la misma landing en inglés (se sirve en /?lang=en)
  gastos-hormiga/page.tsx    → calculadora de gastos hormiga (es); deja guardar la lista en la API
  en/gastos-hormiga/page.tsx → la misma calculadora en inglés (se sirve en /gastos-hormiga?lang=en)
  sitemap.ts                 → sitemap
  robots.ts                  → robots.txt
  manifest.ts                → PWA manifest
  not-found.tsx              → 404
  opengraph-image.png        → imagen social (og:image / twitter:image) de todas las rutas
  apple-icon.png             → ícono iOS
  app/
    soporte/page.tsx         → formulario de soporte (+ mailto de respaldo)
    privacidad/page.tsx      → aviso de privacidad (es/en)
    terminos/page.tsx        → términos (es/en)
    eliminar-cuenta/page.tsx → cómo eliminar la cuenta
  canjear/page.tsx           → canje de códigos promocionales (/canjear?code=XXX), es/en, noindex
  canjear/og/route.tsx       → imagen social del enlace compartido (cupón con los días y el código)
  canjear/og/fonts/*.ttf     → las fuentes de marca de app/fonts convertidas a TTF (el generador no lee WOFF2)
  api/
    soporte/route.ts         → endpoint del formulario (stub 503 hasta reconectar backend)

components/
  Header.tsx, Logo.tsx
  home/*                     → HomePage, copy (es/en), AppFooter, AppStoreBadges, MobileDownloadBar, PhoneMock
  legal/*                    → LegalShell, BackToTop, LanguageSwitcher, HtmlLang
  legal/docs/*               → el texto legal, un módulo por documento e idioma
  soporte/SoporteForm.tsx
  canjear/*                  → CanjearFlow (flujo cliente), GoogleButton, copy (es/en)
  gastos-hormiga/*           → GastosHormigaPage, GastosHormigaCalculator (isla cliente), copy y page-copy (es/en)

proxy.ts                     → idioma de la landing (?lang=, cookie o idioma del dispositivo) y ?lang=en de /gastos-hormiga

lib/
  promo-api.ts              → cliente de la API de códigos promocionales (el contrato vive aquí)
  gastos-hormiga.ts          → la cuenta y los límites de la calculadora de gastos hormiga (los mismos de la API)
  gastos-hormiga-api.ts      → cliente del endpoint que guarda la lista de gastos hormiga
  store-links.ts             → URLs de App Store / Google Play
  social-links.ts            → URLs de Instagram y TikTok (footer)
  seo.ts                     → helpers de JSON-LD y Open Graph por página
  config.ts                  → flags (formulario de soporte, correo)
  lang.ts                    → idioma por query param (?lang=), hreflang, hrefs
  ui-strings.ts              → copy del header/footer/shell en los dos idiomas
```

## Empezar

```bash
cp .env.example .env.local            # ajusta NEXT_PUBLIC_SITE_URL
bun install
bun run dev                           # http://localhost:3000
```

## Variables de entorno

| Variable | Default | Para qué sirve |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://centavos.mx` | URL canónica usada en metadata/sitemap/JSON-LD |
| `NEXT_PUBLIC_API_URL` | _(vacío)_ | URL base de la API de Centavos; `/canjear` y `/gastos-hormiga` la llaman directo desde el navegador. Si falta, `/gastos-hormiga` no ofrece guardar la lista |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | _(vacío)_ | Client ID web de Google; si falta, `/canjear` oculta el botón de Google |

## Comandos

```bash
bun run dev          # desarrollo (http://localhost:3000)
bun run build        # producción
bun start            # servidor de producción
bun run typecheck    # tsc --noEmit
bun run lint         # eslint
```

## Legales en dos idiomas

Los términos y el aviso de privacidad se sirven en español e inglés desde la
misma URL; el idioma va en un query param, así que el enlace es compartible:

| Documento | Español | Inglés |
|---|---|---|
| Términos | `https://centavos.mx/app/terminos` | `https://centavos.mx/app/terminos?lang=en` |
| Privacidad | `https://centavos.mx/app/privacidad` | `https://centavos.mx/app/privacidad?lang=en` |

- El español es el **default**: sin param, con el param vacío o con un valor que
  no reconocemos (`?lang=klingon`), se sirve español. `?lang=en-US` y `?lang=EN`
  también valen: se compara solo el subtag principal.
- El español conserva la URL limpia, sin param, para no romper enlaces ni
  canonicals existentes.
- Las dos variantes se apuntan entre sí con `hreflang` (`es-MX`, `en`,
  `x-default`) y van las dos en el sitemap.
- `<html lang>` lo ajusta `components/legal/HtmlLang.tsx` con un script inline:
  el root layout es quien tiene el `<html>` y no puede leer `searchParams`, y
  leer un header ahí volvería dinámico todo el sitio.
- Estas dos rutas se renderizan on demand (leen `searchParams`); el resto del
  sitio sigue siendo estático.
- El texto vive en `components/legal/docs/`. **El español es la fuente de
  verdad**; el inglés lo traduce y tiene que seguir el mismo orden de secciones,
  porque los anchors `#seccion-N` y las referencias cruzadas del texto son
  compartidos.
- Huecos legales conocidos: [docs/legales-pendientes.md](./docs/legales-pendientes.md).

## Landing en dos idiomas

La landing existe en español (`/`) y en inglés (`/?lang=en`), y **detecta el
idioma del dispositivo**. Lo decide `proxy.ts`, solo para `/`, en este orden:

1. `?lang=es` o `?lang=en` manda siempre, y se recuerda en la cookie `lang`
   (un año). Es lo que usa el selector de idioma del header.
2. Sin param: la cookie, si existe.
3. Sin cookie: el header `Accept-Language`, respetando su orden y sus pesos
   (`es-MX,es;q=0.9,en;q=0.8` es español).
4. Cualquier otro idioma, o ningún header (los crawlers), recibe español.

Si el resultado es inglés, `/` redirige con 307 a `/?lang=en`.

- Las dos versiones son **estáticas**: `app/page.tsx` y `app/en/page.tsx`
  renderizan el mismo `HomePage` con distinto `lang`, y el proxy reescribe
  `/?lang=en` hacia `/en`. Una visita directa a `/en` redirige a `/?lang=en`.
- El copy vive en `components/home/copy.tsx`, tipado: una clave que falte en un
  idioma rompe el typecheck. **El español es la fuente de verdad.** Las maquetas
  de teléfono tienen su propio texto en `components/home/PhoneMock.tsx`.
- Las calculadoras son solo en español (salvo la de gastos hormiga), así que la
  sección de calculadoras y el enlace a la de MSI no salen en la landing en
  inglés. La de gastos hormiga se enlaza ahí desde el footer.
- Soporte y eliminar cuenta siguen solo en español.

## Canjear códigos promocionales

`https://centavos.mx/canjear?code=PDM` es el enlace que se comparte en marketing.
El canje se hace **solo en el sitio web**, nunca dentro de la app (la guideline
3.1.1 del App Store prohíbe mecanismos de códigos propios en la app).

- Lee `?code=`, consulta `GET /api/promo-codes/preview` y muestra la oferta. Sin
  código muestra un campo para escribirlo. Un error del código (no existe,
  inactivo, vencido, agotado, ya canjeado) muestra su mensaje y ningún formulario.
- **Ya tengo cuenta:** correo y contraseña (o Google) contra `/api/auth/*`, y luego
  `POST /api/promo-codes/redeem` con el token. El token vive solo en memoria: no
  va a localStorage, cookies ni a la URL.
- **Soy nuevo:** `POST /api/promo-codes/claims` con el correo; después se pide
  descargar la app y registrarse con **ese mismo correo**.
- Idioma por `?lang=en` (sin detección automática: el proxy no toca `/canjear`).
  El texto está en `components/canjear/copy.ts`, con un mensaje por código de error.
- Es `noindex` y no está en `app/sitemap.ts`.
- Todo el contrato de la API está en `lib/promo-api.ts`. La API debe aceptar CORS
  desde el origen del sitio (usa Bearer tokens, sin cookies).
- Google necesita `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; sin él, el botón no aparece.
  Sign in with Apple en web queda fuera de alcance.

## Calculadora de gastos hormiga

`/gastos-hormiga` es la única calculadora bilingüe y la única que usa la API.
Especificación completa en [docs/calculadoras/gastos-hormiga.md](./docs/calculadoras/gastos-hormiga.md).

- Español en `/gastos-hormiga`, inglés en `/gastos-hormiga?lang=en`. Como en la
  landing, las dos versiones son **estáticas** y `proxy.ts` reescribe `?lang=en`
  hacia `/en/gastos-hormiga`; una visita directa a esa ruta redirige a la URL
  pública. Aquí no hay detección de idioma ni cookie: sin el param es español.
- La lista se conserva en `localStorage`, nada más.
- **¿Quieres guardarlo?** Después del resultado se ofrece guardar la lista con un
  correo (`POST /api/gastos-hormiga/claims`). No crea ninguna cuenta en la web:
  cuando ese correo se registra en la app, la API crea el presupuesto «Gastos
  Hormiga» con esos gastos. Sin `NEXT_PUBLIC_API_URL` la tarjeta no aparece y la
  calculadora funciona igual.
- La cuenta está en `lib/gastos-hormiga.ts` y es la misma que implementa la API;
  el contrato del endpoint, en `lib/gastos-hormiga-api.ts`.

## Notas

- El formulario de soporte (`/app/soporte`) apunta a `POST /api/soporte`, que hoy
  responde `503`. El backend anterior fue retirado; mientras se conecta uno nuevo,
  el formulario ofrece el enlace `mailto:hola@centavos.mx` como respaldo.
- Los links de descarga viven en `lib/store-links.ts`.
