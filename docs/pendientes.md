# Pendientes · UI/UX y SEO

Lo que quedó fuera de la implementación del 7 de septiembre de 2026 (ver
[analisis-ui-ux-seo.md](./analisis-ui-ux-seo.md), sección 9). Marca cada
punto cuando se cierre.

## Después del deploy

- [ ] Confirmar en Vercel que `NEXT_PUBLIC_SITE_URL=https://centavos.mx` (en local apunta a localhost, así que canonical y `og:url` solo son correctos en producción).
- [ ] Compartir el link en WhatsApp o X y comprobar que aparece la imagen social nueva (`/opengraph-image.png`).
- [ ] Validar la home en la prueba de resultados enriquecidos de Google: `MobileApplication` y `FAQPage`.
- [ ] Revisar en Search Console que `/app`, `/blog/*` y las rutas viejas siguen redirigiendo con 308 y que no hay 404 nuevos.

## Contenido (necesita copy o capturas reales)

- [ ] Landing `/presupuestos` (300–500 palabras, mock de la pantalla, CTA).
- [ ] Landing `/suscripciones` (keyword: "app para controlar suscripciones").
- [ ] Landing `/meses-sin-intereses` (keyword: "calculadora de meses sin intereses").
- [ ] Landing `/dividir-gastos` (keyword: "app para dividir gastos entre roomies").
- [ ] Página "¿Por qué Centavos no se conecta a tu banco?" (modelo manual vs. agregadores).
- [ ] Agregar las landings nuevas a `app/sitemap.ts` y enlazarlas desde las tarjetas de función de la home.

## Calculadoras (páginas-herramienta para tráfico orgánico)

Especificaciones completas en [docs/calculadoras/](./calculadoras/README.md): fundamento
legal, fórmulas, casos de prueba, estructura de página y CTA.

- [ ] `/meses-sin-intereses` — cero constantes, pico en el Buen Fin. Empezar por esta.
- [ ] `/aguinaldo` — mayor pico del año; publicar en **octubre**.
- [ ] `/finiquito` — mayor volumen sostenido; requiere el salario mínimo.
- [ ] `/vacaciones` — cero constantes.
- [ ] `/ptu` — publicar antes de marzo; requiere la UMA.
- [ ] `/cetes` — cero constantes si la tasa es input.
- [ ] `lib/fiscal/` con UMA y salario mínimo versionados por año + test de vigencia.

## Prueba social

- [ ] Cuando haya ≥ 20 reseñas reales en las tiendas: mostrar calificación y número de reseñas junto a los badges del hero.
- [ ] Añadir `aggregateRating` a `mobileApplicationJsonLd()` en `lib/seo.ts` solo con cifras reales.
- [ ] 1–2 testimonios con nombre y ciudad (con permiso de la persona).

## Soporte

- [ ] Reconectar el backend del formulario (`app/api/soporte/route.ts` responde 503 hoy).
- [ ] Cambiar `SUPPORT_FORM_ENABLED` a `true` en `lib/config.ts`.
- [ ] Probar el flujo completo: envío exitoso, error del servidor y sin conexión.

## Opcionales

- [ ] Servir los badges de tienda desde `public/` en vez de los hosts de Apple y Google. Artwork oficial en <https://developer.apple.com/app-store/marketing/guidelines/> y <https://play.google.com/intl/es_mx/badges/>; cambiar las dos URLs en `components/home/AppStoreBadges.tsx`.
- [ ] Regenerar `app/opengraph-image.png` con Bricolage Grotesque (hoy usa Segoe UI porque solo hay `.woff2` en el repo; hace falta el `.ttf`). El script de generación quedó fuera del repo; se puede rehacer con PIL o migrar a `app/opengraph-image.tsx` con `ImageResponse`.
- [ ] Mover el JSON-LD de `next/script` a `<script type="application/ld+json">` inline (cosmético; ya sale en el HTML del servidor).
- [ ] Mini calculadora interactiva de suscripciones en la home ("¿cuánto gastas al año?").
- [ ] Añadir redes sociales a `sameAs` en `organizationJsonLd()` cuando existan.
