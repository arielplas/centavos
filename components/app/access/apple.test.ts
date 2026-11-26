import { describe, expect, test } from "bun:test";
import {
  APPLE_PENDING_NAME_KEY,
  appleFullName,
  appleRedirectUri,
  appleScriptUrl,
  classifyAppleError,
  clearPendingAppleName,
  nameForAttempt,
  randomHex,
  sha256Hex,
} from "./apple";

function memoryStore() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("Apple: nonce", () => {
  test("el hash es SHA-256 en hex en minúsculas, como lo compara la API", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  test("el nonce crudo son 32 bytes en hex, distinto cada vez", () => {
    const a = randomHex();
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(randomHex()).not.toBe(a);
    expect(randomHex(16)).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe("Apple: nombre", () => {
  test("une nombre y apellido recortados; sin nada, no hay nombre", () => {
    expect(appleFullName({ name: { firstName: " Ana ", lastName: "López " } })).toBe("Ana López");
    expect(appleFullName({ name: { firstName: "Ana" } })).toBe("Ana");
    expect(appleFullName({ name: { firstName: "  ", lastName: "" } })).toBeUndefined();
    expect(appleFullName(undefined)).toBeUndefined();
  });

  test("el nombre que manda Apple se guarda antes de llamar a la API", () => {
    const store = memoryStore();
    expect(nameForAttempt("Ana López", store)).toBe("Ana López");
    expect(store.data.get(APPLE_PENDING_NAME_KEY)).toBe("Ana López");
  });

  test("si Apple ya no lo manda, se usa el que quedó de un intento fallido", () => {
    const store = memoryStore();
    nameForAttempt("Ana López", store);
    expect(nameForAttempt(undefined, store)).toBe("Ana López");
  });

  test("solo se borra al final: después del 2xx ya no se manda", () => {
    const store = memoryStore();
    nameForAttempt("Ana López", store);
    clearPendingAppleName(store);
    expect(nameForAttempt(undefined, store)).toBeUndefined();
  });

  test("sin almacenamiento, o si falla, el intento sigue", () => {
    expect(nameForAttempt("Ana", null)).toBe("Ana");
    expect(nameForAttempt(undefined, null)).toBeUndefined();
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(nameForAttempt("Ana", broken)).toBe("Ana");
    expect(nameForAttempt(undefined, broken)).toBeUndefined();
    expect(() => clearPendingAppleName(broken)).not.toThrow();
  });
});

describe("Apple: errores de Apple JS", () => {
  test("cancelar o cerrar la ventana no es un error", () => {
    expect(classifyAppleError({ error: "user_cancelled_authorize" })).toBe("cancel");
    expect(classifyAppleError({ error: "popup_closed_by_user" })).toBe("cancel");
    expect(classifyAppleError({ error: "user_trigger_new_signin_flow" })).toBe("cancel");
  });

  test("la ventana bloqueada tiene su propio mensaje", () => {
    expect(classifyAppleError({ error: "popup_blocked_by_browser" })).toBe("blocked");
  });

  test("todo lo demás es el mensaje genérico", () => {
    expect(classifyAppleError({ error: "invalid_client" })).toBe("other");
    expect(classifyAppleError(new Error("boom"))).toBe("other");
    expect(classifyAppleError(undefined)).toBe("other");
  });
});

describe("Apple: script y Return URL", () => {
  test("el script va en el idioma de la página", () => {
    expect(appleScriptUrl("es")).toContain("/es_MX/appleid.auth.js");
    expect(appleScriptUrl("en")).toContain("/en_US/appleid.auth.js");
  });

  test("la Return URL es la página sin query, o la configurada", () => {
    expect(appleRedirectUri({ origin: "https://centavos.mx", pathname: "/app/entrar" })).toBe("https://centavos.mx/app/entrar");
    expect(appleRedirectUri({ origin: "https://centavos.mx", pathname: "/app/crear-cuenta/" })).toBe("https://centavos.mx/app/crear-cuenta");
    expect(appleRedirectUri({ origin: "https://centavos.mx", pathname: "/app/entrar" }, "https://centavos.mx/app/entrar")).toBe(
      "https://centavos.mx/app/entrar",
    );
  });
});
