# `/cetes` — especificación

| | |
|---|---|
| **Keyword principal** | "calculadora de CETES", "cuánto ganas con CETES", "rendimiento CETES" |
| **Long-tail** | "CETES a 28 días", "cuánto me dan 10000 pesos en CETES", "cetesdirecto cómo funciona", "CETES vs pagaré bancario" |
| **Estacionalidad** | Constante, con repuntes cada vez que Banxico mueve la tasa |
| **Constantes que necesita** | **Ninguna** si la tasa es input del usuario. Con tasa en vivo pasa a necesitar Banxico SIE |
| **Dificultad competitiva** | Media-alta. Cetesdirecto y bancos están posicionados, pero su contenido es promocional |

---

## 1. Qué son los CETES (copy base)

Certificados de la Tesorería de la Federación. Son deuda del gobierno mexicano a corto
plazo: le prestas dinero a la Federación y te lo devuelve con rendimiento en una fecha fija.

Lo que hay que explicar bien y casi nadie hace:

1. **No pagan intereses: se compran a descuento.** Un CETE tiene valor nominal de **$10** y
   lo compras en menos. La diferencia entre lo que pagaste y los $10 que recibes al
   vencimiento es tu ganancia. Por eso el "rendimiento" que anuncian no es directamente lo
   que te llega.
2. **La tasa se anuncia anualizada**, aunque el plazo sea de 28 días. Un CETE al 10% anual a
   28 días no te da 10%, te da aproximadamente 0.78% en ese mes.
3. **Pagan ISR sobre el capital, no sobre la ganancia.** Es la sorpresa más común.
4. **Plazos disponibles:** 28, 91, 182 y 364 días. La subasta es semanal (martes).

## 2. Marco de referencia

No es tema de ley laboral, sino de mercado y fiscal.

- **Banco de México** — subastas, tasas y series históricas:
  <https://www.banxico.org.mx/mercados/valores-gubernamentales.html>
- **API SIE de Banxico** (gratis, con token) — series de CETES por plazo:
  <https://www.banxico.org.mx/SieAPIRest/>
- **Cetesdirecto** — la plataforma oficial de la SHCP para personas físicas, desde $100:
  <https://www.cetesdirecto.com>
- **Art. 54 LISR** — retención de ISR sobre intereses, a la tasa anual que fija la **Ley de
  Ingresos de la Federación** de cada ejercicio, aplicada **sobre el capital invertido**:
  <https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf>
- **Ley de Ingresos de la Federación** (la tasa de retención cambia cada año):
  <https://www.diputados.gob.mx/LeyesBiblio/ref/lif.htm>
- **Condusef**, comparativos de instrumentos de ahorro: <https://www.condusef.gob.mx>

## 3. Cómo se calcula

### 3.1 Precio de compra (descuento)

```
VN = 10   // valor nominal en pesos

precio = VN / (1 + (tasaAnual × plazoEnDias / 360))
```

Ojo con la convención: **base 360 días**, no 365. Es la que usa Banxico para valores
gubernamentales.

### 3.2 Rendimiento

```
titulos          = floor(inversion / precio)
montoInvertido   = titulos × precio
montoVencimiento = titulos × VN
gananciaBruta    = montoVencimiento − montoInvertido

rendimientoPeriodo = gananciaBruta / montoInvertido
rendimientoAnualEf = (1 + rendimientoPeriodo)^(360 / plazo) − 1
```

El **rendimiento anual efectivo** difiere de la tasa anunciada por el efecto de la
capitalización. Mostrar ambos y explicar la diferencia es el diferenciador de la página.

### 3.3 Reinversión

La pregunta real de la gente es *"¿cuánto tengo en un año si reinvierto?"*:

```
capital = inversionInicial
for (let i = 0; i < ciclos; i++) {
  capital = capital × (1 + tasaAnual × plazo / 360) − impuestoDelCiclo
}
```

Con `ciclos = floor(360 / plazo)`. Una tabla ciclo por ciclo vale más que el número final.

### 3.4 Impuestos — el punto que hay que explicar

La retención del art. 54 LISR se calcula **sobre el capital invertido**, no sobre la
ganancia:

```
diasInvertidos = plazo
isrRetenido = capital × tasaRetencionAnual × (diasInvertidos / 365)
```

Consecuencia contraintuitiva que conviene decir sin adornos: **cuando la tasa de CETES está
baja, la retención puede acercarse o superar el rendimiento real**. Es una retención
provisional, acreditable en la declaración anual, pero el flujo del momento sí se ve así.

La `tasaRetencionAnual` es **la única constante anual** de esta página, y viene en la Ley de
Ingresos de la Federación de cada ejercicio.

**Decisión de diseño recomendada:** el ISR va como **sección opcional colapsada**. El
resultado principal —rendimiento bruto— no depende de ninguna constante, y así la página
tiene cero mantenimiento obligatorio.

### 3.5 Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Inversión menor a $100 | Cetesdirecto tiene mínimo de $100. Avisar |
| Inversión no divisible entre el precio | Se compran títulos enteros; mostrar el sobrante no invertido |
| Tasa = 0 o negativa | Bloquear, no mostrar `NaN` |
| Plazo fuera de 28/91/182/364 | Permitirlo, pero marcar que no corresponde a una subasta real |
| Tasa muy baja + ISR activado | Rendimiento neto negativo. Mostrarlo, no esconderlo |

## 4. Casos de prueba

```ts
// CETE a 28 días, tasa anual 10%
precio(0.10, 28)  // 10 / (1 + 0.10 × 28/360) = 9.92277...

calcular({ inversion: 10000, tasaAnual: 0.10, plazo: 28 })
// titulos  = floor(10000 / 9.92277) = 1007
// invertido = 9992.23
// vencimiento = 10070
// ganancia = 77.77 → 0.778% en el periodo

// Rendimiento anual efectivo
// (1 + 0.00778)^(360/28) − 1 ≈ 10.46%
```

Verificar el precio contra la calculadora de Cetesdirecto antes de publicar.

## 5. Estructura de la página

```
H1   Calculadora de CETES 2026
     [ Monto a invertir ] [ Plazo ▾ 28 / 91 / 182 / 364 ] [ Tasa anual % ]
     [ ] Reinvertir al vencimiento
     [ ] Calcular ISR retenido           ← opcional, colapsado
     → Al vencimiento recibes $X
     → Ganancia: $Y (Z% en el periodo, W% anual efectivo)
     → Tabla ciclo por ciclo si hay reinversión

H2   ¿Qué son los CETES?
H2   ¿Por qué se compran a descuento?          ← el valor nominal de $10
H2   ¿Cuánto ganas realmente con CETES?        ← anualizada vs. del periodo
H2   ¿Los CETES pagan impuestos?               ← ISR sobre el capital
H2   ¿Cómo comprar CETES?                      ← Cetesdirecto, mínimo $100
H2   ¿Son seguros?                             ← riesgo soberano, no cobertura de IPAB
H2   CETES vs. pagaré bancario vs. cuenta de ahorro
H2   Preguntas frecuentes                      ← FAQPage JSON-LD
[CTA]
```

**Mejora opcional de alto valor:** prellenar el campo de tasa con la tasa vigente de Banxico
(SIE) vía ISR con `revalidate: 86400`. Convierte la página en una que la gente revisita.
Pasa a la categoría de "necesita fetch", pero no de "necesita backend".

## 6. FAQ para el schema

- ¿Qué son los CETES?
- ¿Cuánto puedo ganar con CETES?
- ¿Cuál es el monto mínimo para invertir en CETES?
- ¿Los CETES pagan impuestos?
- ¿Puedo sacar mi dinero antes del vencimiento?
- ¿Los CETES son seguros?
- ¿Cada cuándo cambian las tasas de CETES?
- ¿Qué plazo de CETES conviene más?

## 7. CTA a Centavos

Público distinto al resto de las páginas: aquí llega alguien que ya tiene un excedente y
está decidiendo dónde ponerlo. El gancho no es "controla tus gastos", es "de aquí sale lo
que inviertes".

> ### Lo que inviertes sale de lo que no gastas
> Antes de decidir el plazo, vale la pena saber cuánto te sobra de verdad cada mes. En
> Centavos anotas tus gastos en segundos y ves cuánto puedes apartar sin quedarte corto.
>
> [Descargar gratis · App Store] [Google Play]
>
> Sin conectar tu banco. Sin registro.

**Importante:** esta página no debe dar recomendación de inversión. Solo calcula y explica.
Incluir un aviso: *"Esta calculadora es informativa y no constituye asesoría financiera. Los
rendimientos dependen de la tasa de la subasta vigente."*

Enlaces internos: `/presupuestos`, `/dolar` (audiencia que se traslapa fuerte).

## 8. Fuentes

- Valores gubernamentales, Banxico: <https://www.banxico.org.mx/mercados/valores-gubernamentales.html>
- API SIE: <https://www.banxico.org.mx/SieAPIRest/>
- Cetesdirecto: <https://www.cetesdirecto.com>
- LISR art. 54: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf>
- Ley de Ingresos de la Federación: <https://www.diputados.gob.mx/LeyesBiblio/ref/lif.htm>
- Condusef: <https://www.condusef.gob.mx>

## 9. Mantenimiento

**Ninguno** si la tasa es input del usuario y el ISR queda como sección opcional.

Si se activa el ISR: **un número al año**, la tasa de retención sobre intereses de la Ley de
Ingresos (se publica en noviembre, vigente el 1 de enero).
Si se prellena la tasa en vivo: token de Banxico SIE, sin mantenimiento manual.
