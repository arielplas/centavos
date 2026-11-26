import { AccessGuard } from "@/components/app/SessionGuard";

// Rutas para quien aún no tiene sesión: entrar, crear-cuenta, recuperar (§4.3).
// Con sesión, la guardia manda al `next` válido o al Pulso.
export default function AccessLayout({ children }: { children: React.ReactNode }) {
  return <AccessGuard>{children}</AccessGuard>;
}
