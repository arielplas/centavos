import { describe, expect, test } from "bun:test";
import { COPY } from "@/components/app/copy";
import { TABS, activeTab, isUnder } from "./nav";

describe("pestañas del shell", () => {
  test("son cuatro, en el orden de la app", () => {
    expect(TABS.map((t) => t.id)).toEqual(["pulso", "gastos", "presupuestos", "suscripciones"]);
  });
  test("cada nombre existe en es y en en", () => {
    for (const tab of TABS) {
      const [ns, path] = tab.label.split(":");
      const get = (lang: "es" | "en") =>
        path.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], COPY[lang][ns]);
      expect(typeof get("es")).toBe("string");
      expect(typeof get("en")).toBe("string");
    }
  });
  test("la ruta y las de abajo activan su pestaña", () => {
    expect(activeTab("/app/pulso")).toBe("pulso");
    expect(activeTab("/app/gastos")).toBe("gastos");
    expect(activeTab("/app/presupuestos")).toBe("presupuestos");
    expect(activeTab("/app/presupuestos/3f2a")).toBe("presupuestos");
    expect(activeTab("/app/suscripciones/")).toBe("suscripciones");
  });
  test("lo demás no activa ninguna, ni un prefijo a medias", () => {
    expect(activeTab("/app/perfil")).toBeNull();
    expect(activeTab("/app/conectar-claude")).toBeNull();
    expect(activeTab("/app/presupuestos-viejos")).toBeNull();
    expect(activeTab(null)).toBeNull();
  });
  test("isUnder tolera la barra final", () => {
    expect(isUnder("/app/perfil/", "/app/perfil")).toBe(true);
    expect(isUnder("/app/perfilx", "/app/perfil")).toBe(false);
  });
});
