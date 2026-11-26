// Esqueleto neutro, sin texto: lo que se ve antes de saber el idioma (§9.1) y
// mientras se restaura la sesión (§4.3). Sin texto porque todavía no hay idioma
// en el que escribirlo, y sin datos de nadie porque se dibuja en el servidor.

export function BootSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto w-full max-w-[720px] px-4 py-10">
      <div className="h-8 w-40 animate-pulse rounded-xl bg-sand" />
      <div className="mt-6 h-40 animate-pulse rounded-3xl bg-sand" />
      <div className="mt-4 h-24 animate-pulse rounded-3xl bg-sand" />
    </div>
  );
}
