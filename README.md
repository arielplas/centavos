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
  api/
    soporte/route.ts         → endpoint del formulario (stub 503 hasta reconectar backend)

components/
  Header.tsx, Logo.tsx
  home/*                     → HomePage, copy (es/en), AppFooter, AppStoreBadges, MobileDownloadBar, PhoneMock
  legal/*                    → LegalShell, BackToTop, LanguageSwitcher, HtmlLang
  legal/docs/*               → el texto legal, un módulo por documento e idioma
  soporte/SoporteForm.tsx

proxy.ts                     → idioma de la landing: ?lang=, cookie o idioma del dispositivo

lib/
  store-links.ts             → URLs de App Store / Google Play
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
- Las calculadoras son solo en español, así que la sección de calculadoras y el
  enlace a la de MSI no salen en la landing en inglés.
- Soporte y eliminar cuenta siguen solo en español.

## Notas

- El formulario de soporte (`/app/soporte`) apunta a `POST /api/soporte`, que hoy
  responde `503`. El backend anterior fue retirado; mientras se conecta uno nuevo,
  el formulario ofrece el enlace `mailto:hola@centavos.mx` como respaldo.
- Los links de descarga viven en `lib/store-links.ts`.
