import type { LegalDoc } from "../types";

// Spanish is the source of truth for the legal text: the English version in
// privacy.en.tsx is a translation of this file and has to follow it.

export const privacyEs: LegalDoc = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de Privacidad de la app Centavos conforme a la LFPDPPP: qué datos recabamos, para qué los usamos, cómo los protegemos y cómo ejercer tus derechos ARCO.",
  updated: "19 de noviembre de 2026",
  intro: (
    <p>
      En <b className="text-ink">Centavos</b> tu confianza vale más que cualquier dato. Este
      aviso explica, conforme a la Ley Federal de Protección de Datos Personales en Posesión
      de los Particulares (LFPDPPP) y su Reglamento, qué información recabamos cuando usas
      nuestra app, para qué la usamos, con quién la compartimos (spoiler: con casi nadie) y
      cómo puedes ejercer tus derechos.
    </p>
  ),
  sections: [
    {
      title: "Responsable del tratamiento",
      body: (
        <p>
          El responsable del tratamiento de tus datos personales es <b>Centavos</b>, con sitio web en{" "}
          <a href="https://centavos.mx">https://centavos.mx</a>. Para cualquier tema de privacidad
          puedes escribirnos a <a href="mailto:hola@centavos.mx">hola@centavos.mx</a>.
        </p>
      ),
    },
    {
      title: "Datos personales que recabamos",
      body: (
        <>
          <p>Recabamos únicamente lo necesario para que la app funcione:</p>
          <ul>
            <li>
              <b>Datos de identificación:</b> tu nombre y tu correo electrónico, además de un
              identificador interno de usuario (UUID), tu moneda preferida (MXN por defecto) y la
              fecha de creación de tu cuenta.
            </li>
            <li>
              <b>Datos de autenticación:</b> tu contraseña (almacenada únicamente en forma
              hasheada con Argon2id — nunca en texto plano) y tokens de sesión (tokens de acceso de
              corta vida y refresh tokens con rotación).
            </li>
            <li>
              <b>Contenido que tú capturas:</b> gastos (monto, categoría, nota, fecha),
              presupuestos (categoría, monto mensual, nombre), alcancías
              (metas de ahorro) y suscripciones (nombre, monto, frecuencia, próximo cobro). Todo lo
              capturas tú a mano; Centavos no lo obtiene de ninguna otra fuente.
            </li>
            <li>
              <b>Datos técnicos:</b> registros (logs) de servidor, dirección IP cuando aplica e
              información básica del dispositivo, con fines de seguridad y operación del servicio.
            </li>
          </ul>
          <p>
            <b>No recabamos datos personales sensibles</b> en los términos del artículo 3, fracción
            VI de la LFPDPPP (como origen étnico, estado de salud, creencias religiosas u opiniones
            políticas).
          </p>
          <p>
            <b>Terceros que recaban datos dentro de la app.</b> Para operar la app usamos servicios
            de terceros que, al estar integrados, pueden recabar información de tu dispositivo:
          </p>
          <ul>
            <li>
              <b>Publicidad (Google AdMob).</b> En el plan gratuito la app muestra anuncios no
              personalizados. Google puede recabar identificadores del dispositivo y datos de uso
              para servir y medir esos anuncios, conforme a sus propias políticas. Con Centavos+ no
              se muestran anuncios.
            </li>
            <li>
              <b>Suscripciones (RevenueCat).</b> Para validar y administrar tu suscripción
              Centavos+ se procesan tu identificador de usuario y los datos de la compra que nos
              devuelve la tienda. Nunca recibimos los datos de tu tarjeta.
            </li>
            <li>
              <b>Analítica de producto (PostHog).</b> Registramos eventos de uso de la app
              (pantallas que visitas y acciones que haces) asociados a tu identificador de usuario,
              tu nombre, tu correo, tu plan y tu idioma, para entender qué funciona y qué no. No
              incluye los montos ni las notas de tus gastos.
            </li>
          </ul>
          <p>
            Estos terceros tratan los datos conforme a sus propias políticas de privacidad, que
            puedes consultar en sus sitios.
          </p>
        </>
      ),
    },
    {
      title: "Finalidades del tratamiento",
      body: (
        <>
          <p><b>Finalidades primarias</b> (necesarias para darte el servicio):</p>
          <ul>
            <li>Crear y administrar tu cuenta.</li>
            <li>Permitirte registrar y consultar tu información financiera personal en la app.</li>
            <li>Verificar tu correo electrónico.</li>
            <li>Mantener tu sesión iniciada de forma segura.</li>
            <li>Brindarte soporte cuando nos escribas.</li>
            <li>Cumplir obligaciones legales aplicables.</li>
          </ul>
          <p>
            <b>Finalidades secundarias</b> (no son necesarias para el servicio y puedes negarte sin
            que eso afecte tu cuenta):
          </p>
          <ul>
            <li>Mejorar el producto a partir de datos agregados y anonimizados.</li>
            <li>
              Enviarte comunicaciones sobre novedades del producto (siempre con opción de darte de
              baja).
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "Cómo negarte a las finalidades secundarias",
      body: (
        <p>
          Si no quieres que tratemos tus datos para las finalidades secundarias, solo envía un
          correo a <a href="mailto:hola@centavos.mx">hola@centavos.mx</a> indicándolo. Tu negativa
          no afecta en nada el uso normal de la app.
        </p>
      ),
    },
    {
      title: "Transferencias de datos",
      body: (
        <>
          <p>Para operar el servicio usamos proveedores que tratan datos por cuenta nuestra:</p>
          <ul>
            <li>
              <b>Proveedor de correo transaccional (Resend):</b> para enviarte correos de
              verificación y avisos de cuenta.
            </li>
            <li>
              <b>Infraestructura en la nube:</b> para hospedar nuestro servidor, la base de datos y
              las imágenes que adjuntas a tus gastos.
            </li>
            <li>
              <b>Notificaciones (Expo, con Apple y Google):</b> para enviarte las notificaciones que
              activas en la app.
            </li>
            <li>
              <b>Monitoreo de errores (Sentry):</b> para detectar y corregir fallas del servidor. No
              le enviamos el contenido de tus gastos.
            </li>
            <li>
              <b>Google AdMob, RevenueCat y PostHog:</b> como se describe en la sección «Datos
              personales que recabamos».
            </li>
          </ul>
          <p>
            Estos proveedores actúan como encargados y solo tratan los datos siguiendo nuestras
            instrucciones. <b>No vendemos ni cedemos tus datos personales a terceros con fines
            comerciales.</b> Fuera de lo anterior, solo compartiríamos datos si una autoridad
            competente nos lo requiere conforme a la ley.
          </p>
          <p>
            <b>Conexión con Claude (Anthropic), solo si tú la activas.</b> Puedes conectar tu cuenta
            de Centavos a Claude, el asistente de Anthropic, desde Ajustes → Conectar con Claude
            (más detalles en <a href="/app/claude">centavos.mx/app/claude</a>). Mientras la conexión
            esté activa y cuando tú se lo pidas a Claude:
          </p>
          <ul>
            <li>
              Centavos le envía a Claude los datos necesarios para responderte: tus gastos (monto,
              categoría, nota y fecha), presupuestos, suscripciones y resúmenes de lo que llevas
              gastado. Claude también puede registrar gastos y crear, editar o borrar gastos,
              presupuestos y suscripciones en tu cuenta.
            </li>
            <li>
              Esta transferencia ocurre por tu solicitud expresa. Lo que Claude recibe queda sujeto
              a los términos y al aviso de privacidad de Anthropic que aplican a tu uso de Claude.
            </li>
            <li>
              Centavos no recibe tus conversaciones con Claude: solo las solicitudes concretas que
              Claude le hace a tu cuenta. Guardamos la fecha de la conexión, su último uso, tu zona
              horaria y qué gastos se registraron desde Claude, para operar el servicio y mostrarte
              tus conexiones.
            </li>
            <li>
              Puedes desconectar en cualquier momento desde Ajustes → Conectar con Claude o quitando
              el conector en Claude. Al desconectar, Claude pierde el acceso de inmediato; lo que ya
              recibió sigue sujeto a las políticas de Anthropic.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "Derechos ARCO",
      body: (
        <>
          <p>La ley te da derechos sobre tus datos, conocidos como derechos ARCO:</p>
          <ul>
            <li><b>Acceso:</b> saber qué datos tuyos tenemos y cómo los usamos.</li>
            <li><b>Rectificación:</b> corregir datos inexactos o desactualizados.</li>
            <li><b>Cancelación:</b> pedir que eliminemos tus datos cuando ya no sean necesarios.</li>
            <li><b>Oposición:</b> oponerte al tratamiento de tus datos para fines específicos.</li>
          </ul>
          <p>
            Para ejercerlos, envía tu solicitud a{" "}
            <a href="mailto:hola@centavos.mx">hola@centavos.mx</a> con tu nombre, el derecho que
            quieres ejercer y copia de una identificación oficial que acredite tu identidad (o la de
            tu representante legal). Te responderemos dentro del plazo máximo de <b>20 días
            hábiles</b> que marca la ley, y si procede, la haremos efectiva dentro de los 15 días
            siguientes.
          </p>
          <p>
            También puedes <b>revocar tu consentimiento</b> en cualquier momento por el mismo medio.
            Y si consideras que no atendimos correctamente tu solicitud, tienes derecho a presentar
            una denuncia ante el <b>INAI</b> (Instituto Nacional de Transparencia, Acceso a la
            Información y Protección de Datos Personales):{" "}
            <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer">
              https://www.inai.org.mx
            </a>.
          </p>
        </>
      ),
    },
    {
      title: "Cookies y tecnologías similares",
      body: (
        <>
          <p>
            <b>En la app móvil no usamos cookies.</b> Para mantener tu sesión usamos el
            almacenamiento seguro de tu dispositivo (Keychain en iOS y EncryptedSharedPreferences en
            Android), donde se guardan tus tokens de sesión. Los servicios de publicidad y analítica
            descritos en «Datos personales que recabamos» usan identificadores del dispositivo y de
            la instalación de la app.
          </p>
          <p>
            En nuestro sitio web (centavos.mx) usamos únicamente <b>cookies estrictamente
            necesarias</b> para su funcionamiento, y medimos visitas de forma agregada con Vercel Web
            Analytics, que no usa cookies.
          </p>
        </>
      ),
    },
    {
      title: "Seguridad",
      body: (
        <>
          <p>Protegemos tus datos con medidas administrativas, técnicas y físicas razonables:</p>
          <ul>
            <li>Cifrado TLS para toda la información en tránsito.</li>
            <li>Contraseñas almacenadas solo en forma hasheada (Argon2id).</li>
            <li>Tokens guardados en el almacenamiento cifrado de tu dispositivo.</li>
            <li>Controles de acceso estrictos a nuestro backend.</li>
          </ul>
          <p>
            Trabajamos con un estándar de mejor esfuerzo razonable; como cualquier servicio digital,
            no podemos garantizar seguridad absoluta, pero sí que nos la tomamos muy en serio.
          </p>
        </>
      ),
    },
    {
      title: "Retención de datos",
      body: (
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Si borras tu cuenta (puedes
          hacerlo desde Ajustes en la app), eliminamos tus datos personales en un plazo razonable,
          salvo aquellos que debamos conservar por obligación legal.
        </p>
      ),
    },
    {
      title: "Menores de edad",
      body: (
        <p>
          Centavos está dirigido a personas mayores de 13 años. Si eres madre, padre o tutor y
          tienes alguna inquietud sobre el uso de la app por un menor a tu cargo, escríbenos a{" "}
          <a href="mailto:hola@centavos.mx">hola@centavos.mx</a> y atenderemos tu solicitud.
        </p>
      ),
    },
    {
      title: "Cambios a este aviso",
      body: (
        <p>
          Si este aviso cambia de forma relevante, te lo notificaremos dentro de la app y/o por
          correo electrónico. La versión vigente siempre estará disponible en{" "}
          <a href="https://centavos.mx/app/privacidad">centavos.mx/app/privacidad</a>.
        </p>
      ),
    },
    {
      title: "Aceptación",
      body: (
        <p>
          Al crear tu cuenta o continuar usando la app, confirmas que conoces este Aviso de
          Privacidad y consientes el tratamiento de tus datos conforme a lo aquí descrito.
        </p>
      ),
    },
    {
      title: "Última actualización",
      body: <p>Este aviso se actualizó por última vez el <b>19 de noviembre de 2026</b>.</p>,
    },
  ],
};
