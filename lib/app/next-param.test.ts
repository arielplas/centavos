import { describe, expect, test } from "bun:test";
import { afterLoginHref, entrarHref, isAccessPath, nextFromSearch, safeNext } from "./next-param";

describe("safeNext (§4.3, A-11)", () => {
  test("acepta rutas de la app web, con su query", () => {
    expect(safeNext("/app/pulso")).toBe("/app/pulso");
    expect(safeNext("/app/presupuestos/abc-123")).toBe("/app/presupuestos/abc-123");
    expect(safeNext("/app/gastos?x=1&y=2")).toBe("/app/gastos?x=1&y=2");
    expect(safeNext("/app/conectar-claude")).toBe("/app/conectar-claude");
  });

  test("ignora lo que no es de la app", () => {
    expect(safeNext(null)).toBeNull();
    expect(safeNext(undefined)).toBeNull();
    expect(safeNext("")).toBeNull();
    expect(safeNext("/")).toBeNull();
    expect(safeNext("/canjear")).toBeNull();
    expect(safeNext("/application/x")).toBeNull();
    expect(safeNext("app/pulso")).toBeNull();
    expect(safeNext("pulso")).toBeNull();
  });

  test("ignora URLs con esquema o de otro sitio", () => {
    expect(safeNext("https://evil.example")).toBeNull();
    expect(safeNext("https://evil.example/app/pulso")).toBeNull();
    expect(safeNext("http://localhost/app/pulso")).toBeNull();
    expect(safeNext("javascript:alert(1)")).toBeNull();
    expect(safeNext("data:text/html,<script>")).toBeNull();
  });

  test("ignora `//` y `/\\` (rutas sin esquema)", () => {
    expect(safeNext("//evil.example")).toBeNull();
    expect(safeNext("//evil.example/app/pulso")).toBeNull();
    expect(safeNext("/\\evil.example")).toBeNull();
    expect(safeNext("/app/\\evil.example")).toBeNull();
    expect(safeNext("/app//evil.example")).toBe("/app//evil.example"); // sigue siendo una ruta de este sitio
  });

  test("normaliza antes de decidir: no se sale de /app/ con `..`", () => {
    expect(safeNext("/app/../x")).toBeNull();
    expect(safeNext("/app/../../etc/passwd")).toBeNull();
    expect(safeNext("/app/%2e%2e/x")).toBeNull();
    expect(safeNext("/app/%2E%2E/%2e%2e/x")).toBeNull();
    expect(safeNext("/app/./pulso")).toBe("/app/pulso");
    expect(safeNext("/app/gastos/../pulso")).toBe("/app/pulso");
  });

  test("ignora saltos de línea y otros caracteres de control", () => {
    expect(safeNext("/app/pulso\n//evil.example")).toBeNull();
    expect(safeNext("/app/pulso\r\nLocation: x")).toBeNull();
    expect(safeNext("/app/pulso\t")).toBeNull();
    expect(safeNext("/app/\u0000pulso")).toBeNull();
  });

  test("ignora rutas de acceso, con barra final, mayúsculas de query o anidadas", () => {
    expect(safeNext("/app/entrar")).toBeNull();
    expect(safeNext("/app/entrar/")).toBeNull();
    expect(safeNext("/app/entrar?next=/app/pulso")).toBeNull();
    expect(safeNext("/app/crear-cuenta")).toBeNull();
    expect(safeNext("/app/recuperar")).toBeNull();
    expect(safeNext("/app/gastos/../entrar")).toBeNull();
    expect(safeNext("/app/%65ntrar")).toBeNull(); // %65 = "e"
  });

  test("revisa también la ruta decodificada", () => {
    expect(safeNext("/app/%5cevil.example")).toBeNull();
    expect(safeNext("/app/%2e%2e%2fx")).toBeNull();
    expect(safeNext("/app/%00")).toBeNull();
    expect(safeNext("/app/%E0%A4%A")).toBeNull(); // UTF-8 mal formado
  });

  test("ignora /app/ a secas: redirige a la home", () => {
    expect(safeNext("/app/")).toBeNull();
    expect(safeNext("/app")).toBeNull();
    expect(safeNext("/app/./")).toBeNull();
  });

  test("ignora un valor demasiado largo", () => {
    expect(safeNext(`/app/pulso?x=${"a".repeat(3000)}`)).toBeNull();
  });

  test("devuelve la ruta normalizada, no el texto crudo", () => {
    expect(safeNext("/app/pulso#frag")).toBe("/app/pulso");
    expect(safeNext("/app/gastos ")).toBe("/app/gastos");
    expect(safeNext("/app/a b")).toBe("/app/a%20b");
  });
});

describe("nextFromSearch y afterLoginHref", () => {
  test("lee ?next= de location.search", () => {
    expect(nextFromSearch("?next=%2Fapp%2Fgastos")).toBe("/app/gastos");
    expect(nextFromSearch("next=%2Fapp%2Fgastos%3Fx%3D1")).toBe("/app/gastos?x=1");
    expect(nextFromSearch("?lang=en")).toBeNull();
    expect(nextFromSearch("")).toBeNull();
  });

  test("ignora el next malicioso de la query", () => {
    expect(nextFromSearch("?next=https%3A%2F%2Fevil.example")).toBeNull();
    expect(nextFromSearch("?next=%2F%2Fevil.example")).toBeNull();
    expect(nextFromSearch("?next=%2F%5Cevil.example")).toBeNull();
  });

  test("sin next válido, el Pulso", () => {
    expect(afterLoginHref("?next=%2F%2Fevil.example")).toBe("/app/pulso");
    expect(afterLoginHref("")).toBe("/app/pulso");
    expect(afterLoginHref("?next=%2Fapp%2Fperfil")).toBe("/app/perfil");
  });
});

describe("entrarHref", () => {
  test("lleva la ruta actual con su query", () => {
    expect(entrarHref("/app/gastos?x=1")).toBe("/app/entrar?next=%2Fapp%2Fgastos%3Fx%3D1");
  });

  test("si la ruta actual no sirve de next, va a /app/entrar a secas", () => {
    expect(entrarHref("/app/entrar")).toBe("/app/entrar");
    expect(entrarHref("/canjear")).toBe("/app/entrar");
    expect(entrarHref(null)).toBe("/app/entrar");
  });

  test("ida y vuelta", () => {
    const href = entrarHref("/app/presupuestos/abc?month=10&year=2026");
    expect(afterLoginHref(href.slice(href.indexOf("?")))).toBe("/app/presupuestos/abc?month=10&year=2026");
  });
});

describe("isAccessPath", () => {
  test("reconoce las rutas de acceso", () => {
    expect(isAccessPath("/app/entrar")).toBe(true);
    expect(isAccessPath("/app/crear-cuenta/")).toBe(true);
    expect(isAccessPath("/app/recuperar")).toBe(true);
    expect(isAccessPath("/app/pulso")).toBe(false);
  });
});
