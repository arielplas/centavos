// Clases compartidas de las pantallas de acceso. Los tokens y el vidrio son los
// del sitio (app/globals.css); los campos y el botón, los de /canjear.

export const fieldClass =
  "w-full min-h-12 bg-bg border border-rule-strong px-4 py-3 rounded-xl text-[16px] text-ink placeholder:text-ink-soft outline-none focus:ring-2 focus:ring-ink focus:border-ink disabled:opacity-60 aria-[invalid=true]:border-mandarina-deep";
export const labelClass = "text-[13px] font-bold text-ink mb-1.5 block";
export const primaryButton =
  "w-full min-h-12 bg-ink text-bg px-5 py-3 rounded-xl text-[15px] font-bold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:opacity-80 transition-opacity duration-150";
/** Enlace o botón de texto: sube a 44 px de alto con el relleno. */
export const linkClass =
  "inline-flex min-h-11 items-center text-[14px] font-bold text-mandarina-deep underline underline-offset-2 cursor-pointer disabled:text-ink-soft disabled:no-underline disabled:cursor-not-allowed";
export const errorClass = "text-[13px] font-semibold text-mandarina-deep";
export const titleClass =
  "font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink outline-none whitespace-pre-line";
