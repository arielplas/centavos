// Un aviso que pasa de una pantalla de acceso a otra, solo en memoria y de una
// sola lectura, como `prefillEmail` de la sesión (nunca en la URL). Hoy lo usa
// crear-cuenta cuando el reenvío dice que el correo ya estaba verificado: manda
// a /app/entrar con el correo puesto y este aviso.

export type AccessNotice = "alreadyVerified";

let pending: AccessNotice | null = null;

export function setAccessNotice(notice: AccessNotice): void {
  pending = notice;
}

/** Lo lee una vez: después ya no está. */
export function takeAccessNotice(): AccessNotice | null {
  const notice = pending;
  pending = null;
  return notice;
}
