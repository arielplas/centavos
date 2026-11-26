// Todo lo que hay aquí exige sesión (§4.3). NO pone el AppShell: así una página
// puede quedarse sin él (bienvenida). Las que lo llevan viven en (shell).
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
