// Copia de la app web, es/en. Una pieza por área, para que quien construya una
// pantalla toque solo su módulo y las ramas no choquen.
//
//   Módulo (archivo)  →  namespace de las claves (el de los JSON de la app)
//   ─────────────────────────────────────────────────────────────────────────
//   common.ts         →  common:     acciones, fechas, pestañas
//   auth.ts           →  auth:       apple, google, fields, validation, signIn, profile
//   signUp.ts         →  auth:       signUp.*          (/app/crear-cuenta)
//   verify.ts         →  auth:       verify.*          (paso Verificar)
//   forgot.ts         →  auth:       forgot.*, resetCode.*, newPassword.*  (/app/recuperar)
//   onboarding.ts     →  onboarding: todo              (/app/bienvenida)
//   connectClaude.ts  →  settings:   connectClaude.*   (/app/conectar-claude)
//   pulso.ts          →  home:       el Pulso          (/app/pulso)
//   gastos.ts         →  expenses:   historial         (/app/gastos)
//   presupuestos.ts   →  budgets:    lista y detalle   (/app/presupuestos)
//   suscripciones.ts  →  subscriptions:                (/app/suscripciones)
//   perfil.ts         →  settings:   rows.signOut, language.*  (/app/perfil)
//   categories.ts     →  categories: las 14 etiquetas
//   errors.ts         →  errors:     un texto por código de la API
//   app.ts            →  app:        copia nueva solo de la web (§9.3)
//
// Varios módulos comparten namespace (auth, settings): se fusionan aquí. Las
// claves son las de la app, con su namespace: `t("auth:signIn.title")`. Los
// plurales (`activeCount_one` / `activeCount_other`) se piden sin sufijo y con
// `count`: `t("subscriptions:activeCount", { count: 3 })`.
//
// Para agregar una clave: en el módulo de tu pantalla, en `es` y en `en` en el
// mismo cambio. Para leerla: `useT()` de components/app/LanguageProvider.tsx.

import type { SiteLang } from "@/lib/lang";
import { appCopy } from "./app";
import { authCopy } from "./auth";
import { categoriesCopy } from "./categories";
import { commonCopy } from "./common";
import { connectClaudeCopy } from "./connectClaude";
import { errorsCopy } from "./errors";
import { forgotCopy } from "./forgot";
import { gastosCopy } from "./gastos";
import { onboardingCopy } from "./onboarding";
import { perfilCopy } from "./perfil";
import { presupuestosCopy } from "./presupuestos";
import { pulsoCopy } from "./pulso";
import { signUpCopy } from "./signUp";
import { suscripcionesCopy } from "./suscripciones";
import { verifyCopy } from "./verify";
import type { CopyParams, KeysOf } from "./types";

export type { CopyParams } from "./types";

const MODULES = [
  commonCopy,
  authCopy,
  signUpCopy,
  verifyCopy,
  forgotCopy,
  onboardingCopy,
  connectClaudeCopy,
  pulsoCopy,
  gastosCopy,
  presupuestosCopy,
  suscripcionesCopy,
  perfilCopy,
  categoriesCopy,
  errorsCopy,
  appCopy,
] as const;

/** Árbol completo en español (la fuente de verdad del tipo). */
export type Messages = typeof commonCopy.es &
  typeof authCopy.es &
  typeof signUpCopy.es &
  typeof verifyCopy.es &
  typeof forgotCopy.es &
  typeof onboardingCopy.es &
  typeof connectClaudeCopy.es &
  typeof pulsoCopy.es &
  typeof gastosCopy.es &
  typeof presupuestosCopy.es &
  typeof suscripcionesCopy.es &
  typeof perfilCopy.es &
  typeof categoriesCopy.es &
  typeof errorsCopy.es &
  typeof appCopy.es;

/** Toda clave válida: `namespace:ruta`, sin sufijo de plural. */
export type CopyKey = KeysOf<Messages>;

type Tree = { [key: string]: string | Tree };

function mergeInto(target: Tree, source: Tree): Tree {
  for (const [key, value] of Object.entries(source)) {
    const current = target[key];
    if (typeof value === "string") {
      if (current !== undefined) throw new Error(`Clave de copia repetida: ${key}`);
      target[key] = value;
    } else {
      const child = typeof current === "object" ? current : {};
      target[key] = mergeInto(child, value);
    }
  }
  return target;
}

function build(lang: SiteLang): Tree {
  const tree: Tree = {};
  for (const mod of MODULES) mergeInto(tree, mod[lang] as Tree);
  return tree;
}

export const COPY: Record<SiteLang, Tree> = { es: build("es"), en: build("en") };

function lookup(tree: Tree, path: string): string | undefined {
  let node: string | Tree | undefined = tree;
  for (const part of path.split(".")) {
    if (typeof node !== "object") return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}

function raw(lang: SiteLang, key: string, count?: number): string | undefined {
  const sep = key.indexOf(":");
  if (sep < 0) return undefined;
  const ns = key.slice(0, sep);
  const path = key.slice(sep + 1);
  const tree = COPY[lang][ns];
  if (typeof tree !== "object") return undefined;
  if (count !== undefined) {
    // `Intl.PluralRules` puede dar `many` (es, 1 000 000) o `zero`: si la app no
    // tiene esa forma, `other` es la de reserva, como en i18next.
    const category = new Intl.PluralRules(lang).select(count);
    const plural = lookup(tree, `${path}_${category}`) ?? lookup(tree, `${path}_other`);
    if (plural !== undefined) return plural;
  }
  return lookup(tree, path);
}

/** ¿Existe esta clave (en cualquier forma de plural)? Para claves que llegan como texto. */
export function hasCopy(lang: SiteLang, key: string): boolean {
  return raw(lang, key, 1) !== undefined || raw(lang, key) !== undefined;
}

/** Reemplaza `{{nombre}}`; un nombre sin valor se deja a la vista, para notarlo. */
export function interpolate(text: string, params?: CopyParams): string {
  if (!params) return text;
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  );
}

/**
 * Texto de una clave en `lang`. `count` elige el plural y también sirve como
 * `{{count}}`. Una clave que no existe devuelve la propia clave.
 */
export function translate(lang: SiteLang, key: CopyKey, params?: CopyParams): string {
  const count = typeof params?.count === "number" ? params.count : undefined;
  const text = raw(lang, key, count);
  return text === undefined ? key : interpolate(text, params);
}

export type T = (key: CopyKey, params?: CopyParams) => string;
