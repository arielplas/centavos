import { describe, expect, test } from "bun:test";
import { langFromNavigator, pickLang, readLangCookie, serializeLangCookie } from "./lang";

describe("pickLang (§9.1)", () => {
  test("?lang= gana sobre todo", () => {
    expect(pickLang({ param: "en", cookie: "es", userLanguage: "es", navigatorLanguages: ["es-MX"] })).toBe("en");
    expect(pickLang({ param: "es", cookie: "en", userLanguage: "en", navigatorLanguages: ["en-US"] })).toBe("es");
  });

  test("sin param, gana la cookie", () => {
    expect(pickLang({ cookie: "en", userLanguage: "es", navigatorLanguages: ["es"] })).toBe("en");
  });

  test("sin param ni cookie, user.language", () => {
    expect(pickLang({ userLanguage: "en", navigatorLanguages: ["es-MX"] })).toBe("en");
  });

  test("sin lo anterior, el primer idioma del navegador que sea es o en", () => {
    expect(pickLang({ navigatorLanguages: ["fr-FR", "en-US", "es"] })).toBe("en");
    expect(pickLang({ navigatorLanguages: ["pt-BR", "es-MX", "en"] })).toBe("es");
  });

  test("sin nada, español", () => {
    expect(pickLang({})).toBe("es");
    expect(pickLang({ navigatorLanguages: [] })).toBe("es");
    expect(pickLang({ navigatorLanguages: ["fr", "de"] })).toBe("es");
  });

  test("un valor desconocido no cuenta como elección y pasa a la siguiente fuente", () => {
    expect(pickLang({ param: "klingon", cookie: "en" })).toBe("en");
    expect(pickLang({ param: "", cookie: "fr", userLanguage: "en" })).toBe("en");
    expect(pickLang({ param: null, cookie: null, userLanguage: "de", navigatorLanguages: ["en-GB"] })).toBe("en");
  });

  test("acepta variantes regionales y mayúsculas", () => {
    expect(pickLang({ param: "EN-us" })).toBe("en");
    expect(pickLang({ userLanguage: "es_MX" })).toBe("es");
  });
});

describe("langFromNavigator", () => {
  test("devuelve null si no hay es ni en", () => {
    expect(langFromNavigator(["fr"])).toBeNull();
    expect(langFromNavigator(undefined)).toBeNull();
  });
});

describe("cookie lang", () => {
  test("la lee de un document.cookie con más cookies", () => {
    expect(readLangCookie("a=1; lang=en; b=2")).toBe("en");
    expect(readLangCookie("lang=es")).toBe("es");
  });

  test("sin cookie, null; no confunde otra con el mismo final", () => {
    expect(readLangCookie("")).toBeNull();
    expect(readLangCookie("xlang=en; other=lang")).toBeNull();
  });

  test("la escribe como la landing: un año, SameSite=Lax, en toda la web", () => {
    const cookie = serializeLangCookie("en");
    expect(cookie).toContain("lang=en");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${60 * 60 * 24 * 365}`);
    expect(cookie).toContain("SameSite=Lax");
  });
});
