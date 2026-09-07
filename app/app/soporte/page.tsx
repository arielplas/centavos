import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { AppFooter } from "@/components/home/AppFooter";
import { SoporteForm } from "@/components/soporte/SoporteForm";
import { SUPPORT_EMAIL, SUPPORT_FORM_ENABLED } from "@/lib/config";
import { pageOpenGraph } from "@/lib/seo";

const TITLE = "Soporte";
const DESCRIPTION =
  "¿Necesitas ayuda con la app Centavos? Escríbenos a hola@centavos.mx y te respondemos en uno o dos días hábiles. Sin bots, sin vueltas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/app/soporte" },
  openGraph: pageOpenGraph({ title: `${TITLE} · Centavos`, description: DESCRIPTION, path: "/app/soporte" }),
};

const TOPICS = [
  { t: "Un error en la app", s: "Error en la app" },
  { t: "Una duda sobre tu cuenta", s: "Duda sobre mi cuenta" },
  { t: "Una idea para mejorar Centavos", s: "Idea para Centavos" },
];

function ContactoDirecto() {
  return (
    <div className="bg-surface border border-rule rounded-2xl p-6">
      <div className="text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2">
        Escríbenos
      </div>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="inline-block font-display text-2xl md:text-3xl font-extrabold tracking-[-0.03em] text-ink underline underline-offset-4 decoration-mandarina break-all"
      >
        {SUPPORT_EMAIL}
      </a>
      <p className="text-[14px] text-ink-soft leading-relaxed mt-3 mb-5">
        Cuéntanos qué pasó y desde qué correo te registraste. Te respondemos normalmente
        dentro de uno o dos días hábiles.
      </p>
      <div className="text-[12px] font-bold text-ink mb-2">Atajos con el asunto listo:</div>
      <ul className="flex flex-wrap gap-2">
        {TOPICS.map((tp) => (
          <li key={tp.s}>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(tp.s)}`}
              className="inline-block bg-bg border border-rule-strong rounded-full px-4 py-2 text-[13px] font-semibold text-ink hover:bg-sand"
            >
              {tp.t}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SoportePage() {
  return (
    <>
      <Header />

      <main id="contenido" className="mx-auto max-w-[640px] px-5 pb-16 pt-10 md:pt-14">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.035em] leading-[1.0] mb-4">
          ¿Te echamos la mano?
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-soft mb-8">
          Un error en la app, una duda sobre tu cuenta o una idea para mejorar Centavos:
          escríbenos y te respondemos al correo que nos dejes. Sin bots, sin vueltas.
        </p>

        {SUPPORT_FORM_ENABLED ? <SoporteForm /> : <ContactoDirecto />}

        <p className="text-[13px] text-ink-soft leading-relaxed mt-8">
          ¿Quieres borrar tu cuenta? Puedes hacerlo desde la app o{" "}
          <a href="/app/eliminar-cuenta" className="text-mandarina-deep underline underline-offset-2">
            ver cómo eliminarla
          </a>
          .
        </p>
      </main>

      <AppFooter />
    </>
  );
}
