# `/vacaciones` — especificación

| | |
|---|---|
| **Keyword principal** | "calculadora de vacaciones", "cuántos días de vacaciones me tocan" |
| **Long-tail** | "vacaciones dignas", "prima vacacional cómo se calcula", "tabla de vacaciones 2026", "vacaciones por antigüedad" |
| **Estacionalidad** | Constante todo el año, con repunte en diciembre y julio |
| **Constantes que necesita** | **Ninguna** para días y prima. UMA solo para la exención de ISR |
| **Dificultad competitiva** | Media. La reforma de 2023 dejó mucho contenido viejo y desactualizado rankeando — hueco real |

---

## 1. Qué son (copy base)

Descanso pagado obligatorio por cada año cumplido de trabajo. Desde la reforma de
**"Vacaciones Dignas"** (vigente el **1 de enero de 2023**), el primer año pasó de 6 a
**12 días**.

Dos cosas que el contenido viejo sigue diciendo mal y son la oportunidad de esta página:

1. **Ya no son 6 días el primer año.** Media internet sigue publicando la tabla anterior.
2. **Las vacaciones no se pagan, se disfrutan.** Lo que se paga aparte es la *prima
   vacacional*. Solo al terminar la relación laboral se pagan en dinero los días no gozados.

## 2. Fundamento legal

Reforma publicada en el **DOF el 27 de diciembre de 2022**, vigente desde el 1 de enero de 2023.

| Artículo LFT | Qué dice |
|---|---|
| **76** | Tabla de días por antigüedad |
| **78** | Al menos **12 días continuos** del periodo deben tomarse seguidos |
| **79** | Las vacaciones **no son compensables en dinero**, salvo terminación de la relación |
| **80** | **Prima vacacional: 25%** mínimo sobre los salarios de los días de vacaciones |
| **81** | Deben otorgarse dentro de los **6 meses** siguientes al cumplimiento del año |
| **516** | Prescripción de **un año** |

- **LFT:** <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf>
- **DOF de la reforma:** <https://www.dof.gob.mx/nota_detalle.php?codigo=5675133&fecha=27/12/2022>
- **Art. 93-XIV LISR** — prima vacacional exenta hasta **15 días de UMA**:
  <https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf>
- **STPS, Vacaciones Dignas:** <https://www.gob.mx/stps>

## 3. Cómo se calcula

### 3.1 Tabla del artículo 76

```ts
export const DIAS_VACACIONES = [
  { anios: 1,  dias: 12 },
  { anios: 2,  dias: 14 },
  { anios: 3,  dias: 16 },
  { anios: 4,  dias: 18 },
  { anios: 5,  dias: 20 },
  // A partir del sexto año, +2 días por cada 5 años de servicio
  { desde: 6,  hasta: 10, dias: 22 },
  { desde: 11, hasta: 15, dias: 24 },
  { desde: 16, hasta: 20, dias: 26 },
  { desde: 21, hasta: 25, dias: 28 },
  { desde: 26, hasta: 30, dias: 30 },
] as const;
```

Para antigüedades mayores la regla es abierta: `22 + 2 × floor((anios − 6) / 5)`.
Implementarla como función, no como tabla cerrada, para no toparla en 30 años.

### 3.2 Prima vacacional

```
salarioDiario   = salarioMensual / 30
primaVacacional = salarioDiario × diasDeVacaciones × 0.25
```

El 25% es el **mínimo legal**. Hacerlo editable: hay contratos colectivos con 30%, 50% o más.

### 3.3 Proporcional (año incompleto)

Aplica cuando termina la relación laboral antes de cumplir el año:

```
diasProporcionales = diasQueLeTocan × (diasTrabajadosDelPeriodo / 365)
```

### 3.4 Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Menos de 1 año cumplido | No se ha generado el derecho completo; mostrar solo el proporcional y explicarlo |
| Exactamente 5 años | 20 días (último escalón anual antes de los quinquenios) |
| 6 años | 22 días — es el salto que más confunde |
| 30+ años | Fórmula abierta, no tabla topada |
| Días pendientes de años anteriores | Prescriben al año (art. 516). Nota en la página, no en el cálculo |
| Prima vacacional sobre días no gozados al salir | Sí se paga. Enlazar a `/finiquito` |

## 4. Casos de prueba

```ts
diasPorAntiguedad(1)  === 12
diasPorAntiguedad(5)  === 20
diasPorAntiguedad(6)  === 22   // primer quinquenio
diasPorAntiguedad(10) === 22
diasPorAntiguedad(11) === 24
diasPorAntiguedad(31) === 32   // fórmula abierta, no tabla

// Prima vacacional, 3 años, sueldo 18,000
primaVacacional({ salarioMensual: 18000, anios: 3 })
  // 600 × 16 × 0.25 = 2400
```

## 5. Estructura de la página

```
H1   Calculadora de vacaciones y prima vacacional 2026
     [ Fecha de ingreso | Años de antigüedad ] [ Sueldo mensual ] [ % de prima: 25 ]
     → Te tocan N días de vacaciones
     → Prima vacacional: $X

H2   ¿Cuántos días de vacaciones me tocan? — tabla completa del art. 76
H2   Qué cambió con la reforma de Vacaciones Dignas
H2   ¿Qué es la prima vacacional?
H2   ¿Me pueden pagar las vacaciones en vez de dármelas?   ← no, art. 79
H2   ¿Cuándo puedo tomarlas?                                ← 6 meses, art. 81
H2   ¿Se acumulan si no las tomo?                           ← prescripción, art. 516
H2   Preguntas frecuentes                                   ← FAQPage JSON-LD
[CTA]
```

La **tabla completa del art. 76 en HTML** es el activo más valioso de esta página: es lo que
la gente copia y enlaza, y es candidata a fragmento destacado en Google.

## 6. FAQ para el schema

- ¿Cuántos días de vacaciones me tocan al primer año?
- ¿Qué es la prima vacacional y cuánto es?
- ¿Puedo cobrar mis vacaciones en lugar de tomarlas?
- ¿Cuánto tiempo tengo para tomar mis vacaciones?
- ¿Las vacaciones se acumulan de un año a otro?
- ¿La prima vacacional paga impuestos?
- ¿Los días de vacaciones son hábiles o naturales?

## 7. CTA a Centavos

La prima vacacional es dinero extra que llega junto con un viaje planeado. Ese es el gancho.

> ### $X de prima vacacional. ¿Ya sabes a dónde van?
> La prima vacacional suele irse en el viaje mismo. En Centavos armas un presupuesto de
> viaje, anotas lo que vas gastando y regresas sabiendo exactamente cuánto costó.
>
> [Descargar gratis · App Store] [Google Play]
>
> Funciona sin internet — útil justo cuando andas de viaje.

El ángulo de "funciona sin internet" es especialmente relevante aquí y no lo es en las otras
páginas. Aprovecharlo.

Enlaces internos: `/aguinaldo`, `/finiquito`, `/presupuestos`.

## 8. Fuentes

- LFT arts. 76–81: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf>
- Reforma en el DOF (27 dic 2022): <https://www.dof.gob.mx/nota_detalle.php?codigo=5675133&fecha=27/12/2022>
- LISR art. 93: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf>
- STPS: <https://www.gob.mx/stps>
- PROFEDET: <https://www.gob.mx/profedet>

## 9. Mantenimiento

**Ninguno.** La tabla del art. 76 y el 25% de prima están en la ley y no se indexan.
Solo habría que tocarla si hay una nueva reforma laboral.
