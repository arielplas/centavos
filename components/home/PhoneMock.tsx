// Maquetas de las pantallas de la app Centavos, recreadas en HTML/CSS para
// la página de marketing (Pulso, Presupuestos, Suscripciones, MSI, Divide,
// Recordatorios), con los tokens del sistema de diseño.

import type { CSSProperties, ReactNode } from "react";

// ──────────────────────────────────────────────────────────────
// Marco del teléfono
// ──────────────────────────────────────────────────────────────
/**
 * `crop` recorta el teléfono (muestra ~2/3 con degradado) para secciones
 * secundarias: ahorra scroll sin perder el contexto. En móvil todos los
 * teléfonos se escalan a 0.8 vía CSS (ver .phone en globals.css).
 */
export function PhoneFrame({
  children,
  tilt = 0,
  crop = false,
  className = "",
}: {
  children: ReactNode;
  tilt?: number;
  crop?: boolean;
  className?: string;
}) {
  return (
    <div className={`phone-wrap ${crop ? "phone-wrap--crop" : ""} ${className}`}>
      <div className="phone" style={{ "--tilt": `${tilt}deg` } as CSSProperties}>
        <div className="phone-screen">
          <div className="phone-notch" aria-hidden />
          <div className="h-full overflow-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}

function StatusRow() {
  return (
    <div className="flex justify-between items-center px-6 pt-3 text-[11px] font-bold text-ink">
      <span>9:41</span>
      <span aria-hidden>●●● ▮</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pulso (home)
// ──────────────────────────────────────────────────────────────
export function PulsoMock() {
  return (
    <>
      <StatusRow />
      <div className="px-5 pt-3 flex items-start gap-3">
        <div className="flex-1">
          <div className="text-[10px] font-extrabold tracking-wider text-mandarina-deep uppercase">9 jun · martes</div>
          <div className="font-display text-[22px] font-extrabold tracking-[-0.03em] leading-[1.05] mt-1">
            ¿Qué onda con tu lana hoy?
          </div>
        </div>
        <span className="w-10 h-10 rounded-full bg-mandarina text-bg grid place-items-center font-display font-extrabold border-2 border-yolk">
          ML
        </span>
      </div>

      <div className="mx-4 mt-4 rounded-3xl bg-ink text-bg p-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-yolk" />
          <span className="text-[11px] font-bold opacity-70 uppercase tracking-wide">Vas bien, aguas</span>
        </div>
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide mt-3">Disponible este mes</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$3,541</div>
        <div className="relative h-1.5 bg-white/15 rounded-full mt-4">
          <div className="absolute inset-y-0 left-0 w-[72%] bg-mandarina rounded-full" />
        </div>
        <div className="text-[11px] opacity-60 mt-1.5">Llevas $8,159 de $11,700</div>
      </div>

      <div className="mx-4 mt-3 flex items-center gap-3 bg-surface border border-rule rounded-2xl px-4 py-3">
        <span className="w-9 h-9 rounded-full bg-mandarina text-bg grid place-items-center text-xl font-light">+</span>
        <div className="flex-1">
          <div className="text-[13px] font-bold">Anotar un gasto</div>
          <div className="text-[11px] text-ink-soft">Toma 5 segundos</div>
        </div>
        <span className="text-ink" aria-hidden>›</span>
      </div>

      <div className="px-5 mt-5 text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">Tus presupuestos</div>
      <div className="px-4 mt-2 space-y-2">
        <div className="bg-surface border border-rule rounded-2xl px-4 py-3">
          <div className="flex justify-between text-[13px] font-bold mb-2">
            <span>🌮 Comida</span>
            <span className="text-ink-soft">$2,400 / $3,000</span>
          </div>
          <div className="h-1.5 bg-sand rounded-full"><div className="h-full w-[80%] bg-mandarina rounded-full" /></div>
        </div>
        <div className="bg-surface border border-rule rounded-2xl px-4 py-3">
          <div className="flex justify-between text-[13px] font-bold mb-2">
            <span>🎬 Salidas</span>
            <span className="text-ink-soft">$640 / $1,200</span>
          </div>
          <div className="h-1.5 bg-sand rounded-full"><div className="h-full w-[53%] bg-yolk rounded-full" /></div>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Anotar gasto
// ──────────────────────────────────────────────────────────────
export function AnotarMock() {
  return (
    <>
      <StatusRow />
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="w-9 h-9 rounded-full bg-surface border border-rule grid place-items-center text-lg">×</span>
        <span className="font-display text-[15px] font-extrabold">Anotar gasto</span>
        <span className="w-9 h-9" />
      </div>
      <div className="text-center mt-7">
        <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">¿Cuánto fue?</div>
        <div className="font-display text-[64px] font-extrabold tracking-[-0.05em] leading-none mt-2">$85</div>
      </div>
      <div className="px-5 mt-7 text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">¿En qué?</div>
      <div className="px-4 mt-2 grid grid-cols-4 gap-2">
        <div className="bg-mandarina text-bg rounded-2xl py-3 grid place-items-center text-xl">🌮</div>
        <div className="bg-surface border border-rule rounded-2xl py-3 grid place-items-center text-xl">🚇</div>
        <div className="bg-surface border border-rule rounded-2xl py-3 grid place-items-center text-xl">🎬</div>
        <div className="bg-surface border border-rule rounded-2xl py-3 grid place-items-center text-xl">💊</div>
      </div>
      <div className="px-4 mt-3">
        <div className="bg-surface border border-rule rounded-2xl px-4 py-3 text-[13px] text-ink-soft">📝 Tacos del Güero</div>
      </div>
      <div className="px-4 mt-3 grid grid-cols-3 gap-2 text-center font-display text-2xl font-bold">
        <div className="py-2">1</div><div className="py-2">2</div><div className="py-2">3</div>
        <div className="py-2">4</div><div className="py-2">5</div><div className="py-2">6</div>
        <div className="py-2">7</div><div className="py-2">8</div><div className="py-2">9</div>
      </div>
      <div className="px-4 mt-1">
        <div className="bg-ink text-bg rounded-2xl py-3 text-center text-[14px] font-bold">Anotar $85</div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Presupuestos (límite mensual + cuánto te queda)
// ──────────────────────────────────────────────────────────────
export function PresupuestosMock() {
  const budgets = [
    { emoji: "🌮", name: "Comida", left: "$600", spent: "$2,400", total: "$3,000", pct: 80, bar: "bg-mandarina" },
    { emoji: "🎬", name: "Salidas", left: "$560", spent: "$640", total: "$1,200", pct: 53, bar: "bg-yolk" },
    { emoji: "🚇", name: "Transporte", left: "$310", spent: "$490", total: "$800", pct: 61, bar: "bg-yolk" },
    { emoji: "🛒", name: "Súper", left: "$1,150", spent: "$1,850", total: "$3,000", pct: 62, bar: "bg-mandarina" },
  ];
  return (
    <>
      <StatusRow />
      <div className="px-5 pt-3">
        <div className="text-[10px] font-extrabold tracking-wider text-mandarina-deep uppercase">Junio</div>
        <div className="font-display text-[26px] font-extrabold tracking-[-0.03em] leading-none mt-1">Presupuestos</div>
      </div>

      <div className="mx-4 mt-4 rounded-3xl bg-ink text-bg p-5">
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide">Te queda este mes</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$2,620</div>
        <div className="text-[11px] opacity-60 mt-1.5">De $8,000 en límites que te pusiste</div>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {budgets.map((b) => (
          <div key={b.name} className="bg-surface border border-rule rounded-2xl px-4 py-3">
            <div className="flex justify-between items-baseline text-[13px] font-bold mb-2">
              <span>{b.emoji} {b.name}</span>
              <span className="text-mandarina-deep">Te quedan {b.left}</span>
            </div>
            <div className="h-1.5 bg-sand rounded-full">
              <div className={`h-full ${b.bar} rounded-full`} style={{ width: `${b.pct}%` }} />
            </div>
            <div className="text-[10px] text-ink-soft mt-1.5">{b.spent} de {b.total}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Meses sin intereses (registro manual del calendario de pagos)
// ──────────────────────────────────────────────────────────────
export function MesesSinInteresesMock() {
  const plans = [
    { emoji: "📱", name: "Celular nuevo", per: "$1,000", of: "5 de 12", bg: "bg-sky" },
    { emoji: "🛋️", name: "Sala", per: "$625", of: "2 de 6", bg: "bg-peach" },
    { emoji: "✈️", name: "Vuelo a Cancún", per: "$800", of: "1 de 3", bg: "bg-sand" },
  ];
  return (
    <>
      <StatusRow />
      <div className="px-5 pt-3">
        <div className="text-[10px] font-extrabold tracking-wider text-mandarina-deep uppercase">A plazos</div>
        <div className="font-display text-[24px] font-extrabold tracking-[-0.03em] leading-none mt-1">Meses sin intereses</div>
      </div>

      <div className="mx-4 mt-4 rounded-3xl bg-ink text-bg p-5">
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide">Este mes pagas</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$2,425</div>
        <div className="text-[11px] opacity-60 mt-1.5">En 3 compras a plazos</div>
      </div>

      <div className="px-5 mt-5 text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">Tus compras a meses</div>
      <div className="px-4 mt-2 space-y-2">
        {plans.map((p) => (
          <div key={p.name} className="flex items-center gap-3 bg-surface border border-rule rounded-2xl px-3.5 py-2.5">
            <span className={`w-9 h-9 rounded-xl ${p.bg} grid place-items-center text-lg`}>{p.emoji}</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold leading-tight">{p.name}</div>
              <div className="text-[11px] text-ink-soft">Pago {p.of}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-[15px] font-extrabold tracking-[-0.02em]">{p.per}</div>
              <div className="text-[10px] text-ink-soft">al mes</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Divide gastos (presupuestos compartidos, deudas entre personas y ajuste de cuentas)
// ──────────────────────────────────────────────────────────────
export function DivideMock() {
  return (
    <>
      <StatusRow />
      <div className="px-5 pt-3 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-peach grid place-items-center text-lg">🏠</span>
        <div>
          <div className="text-[10px] font-extrabold tracking-wider text-mandarina-deep uppercase">Compartido</div>
          <div className="font-display text-[22px] font-extrabold tracking-[-0.03em] leading-none mt-0.5">El depa</div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-3xl bg-ink text-bg p-5">
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide">A ti te toca recibir</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$430</div>
        <div className="text-[11px] opacity-60 mt-1.5">Ya que todos ajusten cuentas</div>
      </div>

      <div className="px-5 mt-5 text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">Quién le debe a quién</div>
      <div className="px-4 mt-2 space-y-2">
        {[
          { who: "Ana", detail: "te debe", amount: "$680", pos: true, ini: "A", bg: "bg-sky" },
          { who: "Luis", detail: "le debes", amount: "$250", pos: false, ini: "L", bg: "bg-sand" },
        ].map((r) => (
          <div key={r.who} className="flex items-center gap-3 bg-surface border border-rule rounded-2xl px-3.5 py-2.5">
            <span className={`w-9 h-9 rounded-full ${r.bg} grid place-items-center text-[13px] font-display font-extrabold`}>{r.ini}</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold leading-tight">{r.who}</div>
              <div className="text-[11px] text-ink-soft">{r.pos ? "Te debe" : "Le debes"}</div>
            </div>
            <div className={`font-display text-[15px] font-extrabold tracking-[-0.02em] ${r.pos ? "text-mandarina-deep" : "text-ink"}`}>
              {r.pos ? "+" : "−"}{r.amount}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-3">
        <div className="bg-ink text-bg rounded-2xl py-3 text-center text-[14px] font-bold">Ajustar cuentas</div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Recordatorios (avisos que no molestan)
// ──────────────────────────────────────────────────────────────
export function RecordatoriosMock() {
  const notes = [
    { t: "Ahorita · 9:00 pm", h: "¿Ya anotaste tus gastos de hoy?", b: "30 segundos y quedas al día. Sin presión." },
    { t: "Mañana · 8:00 am", h: "Netflix te cobra en 1 día", b: "Se van $219. Cancélala si ya no la ves." },
    { t: "Vie · 8:00 am", h: "Smart Fit te cobra el sábado", b: "$499 al mes. Tú decides si sigue." },
  ];
  return (
    <>
      <StatusRow />
      <div className="px-5 pt-3">
        <div className="text-[10px] font-extrabold tracking-wider text-mandarina-deep uppercase">Avisos</div>
        <div className="font-display text-[24px] font-extrabold tracking-[-0.03em] leading-none mt-1">Recordatorios</div>
      </div>

      <div className="px-4 mt-5 space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="bg-surface border border-rule rounded-2xl px-4 py-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-5 h-5 rounded-md bg-mandarina text-bg grid place-items-center text-[11px] font-display font-extrabold">C</span>
              <span className="text-[11px] font-bold text-ink-soft">Centavos</span>
              <span className="text-[10px] text-ink-soft ml-auto">{n.t}</span>
            </div>
            <div className="text-[14px] font-bold leading-tight">{n.h}</div>
            <div className="text-[12px] text-ink-soft leading-snug mt-1">{n.b}</div>
          </div>
        ))}
      </div>

      <div className="px-5 mt-5 text-[11px] text-ink-soft leading-relaxed">
        Un solo aviso al día para anotar, y un recordatorio antes de cada cobro. Nada de spam.
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Suscripciones
// ──────────────────────────────────────────────────────────────
export function SuscripcionesMock() {
  const subs = [
    { emoji: "📺", name: "Netflix", days: "en 3 días", amount: "$219", bg: "bg-peach" },
    { emoji: "🎧", name: "Spotify", days: "en 8 días", amount: "$115", bg: "bg-sky" },
    { emoji: "💪", name: "Smart Fit", days: "en 14 días", amount: "$499", bg: "bg-sand" },
    { emoji: "☁️", name: "iCloud", days: "en 21 días", amount: "$49", bg: "bg-peach" },
  ];
  return (
    <>
      <StatusRow />
      <div className="px-5 pt-3">
        <div className="text-[10px] font-extrabold tracking-wider text-mandarina-deep uppercase">Cada mes</div>
        <div className="font-display text-[26px] font-extrabold tracking-[-0.03em] leading-none mt-1">Suscripciones</div>
      </div>

      <div className="mx-4 mt-4 rounded-3xl bg-ink text-bg p-5">
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide">Se te van al mes</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$882</div>
        <div className="text-[11px] opacity-60 mt-1.5">En un año son $10,584</div>
      </div>

      <div className="px-5 mt-5 text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">Próximos cobros</div>
      <div className="px-4 mt-2 space-y-2">
        {subs.map((s) => (
          <div key={s.name} className="flex items-center gap-3 bg-surface border border-rule rounded-2xl px-3.5 py-2.5">
            <span className={`w-9 h-9 rounded-xl ${s.bg} grid place-items-center text-lg`}>{s.emoji}</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold leading-tight">{s.name}</div>
              <div className="text-[11px] text-ink-soft">Mensual · {s.days}</div>
            </div>
            <div className="font-display text-[15px] font-extrabold tracking-[-0.02em]">{s.amount}</div>
          </div>
        ))}
      </div>
    </>
  );
}
