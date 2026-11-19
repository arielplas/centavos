# vendor/

Tarballs **interinos** de los paquetes del sistema de diseño de Centavos, hasta que exista el registry de GitHub Packages (scope `@cntvos`, ver ADR 0001 en centavos-design). Se guardan aquí para que el CI (Vercel) instale sin credenciales.

| Archivo | Paquete |
|---|---|
| `cntvos-tokens-0.1.0.tgz` | `@cntvos/tokens` (paleta, fuentes, escala, CSS de Tailwind v4) |
| `cntvos-icons-0.1.0.tgz` | `@cntvos/icons` (glifos, contrato de trazo, mapeo de beneficios) |

**No se editan a mano.** Para actualizarlos:

1. En el repo `centavos-design`, dentro de `packages/<paquete>`: `bun run build` y luego `bun pm pack` (genera el `.tgz`).
2. Copia el `.tgz` nuevo a esta carpeta y borra el anterior si cambió la versión.
3. Ajusta la ruta `file:./vendor/...` en `package.json` si cambió el nombre del archivo.
4. `bun install` y revisa que `bun run build` siga pasando. Si la versión no cambió, bun reutiliza el tarball viejo (la integridad queda en `bun.lock`): usa `bun remove @cntvos/<paquete>` y luego `bun add @cntvos/<paquete>@file:./vendor/<archivo>.tgz`. Mejor aún, sube la versión del paquete en cada cambio.
