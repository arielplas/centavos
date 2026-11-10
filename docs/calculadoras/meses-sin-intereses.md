# `/meses-sin-intereses` — especificación

| | |
|---|---|
| **Keyword principal** | "calculadora de meses sin intereses", "meses sin intereses" |
| **Long-tail** | "¿conviene comprar a meses sin intereses?", "cuánto pago al mes a 12 MSI", "MSI qué significa" |
| **Estacionalidad** | Pico en **Buen Fin (noviembre)** y diciembre. Segundo pico en Hot Sale (mayo) |
| **Constantes que necesita** | **Ninguna.** Cero mantenimiento de por vida |
| **Dificultad competitiva** | Baja. Las páginas que rankean son de bancos y explican su propio producto, no comparan |

---

## 1. Qué son los MSI (copy base)

"Meses sin intereses" es una promoción de crédito en la que el comercio —no el banco—
absorbe el costo financiero del diferimiento. El precio se divide entre el número de
mensualidades y no se cobra interés sobre el saldo.

La letra chica que casi nadie explica y que es el ángulo diferenciador de esta página:

1. **Sin intereses no es sin costo.** Si el mismo producto tiene precio de contado más
   barato, la diferencia *es* el interés. Solo que va disfrazado de descuento perdido.
2. **Ocupas la línea de crédito completa desde el día uno.** Una compra de $12,000 a 12 MSI
   te bloquea $12,000 de tu límite, no $1,000.
3. **Un solo pago tardío puede cancelar la promoción** y convertir el saldo a la tasa
   ordinaria de la tarjeta. Está en los contratos de casi todos los emisores.
4. **El primer pago no siempre cae el mes siguiente.** Depende de tu fecha de corte.

## 2. Marco regulatorio

No hay una ley específica de MSI. Lo que aplica:

- **Ley para la Transparencia y Ordenamiento de los Servicios Financieros (LTOSF)** —
  obliga a informar el **CAT** en productos de crédito.
  <https://www.diputados.gob.mx/LeyesBiblio/pdf/LTOSF.pdf>
- **Banxico** define la metodología de cálculo del CAT (Circular 21/2009 y sucesoras).
  <https://www.banxico.org.mx/servicios/cat-costo-anual-total.html>
- **Condusef** publica comparativos de tarjetas y recibe quejas por promociones mal
  aplicadas. <https://www.condusef.gob.mx>
- **Ley Federal de Protección al Consumidor**, art. 7 bis — el proveedor debe exhibir el
  precio total. <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf>

> Nota honesta para la página: el CAT de una promoción MSI genuina es **0%** si el precio
> de contado y el precio a meses son idénticos. Deja de ser 0% en cuanto hay descuento por
> pago de contado.

## 3. Cómo se calcula

### 3.1 Mensualidad (el caso simple)

```
mensualidad = monto / numeroDeMeses
```

Sin redondeo bancario, sin interés. Si el monto no es divisible, la práctica del mercado es
ajustar el **último** pago con los centavos sobrantes.

```ts
const base = Math.floor((monto / meses) * 100) / 100;
const ultima = Math.round((monto - base * (meses - 1)) * 100) / 100;
```

### 3.2 Interés implícito (el que da valor a la página)

Cuando existe precio de contado menor, hay un costo real. Se despeja la tasa mensual `i`
que iguala el precio de contado al valor presente de las mensualidades:

```
contado = mensualidad × [1 − (1 + i)^(−n)] / i
```

No tiene solución cerrada: se resuelve numéricamente (bisección o Newton-Raphson en ~20
iteraciones, instantáneo en el navegador). La tasa anual equivalente:

```
tasaAnual = (1 + i)^12 − 1
```

Esa cifra es el titular de la página: *"comprar a 12 MSI en vez de aprovechar el 10% de
descuento de contado te cuesta el equivalente a una tasa anual de X%."*

### 3.3 Fecha del primer pago

```
Si fechaCompra <= fechaCorte  → el cargo entra en el estado de cuenta de este mes
                                 y se paga en la fecha límite de pago de este ciclo
Si fechaCompra >  fechaCorte  → entra hasta el siguiente estado de cuenta
```

Un input opcional de "día de corte" convierte esto en un calendario de pagos con fechas
reales, que es lo que la gente realmente quiere saber.

### 3.4 Casos borde

| Caso | Comportamiento esperado |
|---|---|
| `meses = 1` | No es promoción; mostrar el monto íntegro |
| `monto = 0` o negativo | Deshabilitar resultado, no mostrar `NaN` |
| `contado >= precioMSI` | Interés implícito = 0%. Mensaje: "la promoción no tiene costo" |
| `contado` vacío | Solo mostrar mensualidad y calendario, ocultar la sección de tasa |
| Meses no comunes (3, 6, 9, 12, 18, 24) | Aceptar cualquier entero de 1 a 48 |

## 4. Casos de prueba

```ts
// Mensualidad simple
calcular({ monto: 12000, meses: 12 }).mensualidad === 1000

// Ajuste de centavos en la última
calcular({ monto: 10000, meses: 3 })
  // → [3333.33, 3333.33, 3333.34]

// Interés implícito con 10% de descuento de contado
calcular({ monto: 10000, meses: 12, contado: 9000 }).tasaAnual
  // ≈ 0.2137 (21.4%) — verificar contra una tabla de amortización externa

// Sin descuento
calcular({ monto: 10000, meses: 12, contado: 10000 }).tasaAnual === 0
```

## 5. Estructura de la página

```
H1   Calculadora de meses sin intereses
     [ Monto ] [ Meses ▾ ] [ Precio de contado (opcional) ] [ Día de corte (opcional) ]
     → Pagas $X al mes durante N meses
     → Calendario con las N fechas de pago
     → Si hay contado: "Te cuesta el equivalente a X% anual"

H2   ¿Qué son los meses sin intereses?
H2   ¿Realmente no pagas intereses?          ← el ángulo diferenciador
H2   ¿Cuándo cae el primer pago?             ← fecha de corte vs. límite de pago
H2   ¿Qué pasa si me atraso en una mensualidad?
H2   ¿Conviene o no?                          ← checklist honesta, no venta
H2   Preguntas frecuentes                     ← FAQPage JSON-LD
[CTA]
```

`JSON-LD`: `SoftwareApplication` (la calculadora) + `FAQPage`.

## 6. FAQ para el schema

- ¿Qué significa MSI?
- ¿Los meses sin intereses afectan mi buró de crédito?
- ¿Puedo pagar por adelantado una compra a meses sin intereses?
- ¿Qué pasa si cancelo la tarjeta con una promoción activa?
- ¿Los MSI ocupan todo mi límite de crédito?
- ¿Se puede hacer MSI con tarjeta de débito?

## 7. CTA a Centavos

Va **después del calendario de pagos**, cuando el usuario acaba de ver que se comprometió
N meses hacia adelante. Ese es el momento de máxima relevancia.

> ### Ya sabes cuánto, ahora que no se te olvide
> Acabas de agregar N pagos a tu presupuesto de los próximos N meses. Centavos te los
> recuerda antes de que caigan y te dice cuánto llevas comprometido en total.
>
> [Descargar gratis · App Store] [Google Play]
>
> Sin conectar tu banco. Sin registro.

Botón secundario, discreto, arriba del FAQ: *"Anota esta compra en Centavos →"*

## 8. Fuentes

- CAT — Banco de México: <https://www.banxico.org.mx/servicios/cat-costo-anual-total.html>
- LTOSF: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LTOSF.pdf>
- LFPC: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf>
- Condusef, comparativo de tarjetas: <https://www.condusef.gob.mx>

## 9. Mantenimiento

**Ninguno.** No depende de ninguna cifra que cambie. Revisar el copy solo si Condusef o
Banxico cambian la regulación de promociones.
