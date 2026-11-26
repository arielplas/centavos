"use client";

// /app/perfil (docs/app-web.md §4.6, D-6): el perfil de solo lectura (`GET /api/me`),
// el idioma de la web (solo en el navegador, §9.1: no hace PATCH /me), enlaces a
// Conectar con Claude y a lo legal, eliminar la cuenta y cerrar sesión.

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { getMe, type Me } from "@/lib/app/api";
import { navHref, type SiteLang } from "@/lib/lang";
import { useLang, useT } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { Avatar } from "@/components/app/shell/AccountAvatar";
import { CLAUDE_HREF } from "@/components/app/shell/nav";
import { Bone, LoadError, PageColumn, SkeletonBlock, UseAppNotice, useLoad } from "@/components/app/ui";

const LANGUAGES: readonly { lang: SiteLang; name: string }[] = [
  // El nombre de cada idioma en su propio idioma, como el selector de la app.
  { lang: "es", name: "Español" },
  { lang: "en", name: "English" },
];

export function PerfilScreen() {
  const t = useT();
  const { lang } = useLang();
  const { signOut } = useSession();
  const { phase, data: me, error, apiCode, reload } = useLoad(() => getMe(), "me");
  const [signingOut, setSigningOut] = useState(false);

  // §10: una cuenta que ya no existe cierra la sesión.
  useEffect(() => {
    if (apiCode === "PROFILE_USER_NOT_FOUND") void signOut();
  }, [apiCode, signOut]);

  const out = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <PageColumn as="main" id="contenido" className="py-6">
      <h1 className="mb-5 font-display text-h1 font-extrabold text-ink">{t("auth:profile.title")}</h1>

      {phase === "loading" ? <PerfilSkeleton /> : null}
      {phase === "error" ? <LoadError message={error} onRetry={reload} /> : null}
      {phase === "ready" ? <ProfileCard me={me} /> : null}

      {phase === "ready" ? (
        <>
          <Group>
            <StaticRow label={t("auth:profile.currency")} value={me.currency} />
            <StaticRow label={t("settings:planLabel")} value={me.plan === "premium" ? t("app:planPremium") : t("app:planFree")} last />
          </Group>
        </>
      ) : null}

      <Group title={t("settings:language.title")}>
        <div className="px-4 py-3">
          <LanguageSwitch />
          <p className="mt-3 text-small text-ink-soft">{t("settings:language.footnote")}</p>
        </div>
      </Group>

      <Group>
        <LinkRow href={CLAUDE_HREF} label={t("settings:rows.connectClaude")} last />
      </Group>

      <Group title={t("settings:groups.help")}>
        <LinkRow href={navHref("/app/terminos", lang)} label={t("settings:rows.terms")} />
        <LinkRow href={navHref("/app/privacidad", lang)} label={t("settings:rows.privacy")} />
        <LinkRow href="/app/soporte" label={t("settings:rows.support")} />
        <LinkRow href="/app/eliminar-cuenta" label={t("auth:profile.deleteAccount")} danger last />
      </Group>

      <UseAppNotice className="mb-5 px-1" />

      <button
        type="button"
        onClick={out}
        disabled={signingOut}
        className="glass flex min-h-[48px] w-full items-center justify-center rounded-2xl px-4 text-body-bold font-bold text-ink disabled:opacity-60"
      >
        {t("settings:rows.signOut")}
      </button>
    </PageColumn>
  );
}

function ProfileCard({ me }: { me: Me }) {
  const t = useT();
  return (
    <section className="glass mb-5 flex items-center gap-4 rounded-[20px] p-5">
      <Avatar name={me.name} imageUrl={me.imageUrl} size={64} />
      <div className="min-w-0">
        <h2 className="truncate font-display text-h3 font-extrabold text-ink">{me.name}</h2>
        <p className="truncate text-body text-ink-soft">{me.email}</p>
        {me.emailHidden ? (
          <>
            <span className="mt-2 inline-flex rounded-full bg-sand px-2.5 py-1 text-[11px] font-bold leading-none text-ink">
              {t("auth:apple.emailHidden.badge")}
            </span>
            <p className="mt-2 text-small text-ink-soft">{t("auth:apple.emailHidden.note")}</p>
          </>
        ) : null}
      </div>
    </section>
  );
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      {title ? <h2 className="mb-2 px-1 text-caption font-bold text-ink-soft">{title}</h2> : null}
      <div className="glass overflow-hidden rounded-[20px]">{children}</div>
    </section>
  );
}

const ROW = "flex min-h-[52px] items-center gap-3 px-4 py-3";
const rule = (last?: boolean) => (last ? "" : "border-b border-rule");

function StaticRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`${ROW} ${rule(last)}`}>
      <span className="flex-1 text-body-bold font-bold text-ink">{label}</span>
      <span className="text-body text-ink-soft">{value}</span>
    </div>
  );
}

function LinkRow({ href, label, danger, last }: { href: string; label: string; danger?: boolean; last?: boolean }) {
  return (
    <Link href={href} className={`${ROW} ${rule(last)} hover:bg-sand/40`}>
      <span className={`flex-1 text-body-bold font-bold ${danger ? "text-red" : "text-ink"}`}>{label}</span>
      {danger ? null : (
        <span aria-hidden="true" className="text-lg text-ink-mute">
          ›
        </span>
      )}
    </Link>
  );
}

/** Español / English: se guarda solo en el navegador (cookie `lang`), no en la cuenta. */
function LanguageSwitch() {
  const t = useT();
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label={t("settings:language.title")} className="flex gap-2">
      {LANGUAGES.map((l) => {
        const on = l.lang === lang;
        return (
          <button
            key={l.lang}
            type="button"
            aria-pressed={on}
            lang={l.lang}
            onClick={() => setLang(l.lang)}
            className={`min-h-[44px] flex-1 rounded-full px-4 text-body-bold font-bold ${
              on ? "bg-ink text-bg" : "bg-sand text-ink hover:bg-peach"
            }`}
          >
            {l.name}
          </button>
        );
      })}
    </div>
  );
}

function PerfilSkeleton() {
  return (
    <SkeletonBlock>
      <Bone height={104} radius={20} className="mb-5" />
      <Bone height={104} radius={20} className="mb-5" />
    </SkeletonBlock>
  );
}
