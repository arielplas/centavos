import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { AppStoreBadges } from "@/components/home/AppStoreBadges";
import { MsiCalculator } from "@/components/msi/MsiCalculator";
import { getAppLinks } from "@/lib/store-links";
import { faqJsonLd, pageOpenGraph, webApplicationJsonLd } from "@/lib/seo";

// Keyword de la página: "calculadora de meses sin intereses". El título va con
// el año porque es como se busca cada temporada de Buen Fin.
const TITLE = "Calculadora de meses sin intereses";
const DESCRIPTION =
  "Calcula tu mensualidad a MSI, mira en qué fecha cae cada pago según tu día de corte y descubre cuánto te cuesta de verdad la promoción si hay descuento de contado.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/meses-sin-intereses" },
  openGraph: pageOpenGraph({
    title: `${TITLE} · Centavos`,
    description: DESCRIPTION,
    path: "/meses-sin-intereses",
  }),
};

// Responden las dudas que la gente ya busca y generan el rich result FAQPage.
// Texto plano, sin promesas que el sitio no pueda sostener.
const FAQ = [
  {
    q: "¿Qué significa MSI?",
    a: "MSI son las siglas de “meses sin intereses”. Es una promoción en la que el precio de una compra con tarjeta de crédito se divide en mensualidades fijas y el banco no te cobra intereses sobre el saldo. El costo financiero lo absorbe el comercio, no tú.",
  },
  {
    q: "¿Realmente no pago intereses a meses sin intereses?",
    a: "No pagas intereses al banco. Pero si el mismo producto tiene un precio de contado más barato, la diferencia es un costo financiero disfrazado de descuento perdido. Por eso conviene comparar los dos precios antes de decidir.",
  },
  {
    q: "¿Cuándo cae el primer pago de una compra a meses?",
    a: "Depende de tu fecha de corte. Si compras en o antes del día de corte, el cargo entra en el estado de cuenta de ese ciclo. Si compras después del corte, se va hasta el siguiente estado de cuenta y el primer pago cae casi dos meses después.",
  },
  {
    q: "¿Los meses sin intereses ocupan todo mi límite de crédito?",
    a: "Sí. Una compra a meses aparta el monto completo de tu línea de crédito desde el primer día, no solo la mensualidad. Se va liberando conforme pagas cada mensualidad.",
  },
  {
    q: "¿Qué pasa si me atraso en una mensualidad?",
    a: "La mayoría de los emisores establece en su contrato que el incumplimiento cancela la promoción y convierte el saldo pendiente a la tasa de interés ordinaria de la tarjeta. Revisa el contrato de tu tarjeta para conocer las condiciones exactas.",
  },
  {
    q: "¿Puedo pagar por adelantado una compra a meses sin intereses?",
    a: "Sí, puedes liquidar el saldo antes de tiempo. Como la promoción no genera intereses, adelantar pagos no te ahorra dinero, pero sí libera tu línea de crédito.",
  },
  {
    q: "¿Se pueden hacer meses sin intereses con tarjeta de débito?",
    a: "No. Las promociones a meses sin intereses son un producto de crédito y requieren tarjeta de crédito participante.",
  },
  {
    q: "¿Los meses sin intereses afectan mi historial crediticio?",
    a: "El saldo de una compra a meses forma parte de tu deuda revolvente y se reporta a las sociedades de información crediticia como cualquier otro saldo de tarjeta. Pagar puntualmente ayuda a tu historial; atrasarte lo perjudica.",
  },
];

// Checklist honesta: no empuja a comprar ni a no comprar.
const CHECKLIST = [
  {
    t: "Compara el precio de contado",
    d: "Si hay descuento por pagar de una sola vez, la promoción sí tiene costo. La calculadora de arriba te dice cuánto.",
  },
  {
    t: "Suma lo que ya debes a meses",
    d: "Tres promociones de $1,000 al mes son $3,000 fijos cada mes. El problema casi nunca es una compra, es la suma.",
  },
  {
    t: "Revisa cuánto plazo te queda de ingreso seguro",
    d: "Una compra a 24 meses es un compromiso de dos años. Vale preguntarse si tu situación de hoy aguanta ese plazo.",
  },
  {
    t: "Cuenta tu línea de crédito",
    d: "El monto completo se aparta desde el primer día. Si necesitas la línea disponible para una emergencia, ojo.",
  },
];

export default function MesesSinInteresesPage() {
  const { storeUrl, playUrl } = getAppLinks();

  const h2 = "font-display text-2xl md:text-4xl font-extrabold tracking-[-0.03em] leading-[1.05] mb-4";
  const p = "text-[16px] leading-relaxed text-ink mb-4";

  return (
    <>
      <Header />

      <Script
        id="ld-msi-app"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webApplicationJsonLd({
              name: "Calculadora de meses sin intereses",
              description: DESCRIPTION,
              path: "/meses-sin-intereses",
            }),
          ),
        }}
      />
      <Script
        id="ld-msi-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ)) }}
      />

      <main id="contenido">
        {/* ─── HERO + CALCULADORA ─── */}
        <section className="mx-auto max-w-screen-lg px-5 pt-8 pb-10 md:pt-12">
          <nav aria-label="Ruta" className="text-[12px] text-ink-soft mb-4">
            <Link href="/" className="hover:text-ink underline underline-offset-2">
              Inicio
            </Link>
            <span aria-hidden className="mx-1.5">
              ›
            </span>
            <span className="text-ink font-semibold">Meses sin intereses</span>
          </nav>

          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.035em] leading-[0.95] mb-4">
              Calculadora de meses
              <br />
              <span className="text-mandarina-deep">sin intereses</span>
            </h1>
            <p className="text-[16px] md:text-lg leading-relaxed text-ink-soft mb-8">
              Cuánto pagas al mes, en qué fecha cae cada pago según tu día de corte y —lo que casi nadie te
              dice— cuánto te cuesta de verdad la promoción cuando hay descuento por pagar de contado.
            </p>
          </div>

          <MsiCalculator />
        </section>

        {/* ─── EXPLICACIÓN ─── */}
        <section className="mx-auto max-w-screen-lg px-5 py-10 md:py-14">
          <div className="max-w-2xl">
            <h2 className={h2}>¿Qué son los meses sin intereses?</h2>
            <p className={p}>
              Los meses sin intereses (MSI) son una promoción de crédito en la que el precio de una compra se
              divide en mensualidades fijas y el banco no te cobra intereses sobre el saldo. Quien absorbe el
              costo financiero es el comercio, no el banco ni tú: por eso no todas las tiendas ofrecen todos
              los plazos, y por eso a veces solo aplican con ciertas tarjetas.
            </p>
            <p className={p}>
              La cuenta es simple: el precio se divide entre el número de mensualidades y ya. Si el monto no se
              divide exacto, el último pago absorbe los centavos sobrantes.
            </p>

            <h2 className={`${h2} mt-12`}>¿Realmente no pagas intereses?</h2>
            <p className={p}>
              Al banco, no. Pero &ldquo;sin intereses&rdquo; no es lo mismo que &ldquo;sin costo&rdquo;.
            </p>
            <p className={p}>
              Si la misma pantalla cuesta $10,000 a 12 meses y $9,000 pagando de contado, esos $1,000 de
              diferencia son el precio de diferir el gasto. No aparecen en tu estado de cuenta como intereses,
              pero salen de tu bolsa igual. Puesto en tasa anual, ese ejemplo equivale a poco más de 21% —
              comparable a lo que cobra un crédito personal.
            </p>
            <p className={p}>
              Cuando el precio de contado y el precio a meses son idénticos, la promoción sí es gratis y
              conviene tomarla: el dinero que no adelantas conserva su valor.
            </p>

            <h2 className={`${h2} mt-12`}>¿Cuándo cae el primer pago?</h2>
            <p className={p}>
              Esta es la parte que descoloca a todo el mundo. Tu tarjeta tiene una{" "}
              <strong>fecha de corte</strong> —el día en que se cierra el estado de cuenta— y una{" "}
              <strong>fecha límite de pago</strong>, normalmente unos veinte días después.
            </p>
            <p className={p}>
              Si compras <em>antes</em> de tu corte, el cargo entra en el estado de cuenta que está por
              cerrarse y pagas la primera mensualidad en unas semanas. Si compras <em>justo después</em> del
              corte, el cargo se va al siguiente ciclo y el primer pago puede caer casi dos meses más tarde.
              Comprar un día después del corte te regala un mes de plazo sin costo.
            </p>

            <h2 className={`${h2} mt-12`}>¿Qué pasa si te atrasas?</h2>
            <p className={p}>
              La mayoría de los contratos de tarjeta establece que el incumplimiento{" "}
              <strong>cancela la promoción</strong>: el saldo pendiente deja de ser a meses sin intereses y se
              convierte a la tasa ordinaria de la tarjeta, que en México suele estar muy por encima del 30%
              anual. Un solo pago tardío puede convertir una compra sin costo en la deuda más cara que tengas.
            </p>
            <p className={p}>
              Las condiciones exactas están en tu contrato. Si algo no te cuadra con cómo te aplicaron una
              promoción, la{" "}
              <a
                href="https://www.condusef.gob.mx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mandarina-deep underline underline-offset-2 font-semibold"
              >
                Condusef
              </a>
              <span className="sr-only"> (se abre en una pestaña nueva)</span> recibe quejas y te asesora sin
              costo.
            </p>
          </div>
        </section>

        {/* ─── CHECKLIST ─── */}
        <section className="mx-auto max-w-screen-lg px-5 py-10 md:py-14">
          <div className="max-w-2xl">
            <h2 className={h2}>¿Conviene o no?</h2>
            <p className={`${p} mb-6`}>
              Depende, y no de si eres disciplinado. Depende de cuatro cosas concretas:
            </p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2 max-w-4xl">
            {CHECKLIST.map((c, i) => (
              <li key={c.t} className="bg-surface border border-rule rounded-2xl p-5">
                <div aria-hidden className="font-display text-3xl font-extrabold tracking-[-0.04em] text-ink/15 leading-none mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-display text-lg font-extrabold tracking-[-0.02em] mb-1.5">{c.t}</h3>
                <p className="text-[14px] leading-relaxed text-ink-soft">{c.d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ─── CTA ─── */}
        <section className="mx-auto max-w-screen-lg px-5 py-6">
          <div className="bg-mandarina text-ink rounded-[32px] px-6 md:px-12 py-12 md:py-14 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yolk/50" aria-hidden />
            <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-mandarina-deep/30" aria-hidden />
            <div className="relative max-w-lg">
              <div className="font-hand text-2xl leading-none mb-2">ya sabes cuánto</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.035em] leading-[0.95] mb-4">
                Ahora que no se
                <br />
                te olvide.
              </h2>
              <p className="text-[15px] md:text-lg leading-relaxed mb-7 opacity-90">
                Acabas de comprometer varios meses hacia adelante. En Centavos anotas la compra, ves tu
                calendario de pagos y sabes cuánto llevas comprometido en total, sumando todas tus promociones.
              </p>
              <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} />
              <p className="text-[13px] mt-5 opacity-80">
                Gratis. Sin conectar tu banco: tú anotas la compra, la app no la saca de ninguna tarjeta.
              </p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="mx-auto max-w-screen-lg px-5 py-14 md:py-20" aria-labelledby="faq-title">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
                Dudas comunes
              </div>
              <h2 id="faq-title" className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">
                Preguntas frecuentes
              </h2>
            </div>
            <div className="space-y-2">
              {FAQ.map((it) => (
                <details key={it.q} className="group bg-surface border border-rule rounded-2xl px-5 open:border-rule-strong">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 py-4 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {it.q}
                    <span
                      aria-hidden
                      className="w-7 h-7 rounded-full bg-bg border border-rule grid place-items-center text-lg leading-none flex-shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-[14px] leading-relaxed text-ink-soft pb-4 pr-8">{it.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── AVISO ─── */}
        <section className="mx-auto max-w-screen-lg px-5 pb-12">
          <p className="text-center text-[12px] text-ink-soft leading-relaxed max-w-xl mx-auto">
            Esta calculadora es informativa y no constituye asesoría financiera. Las condiciones de cada
            promoción, la fecha límite de pago y las consecuencias de un atraso las define el contrato de tu
            tarjeta.
          </p>
        </section>
      </main>

      <AppFooter />
    </>
  );
}
