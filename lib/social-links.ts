// Perfiles de Centavos en redes sociales. Instagram y TikTok son fijos; la
// invitación a Discord sale de una variable de entorno.
export const INSTAGRAM_URL = "https://www.instagram.com/centavos.mx/";
export const TIKTOK_URL = "https://www.tiktok.com/@centavos.mx";

/**
 * Invitación al servidor de Discord de la comunidad, desde
 * `NEXT_PUBLIC_DISCORD_URL`. Vacía si falta o no es una URL https: en ese caso
 * ni la landing muestra el bloque de Discord ni el footer el link.
 */
export const DISCORD_URL = httpsUrl(process.env.NEXT_PUBLIC_DISCORD_URL);

function httpsUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return "";
  try {
    return new URL(value).protocol === "https:" ? value : "";
  } catch {
    return "";
  }
}
