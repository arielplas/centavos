# Piezas compartidas de la app web

Copias de las piezas de `centavos-app` (`src/components/{BudgetRow,MonthPicker}.tsx`,
`src/components/ui/*`, `src/lib/format.ts`) hechas para la web. Todo se importa de
`@/components/app/ui`. El idioma sale de `useT()` / `useLang()`; nada lee un global.

Colores: solo los tokens del sitio (`var(--color-green)`, `bg-sand`, `text-ink-soft`…).
Las clases de Tailwind van escritas completas (no `bg-cat-${key}`: se purgarían); el
tinte de una categoría sale de `categoryTint(key)` como estilo en línea.

## Contrato del AppShell

El shell (`(shell)/layout.tsx`) pone la barra, el enlace «Saltar al contenido» y el espacio
para la barra inferior del teléfono. **No envuelve a la pantalla en un `<main>`:** cada
pantalla dibuja el suyo, con `id="contenido"` (a ese `id` apunta el enlace de salto):

```tsx
<PageColumn as="main" id="contenido" className="py-6">…</PageColumn>
```

Gastos, Presupuestos, Suscripciones y el detalle van en una columna de 720 px (`PageColumn`).
Ninguna pantalla necesita `padding-bottom` extra para la barra inferior: ya lo pone el shell.

## Reglas de Centavos+ (decisión del dueño)

Una cuenta gratis ve **este mes y los dos anteriores**; `MonthPicker` bloquea los demás
(`FREE_MONTHS = 3`). El filtro **Año** y la búsqueda sobre todo el historial también son de
Centavos+. En la web **no hay paywall**: lo bloqueado muestra el aviso `app:monthsLocked` /
`app:yearLocked` (copia de lo que hace la app hoy). `usePremium()` da `isPremium`.

## Piezas

| Pieza | Props |
|---|---|
| `Icon` | `name: IconName \| MdiName` (los 37 de `@cntvos/icons` y los 15 de `MDI_PATHS`: `account`, `account-multiple`, `alert-circle-outline`, `alert-outline`, `check`, `check-circle-outline`, `chevron-down/left/up`, `image-outline`, `infinity`, `information-outline`, `lock`, `lock-outline`, `party-popper`), `size=24`, `strokeWidth=1.75` (solo `@cntvos`), `label?` (sin él: `aria-hidden`), `className?`, `style?` |
| `Money` | `value`, `currency`, `compact?` («$5k», desde 1,000), `whole?` (sin «.00»), `sign?`, `prefix?` («−» en gastos, «+» si se pasó), `className?`, `style?`. El código va a `0.5em` |
| `CategoryIcon` | `category` (clave; nula o desconocida → «otros»), `size=44`, `imageUrl?` (foto del presupuesto), `tint?` (`"transparent"` dentro de un anillo), `className?`. Decorativo |
| `ServiceMark` | `name`, `category`, `size=44`, `className?`. Iniciales sobre el tinte; radio `0.3·size`. Decorativo |
| `ProgressBar` | `value`, `max`, `label` (obligatorio, nombre accesible), `height=10`, `showOverflow=true`, `color?`, `className?`. Semáforo 80 % / 100 % |
| `SpendRing` | `share`, `pace` (`null` esconde la marca), `size=168`, `stroke=14`, `fill?`, `children?` (centro), `label?`, `decorative?`, `className?`. También `SoftHalo` (`color`, `size`) y `RingLegend` (`swatch?`, `dash?`, `label`, `children`) para el detalle |
| `BudgetRow` | `b: BudgetRowData`, `userCurrency`, `clock: MonthClock`, `shared?`, `last?`, `href?` (por defecto `/app/presupuestos/<id>`). Toda la fila es un `<Link>`. Va dentro de `BudgetRowsCard` (`border?`, `className?`) |
| `EmptyState` | `icon` (el de la pestaña), `title`, `body`, `action?: { label, href }` (en la web lleva a la app: `appDownloadHref(lang)`), `headingLevel=2` |
| `Chip` | `label`, `bg?`, `fg?` (CSS; tinta/crema por defecto; pagos a meses: `var(--color-sky)` / `var(--color-ink)`), `className?` |
| `MonthPicker` | `months` (`recentMonths(LISTED_MONTHS, lang)`), `selectedKey`, `onSelect(month)` (nunca con uno bloqueado), `isPremium`, `freeMonths=3`, `onLocked?`, `className?` |
| `Dropdown` | `options: { key, label, sublabel?, badge?, icon? }[]`, `selectedKey`, `onSelect(key)`, `label` (nombre accesible), `alignEnd?`, `className?`. Teclado completo; una opción nunca se deshabilita |
| `Card` | `variant`: `glass` (por defecto) \| `ink` \| `peach` \| `sand` \| `sky`, `radius=20`, `padding=20`, `as?`, `className?`, `style?` |
| `PageColumn` | `as?`, `id?`, `className?`: la columna centrada de 720 px con 16 px de margen |
| `SectionHeader` | `kicker?`, `title`, `level=2\|3`, `action?` |
| `SharedBadge`, `PulseDot` | `PulseDot`: `status`, `size=10` |
| `Bone`, `SkeletonBlock` | `Bone`: `width`, `height`, `radius`; `SkeletonBlock` envuelve un esqueleto con `aria-busy` y «Cargando» oculto |
| `LoadError` | `message`, `onRetry`: texto centrado y «Reintentar» en `mandarina-deep` (`role="alert"`) |
| `Notice`, `UseAppNotice` | `Notice`: `icon?`, `tone="plain"\|"band"`, `role?`, `children`; `UseAppNotice`: «Para anotar o editar, usa la app.» |

## Hooks

- `useLoad(fetcher, key?, { fallbackError? })` → `{ phase: "loading"\|"ready"\|"error", data, error (texto), apiCode, reload }`. Re-pide al cambiar `key` y aborta la petición anterior (`fetcher(signal)`).
- `useFormat()` → `{ lang, money(n, cur, opts?), moneyParts, date(iso, "short"\|"long"\|"relative"), installment(cur, total, freq) }`.
- `useCategories()` → `{ getCategory(key), categories }` con la etiqueta en el idioma activo.
- `usePremium()` → `{ isPremium, known }`. `plan` llega con `GET /me`; mientras no llega, `isPremium` es `false`.

## Lógica pura (con pruebas en `helpers.test.ts`)

`formatMoneyParts/formatMoney/formatDate/localDayKey/initialsFrom/installmentLabel`
(`format.ts`; reciben `lang` y `t`), `currencySymbol` (la tabla de la app: «$» si no se
conoce, vacío = solo el código), `getCategory/categoryGlyph/categoryTint` (`categories.ts`),
`recentMonths/isMonthLocked/FREE_MONTHS` (`months.ts`), `ringColor/monthPace/paceState/
ringGeometry/progressParts` (`ring.ts`), `monthClock/shortMoney/toneOf/sortByUse/topBudgets`
(`budget.ts`).

## Pendientes conocidos para quien construya encima

- `lib/subscriptions.ts` de la app (`groupByDue`, `nextChargeDate`…) no está copiado: es de la pantalla de Suscripciones.
- `Money` con `compact` sigue a la app: 1,000 en adelante («$5k MXN»). El doc dice «$5.0k»; la app no pone el «.0».
- La etiqueta «independiente» de `BudgetRow` usa `home:otherCurrencyTag` (en `pulso.ts`); conviene moverla a `presupuestos.ts` como `budgets:otherCurrencyTag`.
