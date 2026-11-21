// Invitation to the Discord server, between the FAQ and the closing CTA.
// HomePage only renders it when `NEXT_PUBLIC_DISCORD_URL` is set (see
// lib/social-links.ts). Design: the "Centavos Discord CTA" canvas in Claude
// Design (desktop and 390 px artboards).

import { HOME_COPY } from "@/components/home/copy";
import type { SiteLang } from "@/lib/lang";

/** Discord's brand mark. Decorative: the link text names Discord. Also used by the footer. */
export function DiscordGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function CommunityCta({ href, lang }: { href: string; lang: SiteLang }) {
  const c = HOME_COPY[lang].community;
  const newTab = HOME_COPY[lang].store.newTab;

  return (
    <section aria-labelledby="comunidad-title" className="mx-auto max-w-screen-lg px-5 pb-4 md:pb-6">
      {/* One column on phones (text, note, button); on wider screens the note
          moves to its own column beside the text and the button. */}
      <div className="bg-sky rounded-[28px] md:rounded-[32px] px-6 pt-8 pb-7 md:p-14 grid md:grid-cols-[1.15fr_.85fr] gap-x-12 gap-y-9 md:gap-y-7">
        <div className="md:self-end">
          {/* Ink, not mandarina-deep: the orange is only 4.25:1 on sky. */}
          <p className="font-hand text-[28px] md:text-3xl leading-none text-ink -rotate-2 origin-left mb-1.5">
            {c.kicker}
          </p>
          <h2 id="comunidad-title" className="font-display text-4xl md:text-5xl font-extrabold tracking-[-0.03em] leading-[1.0] mb-4">
            {c.titleLead}<br /><mark className="mark">{c.titleAccent}</mark>.
          </h2>
          <p className="text-base md:text-[17px] leading-relaxed text-ink/75 max-w-md">{c.body}</p>
        </div>

        <div aria-hidden className="md:col-start-2 md:row-start-1 md:row-span-2 self-center flex justify-center">
          <div className="relative w-[290px] md:w-[330px] rotate-[1.5deg] md:rotate-[2.5deg] will-change-transform">
            <div className="relative overflow-hidden rounded-lg bg-surface shadow-[0_18px_40px_-18px_rgb(42_26_16/.35)] pt-1 pb-5 font-hand text-[26px] md:text-3xl text-ink">
              <div className="absolute inset-y-0 left-10 md:left-12 w-px bg-mandarina/55" />
              <div className="h-9 md:h-10 flex items-end pl-14 md:pl-16 border-b border-[#b4cdd8] text-mandarina-deep">
                {c.note.title}
              </div>
              {c.note.items.map((item, i) => (
                <div key={i} className="h-9 md:h-10 flex items-end pl-14 md:pl-16 border-b border-[#b4cdd8]">
                  <span className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-[18px] md:h-[18px] shrink-0 text-mandarina-deep">
                      <path d="M4 13l5 5L20 6" />
                    </svg>
                    <span>{item}</span>
                  </span>
                </div>
              ))}
            </div>
            {/* Sticker in Discord's own colour, so the note reads as "Discord" at a glance. */}
            <span className="absolute -top-5 -right-3 md:-top-6 md:-right-5 w-[54px] h-[54px] md:w-16 md:h-16 rounded-full bg-[#5865f2] text-white flex items-center justify-center -rotate-12 shadow-[0_8px_18px_-8px_rgb(42_26_16/.45)]">
              <DiscordGlyph className="w-7 h-7 md:w-8 md:h-8" />
            </span>
          </div>
        </div>

        <div className="md:self-start flex flex-col md:flex-row md:flex-wrap md:items-center gap-x-[18px] gap-y-3">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover inline-flex items-center justify-center gap-2.5 h-14 rounded-full bg-ink text-bg pl-[22px] pr-[26px] text-[16px] font-bold"
          >
            <DiscordGlyph className="w-[22px] h-[22px] shrink-0" />
            <span>
              {c.cta}
              <span className="sr-only"> {newTab}</span>
            </span>
            <span aria-hidden>→</span>
          </a>
          <p className="text-[13px] text-ink/75 text-center md:text-left">{c.fine}</p>
        </div>
      </div>
    </section>
  );
}
