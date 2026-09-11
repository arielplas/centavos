import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { AppStoreBadges, InlineStoreLinks } from "@/components/home/AppStoreBadges";
import { MobileDownloadBar } from "@/components/home/MobileDownloadBar";
import {
  PhoneFrame,
  PulsoMock,
  PresupuestosMock,
  SuscripcionesMock,
  MesesSinInteresesMock,
  DivideMock,
  RecordatoriosMock,
} from "@/components/home/PhoneMock";
import { getAppLinks } from "@/lib/store-links";
import { appStoreId, faqJsonLd, mobileApplicationJsonLd, pageOpenGraph } from "@/lib/seo";

// Título con la keyword de búsqueda ("app para anotar gastos") + el
// diferenciador de marca ("sin conectar tu banco"). ≤ 60 caracteres.
const HOME_TITLE = "Centavos · App para anotar gastos sin conectar tu banco";
// ≤ 155 caracteres: Google corta la descripción alrededor de ahí.
const HOME_DESCRIPTION =
  "Anota lo que gastas en segundos, sin conectar tu banco. Presupuestos, suscripciones, meses sin intereses y gastos compartidos. Gratis en iOS y Android.";

export async function generateMetadata(): Promise<Metadata> {
  const { storeUrl } = await getAppLinks();
  const iosId = appStoreId(storeUrl);

  return {
    title: { absolute: HOME_TITLE },
    description: HOME_DESCRIPTION,
    alternates: { canonical: "/" },
    // Smart App Banner de Safari — manda a la App Store a quien ya navega en iPhone.
    ...(iosId ? { itunes: { appId: iosId } } : {}),
    openGraph: pageOpenGraph({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "" }),
  };
}

// Tarjetas de funciones principales, cada una con su maqueta de pantalla.
const FEATURES = [
  {
    kbd: "límite mensual",
    t: "Presupuestos",
    d: "Ponle un límite a cada categoría y mira, de un vistazo, cuánto te queda por gastar. Sin que te tome por sorpresa el fin de mes.",
    Mock: PresupuestosMock,
    tilt: -2,
  },
  {
    kbd: "sin cargos fantasma",
    t: "Suscripciones",
    d: "Netflix, Spotify, el gym, el iCloud que ya ni usas. Centavos suma tus cargos recurrentes y te dice cuánto se te va al mes y al año.",
    Mock: SuscripcionesMock,
    tilt: 2,
  },
  {
    kbd: "compras a plazos",
    t: "Meses sin intereses",
    d: "Registra tus compras a meses sin intereses y ve tu calendario de pagos: cuánto pagas este mes y cuántas mensualidades te faltan. Lo anotas tú, no lo saca de ninguna tarjeta.",
    Mock: MesesSinInteresesMock,
    tilt: -2,
    tool: { href: "/meses-sin-intereses", label: "Calcula tu mensualidad a MSI" },
  },
] as const;

const STEPS = [
  { n: "01", t: "Descarga y crea tu cuenta", d: "30 segundos. Solo tu correo, nunca tarjetas ni datos del banco." },
  { n: "02", t: "Anota lo que gastas", d: "Cada cafecito, cada Uber. El botón + lo hace en segundos." },
  { n: "03", t: "Mira a dónde se va tu lana", d: "Presupuestos, suscripciones y pagos, todo en un cuaderno tuyo." },
];

// Preguntas frecuentes: responden objeciones (conversión) y generan el rich
// result FAQPage (SEO). Solo afirmaciones que ya están en el sitio o en los
// términos; sin promesas nuevas.
const FAQ = [
  {
    q: "¿Centavos se conecta a mi banco o a mis tarjetas?",
    a: "No. Nunca. Centavos no te pide credenciales bancarias, no sincroniza cuentas ni lee tus movimientos. Tú anotas lo que gastas y esa información se queda en tu cuenta.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Descargar y usar Centavos es gratis, en App Store y Google Play.",
  },
  {
    q: "¿Qué necesito para crear mi cuenta?",
    a: "Solo un correo electrónico. No pedimos tarjetas, número de cuenta ni datos del banco.",
  },
  {
    q: "¿Cómo anoto un gasto?",
    a: "Tocas el botón +, escribes el monto, eliges la categoría y listo. Toma unos segundos. Si quieres, agregas una nota.",
  },
  {
    q: "¿Puedo dividir gastos con mi pareja, roomies o amigos?",
    a: "Sí. Arman un presupuesto compartido, cada quien anota lo que pagó y Centavos calcula quién le debe a quién y el mínimo de pagos para quedar a mano.",
  },
  {
    q: "¿Me van a llenar de notificaciones?",
    a: "No. Hay un aviso diario para anotar tus gastos, a la hora que tú elijas, y un recordatorio antes de cada cobro de suscripción. Los puedes apagar cuando quieras.",
  },
  {
    q: "¿Cómo elimino mi cuenta?",
    a: "Desde la app, en Configuraciones > Perfil > Eliminar cuenta. También puedes pedirlo por correo a hola@centavos.mx con el asunto «Eliminar cuenta».",
  },
];

export const revalidate = false; // Página 100% estática.

export default async function AppPage() {
  const { storeUrl, playUrl } = await getAppLinks();

  return (
    <>
      <Script id="ld-mobile-app" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileApplicationJsonLd({ storeUrl, playUrl })) }} />
      <Script id="ld-faq" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ)) }} />

      <Header mobileCta={false} />

      <main id="contenido">
        {/* HERO */}
        <section id="hero" className="relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-yolk/25 blur-2xl" aria-hidden />
          <div className="absolute top-40 -left-20 w-64 h-64 rounded-full bg-peach/40 blur-2xl" aria-hidden />

          <div className="relative mx-auto max-w-screen-lg px-5 pt-10 md:pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 bg-surface border border-rule rounded-full pl-4 pr-4 py-1.5 mb-5 whitespace-nowrap">
                <span className="font-hand text-mandarina-deep text-xl leading-none pr-0.5">gratis</span>
                <span className="w-px h-3.5 bg-rule" aria-hidden />
                <span className="text-[12px] font-bold text-ink-soft">Para iOS y Android</span>
              </div>
              <h1 className="font-display text-[40px] md:text-[58px] font-extrabold tracking-[-0.045em] leading-[0.94] mb-5">
                La app para anotar tus gastos,<br />
                <span className="text-mandarina-deep italic">sin conectar tu banco</span>.
              </h1>
              <p className="text-[16px] md:text-lg leading-relaxed text-ink-soft max-w-md mb-7">
                Anota lo que gastas en segundos. <b className="text-ink">Sin bancos, sin sorpresas</b> y sin que nadie más vea tu dinero. Tú registras, tú tienes el control.
              </p>
              <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} priority />
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-6 text-[13px] font-semibold text-ink-soft" aria-label="Compromisos de Centavos">
                {["Solo tu correo, nunca tu banco", "Tus datos son tuyos", "Hecho en México 🇲🇽"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <span className="text-mandarina-deep" aria-hidden>●</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center md:justify-end">
              <p className="sr-only">
                Pantalla de la app mostrando el Pulso: tu dinero disponible del mes, un acceso para
                anotar gastos y el avance de tus presupuestos.
              </p>
              <div aria-hidden>
                <PhoneFrame tilt={2}>
                  <PulsoMock />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        {/* FUNCIONES PRINCIPALES */}
        <section className="bg-surface border-y border-rule">
          <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">Todo en un cuaderno</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">
                Presupuestos, suscripciones y meses sin intereses en un solo lugar
              </h2>
            </div>

            <div className="space-y-12 md:space-y-24">
              {FEATURES.map((f, i) => {
                const Mock = f.Mock;
                const flip = i % 2 === 1;
                return (
                  <div key={f.t} className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
                    <div className={`flex justify-center ${flip ? "md:order-2" : ""}`}>
                      <p className="sr-only">Pantalla de la app: {f.t}.</p>
                      <div aria-hidden>
                        <PhoneFrame tilt={f.tilt}>
                          <Mock />
                        </PhoneFrame>
                      </div>
                    </div>
                    <div className={flip ? "md:order-1" : ""}>
                      <div className="font-hand text-mandarina-deep text-2xl leading-none mb-2">{f.kbd}</div>
                      <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
                        {f.t}
                      </h3>
                      <p className="text-[15px] md:text-base leading-relaxed text-ink-soft max-w-md">
                        {f.d}
                      </p>
                      {"tool" in f && (
                        <p className="mt-4">
                          <Link
                            href={f.tool.href}
                            className="inline-flex items-center gap-1 text-[14px] font-bold text-mandarina-deep underline underline-offset-4 decoration-mandarina hover:decoration-mandarina-deep py-1"
                          >
                            {f.tool.label}
                            <span aria-hidden>→</span>
                          </Link>
                        </p>
                      )}
                      <InlineStoreLinks storeUrl={storeUrl} playUrl={playUrl} className="mt-5 text-ink-soft" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRIVADO POR DISEÑO — la promesa, una sola vez y completa */}
        <section className="mx-auto max-w-screen-lg px-5 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-4">Privado por diseño</div>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.04em] leading-[0.95] mb-6">
              No pedimos tu banco.<br /><span className="text-mandarina-deep">Nunca.</span>
            </h2>
            <p className="text-[16px] md:text-lg leading-relaxed text-ink-soft max-w-xl mx-auto mb-8">
              Centavos no se conecta a tu banco ni a tus tarjetas. No te pide credenciales, no sincroniza cuentas y no ve tu historial. Es un cuaderno privado: lo que anotas se queda contigo.
            </p>
            <ul className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              {[
                { t: "Cero credenciales", d: "Nunca escribes la clave de tu banco." },
                { t: "Nada que sincronizar", d: "No conectamos cuentas ni tarjetas." },
                { t: "Tu historial es tuyo", d: "Nadie más ve en qué gastas." },
              ].map((c) => (
                <li key={c.t} className="bg-surface border border-rule rounded-3xl p-4 sm:p-5 flex sm:block items-center gap-3">
                  <div aria-hidden className="w-10 h-10 rounded-2xl bg-ink text-bg grid place-items-center text-[15px] font-bold sm:mb-3 flex-shrink-0">✓</div>
                  <div>
                    <div className="font-display text-[15px] font-extrabold tracking-[-0.02em] mb-0.5 sm:mb-1">{c.t}</div>
                    <div className="text-[13px] text-ink-soft leading-relaxed">{c.d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-ink-soft mt-6">
              Los detalles, sin letras chiquitas, en el{" "}
              <Link href="/app/privacidad" className="text-mandarina-deep underline underline-offset-2 font-semibold">Aviso de Privacidad</Link>.
            </p>
          </div>
        </section>

        {/* DIVIDE GASTOS — gancho social */}
        <section className="bg-peach">
          <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
            <div>
              <div className="font-hand text-mandarina-deep text-2xl leading-none mb-2">entre cuates</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
                Divide gastos<br />con quien quieras.
              </h2>
              <p className="text-[15px] md:text-base leading-relaxed text-ink/75 max-w-md mb-7">
                Roomies, pareja o la banda del viaje. Armen un presupuesto compartido, anoten quién pagó qué, y deja que Centavos calcule <b>quién le debe a quién</b>. Nada de cuentas raras a fin de mes.
              </p>
              <ul className="space-y-3">
                {[
                  <><b>Presupuestos compartidos</b> para el depa, el viaje o la fiesta</>,
                  <><b>Lo que te deben y lo que debes</b>, apuntado por persona</>,
                  <>El <b>ajuste de cuentas</b> te dice el mínimo de pagos para quedar a mano</>,
                ].map((li, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span aria-hidden className="w-6 h-6 rounded-full bg-ink text-bg grid place-items-center text-[13px] font-bold flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-[14px]">{li}</span>
                  </li>
                ))}
              </ul>
              <InlineStoreLinks storeUrl={storeUrl} playUrl={playUrl} label="Pruébalo con tu banda:" className="mt-6 text-ink/75" />
            </div>
            <div className="flex justify-center md:justify-end">
              <p className="sr-only">
                Pantalla de la app de gastos compartidos: los balances del grupo y quién le debe a
                quién, con un botón para ajustar cuentas.
              </p>
              <div aria-hidden>
                <PhoneFrame tilt={2} crop>
                  <DivideMock />
                </PhoneFrame>
              </div>
            </div>
          </div>
        </section>

        {/* RECORDATORIOS */}
        <section className="mx-auto max-w-screen-lg px-5 py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="flex justify-center order-2 md:order-1">
            <p className="sr-only">
              Pantalla de la app con recordatorios: un aviso diario para anotar gastos y avisos
              antes de cada cobro de suscripción.
            </p>
            <div aria-hidden>
              <PhoneFrame tilt={-2} crop>
                <RecordatoriosMock />
              </PhoneFrame>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="font-hand text-mandarina-deep text-2xl leading-none mb-2">sin dar lata</div>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
              Recordatorios que<br />no molestan.
            </h2>
            <p className="text-[15px] md:text-base leading-relaxed text-ink-soft max-w-md mb-6">
              Un aviso al día para anotar tus gastos: 30 segundos y quedas al corriente. Y te avisamos <b className="text-ink">antes de que Netflix te cobre</b>, para que decidas a tiempo si sigue o se va.
            </p>
            <ul className="space-y-3">
              {[
                <><b>Aviso diario</b> a la hora que tú elijas</>,
                <><b>Antes de cada cobro</b> de suscripción, no después</>,
                <>Tú mandas: <b>apágalos</b> cuando quieras</>,
              ].map((li, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span aria-hidden className="w-6 h-6 rounded-full bg-ink text-bg grid place-items-center text-[13px] font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-[14px]">{li}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="bg-surface border-y border-rule">
          <div className="mx-auto max-w-screen-lg px-5 py-14 md:py-20">
            <div className="text-center mb-10">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">Así de fácil</div>
              <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">Empieza en 3 pasos</h2>
            </div>
            <ol className="grid md:grid-cols-3 gap-6">
              {STEPS.map((s) => (
                <li key={s.n} className="text-center">
                  <div aria-hidden className="font-display text-6xl font-extrabold tracking-[-0.04em] text-ink/15">{s.n}</div>
                  <h3 className="font-display text-xl font-extrabold tracking-[-0.02em] mt-2 mb-1">{s.t}</h3>
                  <p className="text-[14px] text-ink-soft leading-relaxed">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES */}
        <section className="mx-auto max-w-screen-lg px-5 py-14 md:py-20" aria-labelledby="faq-title">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">Dudas comunes</div>
              <h2 id="faq-title" className="font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0]">Preguntas frecuentes</h2>
            </div>
            <div className="space-y-2">
              {FAQ.map((it) => (
                <details key={it.q} className="group bg-surface border border-rule rounded-2xl px-5 open:border-rule-strong">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 py-4 text-[15px] font-bold text-ink [&::-webkit-details-marker]:hidden">
                    {it.q}
                    <span aria-hidden className="w-7 h-7 rounded-full bg-bg border border-rule grid place-items-center text-lg leading-none flex-shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                  </summary>
                  <p className="text-[14px] leading-relaxed text-ink-soft pb-4 pr-8">{it.a}</p>
                </details>
              ))}
            </div>
            <p className="text-center text-[13px] text-ink-soft mt-6">
              ¿Otra duda?{" "}
              <Link href="/app/soporte" className="text-mandarina-deep underline underline-offset-2 font-semibold">Escríbenos</Link>.
            </p>
          </div>
        </section>

        {/* CIERRE — refuerza privacidad + CTA */}
        <section id="descargar" className="mx-auto max-w-screen-lg py-6 px-5 pb-16 scroll-mt-20">
          <div className="bg-mandarina text-ink rounded-[32px] px-6 md:px-12 py-12 md:py-16 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yolk/50" aria-hidden />
            <div className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-mandarina-deep/30" aria-hidden />
            <div className="relative max-w-lg">
              <div className="font-hand text-2xl leading-none mb-2">tú tienes el control</div>
              <h2 className="font-display text-4xl md:text-6xl font-extrabold tracking-[-0.035em] leading-[0.92] mb-4">
                Tu dinero, solo<br />para tus ojos.
              </h2>
              <p className="text-[15px] md:text-lg leading-relaxed mb-7 opacity-90">
                Descarga Centavos gratis y empieza a anotar hoy. Sin conectar tu banco, sin sorpresas, sin que nadie más vea tu lana.
              </p>
              <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} />
            </div>
          </div>
        </section>

        {/* DISCLAIMER */}
        <section className="mx-auto max-w-screen-lg px-5 pb-10">
          <p className="text-center text-[12px] text-ink-soft leading-relaxed max-w-xl mx-auto">
            Las pantallas mostradas son ilustrativas y pueden variar de la app real.
            Cifras y datos en las imágenes son de ejemplo.
          </p>
        </section>
      </main>

      {/* Deja espacio para la barra inferior móvil sobre el footer. */}
      <AppFooter className="pb-24 md:pb-0" />
      <MobileDownloadBar storeUrl={storeUrl} playUrl={playUrl} />
    </>
  );
}
