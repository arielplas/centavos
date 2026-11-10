import type { LegalDoc } from "../types";

// Spanish is the source of truth for the legal text: the English version in
// terms.en.tsx is a translation of this file and has to follow it.

export const termsEs: LegalDoc = {
  title: "Términos y Condiciones",
  description:
    "Términos y Condiciones de la app Centavos: tu cuaderno digital de gastos, presupuestos, alcancías y suscripciones. Sin bancos, sin dinero real, sin letras chiquitas escondidas.",
  updated: "11 de junio de 2026",
  intro: (
    <p>
      Estos términos regulan el uso de la app <b className="text-ink">Centavos</b> (disponible
      para iOS y Android) y de los servicios relacionados que ofrecemos desde{" "}
      <a href="https://centavos.mx" className="text-mandarina-deep underline underline-offset-2">centavos.mx</a>.
      Los escribimos lo más claro que pudimos — sin letras chiquitas escondidas. Si algo no
      queda claro, escríbenos a hola@centavos.mx y con gusto te lo explicamos.
    </p>
  ),
  sections: [
    {
      title: "Aceptación de los términos",
      body: (
        <p>
          Al crear una cuenta o usar Centavos aceptas estos Términos y Condiciones y nuestro{" "}
          <a href="/app/privacidad">Aviso de Privacidad</a>. Si no estás de acuerdo con algo,
          lo correcto es no usar la app. Así de simple.
        </p>
      ),
    },
    {
      title: "Descripción del servicio",
      body: (
        <>
          <p>
            Centavos es un <b>cuaderno personal digital</b> para llevar registro de tus gastos,
            presupuestos, alcancías y suscripciones. Tú capturas
            todo a mano; nosotros te lo guardamos, lo ordenamos y te lo mostramos bonito.
          </p>
          <p>Para que no haya confusión, esto es lo que Centavos <b>no</b> es:</p>
          <ul>
            <li><b>No es un servicio financiero regulado.</b> No somos banco, fintech, SOFIPO ni institución de crédito.</li>
            <li><b>No se conecta a tus cuentas bancarias</b> ni a ninguna institución financiera.</li>
            <li><b>No procesa pagos ni mueve dinero real.</b> Los montos que registras son solo anotaciones tuyas.</li>
            <li><b>No da asesoría financiera, fiscal ni de inversión.</b></li>
          </ul>
          <p>Es un cuaderno con superpoderes. El dinero de verdad nunca pasa por aquí.</p>
        </>
      ),
    },
    {
      title: "Elegibilidad y registro",
      body: (
        <>
          <p>Para usar Centavos necesitas:</p>
          <ul>
            <li>Tener al menos <b>13 años</b>.</li>
            <li>Registrarte con datos veraces (tu nombre y un correo que sí sea tuyo).</li>
            <li>Tener <b>una sola cuenta</b> por persona.</li>
          </ul>
          <p>
            Si detectamos cuentas duplicadas o datos falsos, podemos pedirte que lo corrijas o
            suspender la cuenta (ver sección 12).
          </p>
        </>
      ),
    },
    {
      title: "Tu cuenta y seguridad",
      body: (
        <>
          <p>
            Tu contraseña es tuya y de nadie más. Eres responsable de mantenerla segura y de toda
            la actividad que ocurra en tu cuenta.
          </p>
          <ul>
            <li>Si sospechas que alguien más entró a tu cuenta, avísanos de inmediato a hola@centavos.mx.</li>
            <li>Puedes cerrar sesión en cualquier momento desde Ajustes; eso invalida la sesión en ese dispositivo.</li>
            <li>Nunca te vamos a pedir tu contraseña por correo ni por ningún otro medio.</li>
          </ul>
        </>
      ),
    },
    {
      title: "Centavos+ (suscripción de paga)",
      body: (
        <>
          <p>
            Centavos se usa gratis. <b>Centavos+</b> es una suscripción opcional que quita los
            anuncios y desbloquea funciones extra; lo que incluye se enlista en la propia app,
            en Ajustes › Centavos+.
          </p>
          <ul>
            <li>
              <b>Planes y precio.</b> Se ofrece en plan <b>mensual</b> y <b>anual</b>. El precio
              de cada uno, en tu moneda local y con impuestos donde apliquen, se te muestra en la
              pantalla de compra <b>antes</b> de que confirmes. Los precios pueden cambiar; si eso
              pasa, el cambio aplica hasta tu siguiente periodo y te avisamos con la anticipación
              que exija la tienda.
            </li>
            <li>
              <b>El cobro lo hace la tienda, no nosotros.</b> La compra se procesa a través de tu
              cuenta de <b>Apple ID</b> (App Store) o de <b>Google Play</b>, según el dispositivo.
              Nosotros nunca vemos ni guardamos los datos de tu tarjeta.
            </li>
            <li>
              <b>Se renueva sola.</b> La suscripción es de <b>renovación automática</b>. Se te
              cobra al confirmar la compra y después se renueva por el mismo periodo, salvo que la
              canceles al menos <b>24 horas antes</b> de que termine el periodo en curso. El cobro
              de la renovación se hace dentro de las 24 horas previas al fin del periodo.
            </li>
            <li>
              <b>Cómo cancelar.</b> Desde los ajustes de tu cuenta en la tienda: en iOS,
              Ajustes del sistema › tu nombre › Suscripciones; en Android, Google Play ›
              Suscripciones. Cancelar detiene las renovaciones futuras y <b>conservas Centavos+
              hasta que termina el periodo que ya pagaste</b>. No podemos cancelar la suscripción
              por ti.
            </li>
            <li>
              <b>Periodos de prueba.</b> Si una oferta incluye prueba gratis, la parte no usada se
              pierde al comprar la suscripción, cuando la tienda lo establezca así.
            </li>
            <li>
              <b>Reembolsos.</b> Los gestiona la tienda conforme a sus propias políticas
              (Apple o Google), no Centavos.
            </li>
            <li>
              <b>Si tu suscripción termina</b>, tu cuenta y todo lo que capturaste siguen ahí:
              vuelves al plan gratuito, con anuncios y sin las funciones de Centavos+. No se borra
              nada por dejar de pagar.
            </li>
          </ul>
          <p>
            Al comprar Centavos+ aceptas estos Términos y el{" "}
            <a href="/app/privacidad">Aviso de Privacidad</a>, además de los términos de la tienda
            donde hiciste la compra.
          </p>
        </>
      ),
    },
    {
      title: "Uso aceptable",
      body: (
        <>
          <p>Queremos que Centavos sea un espacio sano. Por eso, esto no se vale:</p>
          <ul>
            <li>Hacer <b>scraping</b>, extracción masiva de datos o accesos automatizados (bots) a la app o a nuestra API.</li>
            <li>Aplicar <b>ingeniería inversa</b>, descompilar o intentar extraer el código fuente.</li>
            <li>Usar la app o su contenido con <b>fines comerciales</b> sin nuestra autorización por escrito.</li>
            <li>Intentar acceder a <b>cuentas ajenas</b> o a sistemas que no te corresponden.</li>
            <li>Usar la app para cualquier <b>actividad ilegal</b>.</li>
          </ul>
          <p>Incumplir esta sección puede llevar a la suspensión o cierre de tu cuenta.</p>
        </>
      ),
    },
    {
      title: "Contenido del usuario",
      body: (
        <>
          <p>
            Todo lo que capturas en Centavos — gastos, presupuestos, alcancías, suscripciones, notas —{" "}
            <b>es tuyo</b>. Punto.
          </p>
          <p>
            Para que la app funcione, nos otorgas una <b>licencia limitada, no exclusiva y
            revocable</b> para almacenar, procesar y mostrarte <b>tu propio contenido dentro de tu
            propia experiencia</b> en la app. Nada más. No publicamos tu contenido, no lo
            compartimos con otros usuarios y no lo reutilizamos con fines comerciales.
          </p>
          <p>Si borras tu cuenta, la licencia termina (ver sección 12 y el Aviso de Privacidad).</p>
        </>
      ),
    },
    {
      title: "Propiedad intelectual de Centavos",
      body: (
        <p>
          La marca Centavos, el logotipo, el código de la app, el diseño, las ilustraciones y los
          textos son propiedad de Centavos y están protegidos por las leyes de propiedad
          intelectual aplicables. Usar la app no te transfiere ningún derecho sobre ellos.
        </p>
      ),
    },
    {
      title: "No constituye asesoría financiera",
      body: (
        <>
          <p>
            <b>Centavos no ofrece asesoría financiera, fiscal, legal ni de inversión de ningún
            tipo.</b> La información que ves en la app proviene de lo que tú mismo capturas, y
            cualquier cifra, gráfica o resumen tiene fines exclusivamente informativos y de
            organización personal.
          </p>
          <p>
            Las decisiones que tomes con tu dinero son tuyas y bajo tu propia responsabilidad. Si
            necesitas asesoría profesional, acude con una persona o institución certificada.
          </p>
        </>
      ),
    },
    {
      title: "Disponibilidad del servicio",
      body: (
        <p>
          Hacemos nuestro mejor esfuerzo para que Centavos esté disponible siempre, pero no
          podemos garantizar un funcionamiento ininterrumpido o libre de errores. A veces haremos
          mantenimientos, actualizaciones o mejoras que pueden pausar el servicio temporalmente.
          Cuando sea posible, te avisaremos dentro de la app.
        </p>
      ),
    },
    {
      title: "Modificaciones al servicio y a los términos",
      body: (
        <p>
          Centavos evoluciona: podemos agregar, cambiar o retirar funciones. También podemos
          actualizar estos términos. Si el cambio es relevante, te lo notificaremos dentro de la
          app. Si sigues usando Centavos después de la notificación, entendemos que aceptas los
          términos actualizados.
        </p>
      ),
    },
    {
      title: "Suspensión y terminación",
      body: (
        <>
          <p>
            <b>Tú puedes irte cuando quieras.</b> Puedes borrar tu cuenta en cualquier momento desde
            Ajustes dentro de la app, sin trámites raros ni preguntas incómodas.
          </p>
          <p>
            Nosotros podemos suspender o cerrar tu cuenta si incumples estos términos, si detectamos
            fraude o uso indebido, o si la ley nos lo exige. Cuando sea razonable, te avisaremos
            antes para que puedas corregir el problema.
          </p>
        </>
      ),
    },
    {
      title: "Limitación de responsabilidad",
      body: (
        <>
          <p>
            En la medida máxima permitida por la legislación mexicana, Centavos no será responsable
            por daños indirectos, incidentales o consecuenciales, lucro cesante, pérdida de
            oportunidades, ni por pérdida de datos derivada de caso fortuito o fuerza mayor, fallas
            de terceros (como proveedores de hosting o conectividad) o causas fuera de nuestro
            control razonable.
          </p>
          <p>
            Nada en estos términos limita derechos que la ley te otorga como consumidor y que no
            puedan renunciarse.
          </p>
        </>
      ),
    },
    {
      title: "Indemnización",
      body: (
        <p>
          Si usas Centavos de forma indebida o en violación de estos términos y eso genera
          reclamaciones de terceros contra Centavos, aceptas sacarnos en paz y a salvo y cubrir
          los daños y gastos razonables (incluyendo honorarios legales) que se deriven de tu
          incumplimiento.
        </p>
      ),
    },
    {
      title: "Ley aplicable y jurisdicción",
      body: (
        <p>
          Estos términos se rigen por las leyes de los <b>Estados Unidos Mexicanos</b>. Para
          cualquier controversia, las partes se someten a la jurisdicción de los tribunales
          competentes de la <b>Ciudad de México</b>, renunciando a cualquier otro fuero que
          pudiera corresponderles por razón de su domicilio presente o futuro.
        </p>
      ),
    },
    {
      title: "Divisibilidad",
      body: (
        <p>
          Si alguna cláusula de estos términos resulta inválida o inaplicable, el resto seguirá
          siendo plenamente válido. La cláusula afectada se interpretará de la forma que mejor
          refleje su intención original dentro de lo permitido por la ley.
        </p>
      ),
    },
    {
      title: "Contacto",
      body: (
        <p>
          ¿Dudas, comentarios o algo que no cuadra? Escríbenos a{" "}
          <a href="mailto:hola@centavos.mx">hola@centavos.mx</a>. Leemos todo.
        </p>
      ),
    },
  ],
};
