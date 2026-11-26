import { AppShell } from "@/components/app/shell/AppShell";

// Páginas privadas con la navegación de la app web (AppShell, §4.4). Una página
// privada sin navegación (bienvenida) se queda fuera de este grupo.
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
