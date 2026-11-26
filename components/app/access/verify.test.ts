import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";

process.env.NEXT_PUBLIC_API_URL = "http://api.test/";
const api = await import("@/lib/app/api");
const { loginFailure, resendFailure, verifyFailure } = await import("./failures");
const { codeSlots, formatCountdown, isCodeComplete, sanitizeCode } = await import("./code");

type Call = { url: string; body: unknown };
let calls: Call[] = [];
let replies: Response[] = [];
const realFetch = globalThis.fetch;

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

beforeAll(() => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), body: init?.body ? JSON.parse(init.body as string) : undefined });
    const next = replies.shift();
    if (!next) throw new TypeError("fetch failed");
    return next;
  }) as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
});
beforeEach(() => {
  calls = [];
  replies = [];
});

describe("el código de 6 dígitos", () => {
  test("se limpia a dígitos y a 6, también lo pegado con espacios o guiones", () => {
    expect(sanitizeCode("123 456")).toBe("123456");
    expect(sanitizeCode("12-34-56-78")).toBe("123456");
    expect(sanitizeCode("a1b2")).toBe("12");
    expect(sanitizeCode("")).toBe("");
  });

  test("se completa con 6 dígitos y dibuja seis casillas", () => {
    expect(isCodeComplete("12345")).toBe(false);
    expect(isCodeComplete("123456")).toBe(true);
    expect(codeSlots("12")).toEqual(["1", "2", "", "", "", ""]);
  });

  test("la cuenta regresiva se escribe como la app", () => {
    expect(formatCountdown(60)).toBe("1:00");
    expect(formatCountdown(42)).toBe("0:42");
    expect(formatCountdown(5)).toBe("0:05");
    expect(formatCountdown(-3)).toBe("0:00");
  });
});

describe("errores de verificar y reenviar, por código", () => {
  test("verify: vencido o demasiados intentos destaca «Reenviar»; bloqueado deshabilita", () => {
    expect(verifyFailure(new api.ApiError(400, "AUTH_CODE_EXPIRED"))).toEqual({ clearCode: true, highlightResend: true, locked: false });
    expect(verifyFailure(new api.ApiError(400, "AUTH_CODE_TOO_MANY_ATTEMPTS")).highlightResend).toBe(true);
    expect(verifyFailure(new api.ApiError(400, "AUTH_CODE_INVALID"))).toEqual({ clearCode: true, highlightResend: false, locked: false });
    expect(verifyFailure(new api.ApiError(429, "AUTH_CODE_LOCKED")).locked).toBe(true);
    expect(verifyFailure(new Error("x")).clearCode).toBe(true);
  });

  test("resend: ya verificado y cuenta inexistente salen de Verificar", () => {
    expect(resendFailure(new api.ApiError(400, "AUTH_EMAIL_ALREADY_VERIFIED"))).toEqual({ kind: "alreadyVerified" });
    expect(resendFailure(new api.ApiError(404, "AUTH_USER_NOT_FOUND"))).toEqual({ kind: "noAccount" });
    expect(resendFailure(new api.ApiError(429, "AUTH_CODE_LOCKED"))).toEqual({ kind: "locked" });
    expect(resendFailure(new api.ApiError(429, "RATE_LIMIT"))).toEqual({ kind: "message" });
  });
});

describe("flujo: cuenta sin verificar entra con su contraseña", () => {
  test("403 → Verificar con el userId y el signupToken del error → resend y verify los llevan", async () => {
    replies.push(reply(403, { error: { code: "AUTH_EMAIL_UNVERIFIED", message: "x", userId: "u1", signupToken: "st1" } }));
    const failure = await api.login({ email: "ana@correo.mx", password: "secreta123" }).then(
      () => null,
      (e) => loginFailure(e),
    );
    expect(failure).toEqual({ kind: "unverified", userId: "u1", signupToken: "st1" });
    if (failure?.kind !== "unverified") throw new Error("debía pasar a Verificar");

    replies.push(reply(200, { message: "ok" }));
    await api.resendCode({ userId: failure.userId!, signupToken: failure.signupToken });
    expect(calls[1].url).toBe("http://api.test/api/auth/resend");
    expect(calls[1].body).toEqual({ userId: "u1", signupToken: "st1" });

    const session = { accessToken: "a", refreshToken: "r", user: { id: "u1", name: "Ana", email: "ana@correo.mx", currency: "MXN", onboarded: false } };
    replies.push(reply(200, session));
    const res = await api.verifyEmail({ userId: "u1", code: "123456", signupToken: "st1" });
    expect(calls[2].url).toBe("http://api.test/api/auth/verify");
    expect(calls[2].body).toEqual({ userId: "u1", code: "123456", signupToken: "st1" });
    expect(res.user.onboarded).toBe(false);
  });

  test("una cuenta vieja sin signupToken llama a verify sin la llave", async () => {
    replies.push(reply(200, { accessToken: "a", refreshToken: "r", user: { id: "u1" } }));
    await api.verifyEmail({ userId: "u1", code: "123456" });
    expect(calls[0].body).toEqual({ userId: "u1", code: "123456" });
  });

  test("un código incorrecto llega como AUTH_CODE_INVALID, no como texto de la API", async () => {
    replies.push(reply(400, { error: { code: "AUTH_CODE_INVALID", message: "Invalid code" } }));
    const error = await api.verifyEmail({ userId: "u1", code: "000000" }).catch((e) => e);
    expect(error.code).toBe("AUTH_CODE_INVALID");
    expect(error.message).toBe("AUTH_CODE_INVALID");
  });
});

describe("flujo: recuperar la contraseña", () => {
  test("correo → código → contraseña nueva, sin pasar nada por la URL", async () => {
    replies.push(reply(200, { message: "ok" }));
    await api.forgotPassword("ana@correo.mx");
    expect(calls[0].url).toBe("http://api.test/api/auth/forgot-password");
    expect(calls[0].body).toEqual({ email: "ana@correo.mx" });

    replies.push(reply(200, { resetToken: "jwt" }));
    const { resetToken } = await api.verifyResetCode({ email: "ana@correo.mx", code: "123456" });
    expect(calls[1].body).toEqual({ email: "ana@correo.mx", code: "123456" });
    expect(resetToken).toBe("jwt");

    replies.push(reply(200, { accessToken: "a", refreshToken: "r", user: { id: "u1", name: "Ana", email: "ana@correo.mx", currency: "MXN" } }));
    const session = await api.resetPassword({ resetToken, newPassword: "nueva-clave-1" });
    expect(calls[2].body).toEqual({ resetToken: "jwt", newPassword: "nueva-clave-1" });
    // La respuesta de reset no trae `onboarded`: la guardia lo toma como configurado hasta que llegue /me.
    expect((session.user as { onboarded?: boolean }).onboarded).toBeUndefined();
    for (const call of calls) expect(call.url).not.toContain("jwt");
  });

  test("solo un token vencido o repetido reinicia el flujo", async () => {
    const { resetPasswordRestarts } = await import("./failures");
    expect(resetPasswordRestarts(new api.ApiError(400, "AUTH_RESET_TOKEN_INVALID"))).toBe(true);
    expect(resetPasswordRestarts(new api.ApiError(429, "RATE_LIMIT"))).toBe(false);
    expect(resetPasswordRestarts(new Error("x"))).toBe(false);
  });

  test("un código de recuperación incorrecto llega por su código", async () => {
    replies.push(reply(400, { error: { code: "AUTH_RESET_CODE_INVALID", message: "Invalid" } }));
    const error = await api.verifyResetCode({ email: "a@b.mx", code: "000000" }).catch((e) => e);
    expect(error.code).toBe("AUTH_RESET_CODE_INVALID");
  });
});
