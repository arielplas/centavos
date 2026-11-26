"use client";

// Idioma de la app web (docs/app-web.md §9.1): decide el idioma en el cliente,
// ajusta `<html lang>` y da `useT()` a las pantallas.
//
//   const t = useT();
//   t("auth:signIn.title");
//   t("subscriptions:activeCount", { count: 3 });      // plural
//   t("budgets:list.ofCap", { amount: "$4,000" });      // {{amount}}
//
//   const errorText = useErrorText();
//   errorText(apiError);                                 // por código, nunca error.message
//
//   const { lang, setLang } = useLang();                 // el selector de /app/perfil
//
// Las páginas son estáticas, así que el idioma no se conoce en el servidor. Para
// no tener un desajuste de hidratación, el texto se dibuja después de montar:
// antes de eso (`ready === false`) se muestra un esqueleto neutro y no se llama
// a ningún `t`.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { BootSkeleton } from "@/components/app/BootSkeleton";
import { errorText, type ErrorScreen } from "@/components/app/copy/errorText";
import { translate, type T } from "@/components/app/copy";
import { DEFAULT_LANG, HTML_LANG, LANG_PARAM, parseLang, type SiteLang } from "@/lib/lang";
import { pickLang, readLangCookie, serializeLangCookie } from "@/lib/app/lang";

type LangContextValue = {
  lang: SiteLang;
  /** El idioma ya se decidió en el cliente. Antes de eso, `lang` es el de reserva. */
  ready: boolean;
  /** Elige un idioma a mano: se recuerda en la cookie `lang` y gana sobre todo lo demás. */
  setLang: (lang: SiteLang) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

function rememberLang(lang: SiteLang) {
  try {
    document.cookie = serializeLangCookie(lang);
  } catch {
    // Sin cookies el idioma sigue valiendo en esta pestaña, solo no se recuerda.
  }
}

type Props = {
  /**
   * `language` del usuario (`GET /me`), la tercera fuente de §9.1. Se pasa
   * cuando hay sesión; sin ella, `undefined`.
   */
  userLanguage?: string | null;
  children: ReactNode;
  /** Lo que se ve antes de montar. Por defecto, un esqueleto sin texto. */
  fallback?: ReactNode;
};

export function LanguageProvider({ userLanguage, children, fallback }: Props) {
  // Lo que la persona eligió: `?lang=` o, si no, la cookie.
  const [chosen, setChosen] = useState<SiteLang | null>(null);
  const [navigatorLanguages, setNavigatorLanguages] = useState<readonly string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromUrl = parseLang(new URLSearchParams(window.location.search).get(LANG_PARAM));
    // `?lang=` gana siempre y se recuerda.
    if (fromUrl) rememberLang(fromUrl);
    setChosen(fromUrl ?? parseLang(readLangCookie(document.cookie)));
    setNavigatorLanguages(navigator.languages ?? []);
    setReady(true);
  }, []);

  const lang = pickLang({ param: chosen, userLanguage, navigatorLanguages });

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = HTML_LANG[lang];
    return () => {
      document.documentElement.lang = HTML_LANG[DEFAULT_LANG];
    };
  }, [ready, lang]);

  const setLang = useCallback((next: SiteLang) => {
    rememberLang(next);
    setChosen(next);
  }, []);

  const value = useMemo(() => ({ lang, ready, setLang }), [lang, ready, setLang]);

  return (
    <LangContext.Provider value={value}>
      {ready ? children : (fallback ?? <BootSkeleton />)}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang va dentro de <LanguageProvider>");
  return value;
}

/** Texto de la app web en el idioma activo. Estable mientras el idioma no cambie. */
export function useT(): T {
  const { lang } = useLang();
  return useCallback<T>((key, params) => translate(lang, key, params), [lang]);
}

/** Mensaje de un error de la API, en el idioma activo. */
export function useErrorText() {
  const { lang } = useLang();
  return useCallback(
    (error: Parameters<typeof errorText>[1], screen?: ErrorScreen) => errorText(lang, error, screen),
    [lang],
  );
}
