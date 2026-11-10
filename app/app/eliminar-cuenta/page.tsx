import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/LegalShell";
import type { LegalDoc } from "@/components/legal/types";
import { pageOpenGraph } from "@/lib/seo";

const PATH = "/app/eliminar-cuenta";

// Spanish only for now: unlike the terms and the privacy notice, this page is
// not linked from the app's store listing, so it was left out of the bilingual
// work. Translating it is a matter of adding an `.en` doc and the same
// `bilingual` wiring the other two legal pages use.
const doc: LegalDoc = {
  title: "Eliminar tu cuenta",
  description:
    "Cómo eliminar tu cuenta de Centavos: desde la app en Configuraciones > Perfil > Eliminar Cuenta, o enviando un correo a hola@centavos.mx con el asunto «Eliminar cuenta».",
  updated: "12 de junio de 2026",
  intro: (
    <p>
      En <b className="text-ink">Centavos</b> puedes irte cuando quieras, sin trámites raros
      ni preguntas incómodas. Aquí te explicamos las dos formas de eliminar tu cuenta y qué
      pasa con tus datos cuando lo haces.
    </p>
  ),
  sections: [
    {
      title: "Eliminar tu cuenta desde la app",
      body: (
        <>
          <p>La forma más rápida es hacerlo directamente desde la app:</p>
          <ul>
            <li>Abre la app y entra a <b>Configuraciones</b>.</li>
            <li>Selecciona <b>Perfil</b>.</li>
            <li>Toca <b>Eliminar Cuenta</b> y confirma.</li>
          </ul>
          <p>
            Es decir: <b>Configuraciones &gt; Perfil &gt; Eliminar Cuenta</b>. La eliminación es
            inmediata y no necesitas contactarnos para nada más.
          </p>
        </>
      ),
    },
    {
      title: "Solicitar la eliminación por correo",
      body: (
        <p>
          Si prefieres (o ya no tienes acceso a la app), también puedes pedirnos que eliminemos tu
          cuenta por correo. Escríbenos a{" "}
          <a href="mailto:hola@centavos.mx?subject=Eliminar%20cuenta">hola@centavos.mx</a> con el
          asunto <b>&ldquo;Eliminar cuenta&rdquo;</b>, desde el correo electrónico con el que te
          registraste, y nosotros nos encargamos del resto.
        </p>
      ),
    },
    {
      title: "Qué pasa con tus datos",
      body: (
        <>
          <p>
            Al eliminar tu cuenta, eliminamos tus datos personales —tu perfil, tus gastos, tus
            presupuestos, tus alcancías y tus suscripciones— en un plazo razonable, salvo aquellos
            que debamos conservar por obligación legal. Puedes leer más en nuestro{" "}
            <a href="/app/privacidad">Aviso de Privacidad</a>.
          </p>
          <p>
            <b>La eliminación es definitiva:</b> una vez eliminada tu cuenta, no podemos recuperar
            tu información. Si más adelante quieres volver, tendrás que crear una cuenta nueva.
          </p>
        </>
      ),
    },
  ],
};

export const metadata: Metadata = {
  title: doc.title,
  description: doc.description,
  alternates: { canonical: PATH },
  openGraph: pageOpenGraph({ title: `${doc.title} · Centavos`, description: doc.description, path: PATH }),
};

export default function EliminarCuentaPage() {
  return <LegalShell doc={doc} path={PATH} />;
}
