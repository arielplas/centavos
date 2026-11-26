import { describe, expect, test } from "bun:test";
import { codeView, failureOf, formatLongDate } from "./linkCode";

const T0 = Date.parse("2026-11-26T12:00:00Z");
const link = (msFromNow: number) => ({ code: "ABCD-1234", expiresAt: new Date(T0 + msFromNow).toISOString() });

describe("codeView", () => {
  test("sin código no hay vista", () => {
    expect(codeView(null, T0)).toBeNull();
  });
  test("redondea los minutos hacia arriba", () => {
    expect(codeView(link(10 * 60_000), T0)).toEqual({ code: "ABCD-1234", minutesLeft: 10 });
    expect(codeView(link(9 * 60_000 + 1), T0)?.minutesLeft).toBe(10);
    expect(codeView(link(61_000), T0)?.minutesLeft).toBe(2);
  });
  test("nunca baja de 1 minuto mientras sea válido", () => {
    expect(codeView(link(1), T0)?.minutesLeft).toBe(1);
    expect(codeView(link(15_000), T0)?.minutesLeft).toBe(1);
  });
  test("al vencer, el código desaparece", () => {
    expect(codeView(link(0), T0)).toBeNull();
    expect(codeView(link(-5_000), T0)).toBeNull();
  });
  test("una fecha ilegible cuenta como vencida", () => {
    expect(codeView({ code: "X", expiresAt: "no es fecha" }, T0)).toBeNull();
  });
});

describe("failureOf", () => {
  test("CONNECTOR_NOT_AVAILABLE tiene texto propio", () => {
    expect(failureOf({ code: "CONNECTOR_NOT_AVAILABLE", message: "x" })).toBe("notAvailable");
  });
  test("el resto, incluido RATE_LIMIT y los errores sin código, es «falló»", () => {
    expect(failureOf({ code: "RATE_LIMIT" })).toBe("failed");
    expect(failureOf({ code: "NETWORK" })).toBe("failed");
    expect(failureOf(new Error("boom"))).toBe("failed");
    expect(failureOf(null)).toBe("failed");
    expect(failureOf("texto")).toBe("failed");
  });
});

describe("formatLongDate", () => {
  test("en el idioma de la persona", () => {
    const iso = "2026-03-05T18:00:00Z";
    expect(formatLongDate(iso, "es")).toContain("marzo");
    expect(formatLongDate(iso, "en")).toContain("March");
  });
  test("una fecha ilegible no rompe la pantalla", () => {
    expect(formatLongDate("nope", "es")).toBe("");
  });
});
