// Tipos de la copia de la app web. El español de cada módulo es la fuente de
// verdad; el inglés se declara como `Mirror<typeof es>`, así que una clave que
// falte (o sobre) en inglés rompe el typecheck.

/** Misma forma que `T` con todas las hojas como `string`. */
export type Mirror<T> = T extends string ? string : { [K in keyof T]: Mirror<T[K]> };

/** Sufijos de plural que usa la app (i18next): `activeCount_one`, `activeCount_other`. */
type PluralSuffix = "zero" | "one" | "two" | "few" | "many" | "other";

/** La clave pública de una hoja: sin el sufijo de plural. */
type PublicKey<K extends string> = K extends `${infer Base}_${PluralSuffix}` ? Base : K;

type Leaves<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? PublicKey<`${Prefix}${K}`> : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Todas las claves de un árbol, como `namespace:ruta.con.puntos`. */
export type KeysOf<T> = {
  [N in keyof T & string]: `${N}:${Leaves<T[N]>}`;
}[keyof T & string];

/** Valores para `{{nombre}}`. Con `count`, además se elige el plural. */
export type CopyParams = Record<string, string | number>;
