import { describe, expect, test } from "bun:test";
import { ApiError } from "@/lib/app/api";
import { accessHref } from "./links";
import { hasErrors, isSignupStepValid, isValidEmail, isValidName, loginErrors, newPasswordError } from "./validation";
import { loginFailure, signupFailure } from "./failures";

describe("validación", () => {
  test("el correo: vacío, mal formado y bueno", () => {
    expect(isValidEmail("ana@correo.mx")).toBe(true);
    expect(isValidEmail("  ana@correo.mx ")).toBe(true);
    expect(isValidEmail("ana@correo")).toBe(false);
    expect(isValidEmail("ana correo@x.mx")).toBe(false);
    expect(loginErrors({ email: "", password: "x" }).email).toBe("auth:validation.emailRequired");
    expect(loginErrors({ email: "ana", password: "x" }).email).toBe("auth:validation.emailInvalid");
  });

  test("entrar pide contraseña pero no mide su largo", () => {
    expect(loginErrors({ email: "a@b.mx", password: "" }).password).toBe("auth:validation.passwordRequired");
    expect(hasErrors(loginErrors({ email: "a@b.mx", password: "1" }))).toBe(false);
  });

  test("contraseña nueva de 8 a 72", () => {
    expect(newPasswordError("1234567")).toBe("auth:validation.passwordTooShort");
    expect(newPasswordError("12345678")).toBeUndefined();
    expect(newPasswordError("x".repeat(72))).toBeUndefined();
    expect(newPasswordError("x".repeat(73))).toBe("auth:validation.passwordTooLong");
  });

  test("nombre de 1 a 100 sin contar los extremos", () => {
    expect(isValidName("   ")).toBe(false);
    expect(isValidName(" Ana ")).toBe(true);
    expect(isValidName("x".repeat(101))).toBe(false);
  });
});

describe("enlaces entre pantallas de acceso", () => {
  test("llevan el next válido y descartan el que no lo es", () => {
    expect(accessHref("/app/recuperar", "?next=%2Fapp%2Fgastos")).toBe("/app/recuperar?next=%2Fapp%2Fgastos");
    expect(accessHref("/app/recuperar", "")).toBe("/app/recuperar");
    expect(accessHref("/app/crear-cuenta", "?next=https%3A%2F%2Fevil.example")).toBe("/app/crear-cuenta");
    expect(accessHref("/app/crear-cuenta", "?next=%2F%2Fevil.example")).toBe("/app/crear-cuenta");
  });
});

describe("login", () => {
  test("403 AUTH_EMAIL_UNVERIFIED pasa a Verificar con el userId y el signupToken", () => {
    const error = new ApiError(403, "AUTH_EMAIL_UNVERIFIED", { userId: "u1", signupToken: "st" });
    expect(loginFailure(error)).toEqual({ kind: "unverified", userId: "u1", signupToken: "st" });
  });

  test("sin signupToken (cuenta vieja) también pasa", () => {
    const error = new ApiError(403, "AUTH_EMAIL_UNVERIFIED", { userId: "u1" });
    expect(loginFailure(error)).toEqual({ kind: "unverified", userId: "u1", signupToken: undefined });
  });

  test("lo demás es error del formulario", () => {
    const error = new ApiError(401, "AUTH_INVALID_CREDENTIALS");
    expect(loginFailure(error)).toEqual({ kind: "error", error });
  });
});

describe("crear cuenta: cuándo se habilita cada paso", () => {
  const base = { email: "", accepted: false, password: "", name: "" };

  test("paso 1: correo válido Y casilla marcada", () => {
    expect(isSignupStepValid(1, { ...base, email: "ana@correo.mx" })).toBe(false);
    expect(isSignupStepValid(1, { ...base, accepted: true })).toBe(false);
    expect(isSignupStepValid(1, { ...base, email: "ana@correo.mx", accepted: true })).toBe(true);
  });

  test("paso 2: de 8 a 72 caracteres", () => {
    expect(isSignupStepValid(2, { ...base, password: "1234567" })).toBe(false);
    expect(isSignupStepValid(2, { ...base, password: "12345678" })).toBe(true);
    expect(isSignupStepValid(2, { ...base, password: "x".repeat(73) })).toBe(false);
  });

  test("paso 3: nombre de 1 a 100 sin contar los extremos", () => {
    expect(isSignupStepValid(3, { ...base, name: "  " })).toBe(false);
    expect(isSignupStepValid(3, { ...base, name: " Ana " })).toBe(true);
  });
});

describe("crear cuenta: errores del signup", () => {
  test("409 vuelve al paso 1 con AUTH_EMAIL_TAKEN en el campo", () => {
    expect(signupFailure(new ApiError(409, "AUTH_EMAIL_TAKEN"))).toEqual({ step: 1, emailKey: "errors:AUTH_EMAIL_TAKEN" });
  });

  test("VALIDATION con fields.email vuelve al paso 1; con fields.password, al 2", () => {
    const email = signupFailure(new ApiError(400, "VALIDATION", { fields: { email: "must be a valid email address" } }));
    expect(email.step).toBe(1);
    expect(email.emailKey).toBe("auth:validation.emailInvalid");
    expect(email.formError).toBeUndefined();

    const short = signupFailure(new ApiError(400, "VALIDATION", { fields: { password: "must be at least 8 characters" } }));
    expect(short).toMatchObject({ step: 2, passwordKey: "auth:validation.passwordTooShort" });
    const long = signupFailure(new ApiError(400, "VALIDATION", { fields: { password: "must be at most 72 characters" } }));
    expect(long.passwordKey).toBe("auth:validation.passwordTooLong");
  });

  test("lo demás de fields queda como error del formulario, sin el texto crudo de la API", () => {
    const failure = signupFailure(new ApiError(400, "VALIDATION", { fields: { email: "bad", name: "is required" } }));
    expect(failure.step).toBe(1);
    expect(failure.formError).toEqual({ code: "VALIDATION", fields: { name: "is required" } });
  });

  test("RATE_LIMIT y los demás errores van al formulario, en el paso 3", () => {
    const error = new ApiError(429, "RATE_LIMIT");
    expect(signupFailure(error)).toEqual({ formError: error });
  });
});
