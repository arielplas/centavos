import { describe, expect, test } from "bun:test";
import { COPY, hasCopy, interpolate, translate } from "./index";
import { errorText, fieldErrorText } from "./errorText";

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[path] = value;
    else Object.assign(out, leaves(value, path));
  }
  return out;
}

const placeholders = (text: string) => [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort();

describe("la copia", () => {
  const es = leaves(COPY.es);
  const en = leaves(COPY.en);

  test("es y en tienen exactamente las mismas claves", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  test("cada clave usa los mismos {{valores}} en los dos idiomas", () => {
    for (const key of Object.keys(es)) {
      expect({ key, vars: placeholders(en[key]) }).toEqual({ key, vars: placeholders(es[key]) });
    }
  });

  test("ninguna cadena está vacía", () => {
    for (const [key, value] of [...Object.entries(es), ...Object.entries(en)]) {
      expect({ key, empty: value.trim() === "" }).toEqual({ key, empty: false });
    }
  });
});

describe("translate", () => {
  test("lee la clave en cada idioma", () => {
    expect(translate("es", "auth:signIn.title")).toBe("Hola de nuevo");
    expect(translate("en", "auth:signIn.title")).toBe("Welcome back");
    expect(translate("es", "settings:rows.signOut")).toBe("Cerrar sesión");
    expect(translate("en", "settings:rows.signOut")).toBe("Log out");
  });

  test("fusiona los módulos que comparten namespace", () => {
    expect(hasCopy("es", "auth:signIn.submit")).toBe(true);
    expect(hasCopy("es", "auth:signUp.next")).toBe(true);
    expect(hasCopy("es", "auth:verify.title")).toBe(true);
    expect(hasCopy("es", "auth:forgot.title")).toBe(true);
    expect(hasCopy("es", "settings:connectClaude.intro")).toBe(true);
    expect(hasCopy("es", "settings:rows.signOut")).toBe(true);
  });

  test("interpola {{valores}}", () => {
    expect(translate("es", "settings:connectClaude.expiresIn", { n: 7 })).toBe("Vence en 7 min");
    expect(translate("en", "settings:connectClaude.expiresIn", { n: 7 })).toBe("Expires in 7 min");
    expect(translate("es", "app:settlementLine", { from: "Ana", to: "Luis" })).toBe("Ana le pagó a Luis");
  });

  test("un valor que falta se deja a la vista", () => {
    expect(interpolate("Hola {{name}}", {})).toBe("Hola {{name}}");
    expect(interpolate("Hola {{name}}")).toBe("Hola {{name}}");
  });

  test("elige el plural con count", () => {
    expect(translate("es", "subscriptions:activeCount", { count: 1 })).toContain("1");
    expect(translate("es", "subscriptions:activeCount", { count: 1 })).not.toBe(
      translate("es", "subscriptions:activeCount", { count: 3 }),
    );
    expect(translate("en", "subscriptions:activeCount", { count: 3 })).toContain("3");
  });

  test("si el idioma da una categoría que la app no tiene, cae en other", () => {
    // Intl.PluralRules("es") da "many" para 1 000 000, y la app solo tiene one/other.
    expect(new Intl.PluralRules("es").select(1_000_000)).toBe("many");
    expect(translate("es", "subscriptions:activeCount", { count: 1_000_000 })).toBe(
      translate("es", "subscriptions:activeCount", { count: 5 }).replace("5", "1000000"),
    );
    // Y 0 (other en los dos idiomas).
    expect(translate("en", "subscriptions:activeCount", { count: 0 })).toContain("0");
  });

  test("una clave que no existe devuelve la propia clave", () => {
    // @ts-expect-error la clave no existe: el tipo la rechaza
    expect(translate("es", "auth:no.existe")).toBe("auth:no.existe");
  });
});

describe("errorText (§10)", () => {
  test("texto por código, en el idioma activo", () => {
    expect(errorText("es", { code: "AUTH_INVALID_CREDENTIALS" })).toBe(translate("es", "errors:AUTH_INVALID_CREDENTIALS"));
    expect(errorText("en", { code: "AUTH_INVALID_CREDENTIALS" })).toBe(translate("en", "errors:AUTH_INVALID_CREDENTIALS"));
  });

  test("el bloqueo de código no es un RATE_LIMIT", () => {
    const limit = errorText("es", { code: "RATE_LIMIT" });
    expect(errorText("es", { code: "AUTH_CODE_LOCKED" })).not.toBe(limit);
    expect(errorText("es", { code: "AUTH_RESET_CODE_LOCKED" })).not.toBe(limit);
  });

  test("RATE_LIMIT en el reenvío dice 60 segundos", () => {
    expect(errorText("es", { code: "RATE_LIMIT" }, "resend-code")).toBe(translate("es", "errors:RATE_LIMIT_RESEND"));
    expect(errorText("es", { code: "RATE_LIMIT" }, "resend-code")).not.toBe(errorText("es", { code: "RATE_LIMIT" }));
  });

  test("sin respuesta: app.network; desconocido: genericError", () => {
    expect(errorText("es", { code: "NETWORK" })).toBe(translate("es", "app:network"));
    expect(errorText("es", { code: "UNKNOWN" })).toBe(translate("es", "common:genericError"));
    expect(errorText("es", { code: "MCP_DISABLED" })).toBe(translate("es", "common:genericError"));
    expect(errorText("es", undefined)).toBe(translate("es", "common:genericError"));
  });

  test("VALIDATION traduce las reglas de fields, nunca el texto crudo", () => {
    const text = errorText("es", { code: "VALIDATION", fields: { password: "password must be at least 8 characters" } });
    expect(text).toBe("Mínimo 8 caracteres.");
    expect(text).not.toContain("password must");
    expect(errorText("en", { code: "VALIDATION", fields: { email: "email must be a valid email address" } })).toBe(
      "Enter a valid email address.",
    );
    expect(errorText("es", { code: "VALIDATION" })).toBe(translate("es", "errors:VALIDATION"));
  });

  test("regla desconocida: mensaje genérico del campo", () => {
    expect(fieldErrorText("es", "algo raro")).toBe("Revisa este campo.");
    expect(fieldErrorText("en", "algo raro")).toBe("Check this field.");
  });
});
