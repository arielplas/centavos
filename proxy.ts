import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  LANG_PARAM,
  langFromAcceptLanguage,
  parseLang,
  type SiteLang,
} from "@/lib/lang";

// Language of the landing.
//
// The landing is prerendered twice — `/` in Spanish and `/en` in English — and
// this decides which one a visitor gets, without making either page dynamic.
// The public URLs stay `/` and `/?lang=en`, like the legal pages.
//
//   1. `?lang=` is explicit and always wins. It is also remembered in a
//      cookie, so a choice made with the switcher survives later visits to `/`.
//   2. Otherwise: the remembered choice, then the device language
//      (`Accept-Language`), then Spanish.
//
// Crawlers send no `Accept-Language`, so they keep getting Spanish at `/`.

/** Internal route that holds the English landing. */
const EN_ROUTE = "/en";

const ONE_YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // `/en` is an implementation detail: send direct visits to the public URL.
  if (pathname === EN_ROUTE) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set(LANG_PARAM, "en");
    return NextResponse.redirect(url, 308);
  }

  if (pathname !== "/") return NextResponse.next();

  const explicit = parseLang(searchParams.get(LANG_PARAM));
  if (explicit) {
    const response = serve(request, explicit);
    response.cookies.set(LANG_COOKIE, explicit, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
    return response;
  }

  // An unrecognised `?lang=klingon` is not a choice: serve the default as-is.
  if (searchParams.has(LANG_PARAM)) return NextResponse.next();

  const detected =
    parseLang(request.cookies.get(LANG_COOKIE)?.value) ??
    langFromAcceptLanguage(request.headers.get("accept-language"));

  if (detected === DEFAULT_LANG) return NextResponse.next();

  // Temporary on purpose: the answer depends on the visitor, not on the URL.
  const url = request.nextUrl.clone();
  url.searchParams.set(LANG_PARAM, detected);
  const response = NextResponse.redirect(url, 307);
  response.headers.set("Vary", "Accept-Language, Cookie");
  return response;
}

/** Response that renders the landing in `lang` at the current URL. */
function serve(request: NextRequest, lang: SiteLang) {
  if (lang === DEFAULT_LANG) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = EN_ROUTE;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/en"],
};
