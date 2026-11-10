"use client";

import { useEffect } from "react";
import { DEFAULT_LANG, HTML_LANG, type SiteLang } from "@/lib/lang";

/**
 * Keeps `<html lang>` in sync with the language actually served on this page.
 *
 * Why it is done here and not in the root layout: the language comes from a
 * query param, and in the App Router only a *page* can read `searchParams` —
 * the root layout, which owns `<html>`, cannot. Reading a header there instead
 * would force every route (landing included) to render dynamically, which this
 * otherwise-static site should not pay for.
 *
 * So we render an inline script that runs while the document is still being
 * parsed (correct `lang` before first paint, and present in the server HTML),
 * and an effect that re-applies it after client-side navigation and restores
 * the default on unmount.
 */
export function HtmlLang({ lang }: { lang: SiteLang }) {
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
    return () => {
      document.documentElement.lang = HTML_LANG[DEFAULT_LANG];
    };
  }, [lang]);

  return (
    <script
      // Safe: the value is one of two hardcoded tags, never user input.
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(HTML_LANG[lang])}`,
      }}
    />
  );
}
