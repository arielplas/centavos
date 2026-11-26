"use client";

// Proveedor de la sesión (docs/app-web.md §6.1). Solo muestra a React lo que
// maneja `SessionManager` (lib/app/session.ts); el access token no pasa por aquí.
//
//   const { status, user, signIn, signOut } = useSession();
//
//   status          "restoring" | "authenticated" | "anonymous"
//   user            lo de /auth/* completado con GET /me (o null)
//   signIn(res)     abre la sesión con la respuesta de login / verify / google / apple / reset-password
//   signOut()       cierra la sesión (revoca, espera hasta 3 s, borra lo local)
//   updateUser(p)   cambia campos del usuario en memoria (por ejemplo onboarded: true)
//   endedReason     por qué terminó la sesión sin que la persona la cerrara; mostrarlo y `clearEndedReason()`
//   setPrefillEmail(email) / takePrefillEmail()   un correo entre pantallas de acceso, solo en memoria

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { INITIAL_SNAPSHOT, getSessionManager, type SessionManager, type SessionSnapshot } from "@/lib/app/session";

type SessionContextValue = SessionSnapshot &
  Pick<
    SessionManager,
    | "signIn"
    | "signOut"
    | "refreshUser"
    | "updateUser"
    | "clearEndedReason"
    | "setPrefillEmail"
    | "takePrefillEmail"
    | "onSessionCleared"
  >;

const SessionContext = createContext<SessionContextValue | null>(null);

const getServerSnapshot = () => INITIAL_SNAPSHOT;

export function SessionProvider({ children, manager: provided }: { children: ReactNode; manager?: SessionManager }) {
  const [manager] = useState(() => provided ?? getSessionManager());
  const snapshot = useSyncExternalStore(manager.subscribe, manager.getSnapshot, getServerSnapshot);

  // `start` es idempotente: StrictMode monta dos veces y se restaura una sola.
  useEffect(() => {
    void manager.start();
  }, [manager]);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...snapshot,
      signIn: manager.signIn,
      signOut: manager.signOut,
      refreshUser: manager.refreshUser,
      updateUser: manager.updateUser,
      clearEndedReason: manager.clearEndedReason,
      setPrefillEmail: manager.setPrefillEmail,
      takePrefillEmail: manager.takePrefillEmail,
      onSessionCleared: manager.onSessionCleared,
    }),
    [snapshot, manager],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession va dentro de <SessionProvider>");
  return value;
}
