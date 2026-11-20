import type { LegalDoc } from "../types";

// Help page for the Claude connector (centavos.api feature #17), served at
// /app/claude. Spanish is the source of truth; claude.en.tsx translates it with
// the same sections in the same order (the #seccion-N anchors are shared).
// The Claude Connectors Directory links here as the connector's documentation.

export const claudeEs: LegalDoc = {
  title: "Centavos en Claude",
  description:
    "Conecta tu cuenta de Centavos a Claude para anotar gastos y revisar tus presupuestos y suscripciones desde una conversación. Cómo conectarlo, qué puede hacer, límites y ayuda.",
  updated: "19 de noviembre de 2026",
  intro: (
    <p>
      Con el conector de <b className="text-ink">Centavos</b> para Claude, el asistente de
      Anthropic, puedes anotar un gasto, preguntar cuánto llevas este mes o ajustar tus presupuestos
      y suscripciones escribiéndole a Claude, en la web, en la app de escritorio o en el celular. Tus
      datos siguen viviendo en Centavos: Claude solo los consulta o los cambia cuando tú se lo pides.
    </p>
  ),
  sections: [
    {
      title: "Qué puedes hacer",
      body: (
        <>
          <ul>
            <li><b>Ver:</b> tus gastos (por fecha, categoría o nota), un resumen de lo que llevas
              gastado, tus presupuestos y tus suscripciones.</li>
            <li><b>Anotar:</b> gastos nuevos, en un presupuesto o sin presupuesto.</li>
            <li><b>Organizar:</b> mover un gasto a otro presupuesto; crear, editar o borrar
              presupuestos y suscripciones; borrar gastos.</li>
          </ul>
          <p>
            Claude te pide permiso antes de cambiar o borrar algo (puedes decirle que lo permita
            siempre). El conector no mueve dinero,
            no se conecta a tu banco y no da asesoría financiera: trabaja con lo que tú anotas en
            Centavos.
          </p>
        </>
      ),
    },
    {
      title: "Antes de empezar",
      body: (
        <ul>
          <li>Una cuenta de Centavos y la app en tu teléfono, versión 1.12 o posterior.</li>
          <li>
            Una cuenta de Claude (<a href="https://claude.ai">claude.ai</a>). Los conectores
            personalizados están en todos los planes; el plan gratuito permite uno.
          </li>
        </ul>
      ),
    },
    {
      title: "Cómo conectarlo",
      body: (
        <ol>
          <li>
            En la app de Centavos entra a <b>Ajustes → Conectar con Claude</b> y toca{" "}
            <b>Abrir claude.ai</b>. Si prefieres hacerlo a mano, en Claude ve a <b>Personalizar →
            Conectores → Agregar conector personalizado</b> y usa la URL{" "}
            <code>https://api.centavos.mx/mcp</code>.
          </li>
          <li>
            Claude te avisa que el conector viene de un enlace externo: confirma que el nombre sea
            «Centavos» y que la URL sea <code>https://api.centavos.mx/mcp</code>, y continúa.
          </li>
          <li>
            Al conectar, Claude abre una página de Centavos que te pide un código. En la app toca{" "}
            <b>Generar código</b> y luego <b>Copiar código</b>. El código sirve una sola vez y vence
            en 10 minutos.
          </li>
          <li>
            Pega el código, revisa que la cuenta que aparece sea la tuya y toca <b>Conectar</b>.
            Vuelves a Claude con Centavos listo.
          </li>
        </ol>
      ),
    },
    {
      title: "Ejemplos de lo que le puedes pedir",
      body: (
        <ul>
          <li>«Anota 185 pesos de tacos al pastor en comida.»</li>
          <li>«¿Cuánto llevo gastado esta semana y cómo voy con mis presupuestos?»</li>
          <li>«¿En qué gasté más este mes? Agrúpalo por categoría.»</li>
          <li>«Muéstrame mis suscripciones y cuánto pago al mes en total.»</li>
          <li>«Crea un presupuesto de 3,000 al mes para el súper.»</li>
          <li>«Mueve el gasto de Uber de ayer a mi presupuesto de transporte.»</li>
        </ul>
      ),
    },
    {
      title: "Límites",
      body: (
        <>
          <ul>
            <li>
              <b>Plan gratuito:</b> Claude puede anotar hasta 30 gastos cada 30 días y consultar los
              últimos 30 días de gastos y los presupuestos del mes en curso. En la app no hay ningún
              límite nuevo. Con Centavos+ estos límites se amplían.
            </li>
            <li>
              <b>Presupuestos compartidos:</b> los gastos en un presupuesto compartido se anotan
              desde la app, porque se reparten entre sus miembros. Claude sí puede verlos.
            </li>
            <li>
              <b>Moneda:</b> Claude anota en la moneda de tu cuenta o de tu presupuesto; no convierte
              montos.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "Privacidad y seguridad",
      body: (
        <ul>
          <li>
            Para conectar no necesitas tu contraseña: el código sale de tu app, ya con tu sesión
            iniciada, y nadie más puede generarlo.
          </li>
          <li>
            Claude solo ve tu cuenta cuando tú le pides algo que la necesita, y Centavos no recibe
            tus conversaciones con Claude.
          </li>
          <li>
            Cuando conectas, te avisamos en tu teléfono. Si no fuiste tú, desconéctalo desde la app.
          </li>
          <li>
            Los detalles de qué datos se comparten con Anthropic están en el{" "}
            <a href="/app/privacidad">Aviso de Privacidad</a>, en «Transferencias de datos».
          </li>
        </ul>
      ),
    },
    {
      title: "Desconectar",
      body: (
        <p>
          En la app, <b>Ajustes → Conectar con Claude → Desconectar</b>. También puedes quitar el
          conector en Claude, en <b>Personalizar → Conectores</b>. Claude pierde el acceso de
          inmediato; tus gastos y presupuestos se quedan en Centavos.
        </p>
      ),
    },
    {
      title: "Si algo no funciona",
      body: (
        <ul>
          <li>
            <b>«Ese código no es válido o ya venció»:</b> cada código sirve una vez y dura 10
            minutos. Genera otro en la app y pégalo de nuevo.
          </li>
          <li>
            <b>«Ya existe un conector con esta URL»:</b> ya tienes Centavos agregado en Claude.
            Ábrelo en <b>Personalizar → Conectores</b> y toca <b>Conectar</b> en lugar de agregarlo
            otra vez.
          </li>
          <li>
            <b>No veo «Conectar con Claude» en Ajustes:</b> actualiza la app a la versión 1.12 o
            posterior.
          </li>
          <li>
            <b>Claude dice que no tiene acceso a Centavos:</b> la conexión se desconectó o venció.
            Vuelve a conectar desde Claude con un código nuevo.
          </li>
          <li>
            <b>Claude dice que llegaste al límite:</b> en el plan gratuito son 30 gastos cada 30
            días desde Claude. Puedes seguir anotando en la app.
          </li>
        </ul>
      ),
    },
    {
      title: "Soporte",
      body: (
        <p>
          Escríbenos a <a href="mailto:hola@centavos.mx">hola@centavos.mx</a> o desde{" "}
          <a href="/app/soporte">centavos.mx/app/soporte</a>. Te respondemos normalmente dentro de uno
          o dos días hábiles. Para un problema de seguridad, pon «Seguridad» en el asunto.
        </p>
      ),
    },
  ],
};
