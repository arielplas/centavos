# `/gastos-hormiga` — especificación

| | |
|---|---|
| **Keyword principal** | "calculadora de gastos hormiga", "gastos hormiga" |
| **Long-tail** | "qué son los gastos hormiga", "ejemplos de gastos hormiga", "cómo reducir los gastos hormiga", "cuánto gasto en café al año" |
| **Keyword en inglés** | "small expenses calculator", "small daily expenses", "small expenses that add up" |
| **Estacionalidad** | Constante. Es de esperar un repunte en enero (propósitos y cuesta de enero); validar con Search Console |
| **Constantes que necesita** | **Ninguna.** Cero mantenimiento |
| **Dificultad competitiva** | Media. Condusef, bancos y medios explican el término con texto; casi ninguno deja armar tu propia lista. Sin validar con datos |

Es la única calculadora **bilingüe** y la única que **habla con la API**: la persona puede
guardar su lista con un correo y encontrarla como presupuesto al registrarse en la app.

---

## 1. Qué son los gastos hormiga (copy base)

Gastos pequeños y frecuentes que casi no se sienten uno por uno (el café, el refresco, la
propina, el envío de la comida) y que nadie planea ni anota. El nombre viene de que cada uno
es diminuto, pero entre todos se llevan bastante.

El ángulo de la página, que es lo que la separa de los artículos que ya rankean:

1. **Sin regaños.** No son gastos malos. El problema es no saber cuánto suman.
2. **Tu lista, no una lista genérica.** La herramienta parte de lo que tú anotas.
3. **La misma unidad para todo.** Un gasto diario, uno semanal y uno mensual no se pueden
   comparar hasta que los tres están en pesos al mes y al año.
4. **No se trata de quitarlos todos**, sino de decidir cuáles se quedan y ponerles un tope.

## 2. Marco de referencia

No hay ley ni cifra oficial detrás. El término lo usa la **Condusef** en sus materiales de
educación financiera (<https://www.condusef.gob.mx>), y es la única fuente que la página
enlaza.

**No citar porcentajes del tipo "los gastos hormiga se comen X% de tu ingreso".** Circulan
muchos y ninguno trae fuente verificable. La página solo afirma lo que su propia cuenta
demuestra.

## 3. Cómo se calcula

La cuenta vive en `lib/gastos-hormiga.ts`, un módulo puro. **La API implementa las mismas
fórmulas** para las listas guardadas, así que los nombres son los del contrato y los dos
lados se pueden comparar línea por línea.

```
PER_YEAR    = { day: 365, week: 52, month: 12 }
itemYearly  = amount × times × PER_YEAR[period]
itemMonthly = itemYearly / 12
totalYearly = Σ itemYearly
totalMonthly = totalYearly / 12
round2(x)   = Math.round(x * 100) / 100     // solo para mostrar, nunca a media suma
```

`amount` es lo que cuesta **una** vez; `times`, cuántas veces por periodo.

La comparación que aterriza la cifra es el total a **5 años** (`totalYearly × 5`), sin
intereses ni inflación: solo lo mismo de siempre, repetido 60 meses.

### 3.1 Límites

Son los del contrato de la API. El formulario los aplica al escribir para que una lista que
se ve válida nunca sea rechazada al guardarla.

| Campo | Límite |
|---|---|
| Renglones | 1 a 30 |
| `name` | 1 a 60 caracteres, sin espacios a los lados |
| `amount` | Mayor que 0, máximo 100,000, hasta 2 decimales |
| `times` | Entero de 1 a 50 |
| `period` | `day`, `week` o `month` |
| `category` | Una categoría de la app; lo escrito a mano va como `other` |

### 3.2 Sugerencias de un toque

Para que la lista nunca arranque como un formulario vacío. Los montos son precios comunes en
pesos y se pueden editar. Viven en `components/gastos-hormiga/copy.ts`.

| Sugerencia | Monto | Frecuencia | Categoría |
|---|---|---|---|
| Café | $60 | 1 al día | `food` |
| Refresco o botana | $25 | 5 a la semana | `food` |
| Uber o taxi | $120 | 3 a la semana | `transport` |
| Comida a domicilio | $250 | 1 a la semana | `food` |
| Cigarros | $85 | 2 a la semana | `other` |
| Suscripción | $199 | 1 al mes | `entertainment` |

Un renglón que nace de una sugerencia conserva su categoría aunque se le cambie el nombre
("Suscripción" → "Netflix").

### 3.3 Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Lista vacía | Sin resultado; solo las sugerencias y "Agrega tu primer gasto" |
| Renglón incompleto (sin nombre, monto o veces) | No se suma ni se envía; lleva una nota discreta, no un error |
| Monto mayor a 100,000 o con tercer decimal | La tecla se ignora |
| Veces 0 o mayor a 50 | La tecla se ignora |
| Renglón 31 | Los botones de agregar se desactivan y se avisa del máximo |
| `localStorage` bloqueado, lleno o con datos raros | La calculadora funciona; la lista simplemente no se conserva |
| Recarga de la página | La lista vuelve. Se lee después del montaje para no romper la hidratación |
| Sin `NEXT_PUBLIC_API_URL` | No aparece la tarjeta de guardar; todo lo demás igual |

## 4. Casos de prueba

```ts
itemYearly({ amount: 60,   times: 1, period: "day" })    // 21900 → al mes 1825
itemYearly({ amount: 120,  times: 3, period: "week" })   // 18720 → al mes 1560
itemYearly({ amount: 199,  times: 1, period: "month" })  // 2388  → al mes 199

totals([cafe, uber, streaming])   // { yearly: 43008, monthly: 3584 }

itemYearly({ amount: 35.5, times: 2, period: "week" })   // 3692
round2(itemMonthly(...))                                  // 307.67

totals([])                         // null → resultado oculto
```

Son los mismos vectores con los que se prueba la API. Los ejemplos del texto de la página
($21,900, $18,720, $2,388, $43,008, $3,584) salen de aquí: si cambia una sugerencia, hay que
cambiar el texto.

## 5. Estructura de la página

```
H1   Calculadora de gastos hormiga
     [ + Café ] [ + Refresco o botana ] [ + Uber o taxi ] …      ← sugerencias
     [ Gasto ] [ $ Costo ] [ Veces ] [ Por día/semana/mes ] [×]  ← un renglón por gasto
     [ + Agregar un gasto ]
     → Al mes $X · Al año $Y
     → Desglose por gasto, del más grande al más chico
     → En 5 años son $Z
     → ¿Quieres guardarlo?                                       ← ver sección 7

H2   ¿Qué son los gastos hormiga?
H2   Ejemplos de gastos hormiga
H2   ¿Cuánto suman los gastos hormiga al año?
H2   ¿Cómo reducir los gastos hormiga?
[CTA]
H2   Preguntas frecuentes                                        ← FAQPage JSON-LD
```

`JSON-LD`: `WebApplication` + `FAQPage`, con `inLanguage` y `url` del idioma servido.

## 6. FAQ para el schema

- ¿Qué es un gasto hormiga?
- ¿Cuáles son ejemplos de gastos hormiga?
- ¿Cómo se calculan los gastos hormiga?
- ¿Los gastos hormiga son malos?
- ¿Cómo puedo reducir mis gastos hormiga?
- ¿Esta calculadora guarda mis datos? (la respuesta cambia según haya o no API configurada)

## 7. Guardar la lista y CTA a Centavos

### 7.1 "¿Quieres guardarlo?"

Va **justo después del resultado**, dentro de la calculadora: es el momento en que la cifra
está en pantalla. Solo pide un correo y **no crea ninguna cuenta en la web**. Es el mismo
mecanismo de reclamar por correo que usa `/canjear` con las cuentas nuevas.

1. Tarjeta "¿Quieres guardarlo?" con el botón "Sí, guárdalo".
2. Al presionarlo aparece el campo de correo, con el foco puesto en él, y una línea que dice
   para qué se usa el correo, con enlace a `/app/privacidad`.
3. Éxito: la lista quedó guardada y estará esperando como el presupuesto «Gastos Hormiga»
   cuando la persona se registre **en la app con ese mismo correo**. Se muestran los botones
   de las tiendas. Como la API contesta lo mismo tenga o no cuenta ese correo, el texto
   incluye una línea para quien ya tiene cuenta: solo funciona con cuentas nuevas.
4. Error: se explica en palabras simples y se conservan la lista y el correo escrito.

| Error | Qué se dice |
|---|---|
| `VALIDATION` con `fields.email` | Revisa tu correo |
| `VALIDATION` con cualquier otra cosa | No se pudo guardar la lista como está |
| `RATE_LIMIT` (429) | Demasiados intentos, espera unos minutos |
| Sin respuesta (`NETWORK`) | Revisa tu conexión |
| Cualquier otra cosa | Algo salió mal de nuestro lado; tu lista sigue aquí |

### 7.2 Contrato

Todo el contrato está en `lib/gastos-hormiga-api.ts`; el transporte es el de
`lib/promo-api.ts`.

```
POST {NEXT_PUBLIC_API_URL}/api/gastos-hormiga/claims      público, 10 por 15 min por IP
{ "email": "…", "language": "es" | "en",
  "items": [{ "name": "Café", "amount": 60, "times": 1, "period": "day", "category": "food" }] }

200 { "received": true }      // idéntico tenga o no cuenta ese correo
400 VALIDATION (con fields) · 400 BAD_JSON · 429 RATE_LIMIT
```

Qué hace la API con la lista: cuando una cuenta con ese correo se verifica por primera vez,
crea un presupuesto «Gastos Hormiga» (o "Small Expenses" si `language` es `en`) con el total
mensual como límite y un gasto por renglón. Guardar otra vez con el mismo correo reemplaza
la lista anterior. Una lista que nadie reclama se borra a los 180 días.

### 7.3 CTA

El CTA del molde va más abajo, después del contenido. Quien llega acaba de ver cuánto suman
sus gastos chiquitos: el tono es **sin regaño y práctico**.

> ### Ahora no les pierdas la pista
> En Centavos anotas cada gasto en segundos y le pones un tope mensual a tus gastos hormiga.
> No tienen que desaparecer: los eliges tú.
>
> [Descargar gratis · App Store] [Google Play]
>
> Gratis. Sin conectar tu banco: solo necesitas tu correo.

Aquí el cierre no dice "sin registro": la misma página invita a registrarse en la app con el
correo, y decir las dos cosas se contradice.

## 8. Dos idiomas

Español en `/gastos-hormiga` e inglés en `/gastos-hormiga?lang=en`, con el mecanismo de la
landing: las dos versiones son **estáticas** (`app/gastos-hormiga/page.tsx` y
`app/en/gastos-hormiga/page.tsx` renderizan el mismo componente) y `proxy.ts` reescribe
`?lang=en` hacia la ruta interna. Una visita directa a `/en/gastos-hormiga` redirige a la
URL pública. A diferencia de la landing, **no hay detección de idioma ni cookie**: sin
`?lang=en` siempre es español.

- Cada idioma es su propio canonical y los dos se apuntan con `hreflang` (`es-MX`, `en`,
  `x-default` al español). Las dos URLs van en `app/sitemap.ts`.
- El inglés no traduce "gastos hormiga": se escribe para búsquedas como "small expenses
  calculator" y explica el término una vez. No usar "latte factor": es marca registrada.
- Los montos se muestran en pesos en los dos idiomas.
- El texto de la página vive en `components/gastos-hormiga/page-copy.tsx` y el de la
  calculadora en `components/gastos-hormiga/copy.ts`. **El español es la fuente de verdad.**
- `CalcShell` recibe `lang` y `bilingual`; las demás calculadoras no los pasan y se
  renderizan igual que antes.

## 9. Fuentes

- Condusef: <https://www.condusef.gob.mx>

## 10. Mantenimiento

**Ninguno.** No depende de ninguna cifra oficial. Revisar los montos de las sugerencias cada
uno o dos años para que sigan pareciendo precios reales, y con ellos los ejemplos del texto.
