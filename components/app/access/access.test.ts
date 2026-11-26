import { describe, expect, test } from "bun:test";
import { ApiError } from "@/lib/app/api";
import { accessHref } from "./links";
import { hasErrors, isValidEmail, isValidName, loginErrors, newPasswordError } from "./validation";
import { loginFailure } from "./failures";

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
