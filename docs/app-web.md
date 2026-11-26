# `/app/*` — app web: requisitos

| | |
|---|---|
| **Qué es** | Una app web dentro de la landing, bajo `/app/*`, donde una persona con cuenta de Centavos entra y ve sus datos: Pulso, gastos, presupuestos, suscripciones y perfil |
| **Estado** | Requisitos, **revisión 2 (26 de noviembre de 2026)**. Nada implementado. La revisión 2 mete en la v1 crear cuenta, recuperar la contraseña, el onboarding, Conectar con Claude y la página pública `/app/claude` rediseñada (D2 cambia; D5, D6 y D7 son nuevas). Las preguntas que siguen abiertas en la §16 las cierra el dueño del producto antes o durante la implementación |
| **Base de este documento** | Landing en `origin/main` `80adb77` (el `main` local estaba 7 commits atrás: **haz `git pull` antes de empezar**). API en `dev` `9a2f42e`. App móvil en `origin/main` `e9101d0` |
| **Fuentes de verdad** | API: `centavos.api/src/routes/auth.ts`, `src/index.ts`, `src/lib/{http,auth,google,apple}.ts`, `docs/errors.md`, carpeta "Auth" de `Centavos.postman_collection.json`. App: `centavos-app/src/screens/{IniciarSesion,Pulso,HistorialGastos,Presupuestos,DetallePresupuesto,Suscripciones}.tsx`, `src/components/{BudgetRow,MonthPicker}.tsx`, `src/components/ui/*`, `src/lib/{api,auth-context,auth-storage,google-auth,apple-auth,subscriptions,format}.ts`, `src/i18n/locales/{es,en}/*.json` |
| **Diseño** | Lienzo «Centavos web app»: <https://claude.ai/artifact/87MVvNLHNGHGXWV3M34fJC> (12 pantallas, escritorio y teléfono). Para una sesión que no pueda abrirlo, las pantallas de la app de §4.6 son la referencia. Las pantallas nuevas de la revisión 2 (crear cuenta, recuperar, bienvenida, Conectar con Claude) copian las de la app. Página `/app/claude`: lienzo <https://claude.ai/artifact/7ajMSNMZuRDmSgp5zANPQy>, pendiente de aprobación |

Este documento es para la sesión que va a implementar. Está escrito para que no tenga que volver
a investigar: cada contrato de la API que se usa está aquí, confirmado contra el código. Donde algo
no se pudo confirmar se marca **⚠️ verificar**.

---

## 1. Objetivo y no-objetivos

### 1.1 Objetivo

1. Que una persona con cuenta entre desde el navegador **igual que en la app**: correo y
   contraseña, Google o Apple. Mismas pantallas, mismo copy, mismos errores.
2. Que vea sus datos, de solo lectura: el Pulso (resumen del mes), sus gastos, sus presupuestos
   con su detalle, sus suscripciones y su perfil.
3. Que funcione en español y en inglés, en teléfono y en escritorio.
4. Que la sesión sea al menos tan segura como la de `/canjear`, que hoy no guarda tokens en
   ningún lado.
5. *(Revisión 2.)* Que alguien **sin la app** cree su cuenta, verifique su correo, recupere su
   contraseña y configure su cuenta (el onboarding) en la web, con los mismos flujos que en la app.
6. *(Revisión 2.)* Que pueda **conectar Claude desde la web**: sacar el código, ver sus conexiones y
   desconectarlas. Con 5 y 6, Centavos se puede usar desde Claude sin instalar la app.
7. *(Revisión 2.)* Que la página pública `/app/claude` venda el conector y explique cómo usarlo.

### 1.2 No-objetivos de la v1

- **Escribir datos** (D4). Nada de anotar, editar ni borrar gastos, presupuestos o suscripciones.
  Ni aceptar invitaciones, ni amigos, ni saldos o pagos entre miembros. La web manda a la app para
  todo eso. *Excepciones de la revisión 2:* la cuenta (crear, verificar, recuperar), el onboarding
  (D6) y los códigos y conexiones de Claude (D5).
- **Comprar Centavos+**, el paywall, el periodo de prueba y los códigos promocionales (esos siguen
  en `/canjear`).
- **Eliminar la cuenta** desde la web. Se enlaza la página existente `/app/eliminar-cuenta`.
- **Cambiar contraseña, nombre, moneda, foto o idioma en el servidor.** El idioma de la web se
  elige y se recuerda solo en el navegador (§9).
- Alcancías, amigos, notificaciones, novedades (release notes), encuestas.
- Google One Tap y el inicio automático.
- PWA o modo sin conexión.
- Indexar en buscadores: todo `/app/*` de la app web es `noindex` y no va en el sitemap.
- Tocar `/canjear` o la tarjeta de registro de la home. Pueden reutilizar este cliente después
  (pregunta 11 de la §16).

---

## 2. Decisiones (tomadas)

El dueño del producto las decidió el 20 de noviembre de 2026. El detalle está en las secciones que
se citan.

| # | Pregunta | **Decisión** | Dónde |
|---|---|---|---|
| D1 | ¿Cómo se guarda la sesión en el navegador? | **Opción B**: cookie HttpOnly del propio sitio (`/api/sesion/*` en Next), con traspaso y rotación inmediata. **No cambia el código de la API.** Las opciones A y C quedan descartadas (se conservan en §6 solo como registro) | §6 |
| D2 | ¿La web deja crear cuenta y recuperar la contraseña, o solo entrar? | **Revisión 2 (26 de noviembre de 2026): sí, los mismos flujos que la app.** Crear cuenta, verificar el correo y recuperar la contraseña entran en la v1, como dice el **Apéndice A**. (La decisión del 20 de noviembre era «solo entrar».) | §4.5, §5, Apéndice A |
| D3 | ¿Apple entra en la v1? | **Sí, detrás de su propia variable**: el botón no aparece hasta que exista el Services ID y esté en `APPLE_CLIENT_IDS` | §5.5 |
| D4 | ¿La v1 es solo lectura? | **Sí**, salvo la cuenta, el onboarding y Conectar con Claude (revisión 2) | §1.2 |
| D5 | ¿Se conecta Claude desde la web? | **Sí (revisión 2).** `/app/conectar-claude` copia la pantalla de la app: código, conexiones y desconectar. Es el camino para usar Centavos desde Claude sin la app | §4.8 |
| D6 | ¿La web hace el onboarding? | **Sí (revisión 2).** Sin él, una cuenta creada en la web se queda con la moneda por defecto (MXN) sin que nadie la elija. `/app/bienvenida` copia el wizard de la app | §5.8 |
| D7 | ¿Se rediseña `/app/claude`? | **Sí (revisión 2):** página de marketing y de cómo usarlo, sobre el lienzo de referencia una vez aprobado | §4.9 |

**Ojo:** Google y Apple **crean** una cuenta si no existe; es el mismo endpoint para las dos cosas
(§5.4 y §5.5). Con la revisión 2 esa persona sigue al onboarding de la web (§5.8), igual que en la
app.

---

## 3. Cómo está hecha la landing hoy (lo que hay que respetar)

- **Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4 con los tokens de
  `@cntvos/tokens` (tarballs en `vendor/`), `bun`. Se despliega en **Vercel** (usa
  `@vercel/analytics` y `@vercel/speed-insights`). Casi todo es estático, pero ya hay funciones de
  servidor: `app/api/soporte/route.ts`, `app/canjear/og/route.tsx` y el `proxy.ts` (el middleware
  de Next 16).
- **Idioma:** `?lang=en` en la URL. `lib/lang.ts` tiene `resolveLang`, `parseLang`, `langHref`,
  `navHref`, la cookie `lang` (un año) y `BILINGUAL_PATHS`. `proxy.ts` solo actúa sobre `/`, `/en`,
  `/gastos-hormiga` y `/en/gastos-hormiga`. `components/legal/HtmlLang.tsx` ajusta `<html lang>`
  en el cliente.
- **Copy:** cada sección trae su `copy.ts(x)` tipado por idioma, con el español como fuente de
  verdad (por ejemplo `components/canjear/copy.ts`). Una clave que falte en un idioma rompe el
  typecheck.
- **Llamadas a la API, hoy, todas desde el navegador:**
  - `lib/promo-api.ts`: transporte (`fetch`, `credentials: "omit"`, Bearer, error
    `{ error: { code, fields } }`), y además `loginWithPassword` y `loginWithGoogle` para
    `/canjear`. **Tira el refresh token a propósito** y guarda el access token solo en memoria.
  - `lib/signup-api.ts`: `signup`, `verifyEmail` y `resendEmailCode` para la tarjeta de registro de
    la home. **Descarta `signupToken` y los tokens de `/auth/verify`**, y convierte cualquier 429
    en `RATE_LIMIT`.
  - `lib/gastos-hormiga-api.ts`: `POST /api/gastos-hormiga/claims`.
  - **La app web necesita su propio cliente** (§7.1): los de arriba descartan justo los campos que
    la app web usa (`signupToken`, `error.userId`, `error.signupToken`, los tokens de
    `/auth/verify` y el código exacto de cada 429).
- **Google en la web ya existe:** `components/canjear/GoogleButton.tsx` carga Google Identity
  Services (`https://accounts.google.com/gsi/client`), usa `NEXT_PUBLIC_GOOGLE_CLIENT_ID` y no se
  muestra si la variable está vacía.
- **Variables de entorno:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL` y
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (ver `.env.example` y la tabla del README).
- **Lo que ya vive bajo `/app/*`.** Son páginas públicas y la app web no las toca:
  - `/app/terminos`, `/app/privacidad`, `/app/soporte`, `/app/eliminar-cuenta`;
  - `/app/claude`, que solo está en `origin/main`;
  - `/app/invite`, planeada para los enlaces de invitación a presupuestos (spec de Apple en la
    API, `docs/feature-10-sign-in-with-apple.md`).
- **`/app` a secas redirige a `/` de forma permanente** (`next.config.ts`, `permanent: true`, que
  Next sirve como **308**; ahí vivía la landing vieja, y `docs/pendientes.md` vigila esa
  redirección en Search Console). Los navegadores guardan una redirección permanente en caché, así
  que **`/app` no puede ser la portada de la app web**: se queda como está.
- **Sin test runner.** `package.json` tiene `lint` y `typecheck`. Para la lógica pura de la app
  web (validación del `next`, rangos de fechas, mapeo de errores) se puede usar `bun test`, que no
  requiere dependencias.
- **Docs:** en español, en `docs/`. Este archivo sigue esa convención.

---

## 4. Rutas y pantallas

### 4.1 Mapa

Todas en español, igual que el resto del sitio. El idioma va en `?lang=`, no en la ruta.

| Ruta | Pantalla | Equivale en la app a | Sesión |
|---|---|---|---|
| `/app/entrar` | Iniciar sesión | `IniciarSesion` (más la parte de `Bienvenida` que aplica) | Solo sin sesión |
| `/app/pulso` | Resumen del mes. **Portada de la app web** | Tab `Pulso` | Con sesión |
| `/app/gastos` | Historial de gastos con filtros | Tab `Historial` ("Gastos") | Con sesión |
| `/app/presupuestos` | Lista de presupuestos del mes | Tab `Presupuestos` | Con sesión |
| `/app/presupuestos/[id]` | Detalle de un presupuesto | `DetallePresupuesto` | Con sesión |
| `/app/suscripciones` | Suscripciones | Tab `Suscripciones` | Con sesión |
| `/app/perfil` | Perfil, idioma y cerrar sesión | `Ajustes` / `EditarPerfil` (solo lectura) | Con sesión |
| `/app/crear-cuenta` | Crear cuenta y verificar el correo *(revisión 2)* | `CrearCuenta` + `VerificarCorreo` | Solo sin sesión |
| `/app/recuperar` | Recuperar la contraseña *(revisión 2)* | `OlvidasteContrasena` → `VerificarReset` → `NuevaContrasena` | Solo sin sesión |
| `/app/bienvenida` | Onboarding de una cuenta nueva *(revisión 2)* | El wizard de onboarding | Con sesión, `onboarded: false` |
| `/app/conectar-claude` | Conectar con Claude *(revisión 2)* | `ConectarClaude` | Con sesión |

**Rutas reservadas.** Ninguna página nueva puede llamarse `terminos`, `privacidad`, `soporte`,
`eliminar-cuenta`, `claude` ni `invite`. El `/app` a secas se queda como redirección a `/`.

**Enlaces de la app (universal links / app links).** Cuando se publiquen
`apple-app-site-association` y `assetlinks.json` para `/app/invite`, deben cubrir **solo**
`/app/invite`. Si cubrieran `/app/*`, en un teléfono con la app instalada iOS y Android abrirían la
app nativa en lugar de la app web.

`/app/crear-cuenta` y `/app/recuperar` están descritas en el Apéndice A, que la revisión 2 mete en
la v1. `/app/claude` es la página pública (§4.9), no una pantalla de la app web.

### 4.2 Estructura en `app/`

Hay grupos de rutas para que las páginas legales existentes no hereden nada de la app web:

```
app/app/(web)/layout.tsx                    → bandera, noindex, proveedor de idioma y de sesión
app/app/(web)/(acceso)/layout.tsx           → si ya hay sesión, manda a /app/pulso (o al `next`)
app/app/(web)/(acceso)/entrar/page.tsx
app/app/(web)/(acceso)/crear-cuenta/page.tsx   → revisión 2 (Apéndice A)
app/app/(web)/(acceso)/recuperar/page.tsx      → revisión 2 (Apéndice A)
app/app/(web)/(privada)/bienvenida/page.tsx    → revisión 2 (D6); sin AppShell
app/app/(web)/(privada)/conectar-claude/page.tsx → revisión 2 (D5, §4.8)
app/app/(web)/(privada)/layout.tsx          → guardia de sesión + AppShell (navegación)
app/app/(web)/(privada)/pulso/page.tsx
app/app/(web)/(privada)/gastos/page.tsx
app/app/(web)/(privada)/presupuestos/page.tsx
app/app/(web)/(privada)/presupuestos/[id]/page.tsx
app/app/(web)/(privada)/suscripciones/page.tsx
app/app/(web)/(privada)/perfil/page.tsx
components/app/…                            → componentes cliente de la app web
lib/app/…                                   → cliente de la API, sesión, idioma, formato
```

- Cada `page.tsx` es un Server Component que exporta `metadata` con
  `robots: { index: false, follow: false }` y renderiza un componente cliente. Ningún dato de la
  persona se renderiza en el servidor.
- `/app/presupuestos/[id]`: la página es un componente cliente que lee el `id` de los params. No
  se prerenderiza ningún id.
- **Bandera:** `NEXT_PUBLIC_WEB_APP_ENABLED`. Si no vale `"true"`, `(web)/layout.tsx` llama a
  `notFound()`. Se sigue el patrón de `SUPPORT_FORM_ENABLED` en `lib/config.ts`. Así se puede
  desplegar a medias sin que nadie lo vea.
- **Sitemap y robots:** no se agrega nada a `app/sitemap.ts`. Tampoco se pone `Disallow: /app/`
  en `robots.ts`, porque taparía las páginas legales: basta el `noindex` por página.

### 4.3 Guardia de sesión y redirecciones

- Sin sesión, una ruta privada manda a `/app/entrar?next=<ruta actual con su query>`.
- Con sesión, una ruta de acceso manda a `next` si es válido, y si no a `/app/pulso`.
- **`next` válido:** empieza con `/app/`, no empieza con `//` ni con `/\`, no trae esquema y no
  apunta a otra ruta de acceso. Cualquier otro valor se ignora, para no abrir una redirección
  abierta. Va en `lib/app/next-param.ts` con pruebas.
- Mientras se restaura la sesión al cargar (§6.4), la ruta privada muestra un esqueleto, nunca la
  pantalla de entrar. Si no, parpadea.
- Cuando el refresh falla (sesión vencida o revocada), se manda a `/app/entrar?next=…` con el
  mensaje del código (§10).

### 4.4 AppShell (navegación)

> **Diseño visual de referencia:** el lienzo «Centavos web app»
> (<https://claude.ai/artifact/87MVvNLHNGHGXWV3M34fJC>). Cada pantalla tiene versión de escritorio
> y de teléfono, y un selector de estado en Tweaks. Si este documento y el lienzo no coinciden, el
> lienzo manda en lo visual y este documento en el comportamiento.

- **Escritorio (≥ 768 px):** barra superior de vidrio con el logo (`components/Logo.tsx`), las
  cuatro pestañas con su ícono y su nombre (Pulso · Gastos · Presupuestos · Suscripciones; la
  activa en píldora tinta con texto crema) y el avatar con la inicial, que lleva a `/app/perfil`.
  El contenido de Gastos, Presupuestos, Suscripciones y el detalle va en **una columna centrada de
  720 px**, igual que en la app. El Pulso usa dos columnas.
- **Teléfono:** barra inferior de vidrio flotante **solo con íconos**, como la app (la etiqueta es
  un ajuste de la app que por defecto está apagado): la pestaña activa en tinta sobre una burbuja,
  las demás en `ink-mute`. Cada ícono lleva `aria-label`. Sin el botón central «Anotar» (la web es
  de solo lectura). El avatar vive en el encabezado del Pulso, como el `AccountMenu` de la app.
- Íconos: los de la §4.7. Nada de íconos inventados ni emojis donde la app usa un ícono.
- Aviso discreto «Para anotar o editar, usa la app» (copy nuevo, §9.3) en el Pulso y el Perfil.
- Estilo: el vidrio y los tokens que ya usa el sitio (`glass`, `text-ink`, `mandarina`…). No se
  inventan colores.

### 4.5 Pantallas de acceso

**`/app/entrar`** (copia de `IniciarSesion.tsx`):

1. Título `auth:signIn.title` («Hola de nuevo»). Sin logo grande ni subtítulo, como en la app.
2. Campo correo (`auth:fields.email`, placeholder `auth:fields.emailPlaceholder`,
   `autocomplete="email"`, `inputmode="email"`, máximo 254 caracteres). Puede venir prellenado
   desde otra pantalla de acceso (como el `route.params.email` de la app). **El correo no viaja en
   la URL:** va en un valor `prefillEmail` del proveedor de sesión, que vive en memoria mientras
   se navega dentro de `(web)` y se consume al leerlo.
3. Campo contraseña (`auth:fields.password`, placeholder `auth:fields.passwordPlaceholder`,
   `autocomplete="current-password"`, botón ver/ocultar `common:fields.showPassword` y
   `common:fields.hidePassword`, máximo 256).
4. Enlace `auth:signIn.forgot` a `/app/recuperar` (revisión 2).
5. Error del formulario, si hay.
6. Botón principal `auth:signIn.submit`, que dice `auth:signIn.submitting` mientras envía.
7. Separador `common:or`.
8. **Apple primero, Google después** (el mismo orden que la app).
9. Pie: `auth:signIn.noAccount` y el enlace `auth:signIn.createFree` a `/app/crear-cuenta`
   (revisión 2).

Validación del cliente, antes de enviar: correo vacío → `auth:validation.emailRequired`; correo con
formato malo → `auth:validation.emailInvalid`; contraseña vacía →
`auth:validation.passwordRequired`. Cada error se muestra en su campo y se borra al escribir.

**Revisión 2:** «¿Olvidaste tu contraseña?» lleva a `/app/recuperar`, «Créala gratis» a
`/app/crear-cuenta`, y una **cuenta sin verificar** (`403 AUTH_EMAIL_UNVERIFIED`, §5.1) pasa al
paso Verificar en la misma pantalla, con el `userId` y el `signupToken` del error (Apéndice A). Los
paneles «hazlo en la app» (`app.forgotInApp`, `app.verifyInApp`) ya no se usan.

**Botones de Apple y Google** (los `AppleSignInButton` y `GoogleSignInButton` de la app; en
`/app/entrar` y en el paso 1 de `/app/crear-cuenta`). Mientras se habla con la API, el de Apple dice
`auth:apple.signIn.connecting`. El de Google lo dibuja Google y no se puede cambiar, así que
`auth:google.signIn.connecting` va como texto de estado debajo. Si el proveedor no está disponible
en el navegador, el botón no se muestra; si falla al usarlo, `auth:apple.signIn.unavailable` o
`auth:google.signIn.unavailable`. Un error de la API muestra el texto de su código, y cualquier
otro error `auth:apple.signIn.genericError` o `auth:google.signIn.genericError`. Que la persona
cancele no es un error.

### 4.6 Pantallas de datos (solo lectura)

> **Regla principal: las pantallas copian las de la app.** Mismo orden, mismas piezas, mismo copy
> y mismos íconos que `centavos-app/src/screens/{Pulso,HistorialGastos,Presupuestos,Suscripciones,DetallePresupuesto}.tsx`
> y sus componentes (`components/BudgetRow.tsx`, `components/ui/{CategoryIcon,ServiceMark,SpendRing,ProgressBar,Money,EmptyState,Chip}.tsx`,
> `components/MonthPicker.tsx`, `lib/subscriptions.ts`). Lo único que cambia es lo que la web no
> hace: no hay botón «+», ni anotar, ni editar, ni paywall. Ante cualquier duda de diseño, se abre
> la pantalla de la app y se copia.

Reglas comunes:

- **Estados**, como la app: **cargando** (esqueletos con la forma de lo que viene), **error**
  (texto del error y «Reintentar» como enlace `mandarina-deep`, centrado), **vacío**
  (`EmptyState`: el ícono de la pestaña sobre un disco `sand` de 72 px, título, cuerpo y un botón
  tinta que en la web lleva a la app, §9.3) y **con datos**.
- Todas las llamadas llevan `timezone` = `Intl.DateTimeFormat().resolvedOptions().timeZone`
  (§7.2).
- **Montos, como `Money` de la app:** el monto con dos decimales y el código de moneda al lado, a
  la **mitad del tamaño** («$1,234.00 <small>MXN</small>»). Los gastos llevan el prefijo «−». Donde
  la app usa `whole` o `compact`, también: «$520 MXN» en las filas de presupuesto, «$5.0k MXN» en
  los mosaicos del Pulso (compacto desde 1,000). El formato sale de `formatMoneyParts` en
  `centavos-app/src/lib/format.ts`. **Nunca se suman monedas distintas.**
- **Categoría, como `CategoryIcon`:** un círculo con el tinte de la categoría (los `cat-*` de
  `@cntvos/tokens`) y el glifo `category-*` de `@cntvos/icons` adentro, en tinta, a la mitad del
  diámetro, trazo 1.75. Sin emojis. La etiqueta sale de la copia local es/en (§9.2), no de la API.
- **Barras y anillos, como `ProgressBar` y `SpendRing`:** verde `#5fa57a` debajo de 80 %, amarillo
  `#f5b833` desde 80 %, rojo `#d94a3a` desde 100 %. Pista `rule`. El anillo lleva una marca tinta
  donde iría un gasto parejo a la fecha (`monthPace`).
- Fechas en la zona horaria de la persona, con el formato relativo de la app («Hoy», «Ayer», y si
  no la fecha corta).
- Las imágenes (`imageUrl`) son URLs públicas: `<img>` con `alt` y `loading="lazy"` (sin
  `next/image`).

**`/app/pulso`** (`Pulso.tsx`) — `GET /api/pulse?timezone=` (§7.3):

1. Encabezado: la fecha larga en `caption` `mandarina-deep` y `home:greeting` en `h1`. En
   teléfono, el avatar a la derecha.
2. **Tarjeta tinta (`heroBg`, radio 24):** `PulseDot` del color del `status` y
   `home:availableThisMonth` en caption; el disponible (`totalBudget − totalSpent`) en `money`
   crema; `home:ofBudgeted`; `ProgressBar` de 10 px (`value = totalSpent`, `max = totalBudget`,
   etiqueta `home:progressA11y`); `home:spentSoFar` con el porcentaje; si hay presupuestos en otra
   moneda, `home:onlyCurrency`. Abajo, la caja de estado (crema al 7 %) con
   `home:status{Green,Yellow,Red}Line` y su `Sub`.
3. **Mosaicos** Hoy / Semana / Mes en `peach`, `sand` y `sky`, con la etiqueta en caption y el monto
   compacto (`spentToday`, `spentThisWeek`, `spentThisMonth`), etiqueta accesible `home:spentA11y`.
4. **Presupuestos:** `home:budgetsKicker` + `home:budgetsHeading`, y una tarjeta de vidrio con los
   **3 primeros** `BudgetRow` (como la app: ver Presupuestos). En escritorio, «Ver todos» (copy
   nuevo) lleva a `/app/presupuestos`.
5. **Recientes:** `home:recentKicker` + `home:recentHeading`; filas con `CategoryIcon` de 40, la
   nota (o la categoría), «Categoría · fecha relativa», el chip de pagos si aplica, el ícono de
   fotos si tiene, y el monto con «−». «Ver todos» lleva a `/app/gastos`.
6. **Vacío** (sin presupuestos): la tarjeta tinta cambia a `home:emptyEyebrow`, `home:emptyTitle`,
   `home:emptyBody` y un botón crema «Anótalo desde la app ›».
7. **Cuenta nueva** (`onboarded === false`, §5.8): la banda azul «Termina de configurar tu cuenta
   en la app» arriba de lo anterior.

**`/app/gastos`** (`HistorialGastos.tsx`) — `GET /api/expenses` (§7.3):

1. `expenses:history.kicker` («Historial») y `expenses:history.title` («Tus gastos»).
2. **Buscador** de vidrio: 🔍 (la app usa ese carácter), el campo
   `expenses:history.searchPlaceholder`, y ✕ para borrar cuando hay texto. Filtra por `notes`
   (300 ms de espera al escribir).
3. **Pestañas de periodo**, cuatro iguales de 40 px: `expenses:range.day` / `week` / `month` /
   `year` (Hoy · Semana · Mes · Año), la activa en tinta. **Son periodos móviles, no meses de
   calendario:** Hoy = `period=today`, Semana = `period=7d`, Mes = `period=30d` (la que viene
   elegida), Año = `from` = 1 de enero y `to` = ahora. **Año es de Centavos+:** lleva el candado
   (`lock`) y, para una cuenta gratis, al tocarla no cambia el filtro y aparece el aviso
   «El año completo es de Centavos+. Actívalo desde la app.» (copy nuevo).
4. **Búsqueda en todo el historial:** con Centavos+, al buscar se busca en todo
   (`expenses:search.allHistory`); gratis, solo en el periodo, con la línea
   `expenses:search.unlockAll` con candado que, en la web, muestra el mismo aviso de Centavos+.
5. **Categoría:** etiqueta `expenses:history.category` y un desplegable (`Dropdown` de la app) con
   `expenses:history.allCategories` («Todas») y las 14 categorías con su ícono.
6. **Tarjeta del total** (`heroBg`, radio 20): `expenses:range.total*` («Este mes»…), más
   « · categoría» si hay filtro; `totalSpent` en `money` crema; `expenses:history.count`. Mientras
   carga, huesos en vez de «$0.00».
7. **Lista por día:** encabezado con la fecha relativa (caption `ink-soft`) y el subtotal del día a
   la derecha; filas con `CategoryIcon` de 42, la nota (o la categoría) en negritas, la categoría
   en chico, el chip `sky` de pagos («3/12 mensual», `installmentLabel`) y el ícono
   `image-outline` con el número de fotos si hay más de una; a la derecha el monto con «−».
   **Scroll infinito** (como la app, `limit=100`, `offset`), sin botón «Cargar más».
8. Vacío: `EmptyState` con `tab-historial`, `expenses:history.emptyTitle` / `emptyBody`. Si hay
   búsqueda o categoría, `common:nothingHere` / `expenses:history.noResults`, sin botón.
9. La fila no abre detalle en la v1.

**`/app/presupuestos`** (`Presupuestos.tsx`) — `GET /api/budgets` (§7.3):

1. `budgets:listTitle` en `h1` (sin caption).
2. **Selector de mes** (`MonthPicker`): un desplegable con el mes («Noviembre»). Gratis abre los
   3 meses más recientes; Centavos+, 12. Los meses bloqueados se listan con la insignia
   «Centavos+» y, en la web, muestran el aviso «Los meses anteriores son de Centavos+. Actívalo
   desde la app.» (copy nuevo) en lugar del paywall.
3. **Pestañas** `budgets:tabPersonal` («Solos», ícono `account`) y `budgets:tabShared`
   («Compartidos», ícono `account-multiple`). Cada una pide `shared=false` / `shared=true`.
4. **Resumen** (vidrio, radio 22): `budgets:available` o `budgets:overspent`; el disponible en
   `money` (rojo con «−» si se pasó); `budgets:list.perDayLine` («≈ $169 al día · quedan 11 días»,
   solo en el mes actual); la **barra segmentada**: un tramo por presupuesto con límite en la
   moneda de la persona, ancho proporcional a su límite, color según su estado, ordenados por uso.
   Abajo, si aplica, `budgets:onlyCurrencyTotal`.
5. Si nada pide atención, la banda verde `budgets:list.allFine` con `party-popper`.
6. **Grupos**, en este orden y solo si tienen filas: `budgets:list.group_attention` (`alert-circle-outline`
   rojo y borde rojo si alguno se pasó, con `msgOverOne` / `msgOverMany`; si no, `alert-outline`
   `mandarina-deep` y borde amarillo), `group_fine` (`check-circle-outline` verde, borde verde) y
   `group_limitless` (`infinity`, con `information-outline` que explica
   `budgets:limitlessExcluded`). Dentro de cada grupo, ordenados por uso.
7. **`BudgetRow`:** `SpendRing` de 48 (trazo 4, relleno del tinte) con el glifo de la categoría
   adentro; el nombre en negritas con las insignias de la pestaña Compartidos («Compartido» con
   `account-multiple` en `sand`, `budgets:readOnly` con `lock-outline` si está congelado, «USD ·
   independiente» en `peach` si es de otra moneda); debajo `budgets:list.ofCap` («de $4,000») o,
   sin límite, `budgets:list.spentThisMonth`. A la derecha lo que queda («$520 MXN» en tinta,
   `mandarina-deep` si va al 80 %, rojo con «+» si se pasó) y `budgets:list.leftLabel` /
   `overBy`; sin límite, el ícono `infinity`. Toda la fila lleva a `/app/presupuestos/[id]`.
8. Vacío: `EmptyState` con `tab-presupuestos`. Pestaña sin filas: `budgets:emptyPersonal` /
   `emptyShared` y su cuerpo (con `tab-amigos` en compartidos).

**`/app/presupuestos/[id]`** (`DetallePresupuesto.tsx`) — `GET /api/budgets/:id` (§7.3):

1. Volver a Presupuestos y el mismo `MonthPicker`.
2. **Tarjeta de vidrio** con un halo suave del color de la categoría: el ícono en un círculo de 56,
   el nombre en `h2`, `budgets:detail.daysLeft` («Noviembre · quedan 11 días») y la insignia
   `budgets:shared` si es compartido.
3. Con límite: `SpendRing` de 168 (trazo 14) con `budgets:available` / `overspent`, lo que queda y
   `budgets:detail.usedPct` al centro; a un lado la leyenda: `statSpent` (punto del color del
   estado), `statBudget` y `pace` (raya tinta) con `pace_ahead` / `pace_onTrack` / `pace_under`.
   Sin límite: `spentThisMonth` grande, la etiqueta `infinity` + `budgets:edit.noLimit` y
   `movementsCount`.
4. Congelado: banda con `lock-outline` y `budgets:detail.readOnlyNote`. Al 80 % o más: banda con
   `alert-outline` / `alert-circle-outline` y `nearLimit` / `overBy`.
5. `budgets:detail.monthExpensesCount` y la lista de gastos del mes (filas como en Gastos), con
   scroll infinito; vacía: `noExpensesThisMonth`.
6. Compartido: «Pagos registrados» (copy nuevo) de solo lectura y «Para registrar un pago o ver
   saldos, usa la app.» (copy nuevo). Sin los mosaicos de saldos, miembros ni compartir de la app.
7. `404 BUDGET_NOT_FOUND`: `budgets:detail.notFound` + `maybeDeleted` y un enlace a
   `/app/presupuestos`.

**`/app/suscripciones`** (`Suscripciones.tsx`) — `GET /api/subscriptions` (§7.3):

1. `subscriptions:kicker` + « · » + `subscriptions:activeCount` y `subscriptions:title`.
2. **Tarjeta tinta** (radio 24): `subscriptions:monthlyTotal` y `projectedMonthlyCost` en `money`
   crema. Si algo se cobra en los próximos 7 días, la píldora con punto `mandarina`,
   `subscriptions:thisWeek` y el total de ese grupo.
3. **Grupos** con `groupByDue` de `lib/subscriptions.ts` (copiarlo tal cual): `group.week`
   (≤ 7 días), `group.month` (≤ 30) y `group.later`, solo activas, ordenadas por fecha. Cada
   encabezado lleva su total a la derecha, salvo «Más adelante».
4. **Fila** sin tarjeta, con línea abajo: `ServiceMark` (cuadro de 44 con radio 13, el tinte de la
   categoría y las **iniciales** del servicio en 800, `initialsFrom`); el nombre; cuándo
   (`chargeWhen`: `chargedToday`, `chargedTomorrow`, `chargedInDays` hasta 7 días, si no la fecha
   corta, más « · » + `detail.annual` si es anual), en `mandarina-deep` y negritas si faltan 3 días
   o menos; a la derecha el monto y «/mes» o «/año» (`perMonthShort` / `perYearShort`).
5. **Canceladas plegadas:** `cancelledToggle` («Canceladas (1)») con `chevron-down` / `chevron-up`;
   abiertas, filas en `ink-soft` con `cancelledOne`. Sin tachado ni opacidad.
6. Vacío: `EmptyState` con `tab-suscripciones`.

**`/app/perfil`** — `GET /api/me` (§7.3):

- Foto (`imageUrl`) o iniciales, nombre y correo. Si `emailHidden`, el distintivo
  `auth:apple.emailHidden.badge` y la nota `auth:apple.emailHidden.note`.
- Moneda (`auth:profile.currency`) y plan: «Centavos+» si `plan === "premium"`, «Gratis» si no
  (copy nuevo). No se muestran fechas de renovación ni de prueba.
- Idioma de la web: selector Español / English (§9.1). Se guarda solo en el navegador.
- Enlaces: Términos, Privacidad, Soporte (`/app/soporte`) y «Eliminar cuenta»
  (`auth:profile.deleteAccount`, a `/app/eliminar-cuenta`).
- Botón `settings:rows.signOut` («Cerrar sesión») (§5.7).

### 4.7 Íconos

Los mismos que la app, sin sustitutos:

- **`@cntvos/icons`** (ya está en `vendor/` y en `package.json` de la landing): grilla 24, trazo
  1.75, puntas redondas, sin relleno, color por `currentColor`. Se usan los 14 `category-*`, las
  pestañas (`tab-pulso`, `tab-historial`, `tab-presupuestos`, `tab-suscripciones`, y `tab-amigos`
  en el vacío de compartidos) y `action-settle` si hace falta. Hacer un componente `<Icon name>`
  web que pinte `GLYPHS[name]` (el README del paquete lo describe).
- **MaterialCommunityIcons**, los mismos nombres que la app (vía `@expo/vector-icons`): `account`,
  `account-multiple`, `alert-circle-outline`, `alert-outline`, `check-circle-outline`,
  `infinity`, `information-outline`, `party-popper`, `lock`, `lock-outline`, `image-outline`,
  `chevron-down`, `chevron-up`, `chevron-left`. En la web: agregar `@mdi/js` (Apache-2.0, sus
  rutas SVG con los mismos nombres en camelCase, `mdiAccountMultiple`…) y pintarlos como `<svg>`
  de 24 con relleno `currentColor`. No usar la fuente completa (pesa 1.3 MB).
- La app usa los caracteres 🔍 y ✕ en el buscador de Gastos y «›» en el botón del Pulso vacío; la
  web hace lo mismo.
- Íconos decorativos con `aria-hidden="true"`; los que son el único contenido de un botón, con
  `aria-label`.

### 4.8 Conectar con Claude — `/app/conectar-claude` (revisión 2, D5)

Copia de `centavos-app/src/screens/ConectarClaude.tsx`, con el mismo copy (`settings:connectClaude.*`,
ya en es y en en la app). Es la pantalla que permite usar Centavos desde Claude **sin la app**:
alguien crea su cuenta en la web, entra aquí, saca el código y lo pega en la página de conexión
que abre Claude. Con esto el camino de [#20 en la API](../../centavos.api/docs/feature-20-claude-without-app.md)
(entrar con un código por correo en la propia página de Claude) deja de ser necesario para
lanzar; queda como mejora posterior.

| Bloque | Contenido | Endpoint |
|---|---|---|
| Intro | `connectClaude.intro` | — |
| Paso 1 | `step1Title`, `step1Body`, la URL `https://api.centavos.mx/mcp` con **Copiar enlace** (en la web no hay hoja de compartir: `share` se vuelve «Copiar enlace», copy nuevo de §9.3) y **Abrir claude.ai** (`openClaude`, en otra pestaña) | — |
| Paso 2 | `step2Title`, `step2Body`, botón `generate` / `generating`. Con código: el código en grande, `copyCode` / `copied`, `explanation` y `expiresIn` en vivo (cada 15 s, como la app); al vencer, el código desaparece y vuelve `generateAnother` | `POST /api/me/connections/link-code` → `201 { code, expiresAt }` |
| Conexiones | `connectionsTitle`; vacío: `empty`; por fila: cliente, `connectedOn`, `lastUsed`, botón `revoke` con `revokeA11y`. Confirmar con un diálogo (`confirmTitle`, `confirmBody`) | `GET /api/me/connections` → `{ available, connections[] }`; `DELETE /api/me/connections/:id` → `{ revoked: true }` |
| No disponible | Si `available` es `false`, los pasos 1 y 2 se cambian por `notAvailable`; la lista y Desconectar siguen | — |

- **Escrituras.** Es la excepción a D4: generar un código y desconectar. Ninguna otra.
- **El código no sale del componente** salvo al tocar Copiar. No va a la URL, al almacenamiento
  ni a los logs. Se borra al salir de la pantalla, igual que en la app.
- **Errores:** `403 CONNECTOR_NOT_AVAILABLE` → `notAvailable`; `429 RATE_LIMIT` (10 códigos cada
  15 min) y cualquier otro → `createFailed` / `revokeFailed` / `loadFailed`, por código, nunca
  `error.message` (§7.1).
- **Entrada:** en el AppShell (navegación de escritorio y teléfono) y en `/app/perfil`. Se llega con `/app/entrar?next=/app/conectar-claude` desde la página pública `/app/claude`.
- Ruta: `conectar-claude`, no `claude` (reservada para la página pública, §4.9).

### 4.9 Página pública `/app/claude` (revisión 2, D7)

Hoy es un documento con formato legal (`components/legal/docs/claude.{es,en}.tsx` en `LegalShell`).
Se cambia por una página de marketing y de cómo usarlo.

> **Diseño de referencia:** el lienzo «Centavos en Claude — página /app/claude»
> (<https://claude.ai/artifact/7ajMSNMZuRDmSgp5zANPQy>), **pendiente de aprobación del dueño**. No
> se implementa hasta que esté aprobado. Si el lienzo y este documento no coinciden, el lienzo
> manda en lo visual y este documento en lo que se promete.

- **Secciones, en orden:**
  1. Encabezado con «Entrar».
  2. Hero con conversación de ejemplo.
  3. Dónde funciona (web, escritorio, iPhone y Android).
  4. Ejemplos: Anotar, Preguntar, Organizar.
  5. Cómo conectarlo en tres pasos, con el paso 2 en dos pestañas: «En la app» y «En la web».
  6. Bloque oscuro «Tu cuenta, bajo tu control».
  7. Planes: Gratis y Centavos+.
  8. Preguntas frecuentes.
  9. Llamada final con «Crear cuenta gratis».
  10. Pie.
- **Lo que no puede prometer** (se revisa contra el API al implementar):
  - Límites: los de la lista fija de Centavos+ (`centavos.api/src/lib/premium-config.ts`): gratis
    ve este mes y los dos anteriores; Centavos+, todo el historial. **El texto actual («30 gastos
    cada 30 días») ya es falso** desde `feat/mcp-no-free-limits`.
  - El código sirve una vez y vence en 10 minutos.
  - El aviso de conexión hoy es solo push. «Te avisamos» vale para quien tiene la app; para quien
    no, hasta que exista el correo de aviso (#20) el texto dice dónde ver y cortar las conexiones.
  - «Búscalo en el directorio» solo cuando el conector esté publicado ahí.
  - Nada sobre Claude que no venga de su documentación (planes, dónde funciona).
- **Bilingüe**, con `copy.ts` tipado por idioma (español como fuente). Las preguntas frecuentes
  alimentan JSON-LD `FAQPage`, como la home.
- **SEO:** sigue indexable y en el sitemap, con el mismo `PATH`, canonical y alternates de hoy. El
  directorio de conectores de Claude enlaza aquí como documentación del conector, así que la
  página no cambia de URL.
- La sección de la home (`components/home/copy.tsx`, `ai`) deja de decir «Próximamente» y enlaza a
  esta página el día que se encienda el conector (pregunta 17).

---

## 5. Inicio de sesión paso a paso

> **Importante:** «entrar con correo» en Centavos es **correo + contraseña**. El código de 6
> dígitos que llega por correo sirve para **verificar una cuenta nueva** y para **recuperar la
> contraseña**, nunca para entrar sin contraseña.

Rutas base: `${NEXT_PUBLIC_API_URL}/api/auth/*`. Todas son `POST` con JSON, sin `Authorization`.
Mientras una petición está en curso, el botón queda deshabilitado (no se envía dos veces).

### 5.1 Correo y contraseña — `POST /api/auth/login`

```
→ { email, password }                       // la API recorta y pasa a minúsculas el correo
← 200 { accessToken, refreshToken, user: { id, name, email, currency, onboarded } }
← 401 AUTH_INVALID_CREDENTIALS              // correo desconocido, sin contraseña (solo Google/Apple) o contraseña mal
← 403 AUTH_EMAIL_UNVERIFIED { error: { code, message, userId, signupToken? } }
← 400 VALIDATION { fields } · 400 BAD_JSON · 429 RATE_LIMIT
```

- 200: abre la sesión (§6) y sigue con §5.8.
- **403 `AUTH_EMAIL_UNVERIFIED`:** la cuenta existe pero no está verificada, y la contraseña
  coincide con un intento de registro vivo. **Revisión 2:** se pasa al paso Verificar (Apéndice A)
  en la misma pantalla. `error.userId` y `error.signupToken` viven solo en el estado del componente.
  - Se pasa a Verificar con `email`,
    `error.userId` y `error.signupToken`. **El `signupToken` es nuevo**: el anterior ya no sirve.
    Puede faltar en cuentas viejas; entonces `verify` y `resend` se llaman sin él. El correo no se
    reenvía solo: la persona pulsa «Reenviar código», como en la app.
- Límites: 20 por minuto por IP y 10 cada 15 minutos por correo.

### 5.2 Crear cuenta y verificar el correo — **en la v1 desde la revisión 2**

> Contrato del Apéndice A, que la revisión 2 mete en la v1.

**Crear** — `POST /api/auth/signup`:

```
→ { name, email, password }      // name 1–100, email ≤ 254 con formato, password 8–72
← 201 { userId, signupToken, message }                  // producción: se mandó un código
← 201 { userId, emailVerified: true, message }          // solo desarrollo con AUTH_AUTO_VERIFY_EMAIL=true
← 409 AUTH_EMAIL_TAKEN · 400 VALIDATION { fields } · 429 RATE_LIMIT
```

- 201 con `signupToken`: pasa a Verificar con `{ email, userId, signupToken }`.
- 201 con `emailVerified: true` (solo en local): no hay código. Llama `login` con el mismo correo y
  contraseña y sigue con §5.8.
- 409: error en el campo correo (`errors:AUTH_EMAIL_TAKEN`) y regreso al paso 1.
- `VALIDATION` con `fields`: si es `fields.email`, al paso 1 con el mensaje en el campo; si es
  `fields.password`, al paso 2; el resto, como error del formulario. Los mensajes de `fields`
  vienen en inglés desde la API: se muestra `errors:VALIDATION` o el mensaje local del campo
  (`auth:validation.*`), nunca el texto crudo.
- Límites: 10 por minuto por IP, 5 por hora por correo, y 5 códigos por hora por cuenta.

**Verificar** — `POST /api/auth/verify`:

```
→ { userId, code, signupToken? }      // code: 6 caracteres; signupToken solo si se tiene
← 200 { accessToken, refreshToken, user: { id, name, email, currency, createdAt, onboarded } }
← 400 AUTH_CODE_NOT_FOUND | AUTH_CODE_EXPIRED | AUTH_CODE_INVALID | AUTH_CODE_TOO_MANY_ATTEMPTS
← 429 AUTH_CODE_LOCKED | RATE_LIMIT · 400 VALIDATION
```

- 200: **usa directamente los tokens de esta respuesta** para abrir la sesión, y sigue con §5.8.
  (La app móvil los descarta y vuelve a llamar `login` con la contraseña guardada en memoria. En
  la web no hace falta tener la contraseña en memoria: la respuesta ya trae la sesión.)
- El código vence a los 10 minutos y aguanta 5 intentos. Con 20 fallos en 24 h la cuenta se
  bloquea (`AUTH_CODE_LOCKED`, 429): **ese 429 no es un `RATE_LIMIT`** y tiene su propio mensaje.

**Reenviar** — `POST /api/auth/resend`:

```
→ { userId, signupToken? }
← 200 { message }
← 429 RATE_LIMIT (menos de 60 s, o 5 códigos en la hora) · 429 AUTH_CODE_LOCKED
← 400 AUTH_EMAIL_ALREADY_VERIFIED · 400 AUTH_CODE_NOT_FOUND · 404 AUTH_USER_NOT_FOUND
```

- Un `RATE_LIMIT` en el reenvío se muestra con `errors:RATE_LIMIT_RESEND` («Espera 60 segundos
  para pedir otro código.»), igual que la app (`translateError` con pantalla de reenvío).
- `AUTH_EMAIL_ALREADY_VERIFIED`: se manda a `/app/entrar` con el correo en `prefillEmail` y ese
  mensaje.

### 5.3 Recuperar la contraseña — **en la v1 desde la revisión 2**

> Contrato del Apéndice A, que la revisión 2 mete en la v1. Ojo: `reset-password` **revoca todas
> las sesiones** de la persona, la de la web y la de la app, **y todas sus conexiones de Claude**
> (`revokeAllGrants`). Tras recuperar la contraseña hay que volver a conectar Claude, y la pantalla
> final lo dice (copy nuevo, §9.3).

1. `POST /api/auth/forgot-password` `{ email }` → **siempre 200** con el mismo cuerpo, exista o no
   la cuenta. Puede no mandar código (límite de 3 por hora por correo, 60 s entre códigos, cuenta
   bloqueada o no verificada) y responder igual. La UI pasa al paso 2 siempre. Solo
   `VALIDATION` y el `RATE_LIMIT` por IP (10 por minuto) son errores.
2. `POST /api/auth/verify-reset-code` `{ email, code }` → 200 `{ resetToken }` (un JWT que dura
   10 minutos). Errores: `AUTH_RESET_CODE_NOT_FOUND`, `AUTH_RESET_CODE_EXPIRED` (el código dura 15
   minutos), `AUTH_RESET_CODE_INVALID`, `AUTH_RESET_CODE_TOO_MANY_ATTEMPTS` y
   `AUTH_RESET_CODE_LOCKED` (429).
3. `POST /api/auth/reset-password` `{ resetToken, newPassword }` → 200
   `{ accessToken, refreshToken, user: { id, name, email, currency } }`. **Revoca todas las demás
   sesiones** de la cuenta, incluidas las del teléfono y las conexiones con Claude. Abre la
   sesión y sigue con §5.8. Este `user` **no trae `onboarded`**: se trata como «ya configurado»
   hasta que llegue `GET /me`. Error: `AUTH_RESET_TOKEN_INVALID` (vencido o repetido), que vuelve
   al paso 1.

### 5.4 Google en la web

**Qué hace falta**

- Un cliente OAuth de tipo **Web application** en Google Cloud. Su client ID va en
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, la misma variable que ya usa `/canjear`.
- En ese cliente, **Authorized JavaScript origins**: `https://centavos.mx`, y para local
  `http://localhost` **y** `http://localhost:<puerto>`. Google pide los dos. El flujo de botón con
  callback **no usa redirect URIs**.
- Ese client ID tiene que estar en **`GOOGLE_CLIENT_IDS` de la API**, porque la API valida el `aud`
  del token contra esa lista. La app móvil configura el SDK nativo con un `webClientId`
  (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`), y es probable que sea el mismo cliente y que ya esté en
  la lista de producción. **⚠️ verificar** (pregunta 5 de la §16). En local `GOOGLE_CLIENT_IDS`
  está vacío y `/auth/google` responde `503 GOOGLE_AUTH_DISABLED`.

**Flujo**

1. Se reutiliza `components/canjear/GoogleButton.tsx`, agregándole una prop `text` (por defecto
   `"signin_with"`, para no cambiar `/canjear`). La app web usa `text: "continue_with"`, que es
   el texto que trae la app («Continuar con Google» / «Continue with Google»), y `locale` según el
   idioma (`es` o `en`).
2. GIS entrega `credential` (el ID token) en el callback. Se manda a `POST /api/auth/google`:

```
→ { idToken }
← 200 (cuenta existente) | 201 (cuenta nueva) { accessToken, refreshToken, isNewUser, user: { id, name, email, currency, onboarded } }
← 401 AUTH_GOOGLE_TOKEN_INVALID · 403 AUTH_GOOGLE_EMAIL_UNVERIFIED · 409 AUTH_GOOGLE_ACCOUNT_CONFLICT
← 503 GOOGLE_AUTH_DISABLED · 429 RATE_LIMIT (20/min por IP)
```

3. Sigue con §5.8. Es un solo endpoint para entrar y para registrarse: si el correo ya tiene
   cuenta verificada, la liga; si no, crea una cuenta sin contraseña.

**Detalles**

- Si el script de Google está bloqueado o no carga, el botón no aparece y el formulario de correo
  sigue funcionando (es lo que ya hace `GoogleButton`).
- `GoogleButton` deshabilitado = `pointer-events: none` y opacidad. Así se cumple «deshabilitado
  sin términos» en el paso 1 de crear cuenta.
- El flujo FedCM del botón es opcional (`use_fedcm_for_button`, apagado por defecto). No se
  activa en la v1.
- **No** se agrega `Cross-Origin-Opener-Policy: same-origin` a `/app/*`: rompe la ventana de
  Google. Si algún día se pone COOP, tiene que ser `same-origin-allow-popups`.
- **Referrer-Policy:** el sitio manda `strict-origin-when-cross-origin` en todo. Google pide
  `Referrer-Policy: no-referrer-when-downgrade` cuando se prueba en `http` y `localhost`. Si el
  botón falla en local con un error de origen, se pone esa política **solo en desarrollo**
  (condicionada a `NODE_ENV` en `next.config.ts`, como el caché de `/_next/static`).
- Al cerrar sesión: `google.accounts.id.disableAutoSelect()` (§5.7).

### 5.5 Apple en la web

> Confirmado en la documentación de Apple (noviembre de 2026):
> - <https://developer.apple.com/documentation/signinwithapple/configuring-your-webpage-for-sign-in-with-apple>:
>   la Return URL no puede ser `localhost` ni una IP; `user` llega solo en la primera
>   autorización; la forma de la respuesta del popup.
> - <https://developer.apple.com/documentation/signinwithapple/authenticating-users-with-sign-in-with-apple>:
>   agrupar la web con la app de iOS.
> - <https://developer.apple.com/help/account/configure-app-capabilities/configure-sign-in-with-apple-for-the-web>:
>   la App ID principal y que ya no hay archivo de verificación.
>
> Lo que sigue marcado **⚠️ verificar** se confirma con una prueba real.

**Qué hace falta (Apple Developer → Certificates, Identifiers & Profiles)**

1. **Un Services ID nuevo**, por ejemplo `mx.centavos.web`, con *Sign in with Apple* activado.
2. **Asociarlo a la App ID principal de la app de iOS** (el bundle `mx.centavos.cuaderno`). Apple
   lo exige («primary App ID»). Agrupada así, Apple trata la web y la app como la misma: quien ya
   autorizó en el iPhone solo ve «continuar» en la web.
3. En su configuración web: **Domains** `centavos.mx` y **Return URLs**
   `https://centavos.mx/app/entrar` (en la v1 es la única pantalla con botón de Apple). Según la ayuda
   actual de Apple ya **no** hace falta subir un archivo de verificación del dominio.
   - **Confirmado:** la Return URL tiene que llevar un nombre de dominio: **no puede ser
     `localhost` ni una IP**, ni llevar `#`. Por eso Apple no se puede probar en `localhost`: se
     prueba en un dominio de preview fijo de Vercel (o con un túnel `https`) agregado como Domain y
     Return URL (pregunta 9 de la §16).
4. **En la API:** agregar el Services ID a `APPLE_CLIENT_IDS` (lista separada por comas,
   `src/lib/apple.ts`). Si falta, el token de la web da `401 AUTH_APPLE_TOKEN_INVALID`.
   `APPLE_TEAM_ID`, `APPLE_KEY_ID` y `APPLE_PRIVATE_KEY` siguen siendo los mismos: la llave de
   Sign in with Apple pertenece a la App ID principal y sirve también para el Services ID agrupado
   (la revocación al borrar la cuenta usa el `aud` del token como `client_id`).
5. **En la landing:** `NEXT_PUBLIC_APPLE_SERVICE_ID` (el botón no aparece si está vacía) y
   `NEXT_PUBLIC_APPLE_REDIRECT_URI` (la Return URL de la página actual; se puede derivar de
   `location.origin + location.pathname` si coincide con una registrada).

**Flujo (modo ventana emergente)**

1. Cargar `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/<locale>/appleid.auth.js`
   solo al mostrar el botón, con `<locale>` = `es_MX` o `en_US` (**⚠️ verificar** que `es_MX` es
   un valor aceptado).
2. Por cada intento:
   - `rawNonce` = 32 bytes aleatorios (`crypto.getRandomValues`) en hex;
   - `hashedNonce` = SHA-256 de `rawNonce` en **hex en minúsculas** (`crypto.subtle.digest`);
   - `state` = otro valor aleatorio.
3. `AppleID.auth.init({ clientId: <Services ID>, scope: "name email", redirectURI, state, nonce: hashedNonce, usePopup: true })`.
4. `const r = await AppleID.auth.signIn()`. Si se resuelve, `r` es
   `{ authorization: { code, id_token, state }, user?: { email, name: { firstName, lastName } } }`;
   si falla, rechaza con `{ error }` (confirmado). Comprobar `r.authorization.state === state`.
   - **Confirmado:** `r.user` llega **solo la primera vez** que esa Apple ID autoriza a Centavos.
     Después, el correo viene solo dentro del token.
   - En modo popup no hay POST a la Return URL (eso es en modo redirección): la respuesta vuelve a
     la página por la promesa. La Return URL tiene que estar registrada igual.
   - **⚠️ verificar:** que Apple copia el `nonce` tal cual al claim `nonce` del token (la
     documentación solo dice que «asocia la sesión del cliente con el ID token»). La API exige que
     ese claim sea el SHA-256 hex del nonce crudo que se le manda (`verifyAppleIdToken`). Es el
     mismo esquema que la app (`apple-auth.ts`: le pasa a Apple el hash y a la API el valor crudo).
     La primera prueba real lo confirma: si no coincidiera, la API respondería
     `401 AUTH_APPLE_TOKEN_INVALID`.
5. Nombre: `[firstName, lastName]` recortados y unidos con espacio. Si existe, se guarda en
   `sessionStorage` (`centavos.apple.pendingName.v1`, la misma clave que la app) **antes** de
   llamar a la API, y se borra solo cuando la API responde 2xx. Si no llega, se usa el pendiente
   de un intento anterior. Así un error de red no hace perder el único nombre que Apple manda.
6. `POST /api/auth/apple`:

```
→ { idToken: r.authorization.id_token, nonce: rawNonce, name? }   // name solo si hay; nunca vacío
← 200 | 201 { accessToken, refreshToken, isNewUser, user: { id, name, email, currency, onboarded, emailHidden } }
← 401 AUTH_APPLE_TOKEN_INVALID · 400 AUTH_APPLE_EMAIL_MISSING · 403 AUTH_APPLE_EMAIL_UNVERIFIED
← 409 AUTH_APPLE_ACCOUNT_CONFLICT · 503 APPLE_AUTH_DISABLED · 429 RATE_LIMIT
```

7. Sigue con §5.8.

**Errores propios del navegador**

- La persona cancela o cierra la ventana: la documentación solo nombra `user_cancelled_authorize`
  (cancelar). Cerrar la ventana suele dar `popup_closed_by_user` (**⚠️ verificar**). Los dos se
  tratan como cancelación: sin mensaje, igual que la app. Cualquier otro `error`, con
  `auth:apple.signIn.genericError`.
- Ventana bloqueada por el navegador: mensaje nuevo «Tu navegador bloqueó la ventana de Apple…»
  (§9.3). `signIn()` se llama directo desde el clic, sin `await` antes, para que el navegador no la
  bloquee.
- El script no carga: el botón no aparece.

**Misma cuenta en el iPhone y en la web.** La API busca primero por `apple_sub`. Si la web
recibiera un `sub` distinto al del iPhone, la persona caería en la rama de correo y obtendría
`409 AUTH_APPLE_ACCOUNT_CONFLICT`. El identificador de Apple es por equipo de desarrollador, así
que el Services ID agrupado con la App ID de iOS debería dar el mismo `sub`. **⚠️ verificar** con
una Apple ID real (criterio de aceptación A-12).

**Botón.** Igual que en la app (`AppleSignInButton` usa un botón propio, no el nativo de Apple): el
logo de Apple en negro o blanco, el texto `auth:apple.signIn.label` («Continuar con Apple»), al
menos tan visible como el de Google y arriba de él, de más de 30 pt de alto, con un radio menor
que la mitad del alto y un texto que nunca se corta. Son las reglas de Apple para botones propios.
En la web no está el glifo U+F8FF del sistema: se usa el logo oficial en SVG de los recursos de
Apple. Se puede usar también el botón que dibuja Apple JS (`<div id="appleid-signin" data-type="continue">`).

### 5.6 Refrescar — `POST /api/auth/refresh`

```
→ { refreshToken }
← 200 { accessToken, refreshToken }            // rota: el refresh token anterior queda revocado
← 401 AUTH_REFRESH_TOKEN_NOT_FOUND | AUTH_REFRESH_TOKEN_REVOKED | AUTH_REFRESH_TOKEN_EXPIRED
```

- El access token dura **15 minutos** y el refresh token **30 días**. **Cada refresh token se usa
  una sola vez.** Si dos refresh compiten con el mismo token, el segundo recibe
  `AUTH_REFRESH_TOKEN_REVOKED`.
- **Cuándo se refresca:** cuando una llamada con sesión responde `401` con `AUTH_INVALID_ACCESS_TOKEN`
  o `AUTH_UNAUTHORIZED`, como en la app (`api.ts`, interceptor). Se refresca y se repite la llamada
  **una sola vez**. Opcionalmente, también un minuto antes del `exp` del JWT (se lee sin verificar).
- **Una sola vez a la vez por pestaña:** una promesa compartida (`refreshInFlight`, como en la app).
- **Quién llama a `/auth/refresh`**, según la opción de §6 (todo va dentro de
  `SessionStore.refresh()`):

  | Opción | El navegador llama a | Con qué token |
  |---|---|---|
  | Fase 0 (memoria) | `POST {API}/api/auth/refresh` | El que guarda en memoria |
  | A | `POST {API}/api/auth/refresh` con `credentials: "include"` y `X-Centavos-Session: cookie` | La cookie de la API (JS no lo ve) |
  | **B** | `POST /api/sesion/refresh` (mismo origen), que llama a la API desde el servidor | La cookie de `centavos.mx` (JS no lo ve) |
  | C | `POST {API}/api/auth/refresh` | El de `localStorage` |

- **Entre pestañas:** el refresh se serializa con Web Locks
  (`navigator.locks.request("centavos-refresh", …)`). Si aun así un refresh recibe
  `AUTH_REFRESH_TOKEN_REVOKED`, **se reintenta una sola vez** antes de cerrar la sesión, porque otra
  pestaña pudo haberlo rotado. En A y B el reintento manda la cookie que ya actualizó la otra
  pestaña (el navegador la pone solo). En C se vuelve a leer `localStorage` antes de reintentar. En
  la fase 0 no hay sesión compartida entre pestañas: cada una tiene la suya.
- El cierre de sesión (y, en C, los tokens nuevos) se avisa a las demás pestañas con
  `BroadcastChannel("centavos-session")`. Al recibirlo, la pestaña borra su access token y manda a
  `/app/entrar`.
- Si el refresh falla de verdad, se cierra la sesión local y se manda a `/app/entrar?next=…` con
  el mensaje del código.
- El refresh **no** devuelve `user`: al restaurar una sesión se llama `GET /me` (§5.8).

### 5.7 Cerrar sesión — `POST /api/auth/logout`

```
→ { refreshToken }         // sin Authorization; la ruta no lo pide
← 200 { message }          // aunque el token no exista o ya esté revocado
```

1. **Revocar**, según la opción (dentro de `SessionStore.logout()`):
   - **B:** `POST /api/sesion/logout` **esperando la respuesta** (con `keepalive: true` y un tope
     de unos 3 s). Esa ruta borra la cookie aunque la llamada a la API falle. Si la petición misma
     no llega (sin red), se guarda la marca `centavos.logoutPending = "1"` en `localStorage` (no es
     un token). Al cargar, `restore()` la ve, llama primero a `/api/sesion/logout` y solo entonces
     la borra. Así recargar nunca revive una sesión que la persona cerró.
   - **A:** igual, con `POST {API}/api/auth/logout`, `credentials: "include"` y el header del modo
     cookie; la API borra su cookie.
   - **C y fase 0:** `POST {API}/api/auth/logout` con `{ refreshToken }` sin esperar la respuesta, y
     se borra el token local (en C, de `localStorage`) en el acto.
2. Se borran el access token, el usuario en memoria y las respuestas en caché.
3. `google.accounts.id.disableAutoSelect()` (si el script está cargado) y se borra
   `centavos.apple.pendingName.v1`.
4. Aviso a las otras pestañas por `BroadcastChannel`.
5. Se manda a `/app/entrar`. La pantalla no espera más que el tope del paso 1.

Si una llamada con sesión responde `PROFILE_USER_NOT_FOUND` (la cuenta ya no existe), se cierra
la sesión de la misma forma, como en la app.

### 5.8 Después de entrar

1. Se guarda la sesión (§6) con el `user` de la respuesta.
2. `GET /api/me` completa el usuario: `imageUrl`, `language`, `emailHidden`, `plan`,
   `createdAt`. Las respuestas de `/auth/*` son mínimas a propósito. Si `/me` falla por red, se
   queda el usuario que ya había.
3. **Cuenta nueva (`onboarded === false`)** *(revisión 2, D6)*. Google, Apple y la verificación
   pueden crear cuentas con `onboarded: false`. Igual que la app, la web manda a `/app/bienvenida`:
   el wizard (`GET /api/onboarding/catalog`, `POST /api/onboarding/apply`, o
   `POST /api/onboarding/skip`), con la moneda y el idioma primero. Lo que se configure en la web ya
   no se repite en la app: `onboarded_at` queda puesto para la cuenta, no para el dispositivo. Solo
   cuenta `onboarded === false`: si falta, se toma como configurada, como en la app.
4. Se navega a `next` (si es válido) o a `/app/pulso`.
5. Si `isNewUser` es true, se puede registrar el evento de analítica `signup_completed` con
   `method: google|apple|password`, sin datos personales.

---

## 6. Sesión y almacenamiento de tokens (Decisión D1)

### 6.1 Lo que no cambia en ninguna opción

- El **access token vive solo en memoria** (en el módulo de sesión), nunca en `localStorage`,
  `sessionStorage`, cookies legibles, la URL ni los logs.
- Las llamadas de datos van **del navegador directo a la API** con `Authorization: Bearer`. La
  API ya responde CORS con `Access-Control-Allow-Origin: *` (en local `CORS_ORIGIN=*`), sin
  credenciales, y `Authorization` está en los headers permitidos.
- Las llamadas de **inicio de sesión** (en la v1: `login`, `google` y `apple`; con el Apéndice A
  también `signup`, `verify`, `resend`, `forgot-password`, `verify-reset-code` y `reset-password`)
  también van directo del navegador a la API. Los límites por IP de la API (`clientIp` lee `do-connecting-ip`, el header del borde de
  DigitalOcean) siguen viendo la IP de cada persona.
- La sesión se maneja en `lib/app/session.ts` con una interfaz única. Así cambiar de opción toca
  un solo archivo:

  ```ts
  interface SessionStore {
    restore(): Promise<{ accessToken: string } | null>;     // al cargar la página
    adopt(tokens: { accessToken: string; refreshToken: string }): Promise<{ accessToken: string }>;
    refresh(): Promise<{ accessToken: string }>;              // lanza ApiError en 401
    logout(): Promise<void>;
  }
  ```

### 6.2 Las opciones (decidido: B)

La tabla queda como registro de por qué se eligió B. Las opciones A y C no se implementan.

| | **A. Cookie puesta por la API** | **B. Cookie del propio sitio (recomendada)** | **C. `localStorage`** |
|---|---|---|---|
| Dónde vive el refresh token | Cookie `HttpOnly` de `api.centavos.mx` | Cookie `HttpOnly` de `centavos.mx`, que escribe una ruta de Next (`/api/sesion/*`) | `localStorage` |
| ¿JavaScript puede leerlo? | Nunca | Solo un instante al entrar; se rota en seguida (ver abajo) | Siempre |
| Cambios en la API | **Sí**: CORS con credenciales y lista de orígenes, modo cookie en 6 endpoints de auth, `Set-Cookie`, refresh y logout leyendo la cookie, y docs (`errors.md`, Postman, doc de feature) | **Ninguno** en el código | Ninguno |
| Límites por IP de la API | Intactos | Intactos (el refresh y el logout de la API no tienen límite por IP) | Intactos |
| Previews de Vercel (`*.vercel.app`) | No funciona: es otro sitio y `SameSite` la bloquea; en preview hay que usar memoria | Funciona (misma origen) | Funciona |
| Local | `localhost:3002` → `localhost:3000` es el mismo sitio y funciona, aunque algún navegador puede rechazar `Secure` en `http` | Funciona | Funciona |
| Riesgo ante XSS | Puede pedir access tokens mientras la página está abierta; no puede llevarse el refresh token | Igual que A, salvo que el XSS ya esté presente justo en el segundo del inicio de sesión | **Se lleva un token que vale 30 días** |
| Contradice reglas existentes | No | No | **Sí**: `/canjear` promete que el token «no va a localStorage, cookies ni a la URL» |

Fase 0, para cualquier opción: **solo memoria**. Los dos tokens viven en memoria y recargar la
página cierra la sesión. Sirve para construir y probar todas las pantallas antes de decidir, y es
lo que se usa en un preview si se elige A.

### 6.3 Opción B en detalle (la elegida)

Rutas de Next (Route Handlers, en Node; `export const dynamic = "force-dynamic"`), todas con
`Cache-Control: no-store`. Las páginas siguen siendo estáticas:

| Ruta | Hace |
|---|---|
| `POST /api/sesion` `{ refreshToken }` | **Traspaso.** Llama de inmediato a `POST {API}/api/auth/refresh` con ese token. Guarda el refresh token **nuevo** en la cookie y devuelve `{ accessToken }`. El token que JavaScript llegó a ver queda revocado en ese momento |
| `POST /api/sesion/refresh` | Lee la cookie, llama a `/api/auth/refresh`, reescribe la cookie y devuelve `{ accessToken }`. Con un 401 de la API borra la cookie y responde 401 con el mismo `code` |
| `POST /api/sesion/logout` | Lee la cookie, llama a `/api/auth/logout` (sin importar si falla), borra la cookie y responde 204 |

- **Cookie:** `__Secure-cv_rt=<token>; Path=/api/sesion; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`
  (30 días, igual que el token). `Path=/api/sesion` hace que no viaje con cada página. Para borrarla,
  el mismo nombre y `Path` con `Max-Age=0`.
- **Contra CSRF:** las tres rutas exigen `Content-Type: application/json` y un header `Origin` igual
  a `NEXT_PUBLIC_SITE_URL` (o al origen de la petición en preview y en local); si no, responden 403.
  Junto con `SameSite=Strict` basta. Las rutas no mandan headers CORS: ningún sitio ajeno puede
  leer la respuesta.
- **Flujo:** inicio de sesión (navegador → API) → `adopt()` → `POST /api/sesion` → access token en
  memoria. Al recargar, `restore()` → `POST /api/sesion/refresh`. Si da 401, no hay sesión.
- **Si el traspaso falla:**
  - **401 de la API** (el token que se entregó ya se usó o está revocado): el inicio de sesión no
    vale. Se descartan los tokens, se muestra `app.sessionEnded` y la persona vuelve a entrar. Si
    un atacante usara primero el token visto, aquí es donde se nota.
  - **Red o 5xx:** se reintenta una vez. Si vuelve a fallar, la pestaña sigue con la sesión **solo
    en memoria** (como la fase 0, con el refresh token en memoria) y no se muestra error. Recargar
    pedirá entrar de nuevo. Se registra en consola en desarrollo.
- **Logout:** ver §5.7.
- **Concurrencia:** las reglas de §5.6 (Web Locks, reintentar una vez con `REVOKED`). Con la
  cookie, el reintento usa la cookie que ya actualizó la otra pestaña.
- **Lo que guarda el navegador en B:** nada secreto. Solo, si un logout no llegó, la marca
  `centavos.logoutPending` (§5.7).
- **La API para estas rutas** es la misma `NEXT_PUBLIC_API_URL`, llamada desde el servidor. Una
  variable `API_URL` solo de servidor es opcional.
- **Riesgo que queda:** un XSS activo mientras la página está abierta puede usar la sesión. Ninguna
  opción lo evita; para eso son las cabeceras de §11.

### 6.4 Opción A en detalle (descartada; solo como registro)

No se implementa. Se deja escrita por si algún día se quiere que la API sea dueña de la sesión. Es trabajo en el repo de la API, con sus reglas: doc de feature, Postman y
`errors.md`.

- Env nueva `WEB_ORIGINS` (lista, por ejemplo `https://centavos.mx,http://localhost:3002`). Para
  una petición cuyo `Origin` esté en la lista, la respuesta (y el preflight `OPTIONS`) llevan
  `Access-Control-Allow-Origin: <ese origin>`, `Access-Control-Allow-Credentials: true` y
  `Vary: Origin`. Para las demás, el `CORS_ORIGIN` actual. Hoy `CORS_HEADERS` es una constante y
  `json()`/`apiError()` no ven la petición, así que hace falta un envoltorio que reescriba los
  headers de la respuesta. El doc de la feature 9 de la API (dashboard de admin) ya evaluó y
  descartó este mismo costo para otra cosa.
- Modo cookie, que se pide con el header `X-Centavos-Session: cookie` desde un origen permitido:
  `login`, `verify`, `google`, `apple`, `reset-password` y `refresh` responden con
  `Set-Cookie: cv_rt=…; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=2592000` (sin
  `Domain`) y **sin** `refreshToken` en el cuerpo. `refresh` y `logout` aceptan el token de la
  cookie cuando el cuerpo no lo trae, y `logout` la borra.
- El header propio fuerza el preflight y, con la lista de orígenes y `SameSite=Strict`, cierra el
  CSRF. `centavos.mx` y `api.centavos.mx` son el mismo sitio, así que Safari no bloquea la cookie.
- El cliente usa `credentials: "include"` solo en esas rutas.

### 6.5 Por qué B (decidido el 20 de noviembre de 2026)

**B.** No toca el código de autenticación de la API. Funciona igual en producción, en previews y
en local. Mantiene los límites por IP. Y gracias a la rotación inmediata del traspaso, el refresh
token que vive 30 días nunca queda al alcance de JavaScript. A es un poco más estricta (la API
nunca pone el refresh token en un cuerpo), pero cuesta CORS con credenciales y cambios en el núcleo
de auth. C no se recomienda.

**Vida de la sesión:** 30 días, como la app. Una computadora compartida pide «cerrar sesión al
cerrar el navegador» (una cookie de sesión, sin `Max-Age`). Queda como pregunta 13 de la §16.

---

## 7. Endpoints de datos (v1)

### 7.1 Cliente: `lib/app/api.ts`

- Base `${NEXT_PUBLIC_API_URL}/api`. Sin la variable, la app web muestra `app.unavailable`.
- `fetch` con `accept: application/json`, `content-type` solo cuando hay cuerpo, y
  `credentials: "omit"` (salvo las rutas de la opción A, si se elige).
- `Authorization: Bearer <access>` en las rutas con sesión. Refresh y reintento como en §5.6.
- Error tipado:

  ```ts
  class ApiError extends Error {
    status: number;               // 0 = sin respuesta (red, CORS)
    code: string;                 // el error.code de la API, o "NETWORK" | "UNKNOWN"
    fields?: Record<string, unknown>;
    userId?: string;              // AUTH_EMAIL_UNVERIFIED
    signupToken?: string;         // AUTH_EMAIL_UNVERIFIED
  }
  ```

  **Lee el `code` también en los 429**: `RATE_LIMIT`, `AUTH_CODE_LOCKED` y
  `AUTH_RESET_CODE_LOCKED` son cosas distintas. Un cuerpo que no es JSON o un 5xx sin código se
  vuelve `UNKNOWN`.
- **Nunca se muestra `error.message`** (está en inglés): el texto sale del código (§10), como en la
  app (`translateError`).
- Los tipos se copian de `centavos-app/src/lib/api.ts` (`Budget`, `BudgetsResponse`,
  `BudgetDetailResponse`, `BudgetSettlement`, `Expense`, `ExpensesResponse`, `Subscription`,
  `SubscriptionsResponse`, `Pagination`, `PulseResponse`, `AuthUser`) y se comparan con §7.3.

### 7.2 Parámetros comunes

- `timezone`: siempre, en `pulse`, `expenses`, `budgets`, `budgets/:id` y `subscriptions`. Es el
  IANA del navegador. Un valor inválido da `400 VALIDATION`.
- Paginación: `limit` y `offset`. La respuesta trae `pagination: { total, limit, offset }`.
- `month` y `year` van **juntos** o no van (`400 VALIDATION` si va solo uno). `month` de 1 a 12,
  `year` de 2000 a 2100.
- Fechas `from` y `to` en `YYYY-MM-DD`, leídas en `timezone`.
- Límite por persona: 120 peticiones por minuto por recurso (`429 RATE_LIMIT`). Hay que evitar
  ráfagas, por ejemplo al escribir en la búsqueda.

### 7.3 Endpoints y respuestas (confirmadas en el código de la API)

| Endpoint | Pantalla | Respuesta |
|---|---|---|
| `GET /api/me` | Todas (usuario), Perfil | `{ id, name, email, currency, imageUrl?, createdAt, onboarded, language, emailHidden, plan, planStatus, planInterval?, planExpiresAt?, planPeriodType?, promoExpiresAt?, trialConsumedAt?, trialEligible }` (`routes/profile.ts` → `mapUser`) |
| `GET /api/pulse?timezone=` | Pulso | `{ status: "green"\|"yellow"\|"red", spentToday, spentLast7, spentThisWeek, spentThisMonth, totalBudget, totalSpent, subscriptionsMonthly, recentExpenses: [{ id, amount, category, note?, date, imageCount }], budgets: [{ id, name, category?, monthly: number\|null, currency, imageUrl?, spent }] }` (`lib/pulse-core.ts`) |
| `GET /api/expenses?period=&from=&to=&category=&notes=&timezone=&limit=&offset=` | Gastos | `{ expenses: Expense[], totalSpent, pagination }`. `totalSpent` es de **todo** el filtro. Las pestañas mandan `period=today\|7d\|30d` (gana sobre `from`/`to`); Año manda `from`/`to`. Con Centavos+ y búsqueda, sin periodo (todo el historial), como la app. `limit=100` como la app (máximo 500) (`lib/expenses-core.ts`) |
| `GET /api/budgets?month=&year=&timezone=&limit=&offset=` | Presupuestos | `{ budgets: Budget[], totalOfBudgets, totalSpent, totalRemaining, pagination }`. Los totales cubren **todos** los presupuestos de la persona: solo los con límite y en la misma moneda. `shared=true\|false` filtra. `limit` por defecto 50, máximo 200 (`lib/budgets-core.ts`) |
| `GET /api/budgets/:id?month=&year=&timezone=&limit=&offset=` | Detalle | `{ budget: Budget, expenses: Expense[], totalExpensesCount, pagination, settlements: BudgetSettlement[] }`. `404 BUDGET_NOT_FOUND` si no existe, no es de la persona o el id no es UUID (`routes/budgets.ts`) |
| `GET /api/subscriptions?timezone=&limit=&offset=` | Suscripciones | `{ subscriptions: Subscription[], activeSubscriptions, projectedMonthlyCost, projectedYearlyCost, pagination }`. Los totales cubren todas las activas. `limit` por defecto 50, máximo 200 (`routes/subscriptions.ts`) |
| `GET /api/categories` | Todas | `{ categories: [{ key, label, emoji }] }`. Es pública y estática, `label` solo en español, `other` al final. Se pide una vez por sesión |

Formas de los objetos (de los mapeadores de la API):

```ts
Budget  = { id, name, category?, monthly: number | null, currency, imageUrl?, spent,
            role?: "admin" | "member", shared?: boolean, frozen?: boolean }
Expense = { id, amount, category, note?, date /* ISO */, budgetId?, source?: "app" | "claude",
            imageCount?, createdBy?, payerId?, splitKind?, yourShare?, hasInstallments,
            installmentPlanId?, currentInstallment?, totalInstallments?, installmentFrequency? }
Subscription = { id, name, emoji, amount, frequency: "monthly" | "yearly", nextCharge /* ISO */,
                 category, note?, active, history: [{ id, date, amount }] }
```

- En un presupuesto compartido, quien responde por el gasto es `payerId` (`createdBy` solo dice
  quién lo anotó). La v1 no dibuja nombres de miembros: muestra `yourShare` si viene.
- `monthly: null` = presupuesto sin límite: no entra en los totales ni en el `status`.

### 7.4 Endpoints que la v1 **no** usa

Cualquier `POST`, `PATCH` o `DELETE` fuera de `/api/auth/*`; `/api/onboarding/*`;
`/api/expenses/:id` (sin detalle de gasto en la v1); `/api/goals`, `/api/friends*`,
`/api/me/budget-invites`, `/api/budgets/:id/{members,balances}`, `/api/releases`,
`/api/me/notifications` y `/api/me/devices` (no hay push en la web). *Revisión 2:* sí usa
`/api/onboarding/*` (D6) y `/api/me/connections*` (D5).

---

## 8. Cambios en la API

Con la **opción B** (la decidida, D1) no hay cambios de código. Lo que sí hace falta, en
configuración y docs:

| Qué | Dónde | Detalle |
|---|---|---|
| Client ID web de Google en `GOOGLE_CLIENT_IDS` | Env de producción (DigitalOcean) | Confirmar que el `NEXT_PUBLIC_GOOGLE_CLIENT_ID` de Vercel está en la lista (probablemente sí, porque es el `webClientId` de la app). En local, ponerlo en `.env` para probar Google |
| Services ID de Apple en `APPLE_CLIENT_IDS` | Env de producción | Agregarlo junto al bundle de iOS. Actualizar `docs/apple-sign-in-setup.md` (ya anticipa este caso, «Only needed if a web flow is ever added») y la nota de la sección Android de `docs/feature-10-sign-in-with-apple.md` |
| `CORS_ORIGIN` | Env de producción | Hoy tiene que ser `*` o el origen del sitio, porque `/canjear` ya llama desde el navegador. Confirmar el valor. Si en producción es `https://centavos.mx`, los previews de Vercel no pueden llamar a la API de producción |
| Doc | Repo de la API | Agregar una fila a `docs/feature-status.md` con el siguiente número libre y un doc corto `feature-<N>-web-app.md` que apunte a este archivo y liste los envs. (Consulta la skill `docs-naming` del repo) |

Con la **opción A**, además, todo lo de §6.4 en código, y como cambia el contrato de endpoints: la
colección de Postman (variante con cookie en la carpeta Auth) y `docs/errors.md` (el
comportamiento del modo cookie, y `AUTH_REFRESH_TOKEN_NOT_FOUND` cuando no hay cookie).

En ningún caso hacen falta endpoints nuevos para leer datos: los de §7.3 alcanzan.

**Revisión 2, en el repo de la API** (su propia sesión; ningún endpoint nuevo):

| Qué | Dónde | Detalle |
|---|---|---|
| La página de conexión de Claude dice «Abre Centavos en tu teléfono…» | `src/lib/consent-page.ts` | **Hecho** (`feat/mcp-no-free-limits`): dice «en la app o en centavos.mx/app → Conectar con Claude», en es y en, **sin enlace**: la página corre dentro de la ventana de inicio de sesión de Claude, y seguir un enlace ahí perdería la conexión |
| El push de nueva conexión dice «Desconéctalo en Perfil» | `src/lib/connector-notice.ts` | **Hecho:** «Desconéctalo en la app o en centavos.mx/app» |
| `MCP_ALLOWED_USERS` | Env de producción | Una cuenta creada en la web no está en ninguna lista: hasta `MCP_ALLOWED_USERS=*`, `/app/conectar-claude` muestra `notAvailable` (lo dice `available`) |
| #20 | `docs/feature-20-claude-without-app.md` | Con D2 y D5, el código por correo en la página de Claude deja de ser necesario para lanzar. Marcarlo como posterior y apuntar a este doc |
| Doc de la app web | `docs/feature-status.md` | **Hecho:** #21, `docs/feature-21-web-app.md` |

---

## 9. Idioma y copy

### 9.1 Cómo se decide el idioma en `/app/*` de la app web

En este orden:

1. `?lang=es|en` en la URL. Gana siempre y se guarda en la cookie `lang` (la misma de la landing,
   un año, `SameSite=Lax`).
2. La cookie `lang`.
3. Con sesión: `user.language` de `GET /me`, si es `es` o `en`.
4. `navigator.languages` (el primero que sea `es` o `en`).
5. `es`.

- Las páginas son estáticas y el idioma se decide en el cliente. Para no tener un desajuste de
  hidratación, el texto se dibuja después de montar: antes hay un esqueleto neutro (y las
  pantallas con datos ya tienen esqueleto). `document.documentElement.lang` = `es-MX` o `en`
  (`HTML_LANG` de `lib/lang.ts`).
- Al navegar dentro de la app web no hace falta arrastrar `?lang=`: la cookie basta.
- El selector de idioma de `/app/perfil` escribe la cookie y cambia el idioma al momento. **No**
  hace `PATCH /me` en la v1.
- Los enlaces de la landing hacia `/app/entrar` llevan `?lang=en` cuando la landing está en
  inglés: agregar esa ruta a `BILINGUAL_PATHS` en `lib/lang.ts`. Revisado en
  `origin/main`: `BILINGUAL_PATHS` solo lo usa `navHref` (Header, AppFooter, HomePage, CalcShell,
  SignupCard, GastosHormigaCalculator). No lo leen el sitemap, ni los `hreflang`, ni el selector de
  idioma, así que agregarlas no las indexa.

### 9.2 Copy reutilizado de la app (literal)

**Regla:** el texto de la app se copia **tal cual**, con sus claves, de
`centavos-app/src/i18n/locales/{es,en}/*.json` (`origin/main`). Si una clave no existe en la app,
es copy nuevo (§9.3) y se escribe en los dos idiomas a la vez. Se guarda como en el resto del
sitio: `components/app/copy.ts`, tipado `Record<SiteLang, …>`, con el español como fuente.

| Archivo de la app | Claves que usa la web |
|---|---|
| `auth.json` | **v1:** `apple.signIn.*` (`label`, `a11yHint`, `connecting`, `unavailable`, `genericError`), `apple.emailHidden.*`, `google.signIn.*` (`label`, `connecting`, `unavailable`, `genericError`), `fields.email`, `fields.emailPlaceholder`, `fields.password`, `fields.passwordPlaceholder`, `validation.emailRequired`, `validation.emailInvalid`, `validation.passwordRequired`, `signIn.*`, `profile.title`, `profile.currency`, `profile.deleteAccount`. **Solo para el Apéndice A (no se copian en la v1):** `signUp.*`, `verify.*`, `forgot.*`, `resetCode.*`, `newPassword.*`, el resto de `fields.*` y `validation.*` |
| `errors.json` | Todas las de §10 |
| `common.json` | `actions.retry`, `actions.back`, `or`, `genericError`, `stepProgress`, `fields.showPassword`, `fields.hidePassword`, `dates.today`, `dates.yesterday`, `tabs.pulse`, `tabs.expenses`, `tabs.budgets`, `tabs.subscriptions`, `loading`. (**No** `apiUrlMissing`: nombra una variable de Expo; la web usa `app.unavailable`) |
| `home.json` | `greeting`, `loadFailed`, `emptyEyebrow`, `emptyTitle`, `emptyBody`, `availableThisMonth`, `ofBudgeted`, `progressA11y`, `spentSoFar`, `onlyCurrency`, `status{Green,Yellow,Red}{Line,Sub}`, `spentA11y`, `tileToday`, `tileWeek`, `tileMonth`, `budgetsKicker`, `budgetsHeading`, `recentKicker`, `recentHeading` |
| `budgets.json` | `listTitle`, `emptyTitle`, `emptyBody`, `emptyPersonal`, `emptyPersonalBody`, `emptyShared`, `emptySharedBody`, `tabPersonal`, `tabShared`, `available`, `overspent`, `onlyCurrencyTotal`, `limitlessExcluded`, `readOnly`, `shared`, `rowA11y*`, `list.*` (grupos, `ofCap`, `leftLabel`, `overBy`, `spentThisMonth`, `perDayLine_*`, `daysLeft_*`, `msgOverOne`, `msgOverMany`, `allFine`), `edit.noLimit`, `detail.*` (`daysLeft_*`, `spentThisMonth`, `movementsCount_*`, `usedPct`, `statSpent`, `statBudget`, `pace`, `pace_ahead`, `pace_onTrack`, `pace_under`, `ringA11y`, `overBy`, `nearLimit`, `readOnlyNote`, `monthExpensesCount`, `noExpensesThisMonth`, `notFound`, `maybeDeleted`, `loadFailed`) |
| `expenses.json` | `history.kicker`, `history.title`, `history.searchPlaceholder`, `history.searchA11y`, `history.clearSearch`, `history.category`, `history.filterByCategory`, `history.allCategories`, `history.count_*`, `history.emptyTitle`, `history.emptyBody`, `history.noResults`, `history.loadFailed`, `range.*` (incluye `total*`), `search.allHistory`, `search.unlockAll`, `photoCount_*` |
| `subscriptions.json` | `kicker`, `title`, `activeCount_*`, `monthlyTotal`, `thisWeek`, `group.week`, `group.month`, `group.later`, `chargedToday`, `chargedTomorrow`, `chargedInDays_*`, `detail.annual`, `perMonthShort`, `perYearShort`, `cancelledToggle`, `cancelledOne`, `rowA11y`, `rowA11yCancelled`, `periodMonth`, `periodYear`, `emptyTitle`, `emptyBody` |
| `common.json` (además de lo anterior) | `installment.weekly`, `installment.monthly` (para `installmentLabel`), `nothingHere`, `months.sheetTitle` |
| `settings.json` | `rows.signOut`, `language.title` |
| `categories.json` | Todas (14 claves: `food` … `other`). **La etiqueta de la categoría sale de aquí, no de la API** |

Muestra literal de lo central (es / en):

| Clave | es | en |
|---|---|---|
| `auth:signIn.title` | Hola de nuevo | Welcome back |
| `auth:signIn.submit` | Entrar | Log in |
| `auth:signIn.forgot` | ¿Olvidaste tu contraseña? | Forgot your password? |
| `auth:signIn.noAccount` + `createFree` | ¿Aún no tienes cuenta? Créala gratis | Don't have an account yet? Create one free |
| `auth:apple.signIn.label` | Continuar con Apple | Continue with Apple |
| `auth:google.signIn.label` | Continuar con Google | Continue with Google |
| `settings:rows.signOut` | Cerrar sesión | Log out |

Los plurales (`_one` / `_other`) se resuelven con `Intl.PluralRules` del idioma. Las
interpolaciones `{{x}}` se reemplazan con una función pequeña; no hace falta i18next.

### 9.3 Copy nuevo, solo de la web (es / en)

| Clave | es | en |
|---|---|---|
| `app.useAppToEdit` | Para anotar o editar, usa la app. | To log or edit, use the app. |
| `app.copyLink` | Copiar enlace | Copy link |
| `app.copiedLink` | Enlace copiado | Link copied |
| `app.claudeReconnect` | Por seguridad, cambiar tu contraseña desconectó Claude. Vuelve a conectarlo en Conectar con Claude. | For your security, changing your password disconnected Claude. Connect it again from Connect to Claude. |
| `app.nav.connectClaude` | Claude | Claude |

*(Revisión 2: `app.forgotInApp.*`, `app.verifyInApp` y `app.onboardingPending.*` se retiraron; la
web hace esos flujos. `app.copyLink` reemplaza el «Compartir enlace» de la app, que en la web no
tiene hoja de compartir.)*
| `app.emptyCta` | Anótalo desde la app | Log it from the app |
| `app.emptyCtaBudget` | Créalo desde la app | Create it in the app |
| `app.emptyCtaSubscription` | Agrégalas desde la app | Add them in the app |
| `app.seeAll` | Ver todos | See all |
| `app.yearLocked` | El año completo es de Centavos+. Actívalo desde la app. | The full year is part of Centavos+. Turn it on in the app. |
| `app.monthsLocked` | Los meses anteriores son de Centavos+. Actívalo desde la app. | Earlier months are part of Centavos+. Turn it on in the app. |
| `app.settlements` | Pagos registrados | Recorded payments |
| `app.settlementLine` | {{from}} le pagó a {{to}} | {{from}} paid {{to}} |
| `app.settlementsInApp` | Para registrar un pago o ver saldos, usa la app. | To record a payment or see balances, use the app. |
| `app.planPremium` | Centavos+ | Centavos+ |
| `app.planFree` | Gratis | Free |
| `app.language` | Idioma | Language |
| `app.notFound` | No encontramos esta página. | We couldn't find this page. |
| `app.network` | No pudimos conectar. Revisa tu internet e inténtalo de nuevo. | We couldn't connect. Check your connection and try again. |
| `app.sessionEnded` | Tu sesión terminó. Vuelve a entrar. | Your session ended. Please log in again. |
| `app.applePopupBlocked` | Tu navegador bloqueó la ventana de Apple. Permite las ventanas emergentes de centavos.mx e inténtalo de nuevo. | Your browser blocked the Apple window. Allow pop-ups for centavos.mx and try again. |
| `app.unavailable` | La app web no está disponible por ahora. | The web app isn't available right now. |
| `app.skipToContent` | Saltar al contenido | Skip to content |
| `app.nav` | Navegación principal | Main navigation |

Si al implementar sale otra frase nueva, se agrega a esta tabla y a `copy.ts` **en los dos
idiomas en el mismo cambio**.

---

## 10. Errores y estados

El texto de cada código sale de `errors:<CODE>` (de la app, §9.2). La columna «UI» dice qué hace la
pantalla.

| Código (status) | Dónde | UI |
|---|---|---|
| `VALIDATION` (400) | Cualquiera | Con `fields`: el mensaje local en el campo. Sin `fields`: `errors:VALIDATION` en el formulario |
| `BAD_JSON` (400) | Cualquiera | `errors:BAD_JSON` (es un bug del cliente: registrar en consola en desarrollo) |
| `RATE_LIMIT` (429) | Cualquiera | `errors:RATE_LIMIT`. (En el reenvío de código del Apéndice A sería `errors:RATE_LIMIT_RESEND`.) |
| `AUTH_INVALID_CREDENTIALS` (401) | login | Error del formulario. Se conserva el correo y se borra la contraseña |
| `AUTH_EMAIL_UNVERIFIED` (403) | login | Pasa al paso Verificar con el `userId` y el `signupToken` del error (§5.1, Apéndice A) |
| *Apéndice A:* `AUTH_EMAIL_TAKEN` (409) | signup | Error en el campo correo, paso 1 |
| *Apéndice A:* `AUTH_EMAIL_ALREADY_VERIFIED` (400) | resend | A `/app/entrar`, con el correo prellenado (`prefillEmail`, nunca en la URL) y el mensaje |
| *Apéndice A:* `AUTH_USER_NOT_FOUND` (404) | resend | `auth:verify.noAccount` y volver a crear cuenta |
| *Apéndice A:* `AUTH_CODE_NOT_FOUND` / `EXPIRED` / `INVALID` / `TOO_MANY_ATTEMPTS` (400) | verify | Mensaje bajo el código; se borra el código. Con `EXPIRED` o `TOO_MANY_ATTEMPTS`, se destaca «Reenviar código» |
| *Apéndice A:* `AUTH_CODE_LOCKED` (429) | verify, resend | Mensaje. Se deshabilitan verificar y reenviar |
| *Apéndice A:* `AUTH_RESET_CODE_*` (400) / `AUTH_RESET_CODE_LOCKED` (429) | verify-reset-code | Mensaje del código (`errors:AUTH_RESET_CODE_*`) bajo el código. `auth:resetCode.invalid` solo si el error no viene de la API |
| *Apéndice A:* `AUTH_RESET_TOKEN_INVALID` (400) | reset-password | Mensaje y vuelta al paso 1 de recuperar |
| `GOOGLE_AUTH_DISABLED` (503) | google | Mensaje en el formulario |
| `AUTH_GOOGLE_TOKEN_INVALID` (401) / `AUTH_GOOGLE_EMAIL_UNVERIFIED` (403) / `AUTH_GOOGLE_ACCOUNT_CONFLICT` (409) | google | Mensaje en el formulario |
| `APPLE_AUTH_DISABLED` (503) | apple | Mensaje en el formulario |
| `AUTH_APPLE_TOKEN_INVALID` (401) / `AUTH_APPLE_EMAIL_MISSING` (400) / `AUTH_APPLE_EMAIL_UNVERIFIED` (403) / `AUTH_APPLE_ACCOUNT_CONFLICT` (409) | apple | Mensaje en el formulario |
| `AUTH_UNAUTHORIZED` / `AUTH_INVALID_ACCESS_TOKEN` (401) | Rutas con sesión | Refrescar y reintentar una vez (§5.6). No se muestra |
| `AUTH_REFRESH_TOKEN_NOT_FOUND` / `REVOKED` / `EXPIRED` (401) | refresh | Cerrar sesión local y mandar a `/app/entrar?next=` con el mensaje del código (`REVOKED`: reintentar una vez antes) |
| `PROFILE_USER_NOT_FOUND` (404) | `/me` | Cerrar sesión (§5.7) |
| `BUDGET_NOT_FOUND` (404) | detalle | Estado «no encontrado» (§4.6) |
| `NETWORK` (sin respuesta) | Cualquiera | `app.network`. En las pantallas de datos, tarjeta con «Reintentar» |
| `UNKNOWN` / 5xx | Cualquiera | `common:genericError`. En las pantallas de datos, tarjeta con «Reintentar» |
| Popup de Apple cerrado | Apple | Nada |
| Popup de Apple bloqueado | Apple | `app.applePopupBlocked` |
| Script de Google o Apple no carga | Botones | El botón no aparece; el correo sigue funcionando |
| Falta `NEXT_PUBLIC_API_URL` | Todas | `app.unavailable` en lugar de los formularios |

- Los errores del formulario se anuncian con `role="alert"` o `aria-live="assertive"`. Los de los
  campos se ligan con `aria-describedby` y `aria-invalid`.
- Al cambiar de paso, el foco va al título del paso nuevo.

---

## 11. Seguridad y privacidad

- Ningún token en la URL, `localStorage`, `sessionStorage`, logs, Sentry ni analítica (salvo C, si
  se eligiera). Lo único que la app web guarda en el navegador: el nombre pendiente de Apple en
  `sessionStorage` (§5.5, se borra al primer 2xx), la marca `centavos.logoutPending` en
  `localStorage` (§5.7) y la cookie `lang`. Ningún correo en la URL (se usa `prefillEmail`).
- El `signupToken` y el `resetToken` viven solo en el estado del componente.
- La redirección `next` se valida (§4.3).
- Cabeceras extra para `/app/:path*` en `next.config.ts` (sin tocar las de `/app/terminos` y las
  otras páginas legales; se puede filtrar con `has`/`missing` o listar las rutas de la app web):
  - `X-Frame-Options: DENY` (o `Content-Security-Policy: frame-ancestors 'none'`);
  - Una `Content-Security-Policy`. Las fuentes de Google se toman de la sección «Content
    Security Policy» de su guía
    (<https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid>), que pide
    entradas en `script-src`, `frame-src`, `connect-src` **y `style-src`**. Las de Apple, de
    `appleid.cdn-apple.com` y `appleid.apple.com`. Se agregan la API (`connect-src`), el host de
    imágenes de la API (`img-src`) y Vercel Analytics, más `object-src 'none'`,
    `base-uri 'self'` y `form-action 'self'`. Esta lista **no** está probada: se arma al
    implementar y se publica primero como `Content-Security-Policy-Report-Only`, revisando la
    consola en entrar, Google, Apple y cada pantalla. Next mete scripts en línea y quitar
    `'unsafe-inline'` exige nonces y páginas dinámicas: queda para después (pregunta 12 de la §16).
  - **No** poner `Cross-Origin-Opener-Policy: same-origin` (§5.4).
- Analítica (Vercel): solo vistas de página y eventos sin datos personales. No mandar ids de
  presupuestos ni montos.
- `GoogleButton` y Apple JS se cargan solo en las pantallas de acceso, no en las de datos.

---

## 12. Desarrollo local

- **Puertos:** la API usa `3000` (`PORT=3000` en su `.env`) y `next dev` también usa 3000 por
  defecto. La landing corre en **3002**: `bun run dev -- -p 3002`, y se agrega la configuración
  `centavos-dev-app` (puerto 3002) en `.claude/launch.json`. El 3001 ya es `centavos-prod`.
- **`.env.local` de la landing:** `NEXT_PUBLIC_SITE_URL=http://localhost:3002`,
  `NEXT_PUBLIC_API_URL=http://localhost:3000`, `NEXT_PUBLIC_WEB_APP_ENABLED=true`, y opcionalmente
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_SERVICE_ID` y `NEXT_PUBLIC_APPLE_REDIRECT_URI`.
  Documentarlas todas en `.env.example` y en la tabla del README.
- **API local** (`centavos.api`, `docker compose` con el servicio `db`, migraciones hasta `051`):
  - `CORS_ORIGIN=*` ya está.
  - `AUTH_AUTO_VERIFY_EMAIL=true` está puesto: `signup` responde `emailVerified: true` **sin**
    `signupToken` ni código (§5.2). Para probar la verificación de verdad se apaga el flag. Sin
    `RESEND_API_KEY`, la API no manda correos: imprime el código en su consola
    (`📬 [DEV] Verification code for …` y `🔑 [DEV] Password reset code for …`, en
    `src/lib/email.ts`).
  - `GOOGLE_CLIENT_IDS` y `APPLE_CLIENT_IDS` están vacíos: Google y Apple responden 503. Para
    probar Google en local, poner el client ID web en `GOOGLE_CLIENT_IDS` y agregar
    `http://localhost` y `http://localhost:3002` a los orígenes del cliente OAuth. Si GIS rechaza el
    origen, ver la nota de `Referrer-Policy` en §5.4.
  - Cuentas de prueba: `bun db:seed` crea un usuario demo con datos, y `bun db:seed-test-user` crea
    otro (las credenciales están en el README de la API). Sirven para ver todas las pantallas con
    datos.
- **Apple:** ver §5.5 (no funciona en `localhost`, **⚠️ verificar**). Se prueba en un preview fijo
  de Vercel registrado en el Services ID. Ese preview apunta a la API de producción, salvo que
  exista otra (pregunta 9).
- **Verificación:** `bun run typecheck`, `bun run lint` y `bun test` (si se agregan pruebas), y una
  pasada en el navegador a 375 px y en escritorio, en es y en en.

---

## 13. Criterios de aceptación

**Acceso**

- A-1. Con la bandera apagada, toda ruta de §4.1 responde 404, y las páginas legales y `/app` (que
  redirige a `/`) siguen como antes.
- A-2. Correo y contraseña correctos → `/app/pulso` (o el `next` válido). Incorrectos →
  `errors:AUTH_INVALID_CREDENTIALS` en el idioma activo.
- A-3. *(Revisión 2.)* Una cuenta sin verificar que entra con su contraseña pasa a Verificar; con
  el código correcto queda dentro.
- A-4. *(Revisión 2.)* «¿Olvidaste tu contraseña?» lleva a `/app/recuperar` y «Créala gratis» a
  `/app/crear-cuenta`, en el idioma activo.
- A-5. *(Revisión 2.)* `/app/crear-cuenta` crea la cuenta en tres pasos y Verificar; una cuenta
  nueva cae en `/app/bienvenida`, y al terminar el wizard, en `/app/pulso` con la moneda elegida.
- A-6. *(Revisión 2.)* `/app/recuperar` cambia la contraseña y deja a la persona dentro, con el
  aviso `app.claudeReconnect` si tenía conexiones de Claude.
- A-13. *(Revisión 2.)* `/app/conectar-claude` genera un código que funciona en la página de
  conexión de Claude, muestra la conexión nueva en la lista y la desconecta.
- A-7. Google: con el cliente configurado, «Continuar con Google» entra a una cuenta existente o
  crea una nueva. Sin `NEXT_PUBLIC_GOOGLE_CLIENT_ID` el botón no aparece.
- A-8. Apple: con el Services ID configurado, «Continuar con Apple» entra o crea la cuenta. El
  nombre de la primera autorización llega a la cuenta. Sin `NEXT_PUBLIC_APPLE_SERVICE_ID` el botón
  no aparece. Cerrar la ventana no muestra error.
- A-9. *(Reservado para el Apéndice A: casilla de términos y botones sociales en crear cuenta.)*
- A-10. Una cuenta nueva (`onboarded: false`, por ejemplo creada con Google o Apple desde
  `/app/entrar`) ve el aviso de terminar en la app, y en la base `onboarded_at` sigue en `NULL`
  (la web no lo tocó).
- A-11. `next=https://evil.example` o `next=//evil.example` se ignoran.
- A-12. La misma Apple ID entra a **la misma cuenta** en el iPhone y en la web.

**Sesión**

- S-1. Ningún token aparece en `localStorage`, `sessionStorage`, la URL ni las cookies legibles
  por JS. Se revisa en DevTools → Application. (Con la opción B, la cookie `__Secure-cv_rt` aparece
  como `HttpOnly`.)
- S-2. Recargar cualquier página con sesión mantiene la sesión (con la opción B ya puesta; no en la
  fase 0).
- S-3. A los 15 minutos o más, la siguiente llamada refresca sola y la pantalla no lo nota.
- S-4. Dos pestañas abiertas pasan los 15 minutos y refrescan casi a la vez: ninguna cierra sesión.
- S-5. «Cerrar sesión» en una pestaña cierra la sesión en las demás. Después, recargar no la
  recupera, y el refresh token queda revocado en la API.
- S-6. Con la sesión revocada desde otro lado (por ejemplo, recuperar la contraseña en el
  teléfono), la siguiente acción manda a `/app/entrar` con el mensaje de sesión terminada.

**Datos**

- D-1. El Pulso cuadra con el de la app para la misma cuenta y el mismo momento: estado,
  disponible, hoy/semana/mes, presupuestos y recientes.
- D-2. Gastos: Hoy / Semana / Mes dan los mismos totales que esas pestañas en la app (periodos
  móviles), y Año está bloqueado para una cuenta gratis. El total corresponde a todo el filtro, no
  a la página. El scroll infinito trae sin repetir hasta `pagination.total`. La búsqueda y la
  categoría funcionan.
- D-3. Presupuestos: Solos y Compartidos muestran los mismos grupos, anillos, insignias y montos
  que la app para la misma cuenta y mes. Al cambiar de mes cambian los montos. Los meses
  bloqueados no se abren en una cuenta gratis.
- D-4. Detalle: el anillo, la leyenda y el ritmo coinciden con la app; los gastos del mes suman
  `spent`. Un id inválido o ajeno muestra «no encontrado».
- D-5. Suscripciones: los grupos, la píldora «Se cobra esta semana», las marcas con iniciales y
  los textos de cuándo se cobra coinciden con la app; las canceladas van plegadas.
- D-9. Ningún ícono es inventado ni un emoji donde la app usa un ícono: categorías y pestañas de
  `@cntvos/icons`, el resto de MaterialCommunityIcons con el mismo nombre (§4.7).
- D-6. Perfil: datos de `/me`, el distintivo de correo oculto para Apple, y el cambio de idioma.
- D-7. Cada pantalla tiene esqueleto, error con reintento y vacío.
- D-8. Toda llamada lleva `timezone`.

**Idioma, accesibilidad y diseño**

- I-1. `?lang=en` pone toda la app web en inglés y se recuerda. Sin param, con el navegador en
  inglés y sin cookie, también sale en inglés. `<html lang>` cambia.
- I-2. Ninguna cadena visible está solo en un idioma (lo garantiza el typecheck del `copy.ts`).
- I-3. Se navega todo con teclado, con foco visible, y los errores se anuncian. El contraste es
  AA con los tokens del sitio.
- I-4. A 375 px no hay scroll horizontal y la navegación inferior no tapa contenido.
- I-5. Todas las rutas de §4.1 llevan `noindex` y ninguna está en el sitemap.

---

## 14. Plan de implementación

Pasos pequeños, uno por commit, en este orden. Cada paso deja el sitio compilando
(`bun run typecheck && bun run lint`). Nada se empuja sin el OK explícito del dueño.

**Revisión 2 (26 de noviembre de 2026).** Entran crear cuenta, recuperar la contraseña, el
onboarding, Conectar con Claude y la página pública `/app/claude`. Los pasos nuevos o cambiados
llevan ★. El orden pone primero lo que hace falta para usar Centavos desde Claude sin la app:
entrar, crear cuenta, onboarding y Conectar con Claude.

**Fase 1 — base**

1. **Preparar.** `git pull` en la landing y una rama `feat/app-web`. Leer este doc completo. Este
   archivo está sin commit en `main`: se agrega en el primer commit de la rama.
2. **Esqueleto y bandera.** Grupos de rutas de §4.2 con páginas vacías, `noindex`, la bandera
   `NEXT_PUBLIC_WEB_APP_ENABLED`, `.env.example`, la configuración `centavos-dev-app` en el puerto
   3002, y `/app/entrar` en `BILINGUAL_PATHS`. Criterios A-1 y A-5. ★ Incluye
   `/app/crear-cuenta`, `/app/recuperar`, `/app/bienvenida` y `/app/conectar-claude`.
3. **Copy e idioma.** `components/app/copy.ts` con las claves de §9.2 (copiadas de la app) y las
   de §9.3; las utilidades de interpolación y plural; el proveedor de idioma de §9.1, que ajusta
   `<html lang>`. Pruebas de la precedencia. ★ Con las claves de `auth:signUp.*`, `auth:verify.*`,
   `auth:forgot.*`, `auth:resetCode.*`, `auth:newPassword.*`, `onboarding:*` y
   `settings:connectClaude.*`.
4. **Cliente de la API.** `lib/app/api.ts` con `ApiError` completo, los códigos tipados, `timezone`
   y el gancho para el refresh. `lib/app/next-param.ts` con pruebas (A-11).
5. **Sesión, fase 0 (memoria).** `lib/app/session.ts` con la interfaz de §6.1, el proveedor de
   sesión, la guardia de §4.3, el refresh con una sola promesa y el logout local.

**Fase 2 — entrar y crear cuenta**

6. **`/app/entrar` con correo y contraseña** (A-2).
7. ★ **Verificar** como componente compartido (Apéndice A): el 403 de cuenta sin verificar en
   `/app/entrar` ya no manda a la app, verifica aquí (A-3).
8. ★ **`/app/crear-cuenta`**: los tres pasos y Verificar (Apéndice A, §5.2). Decidir antes la
   pregunta 7 (casilla de términos).
9. ★ **`/app/recuperar`**: correo, código y contraseña nueva (Apéndice A, §5.3). El «¿Olvidaste
   tu contraseña?» de `/app/entrar` apunta aquí (A-4).
10. **Después de entrar**: `GET /me` y la redirección a `next` (A-10). ★ Con `onboarded: false`
    va a `/app/bienvenida` en vez del aviso de «termina en la app».
11. ★ **`/app/bienvenida`** (D6): el wizard de la app (`GET /api/onboarding/catalog`,
    `POST /api/onboarding/apply`, `POST /api/onboarding/skip`), con moneda e idioma primero.
12. **Persistencia de la sesión con la opción B** (D1): las rutas
    `app/api/sesion/{route.ts,refresh/route.ts,logout/route.ts}`, la cookie, las revisiones de
    `Origin`, Web Locks, el reintento con `REVOKED` y `BroadcastChannel` (S-1 a S-6). Se adelanta:
    sin ella, recargar cierra la sesión y sacar el código de Claude en una pestaña aparte falla.

**Fase 3 — Claude sin la app**

13. **Íconos y piezas compartidas** (§4.6 y §4.7) y el **AppShell** (navegación de escritorio y
    teléfono), el aviso «usa la app» y `/app/perfil` con el cierre de sesión (D-6, D-9).
14. ★ **`/app/conectar-claude`** (§4.8, D5): código, copiar, vencimiento en vivo, conexiones y
    desconectar. Probarlo de punta a punta con una cuenta creada en la web y el conector en Claude
    (API local por túnel, como en la primera conexión de #17).
15. ★ **`/app/claude`, la página pública** (§4.9, D7), **cuando el lienzo esté aprobado**:
    `components/claude/` con su `copy.ts` es/en, el JSON-LD de las preguntas, metadatos iguales a
    los de hoy, y se retiran `components/legal/docs/claude.{es,en}.tsx`. Las pestañas «En la app» y
    «En la web» del paso 2 se encienden con `NEXT_PUBLIC_WEB_APP_ENABLED`: sin la app web, la
    página solo enseña la app.

**Fase 4 — las pantallas de datos**

16. **`/app/pulso`** (D-1).
17. **`/app/presupuestos` y `/app/presupuestos/[id]`** (D-3, D-4). ★ El selector de meses copia el
    de la app: gratis abre este mes y los dos anteriores (`FREE_MONTHS = 3`).
18. **`/app/gastos`** (D-2). ★ Los bloqueos de Centavos+ copian los de la app: «Año» y buscar en
    todo el historial.
19. **`/app/suscripciones`** (D-5).

**Fase 5 — accesos y cierre**

20. **Google**: la prop `text` en `GoogleButton` (sin cambiar `/canjear`), el botón en
    `/app/entrar` y `/app/crear-cuenta`, y `disableAutoSelect` al salir (A-7).
21. **Apple**, cuando exista el Services ID: carga del script, nonce, popup, nombre pendiente y
    errores del navegador. Prueba en el preview (A-8, A-12). ★ Return URLs de `/app/entrar` y
    `/app/crear-cuenta`.
22. **Cabeceras y endurecimiento** de §11 (CSP primero en Report-Only) y una pasada de
    accesibilidad con la skill `a11y-seo` del repo (I-3, I-4).
23. **Docs.** Sección «App web» en el README (rutas, variables, la sesión), `.env.example` y una
    línea en `docs/pendientes.md` con lo que quede abierto. ★ En el repo de la API, en su propia
    sesión: los cambios de §8.
24. **Verificación final:** recorrer los criterios de §13 en el navegador (375 px y escritorio, es
    y en) contra la API local con el usuario demo, y Google y Apple contra lo que esté
    configurado. ★ Más el recorrido de Claude sin la app: crear cuenta en la web, onboarding,
    sacar el código, conectar en Claude, anotar un gasto y verlo en `/app/gastos`. Reportar lo que
    no se pudo probar.

---

## 15. Referencias rápidas

- Límites de la API para auth: login 20/min por IP y 10 cada 15 min por correo; signup 10/min por
  IP y 5/h por correo; verify 30/min por IP; resend 10/min por IP, 60 s entre códigos y 5 códigos
  por hora por cuenta; forgot 10/min por IP y 3/h por correo (sin aviso); verify-reset-code
  20/min por IP; reset-password 20/min por IP; google y apple 20/min por IP; refresh y logout sin
  límite.
- Vida de los códigos: verificación 10 min y 5 intentos; recuperación 15 min y 5 intentos;
  `resetToken` 10 min; 20 fallos en 24 h bloquean.
- Contraseña: 8 a 72 al crear o cambiar, hasta 256 al entrar. Nombre: 1 a 100. Correo: hasta 254.

---

## 16. Preguntas abiertas

1. ~~D1 — almacenamiento de la sesión~~ → **Decidido: opción B** (§2).
2. ~~D2 — crear cuenta y recuperar~~ → **Revisión 2: sí, los mismos flujos que la app** (§2, Apéndice A).
3. ~~D3 — Apple en la v1~~ → **Decidido: sí, detrás de `NEXT_PUBLIC_APPLE_SERVICE_ID`**. Sigue
   pendiente crear el Services ID, registrar el dominio y la Return URL
   (`https://centavos.mx/app/entrar`) y agregarlo a `APPLE_CLIENT_IDS` en producción.
4. ~~D4 — solo lectura~~ → **Decidido: sí.** Queda abierto qué escritura vendría primero en una
   v1.1 (¿anotar un gasto?).
5. ¿El `NEXT_PUBLIC_GOOGLE_CLIENT_ID` de Vercel está en el `GOOGLE_CLIENT_IDS` de producción, y
   el cliente OAuth tiene `https://centavos.mx` en Authorized JavaScript origins? (No se puede ver
   desde aquí.)
6. ¿Cuál es el `CORS_ORIGIN` de producción? (`*` o `https://centavos.mx`.)
7. *(Ya aplica: el Apéndice A entra en la v1.)* La app trae la casilla de términos **marcada** de
   inicio. ¿La web la copia, o empieza desmarcada? Recomendado: desmarcada en la web, donde nadie
   ha visto antes una pantalla de bienvenida.
8. ¿Cuándo y dónde se enlaza la app web desde la landing (un «Entrar» en el header o en el
   footer)? Recomendado: cuando se encienda la bandera en producción.
9. ¿Con qué dominio y con qué API se prueba Apple antes de producción (un preview fijo de Vercel
   contra la API de producción, o un túnel)?
10. ¿Detalle de gasto (fotos, pagos, división), alcancías y amigos para una v1.1?
11. ¿`/canjear` y la tarjeta de registro de la home deberían reutilizar esta sesión después (por
    ejemplo, «Entrar a la web» al verificar)?
12. ¿Vale la pena una CSP estricta con nonces (que vuelve dinámicas las páginas de la app web), o
    basta con la de §11?
13. ¿La sesión web dura 30 días como la app, o termina al cerrar el navegador?
14. **⚠️ Por verificar con Apple, en la primera prueba real.** Ya confirmado en la documentación:
    no se acepta `localhost`, `user` llega una sola vez, y la forma de la respuesta del popup.
    Falta confirmar: que el `nonce` se copie tal cual al token (si no, la API responde 401); el
    código de error al cerrar la ventana; que `es_MX` sea un locale válido del script; y que el
    `sub` sea el mismo que en iOS (A-12).
15. Con «solo entrar», Google y Apple pueden **crear** cuentas desde `/app/entrar` (es el mismo
    endpoint). ¿Está bien así, como en la pantalla de entrar de la app, o la web debería avisar
    antes de crear una cuenta nueva? La API no distingue los dos casos hasta después de crearla
    (`isNewUser`).

16. *(Revisión 2.)* ¿El onboarding de la web es el wizard completo o solo moneda e idioma, con
    «saltar» para lo demás? Recomendado: el wizard completo, que ya es del servidor (catálogo y
    `apply`) y solo pide la interfaz.
17. *(Revisión 2.)* ¿Cuándo se enciende el conector para todos (`MCP_ALLOWED_USERS=*`)? La página
    `/app/claude` nueva y la sección de la home dejan de decir «Próximamente» ese día, no antes.
18. *(Revisión 2.)* ¿Aprobado el lienzo de `/app/claude`
    (<https://claude.ai/artifact/7ajMSNMZuRDmSgp5zANPQy>)? El paso 15 espera esa respuesta.

---

## Apéndice A — Crear cuenta, verificar y recuperar (en la v1 desde la revisión 2)

**Entra en la v1 con la revisión 2** (D2). El contrato de la API de cada paso está en §5.2 y §5.3,
y sus errores en §10 (las filas marcadas «fuera de la v1» ahora aplican).
Rutas previstas: `/app/crear-cuenta` y `/app/recuperar`, en el grupo `(acceso)`. El paso Verificar
sería un componente compartido con `/app/entrar` (para el caso 403) y sin URL propia: vive en el
estado del componente, así que ni el `signupToken` ni el `resetToken` llegan a la URL. Recargar a la
mitad vuelve al primer paso. Apple: agregar `https://centavos.mx/app/crear-cuenta` a las Return
URLs del Services ID.

**`/app/crear-cuenta`** (copia de `CrearCuenta.tsx`): una sola pantalla con un índice de paso,
una barra de progreso (`common:stepProgress`, «Paso {{step}} de {{total}}») y el botón «atrás».
El botón principal se habilita solo cuando el paso es válido; no hay mensajes de validación
previos.

| Paso | Ceja / Título / Subtítulo | Contenido | Válido cuando |
|---|---|---|---|
| 1 | `auth:signUp.step1Eyebrow` / `step1Title` / `step1Subtitle` | Correo; casilla de términos (`termsPrefix` + enlace `termsLink` a `/app/terminos` + `termsMiddle` + enlace `privacyLink` a `/app/privacidad` + `termsSuffix`, con `termsA11y` como etiqueta accesible); `common:or`; Apple y Google, **deshabilitados si la casilla no está marcada**; pie `hasAccount` + `goSignIn` | correo con formato válido **y** casilla marcada |
| 2 | `step2Eyebrow` / `step2Title` / `step2Subtitle` | Contraseña (`autocomplete="new-password"`, placeholder `auth:fields.passwordMinPlaceholder`) | 8 a 72 caracteres |
| 3 | `step3Eyebrow` / `step3Title` / `step3Subtitle` | Nombre (`auth:fields.name`, placeholder `auth:fields.yourName`, `autocomplete="name"`) | 1 a 100 caracteres sin contar espacios de los extremos |

- Botón: `auth:signUp.next` en los pasos 1 y 2; `auth:signUp.submit` (y `submitting`) en el 3.
- En la app la casilla de términos **viene marcada** (`useState(true)`). La web la copia, pero
  queda como pregunta (pregunta 7 de la §16, pendiente para cuando se haga).
- Los enlaces de términos y privacidad abren en otra pestaña y llevan `?lang=` si la web está en
  inglés.
- El paso 3 envía (§5.2) y pasa al paso **Verificar**, dentro de la misma pantalla.

**Paso Verificar** (copia de `VerificarCorreo.tsx`; un componente que comparten `/app/entrar` y
`/app/crear-cuenta`):

- Título `auth:verify.title`. Texto `auth:verify.sentTo` con el correo en negritas (o
  `auth:verify.fallbackEmail` si no se conoce).
- Código de 6 dígitos. En la web: **un solo `<input>`** con `inputmode="numeric"`,
  `autocomplete="one-time-code"`, `maxlength=6` y `pattern="[0-9]*"`, dibujado como seis casillas.
  Así funcionan el autocompletado del navegador y el pegado, y es accesible. La app usa seis
  inputs; la web no lo necesita.
- Botón `auth:verify.submit` / `auth:verify.submitting`. Se habilita con 6 dígitos.
- Fila de reenvío: `auth:verify.notReceived` + `auth:verify.resend` (`auth:verify.resending`
  mientras envía). Después de reenviar, `auth:verify.resent` y una cuenta regresiva de 60 s
  (`auth:verify.canResendIn` + segundos). Al llegar a cero se borra el «Te enviamos un código
  nuevo».
- Sin `userId` (no debería pasar): `auth:verify.noAccount`.

**`/app/recuperar`** (copia de `OlvidasteContrasena` → `VerificarReset` → `NuevaContrasena`,
leídas en `origin/main`):

1. **Correo:** título `auth:forgot.title`, subtítulo `auth:forgot.subtitle`, campo correo
   (`auth:fields.email`, placeholder `auth:fields.emailPlaceholder`), botón `auth:forgot.submit` /
   `auth:forgot.submitting`. Antes de enviar: `auth:validation.emailRequired` o
   `auth:validation.emailInvalid` en el campo. Cualquier otro error, en el formulario.
2. **Código:** título `auth:verify.title` y `auth:verify.sentTo` con el correo (los mismos textos
   que Verificar), el input de 6 dígitos y el botón `auth:resetCode.submit` (dice
   `auth:verify.submitting` mientras envía; se habilita con los 6 dígitos). Un error de la API
   muestra el texto de su código (`errors:AUTH_RESET_CODE_*`). `auth:resetCode.invalid` es solo el
   respaldo cuando el error no viene de la API. **La app no tiene «reenviar» en este paso**, y la
   web tampoco: para pedir otro código, «atrás» vuelve al paso 1 con el correo puesto y se envía
   de nuevo. El servidor pone 60 s entre códigos sin avisar.
3. **Contraseña nueva:** título `auth:newPassword.title`, subtítulo `auth:newPassword.subtitle`,
   campo `auth:newPassword.field` (placeholder `auth:fields.passwordMinPlaceholder`,
   `autocomplete="new-password"`), y botón `auth:newPassword.submit` / `submitting`, deshabilitado
   solo mientras envía. Antes de enviar: `auth:validation.passwordTooShort` (menos de 8) o
   `auth:validation.passwordTooLong` (más de 72). Al terminar la persona **queda dentro** (§5.3).

> Los títulos de la app traen `\n` («¿Olvidaste tu\ncontraseña?»). En la web el salto se respeta
> con `white-space: pre-line` o se quita; los dos idiomas igual.
