// Traspaso de la sesión (docs/app-web.md §6.3, opción B).
//
// Recibe el refresh token que la API acaba de dar en el inicio de sesión y lo
// rota de inmediato: el token que JavaScript llegó a ver queda revocado, y el
// nuevo solo existe en la cookie HttpOnly. Devuelve el access token.

import { fail, refreshUpstream, rejectCrossSite, respondToUpstream } from "@/lib/app/session-routes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const forbidden = rejectCrossSite(request);
  if (forbidden) return forbidden;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_JSON");
  }
  const refreshToken = (body as { refreshToken?: unknown } | null)?.refreshToken;
  if (typeof refreshToken !== "string" || refreshToken === "") return fail(400, "VALIDATION");

  return respondToUpstream(await refreshUpstream(refreshToken));
}
