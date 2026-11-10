# `/finiquito` — especificación

| | |
|---|---|
| **Keyword principal** | "calculadora de finiquito", "calculadora de liquidación", "finiquito y liquidación" |
| **Long-tail** | "diferencia entre finiquito y liquidación", "cuánto me toca de finiquito si renuncio", "liquidación por despido injustificado", "prima de antigüedad" |
| **Estacionalidad** | Constante todo el año. Es la de mayor volumen sostenido de toda la lista |
| **Constantes que necesita** | **Salario mínimo** — un número, solo para el tope de la prima de antigüedad |
| **Dificultad competitiva** | Media-alta. Hay despachos laborales posicionados, pero su contenido es captación de clientes, no herramienta |

---

## 1. Finiquito ≠ liquidación (copy base)

La confusión entre ambos términos es **la razón de ser de esta página**. Resolverla arriba,
antes de la calculadora:

| | **Finiquito** | **Liquidación** |
|---|---|---|
| ¿Cuándo aplica? | **Siempre** que termina la relación laboral: renuncia, despido justificado o injustificado, fin de contrato | Solo en **despido injustificado** o rescisión por causa imputable al patrón |
| ¿Qué incluye? | Partes proporcionales que ya te habías ganado | Indemnización, **además** del finiquito |
| ¿Es un castigo al patrón? | No, es tu dinero devengado | Sí, es la sanción por despedir sin causa |

Frase que resume y conviene poner textual: *"El finiquito siempre te lo deben. La
liquidación solo si te corrieron sin razón."*

## 2. Fundamento legal

| Artículo LFT | Qué establece |
|---|---|
| **47** | Causales de rescisión sin responsabilidad para el patrón |
| **48** | Derecho a reinstalación o indemnización + **salarios vencidos** (topados a 12 meses, más 2% mensual sobre 15 meses de salario) |
| **50** | Monto de la indemnización: **3 meses** + **20 días por año** de servicio |
| **51** | Causales de rescisión por culpa del patrón (aplica la misma indemnización) |
| **162** | **Prima de antigüedad**: 12 días por año trabajado |
| **485 y 486** | El salario base de la prima de antigüedad se **topa a 2 veces el salario mínimo** |
| **516 / 518** | Prescripción general de un año; **2 meses** para demandar el despido |

- **LFT:** <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf>
- **PROFEDET** — asesoría y representación gratuita: <https://www.gob.mx/profedet>
- **Centros de Conciliación Laboral:** <https://centrolaboral.gob.mx>

> **Aviso legal obligatorio en la página.** Esta calculadora es informativa. El monto real
> depende de la causa de terminación, prestaciones superiores del contrato y criterios del
> centro de conciliación. Consulta a PROFEDET, que es gratuito.

## 3. Cómo se calcula

### 3.1 Finiquito — siempre se paga

```
salarioDiario = salarioMensual / 30

aguinaldoProporcional       = salarioDiario × 15 × (diasTrabajadosDelAnio / 365)
vacacionesNoGozadas         = salarioDiario × diasPendientes
primaVacacionalProporcional = vacacionesNoGozadas × 0.25
salariosPendientes          = salarioDiario × diasNoPagados

finiquito = suma de lo anterior
```

Los `diasPendientes` de vacaciones salen de la tabla del art. 76 — reutilizar el módulo de
`/vacaciones`, no duplicarlo.

### 3.2 Prima de antigüedad — art. 162

Aplica en **despido (justificado o no)** y en **renuncia con 15 o más años** de servicio.

```
salarioTopado   = min(salarioDiario, 2 × salarioMinimoDiario)
primaAntiguedad = salarioTopado × 12 × aniosDeServicio
```

Aquí entra **la única constante de toda la página**: el salario mínimo diario vigente.
Fuente: CONASAMI. Ojo con las dos zonas — general y Zona Libre de la Frontera Norte.

### 3.3 Liquidación — solo despido injustificado, art. 50

```
tresMeses         = salarioDiario × 90
veinteDiasPorAnio = salarioDiario × 20 × aniosDeServicio

liquidacion = finiquito + primaAntiguedad + tresMeses + veinteDiasPorAnio
```

> **Matiz importante que casi nadie explica.** Los 20 días por año del art. 50-II no son
> automáticos en todos los escenarios: aplican cuando el trabajador opta por la
> indemnización en lugar de la reinstalación, o cuando la reinstalación no procede. En la
> práctica de negociación se incluyen casi siempre. Mostrarlos como **línea separada y
> marcada como "sujeta a negociación o resolución"**, no fundidos en el total.

Los **salarios vencidos** del art. 48 dependen de la duración del juicio: no calcularlos,
solo explicarlos.

### 3.4 El salario base

Para indemnizaciones se usa el **salario integrado** (arts. 84 y 89): cuota diaria más
prestaciones —proporción de aguinaldo y prima vacacional—. No es el salario diario simple.

```
factorIntegracion = 1 + (15/365) + (diasVacaciones × 0.25 / 365)
salarioIntegrado  = salarioDiario × factorIntegracion
```

Decisión de diseño recomendada: calcular con salario diario simple por default y ofrecer un
switch *"usar salario diario integrado"*, explicando la diferencia. Mezclarlos sin avisar es
lo que hace que las calculadoras de la competencia den cifras que no cuadran.

### 3.5 Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Renuncia con <15 años | Finiquito sí, prima de antigüedad **no**, liquidación **no** |
| Renuncia con ≥15 años | Finiquito + prima de antigüedad |
| Despido justificado | Finiquito + prima de antigüedad, sin indemnización |
| Despido injustificado | Todo |
| Salario < 2 salarios mínimos | El tope del art. 486 no muerde; usar el salario real |
| Salario muy alto | La prima de antigüedad queda topada — explicar por qué sale tan baja |
| Menos de un año | Todo proporcional, prima de antigüedad también |
| Contrato por obra determinada | Reglas distintas (art. 53). Mostrar nota, no calcular |

## 4. Casos de prueba

```ts
// Renuncia, 3 años, sueldo 20,000, 10 días de vacaciones pendientes, sin días sueltos
// salarioDiario = 666.67
//   aguinaldo prop. (180 días)  = 666.67 × 15 × 180/365 = 4931.51
//   vacaciones no gozadas       = 666.67 × 10           = 6666.70
//   prima vacacional            = 6666.70 × 0.25        = 1666.68
//   prima de antigüedad         = NO (menos de 15 años)
// finiquito ≈ 13,264.89

// Despido injustificado, mismos datos
//   + prima de antigüedad: min(666.67, 2 × SMdiario) × 12 × 3
//   + 3 meses:      666.67 × 90     = 60,000.30
//   + 20 días/año:  666.67 × 20 × 3 = 40,000.20
```

Fijar estos casos como tests y verificarlos contra la calculadora de PROFEDET antes de
publicar.

## 5. Estructura de la página

```
H1   Calculadora de finiquito y liquidación 2026
     [ ¿Cómo terminó? ▾ renuncia / despido justificado / despido injustificado ]
     [ Sueldo mensual ] [ Fecha de ingreso ] [ Fecha de salida ]
     [ Días de vacaciones pendientes ]
     → Desglose línea por línea, cada una con su artículo citado
     → Total

H2   ¿Cuál es la diferencia entre finiquito y liquidación?   ← la tabla de arriba
H2   ¿Qué incluye el finiquito?
H2   ¿Cuándo me toca liquidación?
H2   ¿Qué es la prima de antigüedad?
H2   ¿Cuánto tiempo tienen para pagarme?
H2   Me despidieron, ¿qué hago?                              ← PROFEDET, plazo de 2 meses
H2   Preguntas frecuentes                                    ← FAQPage JSON-LD
[CTA]
```

Que **cada línea del desglose cite su artículo** es a la vez utilidad real y señal E-E-A-T:
es contenido YMYL y Google evalúa la confiabilidad con dureza.

## 6. FAQ para el schema

- ¿Cuál es la diferencia entre finiquito y liquidación?
- ¿Me toca liquidación si renuncio?
- ¿Cuánto es la prima de antigüedad?
- ¿Cuánto tiempo tiene la empresa para pagarme el finiquito?
- ¿Puedo demandar si no me pagan?
- ¿El finiquito paga impuestos?
- ¿Qué pasa si firmo el finiquito y no estoy de acuerdo?
- ¿Me toca finiquito si trabajé menos de un año?

## 7. CTA a Centavos

Contexto emocional distinto al resto: la persona probablemente acaba de quedarse sin
ingreso. El CTA **no puede ser festivo**. Tono sobrio y útil.

> ### Ese dinero tiene que durarte
> Mientras encuentras la siguiente chamba, saber exactamente cuánto sale cada semana es lo
> que hace la diferencia. Centavos te deja anotar gastos en segundos y ver cuánto te queda,
> sin conectar tu banco ni registrarte.
>
> [Descargar gratis · App Store] [Google Play]

Antes del CTA, un bloque de **PROFEDET** —asesoría gratuita, teléfono y liga—. Ayuda de
verdad a quien llegó ahí, y es exactamente la clase de señal que Google premia en YMYL.

Enlaces internos: `/aguinaldo` (el proporcional va en el finiquito), `/vacaciones`.

## 8. Fuentes

- LFT arts. 47–53, 162, 485–486: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf>
- PROFEDET: <https://www.gob.mx/profedet>
- Centro Federal de Conciliación y Registro Laboral: <https://centrolaboral.gob.mx>
- Salario mínimo (CONASAMI): <https://www.gob.mx/conasami>

## 9. Mantenimiento

**Un número al año:** el salario mínimo diario (general y ZLFN), que CONASAMI publica en
diciembre con vigencia del 1 de enero. Solo afecta el tope de la prima de antigüedad.
Ver `docs/calculadoras/README.md`.
