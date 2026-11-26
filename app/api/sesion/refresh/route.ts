// Refresh con la cookie (docs/app-web.md §6.3). Lee la cookie, rota el token en
// la API, reescribe la cookie y devuelve el access token. Con un 401 de la API
// borra la cookie y responde 401 con el mismo `code`.

import {
  clearCookieHeader,
  fail,
  readRefreshCookie,
  refreshUpstream,
  rejectCrossSite,
  respondToUpstream,
} from "@/lib/app/session-routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const forbidden = rejectCrossSite(request);
  if (forbidden) return forbidden;

  const refreshToken = readRefreshCookie(request);
  if (refreshToken === null) {
    return fail(401, "AUTH_REFRESH_TOKEN_NOT_FOUND", { cookie: clearCookieHeader() });
  }
  return respondToUpstream(await refreshUpstream(refreshToken));
}
