import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { CLAUDE_COPY } from "@/components/claude/copy";
import { LANG_PARAM, resolveLang } from "@/lib/lang";

// The social image for /app/claude (og:image and twitter:image): the page's own hero, "Tus gastos,
// en una conversación.", beside the example chat in which Claude logs an expense through Centavos.
// Both come from the page copy, so the link preview says what the page says, in its language
// (`?lang=en`). Nothing here depends on the request but the language.

const SIZE = { width: 1200, height: 630 };

// The brand's typefaces, as TTF (the renderer can't read the WOFF2 in app/fonts). Same files the
// /canjear image uses; next.config.ts ships them with this route too.
const FONT_DIR = join(process.cwd(), "app/canjear/og/fonts");
const FONTS = [
  { name: "Bricolage", file: "Bricolage-800.ttf", weight: 800 },
  { name: "Manrope", file: "Manrope-600.ttf", weight: 600 },
] as const;
let fontsPromise: Promise<{ name: string; data: Buffer; weight: 600 | 800; style: "normal" }[]> | null = null;
// If the files can't be read, the image still renders in the renderer's built-in face.
const loadFonts = () =>
  (fontsPromise ??= Promise.all(
    FONTS.map(async (f) => ({ name: f.name, data: await readFile(join(FONT_DIR, f.file)), weight: f.weight, style: "normal" as const })),
  )).catch(() => {
    fontsPromise = null;
    return undefined;
  });

const DISPLAY = { fontFamily: "Bricolage", fontWeight: 800 } as const;

// Brand tokens (app/globals.css). The renderer takes literal colours, not CSS variables.
const C = {
  bg: "#faf3e3", surface: "#ffffff", ink: "#2a1a10", inkSoft: "#6e5849", rule: "#ead9c2",
  mandarina: "#ed7e3c", mandarinaDeep: "#a84a22", yolk: "#f5b833", peach: "#f7d1bb", sky: "#cfe1e8",
  greenSoft: "#d8ecdf", green: "#3f8a5a",
};

// "Listo, anoté **$185** en Comida…" → one span per word, so lines can break between words and
// the **marked** amounts can stand out. The renderer lays out with flexbox only and wraps at
// element boundaries, so a word per element is what lets the sentence wrap.
function words(text: string): { word: string; strong: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .flatMap((part) => {
      const strong = part.startsWith("**");
      return part
        .replace(/\*\*/g, "")
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({ word, strong }));
    });
}

export async function GET(request: NextRequest) {
  const lang = resolveLang(request.nextUrl.searchParams.get(LANG_PARAM) ?? undefined);
  const { hero, chat } = CLAUDE_COPY[lang];
  // The badge is "Nuevo · Conector para Claude": the preview keeps only the lasting half.
  const eyebrow = hero.badge.split("·").pop()!.trim();
  const lead = hero.titleLead.split(/\s+/).filter(Boolean);
  const accent = hero.titleAccent.split(/\s+/).filter(Boolean);
  // "Your spending," is wider than "Tus gastos,": a step smaller keeps it on one line.
  const titleSize = hero.titleLead.trim().length > 12 ? 68 : 76;

  return new ImageResponse(
    (
      // Satori rejects a <div> with several children unless it says `display: flex`, so every
      // box below declares it.
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: C.bg, color: C.ink, position: "relative", fontFamily: "Manrope", fontWeight: 600 }}>
        {/* Soft colour washes, as on the page. */}
        <div style={{ display: "flex", position: "absolute", top: -170, right: -110, width: 520, height: 520, borderRadius: 260, backgroundColor: C.mandarina, opacity: 0.14 }} />
        <div style={{ display: "flex", position: "absolute", top: 120, left: -180, width: 460, height: 460, borderRadius: 230, backgroundColor: C.sky, opacity: 0.55 }} />
        <div style={{ display: "flex", position: "absolute", bottom: -220, right: 220, width: 480, height: 480, borderRadius: 240, backgroundColor: C.peach, opacity: 0.55 }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 0 56px 72px", width: 600 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, borderRadius: 25, backgroundColor: C.mandarina }}>
              <div style={{ display: "flex", width: 21, height: 5, borderRadius: 3, backgroundColor: C.ink, transform: "rotate(-12deg)" }} />
            </div>
            <div style={{ display: "flex", marginLeft: 14, fontSize: 44, letterSpacing: -2, ...DISPLAY }}>centavos</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: C.mandarinaDeep, textTransform: "uppercase" }}>{eyebrow}</div>
            <div style={{ display: "flex", flexWrap: "wrap", marginTop: 14, fontSize: titleSize, lineHeight: 1.0, letterSpacing: -3.5, ...DISPLAY }}>
              {lead.map((w, i) => (
                <span key={`l${i}`} style={{ marginRight: 18, marginTop: 6 }}>
                  {w}
                </span>
              ))}
              {/* The page's marker: yellow under the lower half of the words. */}
              {accent.map((w, i) => (
                <span
                  key={i}
                  style={{ marginRight: 18, marginTop: 6, padding: "0 6px", backgroundImage: `linear-gradient(to bottom, transparent 52%, ${C.yolk} 52%, ${C.yolk} 92%, transparent 92%)` }}
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 24, color: C.inkSoft }}>centavos.mx/app/claude</div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", paddingRight: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 500, padding: 28, borderRadius: 36, backgroundColor: C.surface, border: `2px solid ${C.rule}`, boxShadow: "0 40px 70px -36px rgba(42,26,16,0.55)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, borderBottom: `2px solid ${C.rule}` }}>
              <div style={{ display: "flex", fontSize: 26, ...DISPLAY }}>{chat.assistant}</div>
              <div style={{ display: "flex", alignItems: "center", padding: "7px 14px", borderRadius: 999, backgroundColor: C.greenSoft, fontSize: 18 }}>
                <div style={{ display: "flex", width: 10, height: 10, borderRadius: 5, backgroundColor: C.green, marginRight: 8 }} />
                {chat.connected}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
              <div style={{ display: "flex", maxWidth: 380, padding: "14px 20px", borderRadius: "24px 24px 8px 24px", backgroundColor: C.mandarina, fontSize: 24, lineHeight: 1.3 }}>
                {chat.user1}
              </div>
            </div>

            <div style={{ display: "flex", marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", padding: "8px 14px", borderRadius: 999, backgroundColor: C.bg, border: `2px solid ${C.rule}`, fontSize: 17, color: C.inkSoft }}>
                <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, backgroundColor: C.mandarina, marginRight: 9 }} />
                {chat.tool1}
              </div>
            </div>

            <div style={{ display: "flex", marginTop: 14 }}>
              <div style={{ display: "flex", flexWrap: "wrap", maxWidth: 420, padding: "16px 20px", borderRadius: "24px 24px 24px 8px", backgroundColor: C.bg, border: `2px solid ${C.rule}`, fontSize: 23, lineHeight: 1.35 }}>
                {words(chat.reply1).map((w, i) => (
                  <span key={i} style={{ marginRight: 7, color: w.strong ? C.mandarinaDeep : C.ink, ...(w.strong ? DISPLAY : {}) }}>
                    {w.word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      fonts: await loadFonts(),
      headers: {
        // The same picture for everyone; chat apps and crawlers cache it themselves too.
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    },
  );
}
