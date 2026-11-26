// Google en las pantallas de acceso (§5.4). Lo puro.

/**
 * ¿Se atiende un token de Google? «Deshabilitado» del botón es solo
 * `pointer-events: none`: con el teclado se llega al botón de Google igual, así
 * que sin términos aceptados el token se ignora aquí (crear cuenta, paso 1).
 */
export function acceptGoogleToken(state: { disabled: boolean; busy: boolean }): boolean {
  return !state.disabled && !state.busy;
}
