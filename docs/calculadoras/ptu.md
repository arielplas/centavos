# `/ptu` — especificación

| | |
|---|---|
| **Keyword principal** | "calculadora de PTU", "reparto de utilidades", "cuánto me toca de utilidades" |
| **Long-tail** | "cuándo pagan las utilidades 2026", "tope de utilidades 3 meses", "utilidades si renuncié", "quién no tiene derecho a utilidades" |
| **Estacionalidad** | **Abril–junio**, pico muy marcado. Construir en marzo |
| **Constantes que necesita** | **UMA** — un número, solo para la exención de ISR |
| **Dificultad competitiva** | Media. Mucho contenido periodístico anual, poca herramienta real |

---

## 1. Qué es la PTU (copy base)

Participación de los Trabajadores en las Utilidades. Es el derecho constitucional a recibir
una parte de las ganancias de la empresa donde trabajas. **No es un bono discrecional**: si
la empresa tuvo utilidad fiscal, el reparto es obligatorio.

Lo que casi nadie explica bien y es el ángulo de esta página:

1. **La empresa reparte el 10% de su renta gravable**, no de sus ventas ni de su "utilidad
   contable". Por eso una empresa con mucha facturación puede repartir poco.
2. **La mitad se reparte por días trabajados y la otra mitad por salarios devengados.** Dos
   bolsas distintas con reglas distintas.
3. **Desde la reforma de 2021 hay tope**, y es la razón por la que a mucha gente le bajó el
   monto respecto a años anteriores.
4. Se puede calcular **tu** parte solo si conoces el monto total a repartir, el total de días
   trabajados por toda la plantilla y el total de salarios. Eso viene en el aviso que la
   empresa está obligada a publicar.

## 2. Fundamento legal

- **Art. 123, apartado A, fracción IX, constitucional** — el derecho de origen:
  <https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf>
- **LFT arts. 117 a 131:** <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf>

| Artículo LFT | Qué establece |
|---|---|
| **117** | Derecho a participar en las utilidades |
| **122** | Plazo de pago: dentro de los **60 días** siguientes a la fecha en que deba pagarse el ISR anual |
| **123** | Reparto: **50% por días trabajados**, **50% por salarios devengados** |
| **127** | Quiénes quedan excluidos y las reglas del reparto |
| **127, fracción VIII** | **Tope de la reforma 2021**: 3 meses de salario **o** el promedio de la PTU de los últimos 3 años, **lo que resulte más favorable al trabajador** |
| **516** | Prescripción de un año |

- **Reforma de subcontratación y tope de PTU**, DOF 23 de abril de 2021:
  <https://www.dof.gob.mx/nota_detalle.php?codigo=5616745&fecha=23/04/2021>
- **Art. 93, fracción XIV, LISR** — exención de **15 días de UMA**:
  <https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf>
- **PROFEDET:** <https://www.gob.mx/profedet>

### Fechas límite

| Tipo de patrón | Fecha límite de pago |
|---|---|
| Personas morales | **30 de mayo** |
| Personas físicas | **29 de junio** |

## 3. Cómo se calcula

### 3.1 El reparto

El monto total a repartir se divide en dos mitades iguales:

```
mitad = utilidadRepartible / 2

// Bolsa 1: por días trabajados
factorDias    = mitad / totalDiasTrabajadosPlantilla
porDias       = factorDias × misDiasTrabajados

// Bolsa 2: por salarios devengados
factorSalario = mitad / totalSalariosPlantilla
porSalario    = factorSalario × misSalariosDevengados

ptuBruta = porDias + porSalario
```

Para el cálculo de la bolsa 2 se usa el **salario diario sin prestaciones** (art. 124), y
quien gana más de lo que gana el trabajador sindicalizado de mayor salario tiene ese monto
como referencia topada, +20% (art. 127-II).

### 3.2 El tope de la reforma 2021

```
topeA = salarioMensual × 3
topeB = promedio de la PTU recibida en los últimos 3 años

ptuFinal = min(ptuBruta, max(topeA, topeB))
```

El `max` es clave y es lo que casi todas las notas de prensa cuentan al revés: la ley dice
*"lo que resulte más favorable al trabajador"*, así que primero se toma el **mayor** de los
dos topes y contra ese se compara.

Si no hay historial de 3 años, solo aplica `topeA`.

### 3.3 Impuestos

Exentos **15 días de UMA** (art. 93-XIV LISR). El excedente paga ISR, y el patrón puede usar
el procedimiento del art. 142 del Reglamento de la LISR, que suele resultar en menor
retención.

**Recomendación de diseño:** igual que en `/aguinaldo`, mostrar la **PTU bruta** como
resultado principal y explicar la exención en texto. Así la única constante (UMA) no puede
romper el número que la gente vino a buscar.

### 3.4 Quiénes NO tienen derecho — art. 127

- Directores, administradores y gerentes generales
- Socios y accionistas
- Profesionistas y técnicos que prestan servicios independientes por honorarios
- Trabajadores eventuales que laboraron **menos de 60 días** en el año
- Trabajadoras del hogar
- Empresas de nueva creación, **durante su primer año** (y dos años si fabrican un producto
  nuevo)
- Empresas con capital menor al que fije la STPS, e instituciones de asistencia privada

### 3.5 Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Trabajó menos de 60 días y es eventual | Sin derecho — decirlo explícitamente, no dar $0 sin explicación |
| Renunció durante el ejercicio | **Sí tiene derecho** a la parte proporcional. Es la duda más buscada |
| Incapacidad por maternidad o riesgo de trabajo | **Sí** computa como días trabajados (art. 127-IV) |
| Sin historial de 3 años | Solo aplica el tope de 3 meses |
| No conoce el monto total a repartir | Mostrar el modo "estimación por tope": calcular los 3 meses como cota superior y explicar que es un máximo, no una promesa |

Ese último caso es importante: **la mayoría de los visitantes no tiene los datos de la
plantilla**. La página debe funcionar igual y ser honesta sobre lo que puede y no puede
decir.

## 4. Casos de prueba

```ts
// Reparto con datos completos
calcularPTU({
  utilidadRepartible: 1_000_000,
  totalDias: 20_000,   misDias: 365,
  totalSalarios: 8_000_000, misSalarios: 240_000,
})
// porDias    = (500000/20000) × 365     = 9125
// porSalario = (500000/8000000) × 240000 = 15000
// bruta = 24125

// Con tope de 3 meses (sueldo 20,000)
// topeA = 60000 → no muerde, ptuFinal = 24125

// Tope que sí muerde (sueldo 5,000)
// topeA = 15000, sin historial → ptuFinal = 15000
```

## 5. Estructura de la página

```
H1   Calculadora de PTU 2026 — reparto de utilidades
     Modo A: [ Monto a repartir ] [ Días totales ] [ Salarios totales ] [ Mis días ] [ Mi salario ]
     Modo B: "No tengo esos datos" → estima el tope máximo con el sueldo mensual
     → Tu PTU estimada: $X
     → Desglose: por días + por salarios, y si el tope aplicó

H2   ¿Qué es el reparto de utilidades?
H2   ¿Cuándo se pagan las utilidades?            ← 30 de mayo / 29 de junio
H2   ¿Cómo se calcula mi parte?                   ← las dos bolsas
H2   ¿Cuál es el tope de las utilidades?          ← reforma 2021
H2   ¿Quién no tiene derecho a utilidades?
H2   ¿Me tocan utilidades si renuncié?
H2   ¿Las utilidades pagan impuestos?
H2   Preguntas frecuentes                         ← FAQPage JSON-LD
[CTA]
```

## 6. FAQ para el schema

- ¿Cuándo pagan las utilidades en México?
- ¿Cómo se calcula el reparto de utilidades?
- ¿Cuál es el máximo que pueden darme de utilidades?
- ¿Me tocan utilidades si renuncié a mitad de año?
- ¿Por qué este año me tocaron menos utilidades?
- ¿Qué pasa si la empresa dice que no tuvo utilidades?
- ¿Las utilidades pagan ISR?
- ¿Los trabajadores por honorarios reciben PTU?

## 7. CTA a Centavos

Dinero extra e inesperado, en un momento del año sin gasto obligado asociado. El ángulo es
que no se evapore.

> ### $X que no estaban en tu presupuesto
> El dinero que no esperabas es el que más rápido desaparece. Anota a qué lo destinas antes
> de que llegue, y en junio vas a saber exactamente en qué se fue.
>
> [Descargar gratis · App Store] [Google Play]
>
> Sin conectar tu banco. Sin registro.

Enlaces internos: `/aguinaldo`, `/finiquito`, `/presupuestos`.

## 8. Fuentes

- Constitución, art. 123-A-IX: <https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf>
- LFT arts. 117–131: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LFT.pdf>
- Reforma de 2021 en el DOF: <https://www.dof.gob.mx/nota_detalle.php?codigo=5616745&fecha=23/04/2021>
- LISR art. 93: <https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf>
- PROFEDET: <https://www.gob.mx/profedet>
- STPS: <https://www.gob.mx/stps>
- Valor de la UMA (INEGI): <https://www.inegi.org.mx/temas/uma/>

## 9. Mantenimiento

**Un número al año:** la UMA, solo si se calcula la parte exenta. INEGI la publica en los
primeros 10 días de enero con **vigencia desde el 1 de febrero**.
Ver `docs/calculadoras/README.md`.
