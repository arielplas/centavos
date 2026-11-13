// Maquetas de las pantallas de la app Centavos, recreadas en HTML/CSS para
// la página de marketing (Pulso, Divide, fragmentos de Presupuestos,
// Suscripciones y MSI, avisos de Recordatorios y el formulario de registro),
// con los tokens del sistema de diseño.

import type { CSSProperties, ReactNode } from "react";
import { DEFAULT_LANG, type SiteLang } from "@/lib/lang";

/** Every mock takes the language of the page it is rendered on. */
type MockProps = { lang?: SiteLang };

// Copy of the mock screens. English follows the wording of the app's own
// English locale (Budgets, Subscriptions, Log expense, Upcoming charges…).
// Amounts stay as they are: the app never converts currency.
const MOCK = {
  es: {
    pulso: {
      date: "9 jun · martes", greeting: "¿Qué onda con tu lana hoy?", status: "Vas bien, aguas",
      available: "Disponible este mes", progress: (spent: string) => `Llevas ${spent} de $11,700`,
      log: "Anotar un gasto", logHint: "Toma 5 segundos", budgets: "Tus presupuestos",
      food: "Comida", fun: "Salidas",
    },
    anotar: { title: "Anotar gasto", howMuch: "¿Cuánto fue?", onWhat: "¿En qué?", cta: "Anotar $85" },
    signup: {
      title: "Crea tu cuenta", name: "Nombre", email: "Correo", password: "Contraseña",
      nameValue: "Mariana", emailValue: "mariana@example.com", cta: "Crear cuenta", note: "y ya, es todo",
    },
    presupuestos: {
      left: "Te queda este mes", limits: "De $8,000 en límites que te pusiste",
      names: ["Comida", "Salidas", "Transporte", "Súper"],
      leftOf: (amount: string) => `Te quedan ${amount}`,
      spentOf: (spent: string, total: string) => `${spent} de ${total}`,
    },
    msi: {
      due: "Este mes pagas", count: "En 3 compras a plazos",
      names: ["Celular nuevo", "Sala", "Vuelo a Cancún"],
      payment: (n: number, of: number) => `Pago ${n} de ${of}`, perMonth: "al mes",
    },
    divide: {
      kicker: "Compartido", title: "El depa", owed: "A ti te toca recibir", owedHint: "Ya que todos ajusten cuentas",
      list: "Quién le debe a quién", owesYou: "Te debe", youOwe: "Le debes", cta: "Ajustar cuentas",
    },
    recordatorios: {
      notes: [
        { t: "Ahorita · 9:00 pm", h: "¿Ya anotaste tus gastos de hoy?", b: "30 segundos y quedas al día. Sin presión." },
        { t: "Mañana · 8:00 am", h: "Netflix te cobra en 1 día", b: "Se van $219. Cancélala si ya no la ves." },
      ],
    },
    suscripciones: {
      total: "Se te van al mes", yearly: "En un año son $10,584",
      monthly: "Mensual", inDays: (n: number) => `en ${n} días`,
    },
  },
  en: {
    pulso: {
      date: "Jun 9 · Tuesday", greeting: "How's your money doing today?", status: "On track, stay sharp",
      available: "Available this month", progress: (spent: string) => `You've spent ${spent} of $11,700`,
      log: "Log an expense", logHint: "Takes 5 seconds", budgets: "Your budgets",
      food: "Food", fun: "Going out",
    },
    anotar: { title: "Log expense", howMuch: "How much?", onWhat: "On what?", cta: "Log $85" },
    signup: {
      title: "Create your account", name: "Name", email: "Email", password: "Password",
      nameValue: "Mariana", emailValue: "mariana@example.com", cta: "Create account", note: "that's the whole form",
    },
    presupuestos: {
      left: "Left this month", limits: "Of $8,000 in limits you set",
      names: ["Food", "Going out", "Transport", "Groceries"],
      leftOf: (amount: string) => `${amount} left`,
      spentOf: (spent: string, total: string) => `${spent} of ${total}`,
    },
    msi: {
      due: "Due this month", count: "Across 3 purchases",
      names: ["New phone", "Couch", "Flight to Cancún"],
      payment: (n: number, of: number) => `Payment ${n} of ${of}`, perMonth: "a month",
    },
    divide: {
      kicker: "Shared", title: "The apartment", owed: "You're owed", owedHint: "Once everyone settles up",
      list: "Who owes whom", owesYou: "Owes you", youOwe: "You owe", cta: "Settle up",
    },
    recordatorios: {
      notes: [
        { t: "Now · 9:00 pm", h: "Did you log today's expenses?", b: "30 seconds and you're caught up. No pressure." },
        { t: "Tomorrow · 8:00 am", h: "Netflix charges you in 1 day", b: "$219 is going out. Cancel it if you've stopped watching." },
      ],
    },
    suscripciones: {
      total: "Going out each month", yearly: "That's $10,584 a year",
      monthly: "Monthly", inDays: (n: number) => `in ${n} days`,
    },
  },
} satisfies Record<SiteLang, unknown>;

// ──────────────────────────────────────────────────────────────
// Marco del teléfono
// ──────────────────────────────────────────────────────────────
/**
 * `crop` recorta el teléfono (muestra ~2/3 con degradado) para secciones
 * secundarias: ahorra scroll sin perder el contexto. En móvil todos los
 * teléfonos se escalan a 0.75 vía CSS (ver .phone en globals.css).
 */
export function PhoneFrame({
  children,
  crop = false,
  className = "",
}: {
  children: ReactNode;
  crop?: boolean;
  className?: string;
}) {
  return (
    <div className={`phone-wrap ${crop ? "phone-wrap--crop" : ""} ${className}`}>
      <div className="phone">
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
// Pulso (home), with the "log an expense" demo
// ──────────────────────────────────────────────────────────────
// The markup is the FINAL state of the demo (expense logged); the elements
// marked `data-a` animate from their "before" state inside `.demo` (see
// "Demo del hero" in globals.css). Without JS, or with reduced motion, the
// visitor just sees the logged state.

/** Start time (and optional duration) of an animation, read by `.demo [data-a]`. */
const at = (delay: string, duration?: string) =>
  ({ "--d": delay, ...(duration ? { "--t": duration } : {}) }) as CSSProperties;

/** A number that rolls from `from` to `to` (final state: `to`). */
function Roll({ from, to, delay, duration = "520ms", className = "" }: {
  from: string;
  to: string;
  delay: string;
  duration?: string;
  className?: string;
}) {
  return (
    <span className={`roll ${className}`}>
      <span data-a="roll-old" style={at(delay, duration)}>{from}</span>
      <span data-a="roll-new" style={at(delay, duration)}>{to}</span>
    </span>
  );
}

export function PulsoMock({ lang = DEFAULT_LANG }: MockProps) {
  const m = MOCK[lang].pulso;
  return (
    <>
      <StatusRow />
      <div className="px-5 pt-3 flex items-start gap-3">
        <div className="flex-1">
          <div className="text-[10px] font-extrabold tracking-wider text-mandarina-deep uppercase">{m.date}</div>
          <div className="font-display text-[22px] font-extrabold tracking-[-0.03em] leading-[1.05] mt-1">
            {m.greeting}
          </div>
        </div>
        <span className="w-10 h-10 rounded-full bg-mandarina text-bg grid place-items-center font-display font-extrabold border-2 border-yolk">
          ML
        </span>
      </div>

      <div className="mx-4 mt-4 rounded-3xl bg-ink text-bg p-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-yolk" />
          <span className="text-[11px] font-bold opacity-70 uppercase tracking-wide">{m.status}</span>
        </div>
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide mt-3">{m.available}</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">
          <Roll from="$3,541" to="$3,456" delay="2.8s" />
        </div>
        <div className="relative h-1.5 bg-white/15 rounded-full mt-4">
          <div data-a="bar-main" style={at("2.8s", "520ms")} className="absolute inset-y-0 left-0 w-[71%] bg-mandarina rounded-full" />
        </div>
        <div className="text-[11px] opacity-60 mt-1.5">
          <Roll from={m.progress("$8,159")} to={m.progress("$8,244")} delay="2.8s" />
        </div>
      </div>

      <div data-a="log-row" style={at("600ms", "240ms")} className="mx-4 mt-3 flex items-center gap-3 bg-surface border border-rule rounded-2xl px-4 py-3">
        <span className="w-9 h-9 rounded-full bg-mandarina text-bg grid place-items-center text-xl font-light">+</span>
        <div className="flex-1">
          <div className="text-[13px] font-bold">{m.log}</div>
          <div className="text-[11px] text-ink-soft">{m.logHint}</div>
        </div>
        <span className="text-ink" aria-hidden>›</span>
      </div>

      <div className="px-5 mt-5 text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">{m.budgets}</div>
      <div className="px-4 mt-2 space-y-2">
        <div data-a="food-row" style={at("2.95s", "900ms")} className="bg-surface border border-rule rounded-2xl px-4 py-3">
          <div className="flex justify-between text-[13px] font-bold mb-2">
            <span>🌮 {m.food}</span>
            <span className="text-ink-soft">
              <Roll from="$2,400" to="$2,485" delay="2.95s" duration="600ms" /> / $3,000
            </span>
          </div>
          <div className="h-1.5 bg-sand rounded-full">
            <div data-a="bar-food" style={at("2.95s", "600ms")} className="h-full w-[83%] bg-mandarina rounded-full" />
          </div>
        </div>
        <div className="bg-surface border border-rule rounded-2xl px-4 py-3">
          <div className="flex justify-between text-[13px] font-bold mb-2">
            <span>🎬 {m.fun}</span>
            <span className="text-ink-soft">$640 / $1,200</span>
          </div>
          <div className="h-1.5 bg-sand rounded-full"><div className="h-full w-[53%] bg-yolk rounded-full" /></div>
        </div>
      </div>

      <AnotarSheet lang={lang} />
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Anotar gasto: the bottom sheet that slides up over Pulso during the demo.
// Hidden in its base state (the demo ends with it closed).
// ──────────────────────────────────────────────────────────────
function AnotarSheet({ lang }: { lang: SiteLang }) {
  const m = MOCK[lang].anotar;
  const names = MOCK[lang].presupuestos.names;
  const chips = [
    { emoji: "🌮", name: names[0] },
    { emoji: "🎬", name: names[1] },
    { emoji: "🚇", name: names[2] },
    { emoji: "🛒", name: names[3] },
  ];
  return (
    <>
      <div data-a="scrim" style={at("800ms", "1.95s")} className="absolute inset-0 z-30 bg-ink/35 opacity-0" />
      <div
        data-a="sheet"
        style={at("800ms", "1.95s")}
        className="absolute inset-x-0 bottom-0 z-30 h-[400px] rounded-t-[28px] bg-bg px-5 pt-3 shadow-[0_-12px_30px_-12px_rgba(42,26,16,.35)]"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-rule-strong/50" />
        <div className="font-display text-[17px] font-extrabold tracking-[-0.02em] text-center mt-3">{m.title}</div>
        <div className="text-center mt-5">
          <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">{m.howMuch}</div>
          <div className="grid justify-items-center font-display text-[56px] font-extrabold tracking-[-0.04em] leading-none mt-2">
            <span data-a="amt-0" style={at("800ms", "500ms")} className="col-start-1 row-start-1 opacity-0 text-ink/30">$0</span>
            <span data-a="amt-8" style={at("800ms", "700ms")} className="col-start-1 row-start-1 opacity-0">$8</span>
            <span data-a="amt-85" style={at("800ms", "700ms")} className="col-start-1 row-start-1">$85</span>
          </div>
        </div>
        <div className="mt-6 text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">{m.onWhat}</div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {chips.map((c, i) => (
            <div
              key={c.name}
              {...(i === 0 ? { "data-a": "chip", style: at("1.85s", "150ms") } : {})}
              className={`rounded-2xl py-2.5 grid place-items-center gap-0.5 border ${i === 0 ? "bg-mandarina text-bg border-mandarina" : "bg-surface border-rule"}`}
            >
              <span className="text-xl leading-none">{c.emoji}</span>
              <span className="text-[10px] font-bold leading-none">{c.name}</span>
            </div>
          ))}
        </div>
        <div data-a="cta" style={at("2.25s", "160ms")} className="mt-6 bg-ink text-bg rounded-2xl py-3 text-center text-[14px] font-bold">
          {m.cta}
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Screen fragments (features section): the dark summary card and the first
// two rows of each screen, without status bar or title.
// ──────────────────────────────────────────────────────────────
export function PresupuestosSnippet({ lang = DEFAULT_LANG }: MockProps) {
  const m = MOCK[lang].presupuestos;
  const budgets = [
    { emoji: "🌮", name: m.names[0], left: "$600", spent: "$2,400", total: "$3,000", pct: 80, bar: "bg-mandarina" },
    { emoji: "🎬", name: m.names[1], left: "$560", spent: "$640", total: "$1,200", pct: 53, bar: "bg-yolk" },
  ];
  return (
    <>
      <div className="rounded-3xl bg-ink text-bg p-5">
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide">{m.left}</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$2,620</div>
        <div className="text-[11px] opacity-60 mt-1.5">{m.limits}</div>
      </div>
      <div className="hidden md:block mt-2 space-y-2">
        {budgets.map((b) => (
          <div key={b.name} className="bg-surface border border-rule rounded-2xl px-4 py-2">
            <div className="flex justify-between items-baseline text-[13px] font-bold mb-1.5">
              <span>{b.emoji} {b.name}</span>
              <span className="text-mandarina-deep">{m.leftOf(b.left)}</span>
            </div>
            <div className="h-1.5 bg-sand rounded-full">
              <div className={`h-full ${b.bar} rounded-full`} style={{ width: `${b.pct}%` }} />
            </div>
            <div className="text-[10px] text-ink-soft mt-1">{m.spentOf(b.spent, b.total)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function SuscripcionesSnippet({ lang = DEFAULT_LANG }: MockProps) {
  const m = MOCK[lang].suscripciones;
  const subs = [
    { emoji: "📺", name: "Netflix", days: 3, amount: "$219", bg: "bg-peach" },
    { emoji: "🎧", name: "Spotify", days: 8, amount: "$115", bg: "bg-sky" },
  ];
  return (
    <>
      <div className="rounded-3xl bg-ink text-bg p-5">
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide">{m.total}</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$882</div>
        <div className="text-[11px] opacity-60 mt-1.5">{m.yearly}</div>
      </div>
      <div className="hidden md:block mt-2 space-y-2">
        {subs.map((s) => (
          <div key={s.name} className="flex items-center gap-3 bg-surface border border-rule rounded-2xl px-3.5 py-2.5">
            <span className={`w-9 h-9 rounded-xl ${s.bg} grid place-items-center text-lg`}>{s.emoji}</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold leading-tight">{s.name}</div>
              <div className="text-[11px] text-ink-soft">{m.monthly} · {m.inDays(s.days)}</div>
            </div>
            <div className="font-display text-[15px] font-extrabold tracking-[-0.02em]">{s.amount}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function MsiSnippet({ lang = DEFAULT_LANG }: MockProps) {
  const m = MOCK[lang].msi;
  const plans = [
    { emoji: "📱", name: m.names[0], per: "$1,000", n: 5, of: 12, bg: "bg-sky" },
    { emoji: "🛋️", name: m.names[1], per: "$625", n: 2, of: 6, bg: "bg-peach" },
  ];
  return (
    <>
      <div className="rounded-3xl bg-ink text-bg p-5">
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide">{m.due}</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$2,425</div>
        <div className="text-[11px] opacity-60 mt-1.5">{m.count}</div>
      </div>
      <div className="hidden md:block mt-2 space-y-2">
        {plans.map((p) => (
          <div key={p.name} className="flex items-center gap-3 bg-surface border border-rule rounded-2xl px-3.5 py-2.5">
            <span className={`w-9 h-9 rounded-xl ${p.bg} grid place-items-center text-lg`}>{p.emoji}</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold leading-tight">{p.name}</div>
              <div className="text-[11px] text-ink-soft">{m.payment(p.n, p.of)}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-[15px] font-extrabold tracking-[-0.02em]">{p.per}</div>
              <div className="text-[10px] text-ink-soft">{m.perMonth}</div>
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
export function DivideMock({ lang = DEFAULT_LANG }: MockProps) {
  const m = MOCK[lang].divide;
  return (
    <>
      <StatusRow />
      <div className="px-5 pt-3 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-peach grid place-items-center text-lg">🏠</span>
        <div>
          <div className="text-[10px] font-extrabold tracking-wider text-mandarina-deep uppercase">{m.kicker}</div>
          <div className="font-display text-[22px] font-extrabold tracking-[-0.03em] leading-none mt-0.5">{m.title}</div>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-3xl bg-ink text-bg p-5">
        <div className="text-[11px] opacity-60 font-bold uppercase tracking-wide">{m.owed}</div>
        <div className="font-display text-[40px] font-extrabold tracking-[-0.04em] leading-none text-yolk mt-1">$430</div>
        <div className="text-[11px] opacity-60 mt-1.5">{m.owedHint}</div>
      </div>

      <div className="px-5 mt-5 text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase">{m.list}</div>
      <div className="px-4 mt-2 space-y-2">
        {[
          { who: "Ana", amount: "$680", pos: true, ini: "A", bg: "bg-sky" },
          { who: "Luis", amount: "$250", pos: false, ini: "L", bg: "bg-sand" },
        ].map((r) => (
          <div key={r.who} className="flex items-center gap-3 bg-surface border border-rule rounded-2xl px-3.5 py-2.5">
            <span className={`w-9 h-9 rounded-full ${r.bg} grid place-items-center text-[13px] font-display font-extrabold`}>{r.ini}</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold leading-tight">{r.who}</div>
              <div className="text-[11px] text-ink-soft">{r.pos ? m.owesYou : m.youOwe}</div>
            </div>
            <div className={`font-display text-[15px] font-extrabold tracking-[-0.02em] ${r.pos ? "text-mandarina-deep" : "text-ink"}`}>
              {r.pos ? "+" : "−"}{r.amount}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 mt-3">
        <div className="bg-ink text-bg rounded-2xl py-3 text-center text-[14px] font-bold">{m.cta}</div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Reminders: two notification cards, no phone around them
// ──────────────────────────────────────────────────────────────
export function ReminderCards({ lang = DEFAULT_LANG, className = "" }: MockProps & { className?: string }) {
  const [first, second] = MOCK[lang].recordatorios.notes;
  return (
    <div className={`space-y-3 ${className}`}>
      {[first, second].map((n, i) => (
        <div key={i} className={`bg-surface border border-rule rounded-2xl px-4 py-3.5 shadow-sm ${i === 1 ? "md:ml-8" : ""}`}>
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
  );
}

// ──────────────────────────────────────────────────────────────
// Sign-up (create-account form, with its handwritten note)
// ──────────────────────────────────────────────────────────────
/** The sign-up card (decorative: divs, not inputs) and the margin note under it. */
export function SignupMock({ lang = DEFAULT_LANG }: MockProps) {
  const m = MOCK[lang].signup;
  const field = "h-12 rounded-2xl bg-surface border border-rule px-4 flex items-center text-[15px]";
  const label = "text-[12px] font-bold mb-1.5";
  return (
    <div className="w-full max-w-sm mx-auto md:mx-0 md:ml-auto">
      <div
        aria-hidden
        className="bg-bg text-ink rounded-[28px] p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,.5)]"
      >
        <span className="w-9 h-9 rounded-xl bg-mandarina text-bg grid place-items-center font-display font-extrabold">C</span>
        <div className="font-display text-2xl font-extrabold tracking-[-0.03em] mt-4 mb-5">{m.title}</div>
        <div className="space-y-4">
          <div>
            <div className={label}>{m.name}</div>
            <div className={field}>{m.nameValue}</div>
          </div>
          <div>
            <div className={label}>{m.email}</div>
            <div className={field}>{m.emailValue}</div>
          </div>
          <div>
            <div className={label}>{m.password}</div>
            <div className={field}>••••••••</div>
          </div>
        </div>
        <div className="h-12 rounded-2xl bg-ink text-bg font-bold grid place-items-center mt-6">{m.cta}</div>
      </div>
      <div aria-hidden className="mt-4 flex items-start justify-end gap-2 text-yolk font-hand text-3xl -rotate-2">
        <svg width="48" height="36" viewBox="0 0 48 36" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-[-6px]">
          <path d="M40 32C30 30 14 24 10 6" />
          <path d="M3 13l7-8 6 9" />
        </svg>
        <span>{m.note}</span>
      </div>
    </div>
  );
}
