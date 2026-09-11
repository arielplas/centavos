# `/aguinaldo` — especificación

| | |
|---|---|
| **Keyword principal** | "calculadora de aguinaldo", "cómo se calcula el aguinaldo" |
| **Long-tail** | "cuántos días de aguinaldo me tocan", "cuándo pagan el aguinaldo 2026", "aguinaldo si no cumplí el año", "el aguinaldo paga impuestos" |
| **Estacionalidad** | **Noviembre–diciembre**, pico muy pronunciado. Construir en octubre |
| **Constantes que necesita** | **Ninguna** para el monto bruto. UMA solo si se calcula la parte exenta de ISR |
| **Dificultad competitiva** | Media en la calculadora, muy alta en el explainer puro |

---

## 1. Qué es el aguinaldo (copy base)

Prestación anual obligatoria para toda persona trabajadora bajo la Ley Federal del Trabajo,
sin importar el tipo de contrato ni la antigüedad. **No es un bono ni depende del desempeño
ni de las utilidades de la empresa**: es un derecho.

Tres cosas que la gente busca y casi nadie responde junto:

1. El mínimo son **15 días de salario**, no un mes. El mes completo es prestación superior
   que algunas empresas dan, pero no es lo que marca la ley.
2. Se paga **antes del 20 de diciembre**, sin excepción.
3. Si no trabajaste el año completo —incluso si ya no trabajas ahí— te toca **la parte
   proporcional**.

## 2. Fundamento legal

**Artículo 87 de la Ley Federal del Trabajo:**

> Los trabajadores tendrán derecho a un aguinaldo anual que deberá pagarse antes del día
> veinte de diciembre, equivalente a quince días de salario, por lo menos. Los que no hayan
> cumplido el año de servicios [...] tendrán derecho a que se les pague en proporción al
> tiempo que hubieren trabajado, cualquiera que fuere éste.

- **LFT completa:** <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf>
- **Art. 88 LFT** — el salario base es el que corresponde al día del pago.
- **Art. 516 LFT** — prescripción de un año para reclamarlo.
- **Art. 93, fracción XIV, LISR** — exención de **30 días de UMA**:
  <https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf>
- **PROFEDET** asesora y representa gratis en la reclamación:
  <https://www.gob.mx/profedet>

## 3. Cómo se calcula

### 3.1 Fórmula

```
salarioDiario  = salarioMensual / 30
aguinaldo      = salarioDiario × diasDeAguinaldo × (diasTrabajados / 365)
```

- `diasDeAguinaldo` = 15 por default, editable (hay empresas con 20, 30 o más).
- `diasTrabajados` = días del año trabajados. Si trabajó el año completo, 365 → el factor es 1.
- La LFT usa **mes de 30 días** para derivar el salario diario. No 30.4, no días naturales
  del mes. Esto es fuente constante de discrepancias; conviene decirlo en la página.

### 3.2 Qué salario se usa

Salario **diario** (cuota diaria), no el salario diario integrado del IMSS. No incluye
horas extra ni bonos variables; sí incluye las percepciones fijas. Para quienes ganan por
comisión o salario variable, el art. 89 LFT manda usar el **promedio de los últimos 30
días** efectivamente trabajados.

### 3.3 Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Trabajó el año completo | Factor = 1, sin proporcional |
| Entró a mitad de año | Proporcional desde la fecha de ingreso al 31 de diciembre |
| Ya renunció o lo despidieron | Le toca proporcional; se paga en el finiquito. Enlazar a `/finiquito` |
| Año bisiesto | La práctica y los criterios de la JFCA usan **365**. Documentarlo en el código |
| Incapacidad por riesgo de trabajo | **Sí** cuenta como tiempo trabajado |
| Incapacidad por enfermedad general | Criterio dividido; la práctica común la descuenta. Mostrar nota, no decidir por el usuario |
| Permiso sin goce de sueldo | Se descuenta de `diasTrabajados` |
| Salario variable / comisionistas | Promedio de los últimos 30 días trabajados (art. 89 LFT) |

### 3.4 Impuestos — decisión de diseño

**Recomendación: no calcular el neto.** Explicarlo en prosa y dejar el bruto como resultado.

Razón: el ISR sobre aguinaldo requiere la tarifa del art. 96 LISR *o* el procedimiento
opcional del art. 174 del Reglamento, más la UMA vigente. Son dos tablas que hay que
mantener cada año, y el bruto —que es lo que la gente vino a saber— no las necesita.

Lo que sí va en la página, como texto:

> Los primeros **30 días de UMA** de tu aguinaldo están exentos de ISR (art. 93-XIV LISR).
> Lo que exceda ese monto sí paga impuesto, y tu empresa lo retiene. El cálculo exacto de
> la retención depende de tu ingreso anual, así que la cifra de arriba es tu aguinaldo
> **bruto**.

Si más adelante quieres el neto, se agrega como sección opcional colapsada, y el fallo
de una constante vieja no rompe el resultado principal.

## 4. Casos de prueba

```ts
// Año completo, 15 días
calcular({ salarioMensual: 15000, dias: 15, diasTrabajados: 365 })
  // salarioDiario = 500 → 500 × 15 × 1 = 7500

// Medio año
calcular({ salarioMensual: 15000, dias: 15, diasTrabajados: 183 })
  // 500 × 15 × (183/365) = 3760.27

// Prestación superior: 30 días
calcular({ salarioMensual: 15000, dias: 30, diasTrabajados: 365 })
  // 15000

// Ingreso el 1 de octubre
calcular({ salarioMensual: 12000, dias: 15, fechaIngreso: "2026-10-01" })
  // diasTrabajados = 92 → 400 × 15 × (92/365) = 1512.33
```

## 5. Estructura de la página

```
H1   Calculadora de aguinaldo 2026
     [ Sueldo mensual ] [ Días de aguinaldo: 15 ] [ Fecha de ingreso | Año completo ]
     → Te tocan $X de aguinaldo
     → Desglose: salario diario × días × proporción

H2   ¿Qué es el aguinaldo?
H2   ¿Cuándo se paga el aguinaldo?           ← "antes del 20 de diciembre"
H2   ¿Cuántos días de aguinaldo me tocan?
H2   ¿Y si no cumplí el año?                  ← enlace a /finiquito
H2   ¿El aguinaldo paga impuestos?
H2   ¿Qué hago si no me lo pagan?             ← PROFEDET, prescripción de 1 año
H2   Preguntas frecuentes                     ← FAQPage JSON-LD
[CTA]
```

Variantes de URL que valen la pena: `/aguinaldo/2025`, `/aguinaldo/2024` con el mismo
componente y el año en el H1. Son keywords propias con volumen real.

## 6. FAQ para el schema

- ¿Cuándo se paga el aguinaldo en México?
- ¿Cuántos días de aguinaldo marca la ley?
- ¿Me toca aguinaldo si renuncié?
- ¿Me toca aguinaldo si llevo menos de un año?
- ¿El aguinaldo paga ISR?
- ¿Qué pasa si mi empresa no me paga el aguinaldo?
- ¿Los trabajadores por honorarios tienen aguinaldo?
- ¿El aguinaldo se puede pagar en vales o en especie? (No — art. 87, debe ser en efectivo)

## 7. CTA a Centavos

Después del resultado, cuando la persona acaba de ver una cifra concreta de dinero que va a
recibir. Es el mejor momento de toda la lista de páginas.

> ### Son $X. ¿Ya sabes en qué se te van a ir?
> El aguinaldo se evapora en dos semanas si no lo anotas. En Centavos apartas cuánto va a
> deudas, cuánto a regalos y cuánto se queda — y ves en qué se fue de verdad.
>
> [Descargar gratis · App Store] [Google Play]
>
> Sin conectar tu banco. Sin registro. Hecha en México.

Enlaces internos desde esta página: `/finiquito` (proporcional al salir), `/vacaciones`
(prima vacacional, la otra prestación que se cobra en diciembre),
`/meses-sin-intereses` (para quien piensa gastarlo en el Buen Fin).

## 8. Fuentes

- Ley Federal del Trabajo: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf>
- Ley del ISR (art. 93): <https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf>
- PROFEDET: <https://www.gob.mx/profedet>
- Valor de la UMA (INEGI): <https://www.inegi.org.mx/temas/uma/>

## 9. Mantenimiento

**Ninguno** si solo se calcula el bruto. La fórmula y los 15 días están en la ley y no se
indexan a la inflación.

Si se agrega el cálculo del neto: UMA (INEGI, cada febrero) y tarifa ISR (Anexo 8 de la RMF,
cada diciembre). Ver `docs/calculadoras/README.md`.
