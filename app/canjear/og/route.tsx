import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { CANJEAR_COPY } from "@/components/canjear/copy";
import { LANG_PARAM, resolveLang } from "@/lib/lang";
import { fetchPromoPreview, normalizeCode } from "@/lib/promo-preview";

// The social image for a shared promo link (`/canjear?code=PDM`): the offer as
// the same coupon the page draws, so the link preview in a chat already says
// what the code gives.
//
// The days come from the API, never from the URL: anyone can write a query
// string, and this image carries the Centavos name. A code that does not exist
// or cannot be redeemed gets the site's generic image instead.

const SIZE = { width: 1200, height: 630 };

// The brand's own typefaces, as on the site: Bricolage Grotesque for display,
// Manrope for text, Caveat for the handwritten note.
//
// The renderer reads TTF/OTF/WOFF but not the WOFF2 the site ships in
// app/fonts, so ./fonts holds the same three files converted to TTF (same
// glyphs, nothing subset further). Replace both copies together if the brand
// fonts ever change. Read once per server process and kept.
const FONT_DIR = join(process.cwd(), "app/canjear/og/fonts");
const FONTS = [
  { name: "Bricolage", file: "Bricolage-800.ttf", weight: 800 },
  { name: "Manrope", file: "Manrope-600.ttf", weight: 600 },
  { name: "Caveat", file: "Caveat-500.ttf", weight: 500 },
] as const;
let fontsPromise: Promise<{ name: string; data: Buffer; weight: 500 | 600 | 800; style: "normal" }[]> | null = null;
// If the files cannot be read (a host that did not ship them), the image still
// renders in the renderer's built-in face rather than failing the preview.
const loadFonts = () =>
  (fontsPromise ??= Promise.all(
    FONTS.map(async (f) => ({ name: f.name, data: await readFile(join(FONT_DIR, f.file)), weight: f.weight, style: "normal" as const })),
  )).catch(() => {
    fontsPromise = null;
    return undefined;
  });

const DISPLAY = { fontFamily: "Bricolage", fontWeight: 800 } as const;
const HAND = { fontFamily: "Caveat", fontWeight: 500 } as const;

// Satori (the renderer behind ImageResponse) lays out with flexbox only and
// rejects a <div> with several children unless it says `display: flex`, so
// every box below declares it.

// Brand tokens (app/globals.css). Satori takes literal colours, not CSS variables.
const C = {
  bg: "#faf3e3", ink: "#2a1a10", inkSoft: "#6e5849", mandarina: "#ed7e3c",
  mandarinaDeep: "#a84a22", yolk: "#f5b833", peach: "#f7d1bb",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lang = resolveLang(searchParams.get(LANG_PARAM) ?? undefined);
  const t = CANJEAR_COPY[lang];
  const preview = await fetchPromoPreview(normalizeCode(searchParams.get("code")));
  if (!preview) return NextResponse.redirect(new URL("/opengraph-image.png", request.url), 302);

  const { code, grantDays: days } = preview;
  // A long code must still fit the stub.
  const codeSize = code.length > 14 ? 40 : code.length > 9 ? 54 : 68;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: C.bg, color: C.ink, position: "relative", fontFamily: "Manrope", fontWeight: 600 }}>
        {/* Soft colour washes, as on the page. */}
        <div style={{ display: "flex", position: "absolute", top: -160, right: -120, width: 520, height: 520, borderRadius: 260, backgroundColor: C.yolk, opacity: 0.28 }} />
        <div style={{ display: "flex", position: "absolute", bottom: -200, left: -140, width: 460, height: 460, borderRadius: 230, backgroundColor: C.peach, opacity: 0.6 }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 64px 72px", width: 680 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 26, backgroundColor: C.mandarina }}>
              <div style={{ display: "flex", width: 22, height: 6, borderRadius: 3, backgroundColor: C.ink, transform: "rotate(-8deg)" }} />
            </div>
            <div style={{ display: "flex", marginLeft: 16, fontSize: 46, letterSpacing: -2, ...DISPLAY }}>centavos</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: C.mandarinaDeep, textTransform: "uppercase" }}>{t.eyebrow}</div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 72, lineHeight: 1.02, letterSpacing: -3, ...DISPLAY }}>{t.offerBody(days)}</div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 28, lineHeight: 1.35, color: C.inkSoft }}>{t.offerLead}</div>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", position: "relative", paddingTop: 56 }}>
          <div style={{ display: "flex", position: "absolute", top: 22, right: 96, fontSize: 50, color: C.mandarinaDeep, transform: "rotate(6deg)", ...HAND }}>{t.giftNote}</div>
          <div style={{ display: "flex", flexDirection: "column", width: 420, borderRadius: 40, backgroundColor: C.ink, color: C.bg, transform: "rotate(-4deg)", overflow: "hidden", position: "relative", boxShadow: "0 40px 60px -30px rgba(42,26,16,0.6)" }}>
            <div style={{ display: "flex", position: "absolute", top: -70, right: -70, width: 230, height: 230, borderRadius: 115, backgroundColor: C.mandarina, opacity: 0.4 }} />
            <div style={{ display: "flex", flexDirection: "column", padding: "34px 44px 24px" }}>
              <div style={{ display: "flex", fontSize: 20, letterSpacing: 5, opacity: 0.7 }}>CENTAVOS+</div>
              <div style={{ display: "flex", alignItems: "flex-end", marginTop: 14 }}>
                <div style={{ display: "flex", fontSize: 176, lineHeight: 0.82, letterSpacing: -9, color: C.yolk, ...DISPLAY }}>{days}</div>
                <div style={{ display: "flex", flexDirection: "column", marginLeft: 18, marginBottom: 8, fontSize: 42, lineHeight: 1.02, letterSpacing: -1, ...DISPLAY }}>
                  <div>{t.ticketUnit(days)}</div>
                  <div>{t.ticketRest}</div>
                </div>
              </div>
            </div>
            {/* Tear line: the page colour bites a notch out of each edge. */}
            <div style={{ display: "flex", alignItems: "center", height: 36, position: "relative" }}>
              <div style={{ display: "flex", position: "absolute", left: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg }} />
              <div style={{ display: "flex", position: "absolute", right: -18, width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg }} />
              <div style={{ display: "flex", marginLeft: 40, marginRight: 40, flex: 1, borderTop: "3px dashed rgba(250,243,227,0.3)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "18px 44px 34px" }}>
              <div style={{ display: "flex", fontSize: 20, letterSpacing: 5, opacity: 0.7, textTransform: "uppercase" }}>{t.ticketCodeLabel}</div>
              <div style={{ display: "flex", marginTop: 6, fontSize: codeSize, letterSpacing: 7, ...DISPLAY }}>{code}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: await loadFonts(),
      // Crawlers and chat apps cache previews themselves; five minutes here
      // matches the lookup and lets a deactivated code stop advertising itself.
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    },
  );
}
