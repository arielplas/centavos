import { describe, expect, test } from "bun:test";
import { acceptGoogleToken } from "./google";

describe("Google", () => {
  test("sin términos aceptados el token se ignora aunque se llegue al botón con el teclado", () => {
    expect(acceptGoogleToken({ disabled: true, busy: false })).toBe(false);
    expect(acceptGoogleToken({ disabled: false, busy: false })).toBe(true);
  });

  test("un segundo token mientras se habla con la API se ignora", () => {
    expect(acceptGoogleToken({ disabled: false, busy: true })).toBe(false);
  });
});
