# Calculadoras · índice y convenciones

Especificaciones de las páginas-herramienta de centavos.mx. Cada archivo trae el fundamento
legal, la fórmula exacta, casos borde, casos de prueba, la estructura de la página y el CTA.

## Las páginas

| Página | Keyword | Pico | Mantenimiento | Spec |
|---|---|---|---|---|
| `/meses-sin-intereses` | calculadora de meses sin intereses | Buen Fin (nov) | **Ninguno** | [spec](./meses-sin-intereses.md) |
| `/aguinaldo` | calculadora de aguinaldo | nov–dic | **Ninguno** (bruto) | [spec](./aguinaldo.md) |
| `/vacaciones` | cuántos días de vacaciones me tocan | todo el año | **Ninguno** | [spec](./vacaciones.md) |
| `/finiquito` | calculadora de finiquito | todo el año | Salario mínimo | [spec](./finiquito.md) |
| `/ptu` | reparto de utilidades | abr–jun | UMA | [spec](./ptu.md) |
| `/cetes` | calculadora de CETES | todo el año | **Ninguno** (tasa como input) | [spec](./cetes.md) |

**`/sueldo-neto` (ISR) queda fuera a propósito.** Requiere la tarifa del art. 96 LISR,
subsidio al empleo y cuotas del IMSS: tres tablas que hay que transcribir cada año. Es la
única de la lista con mantenimiento real y no vale la pena hasta que las demás estén vivas.

### Orden sugerido

1. **`/meses-sin-intereses`** — cero constantes, cero mantenimiento de por vida, y el pico es
   en noviembre. Sirve de molde para las demás.
2. **`/aguinaldo`** — el mayor pico estacional del año. Publicar en octubre, Google necesita
   4–8 semanas para posicionarla.
3. **`/finiquito`** — el mayor volumen sostenido.
4. `/vacaciones`, `/ptu` (esta antes de marzo), `/cetes`.

## Por qué calculadora y no solo artículo

"Qué es el aguinaldo" lo tienen copado El Economista, Milenio, gob.mx, Condusef y los
bancos, que republican el mismo texto cada año. Un dominio nuevo no les gana con prosa.

La calculadora compite en **otra intención de búsqueda**: en "calculadora de X" los
periódicos pierden porque publican texto donde Google quiere una herramienta.

El explainer no es la alternativa, es la mitad de abajo de la página: una calculadora pelada
de 50 palabras tampoco rankea.

## Molde de página

Todas siguen la misma estructura:

```
H1   Calculadora de <cosa> 2026
     Inputs (pocos, con defaults sensatos)
     Resultado grande + desglose línea por línea, cada línea citando su artículo

H2   ¿Qué es <cosa>?
H2   ...3 a 5 secciones que respondan las dudas reales de búsqueda...
H2   Preguntas frecuentes          ← FAQPage JSON-LD
[CTA a Centavos]
```

Reglas comunes:

- **Server Component** con la parte interactiva aislada en un `"use client"` mínimo. El
  texto tiene que salir en el HTML del servidor o no rankea.
- **JSON-LD:** `SoftwareApplication` (la herramienta) + `FAQPage`. Reutilizar los helpers de
  `lib/seo.ts` y agregar los que falten ahí, no en cada página.
- **Citar el artículo en cada línea del desglose.** Es contenido YMYL: Google evalúa la
  confiabilidad con dureza y las fuentes visibles son la señal más barata de E-E-A-T.
- **Aviso de "informativo, no asesoría"** en las laborales y en `/cetes`.
- **Enlace a PROFEDET** en las laborales. Ayuda de verdad y refuerza la señal anterior.
- **Sin `NaN` nunca.** Input vacío o inválido → resultado oculto, no un error a la cara.
- Agregar cada página a `app/sitemap.ts` con fecha fija, y enlazarla desde la home.

### Variantes por año

`/aguinaldo/2025`, `/ptu/2025`, etc. usan el mismo componente con el año en el H1 y en las
constantes. Son keywords propias con volumen real y cuestan una ruta dinámica.

## El CTA

Va **después del resultado**, cuando la persona acaba de ver una cifra concreta de su propio
dinero. Ese es el punto de máxima relevancia de toda la página.

El tono cambia según el contexto emocional:

| Página | Situación de quien llega | Tono |
|---|---|---|
| `/aguinaldo`, `/ptu` | Dinero extra que va a llegar | Optimista — "que no se evapore" |
| `/meses-sin-intereses` | Acaba de comprometerse N meses | Práctico — "que no se te olvide" |
| `/vacaciones` | Planea un viaje | Ligero — resaltar que funciona sin internet |
| `/finiquito` | Se quedó sin ingreso | **Sobrio.** Nada festivo. Primero PROFEDET, luego la app |
| `/cetes` | Tiene un excedente y lo va a invertir | "De aquí sale lo que inviertes" |

Siempre cerrar con el diferenciador: *sin conectar tu banco, sin registro*.

## Constantes: de dónde salen

No hay API para ninguna. Se transcriben a mano del documento oficial.

| Constante | Fuente | Cuándo se publica | Quién la usa |
|---|---|---|---|
| Salario mínimo (general y ZLFN) | CONASAMI → <https://www.gob.mx/conasami> | Diciembre, vigente **1 de enero** | `/finiquito` |
| UMA (diaria, mensual, anual) | INEGI → <https://www.inegi.org.mx/temas/uma/> | Primeros 10 días de enero, vigente **1 de febrero** | `/ptu`, exenciones |
| Tarifa ISR + subsidio | Anexo 8 de la RMF, DOF → <https://www.dof.gob.mx> | Fines de diciembre | Solo `/sueldo-neto` (fuera de alcance) |
| Retención sobre intereses | Ley de Ingresos de la Federación → <https://www.diputados.gob.mx/LeyesBiblio/ref/lif.htm> | Noviembre, vigente 1 de enero | `/cetes` (opcional) |

### Dos trampas de calendario

- **La UMA cambia el 1 de febrero, no el 1 de enero.** Enero se calcula con la del año
  anterior. Si el código asume año calendario, todas las exenciones de enero salen mal.
- **La tarifa del ISR no cambia todos los años.** Por el art. 152 LISR solo se actualiza
  cuando la inflación acumulada desde la última actualización rebasa 10%.

### Estructura del archivo de constantes

Versionado por año, no un valor "vigente". Cuesta lo mismo y habilita las variantes por año.

```ts
// lib/fiscal/uma.ts
export const UMA = {
  2025: { diaria: 0, mensual: 0, anual: 0, vigenteDesde: "2025-02-01" },
  2026: { diaria: 0, mensual: 0, anual: 0, vigenteDesde: "2026-02-01" },
} as const;

// lib/fiscal/salario-minimo.ts
export const SALARIO_MINIMO = {
  2026: { general: 0, zlfn: 0, vigenteDesde: "2026-01-01" },
} as const;
```

**No copiar valores de blogs ni de memoria.** Un dígito mal en un límite inferior da una
cifra incorrecta que alguien va a usar para reclamarle a su patrón. Del DOF y verificado.

## Que el build te recuerde

Para no depender de acordarse en enero:

```ts
// lib/fiscal/vigencia.test.ts
test("las constantes fiscales están vigentes", () => {
  const anio = new Date().getFullYear();
  expect(Math.max(...Object.keys(UMA).map(Number))).toBeGreaterThanOrEqual(anio);
  expect(Math.max(...Object.keys(SALARIO_MINIMO).map(Number))).toBeGreaterThanOrEqual(anio);
});
```

En enero el deploy truena y dice exactamente qué falta.

Además, mostrar en la página un **`Datos vigentes a 2026`** visible. Si algún día se pasa la
actualización, la página es honesta en vez de mentir en silencio.

## Calendario de mantenimiento

| Cuándo | Qué |
|---|---|
| **5 de enero** | Revisar CONASAMI: salario mínimo del año |
| **15 de febrero** | Revisar INEGI: UMA vigente desde el 1 de febrero |
| **Marzo** | Publicar/revisar `/ptu` antes del pico de abril |
| **Octubre** | Publicar/revisar `/aguinaldo` antes del pico de noviembre |

Media hora al año en total.
