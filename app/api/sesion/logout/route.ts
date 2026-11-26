// Cierre de sesión (docs/app-web.md §5.7, §6.3). Revoca el token en la API y
// borra la cookie aunque la API falle: recargar nunca revive una sesión cerrada.

import { clearCookieHeader, logoutUpstream, noContent, readRefreshCookie, rejectCrossSite } from "@/lib/app/session-routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const forbidden = rejectCrossSite(request);
  if (forbidden) return forbidden;

  const refreshToken = readRefreshCookie(request);
  if (refreshToken !== null) await logoutUpstream(refreshToken);
  return noContent({ cookie: clearCookieHeader() });
}
