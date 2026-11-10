import type { LegalDoc } from "../types";

// Spanish is the source of truth for the legal text: the English version in
// privacy.en.tsx is a translation of this file and has to follow it.

export const privacyEs: LegalDoc = {
  title: "Aviso de Privacidad",
  description:
    "Aviso de Privacidad de la app Centavos conforme a la LFPDPPP: qué datos recabamos, para qué los usamos, cómo los protegemos y cómo ejercer tus derechos ARCO.",
  updated: "11 de junio de 2026",
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
              hasheada con bcrypt — nunca en texto plano) y tokens de sesión (tokens de acceso de
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
            políticas). Tampoco usamos analytics de terceros ni SDKs de publicidad en la app.
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
              <b>Proveedor de correo transaccional:</b> para enviarte correos de verificación y
              avisos de cuenta.
            </li>
          </ul>
          <p>
            Estos proveedores actúan como encargados y solo tratan los datos siguiendo nuestras
            instrucciones. <b>No vendemos ni cedemos tus datos personales a terceros con fines
            comerciales.</b> Fuera de lo anterior, solo compartiríamos datos si una autoridad
            competente nos lo requiere conforme a la ley.
          </p>
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
            Android), donde se guardan tus tokens de sesión.
          </p>
          <p>
            En nuestro sitio web (centavos.mx) usamos únicamente <b>cookies estrictamente
            necesarias</b> para su funcionamiento.
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
            <li>Contraseñas almacenadas solo en forma hasheada (bcrypt).</li>
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
      body: <p>Este aviso se actualizó por última vez el <b>11 de junio de 2026</b>.</p>,
    },
  ],
};
