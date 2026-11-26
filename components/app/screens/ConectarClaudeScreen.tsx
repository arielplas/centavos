"use client";

// Conectar con Claude (docs/app-web.md §4.8, D5): copia de
// centavos-app/src/screens/ConectarClaude.tsx. El paso 1 da el enlace del
// conector, el paso 2 genera un código de un solo uso al tocar, y abajo se ven
// y se cortan las conexiones.
//
// El código es un secreto: vive solo en el estado de este componente. No va a la
// URL, al almacenamiento ni a los logs; sale únicamente al copiarlo, y se borra
// al desmontar (el estado se va con el componente).

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/app/connect/ConfirmDialog";
import {
  COPIED_MS,
  TICK_MS,
  WRITE_SCOPE,
  codeView,
  failureOf,
  formatLongDate,
} from "@/components/app/connect/linkCode";
import { useLang, useT } from "@/components/app/LanguageProvider";
import {
  MCP_URL,
  createLinkCode,
  getConnections,
  revokeConnection,
  type ClaudeConnection,
  type LinkCode,
} from "@/lib/app/api";

// Abre el diálogo de «añadir conector personalizado» de Claude con Centavos ya escrito.
const CLAUDE_CONNECTOR_URL =
  "https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Centavos" +
  `&connectorUrl=${encodeURIComponent(MCP_URL)}`;

const BTN =
  "inline-flex min-h-11 items-center justify-center rounded-cv-pill px-5 text-[15px] font-bold disabled:opacity-60";
const BTN_DARK = `${BTN} bg-ink text-bg`;
const BTN_LIGHT = `${BTN} border border-rule-strong bg-transparent text-ink`;
const CARD = "glass rounded-cv-xl p-5";

type Load =
  | { phase: "loading" }
  | { phase: "error" }
  | { phase: "ready"; available: boolean; connections: ClaudeConnection[] };

export function ConectarClaudeScreen() {
  const t = useT();
  const { lang } = useLang();

  const [load, setLoad] = useState<Load>({ phase: "loading" });
  // El código secreto: solo estado del componente.
  const [link, setLink] = useState<LinkCode | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [generating, setGenerating] = useState(false);
  const [codeError, setCodeError] = useState<"notAvailable" | "failed" | null>(null);
  const [copied, setCopied] = useState<"code" | "url" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [confirming, setConfirming] = useState<ClaudeConnection | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [revokeFailed, setRevokeFailed] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const loadConnections = useCallback(async (mode: "initial" | "quiet") => {
    if (mode === "initial") setLoad({ phase: "loading" });
    try {
      const res = await getConnections();
      if (alive.current) setLoad({ phase: "ready", available: res.available, connections: res.connections });
    } catch {
      // Una recarga en silencio que falla deja la lista como estaba.
      if (alive.current && mode === "initial") setLoad({ phase: "error" });
    }
  }, []);

  useEffect(() => {
    void loadConnections("initial");
  }, [loadConnections]);

  // Quien pega el código lo hace en otra pestaña (la de Claude). Al volver, la conexión nueva
  // ya debe estar en la lista, como en la app, que recarga al recuperar el foco.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadConnections("quiet");
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadConnections]);

  // «Vence en N min» en vivo y el código que desaparece al vencer.
  useEffect(() => {
    if (!link) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [link]);

  // El «Copiado» vuelve a su texto solo; el aviso para lectores de pantalla se limpia con él.
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => {
      setCopied(null);
      setAnnouncement("");
    }, COPIED_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const view = codeView(link, now);
  const available = load.phase === "ready" ? load.available : true;

  async function generate() {
    if (generating) return;
    setGenerating(true);
    setCodeError(null);
    setCopied(null);
    try {
      const next = await createLinkCode();
      if (!alive.current) return;
      setLink(next);
      setNow(Date.now());
    } catch (err) {
      if (!alive.current) return;
      setLink(null);
      const outcome = failureOf(err);
      setCodeError(outcome);
      // La cuenta no tiene el conector: se cambian los pasos por el aviso.
      if (outcome === "notAvailable") {
        setLoad((cur) => (cur.phase === "ready" ? { ...cur, available: false } : cur));
      }
    } finally {
      if (alive.current) setGenerating(false);
    }
  }

  // Copiar es lo único que saca el código del estado, y solo al tocar.
  async function copy(kind: "code" | "url", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setAnnouncement(t(kind === "code" ? "settings:connectClaude.copied" : "app:copiedLink"));
    } catch {
      setCopied(null);
    }
  }

  async function revoke(c: ClaudeConnection) {
    setRevoking(true);
    setRevokeFailed(false);
    try {
      await revokeConnection(c.id);
      if (!alive.current) return;
      setConfirming(null);
      await loadConnections("quiet");
      // La fila ya no existe: el foco va al título de la lista, no se pierde.
      titleRef.current?.focus();
    } catch {
      if (!alive.current) return;
      setConfirming(null);
      setRevokeFailed(true);
    } finally {
      if (alive.current) setRevoking(false);
    }
  }

  if (load.phase === "loading") {
    return (
      <main id="contenido" aria-busy="true" className="mx-auto w-full max-w-[720px] px-4 py-8">
        <p className="sr-only" role="status">
          {t("common:loading")}
        </p>
        <div className="h-8 w-56 animate-pulse rounded-xl bg-sand" />
        <div className="mt-6 h-40 animate-pulse rounded-3xl bg-sand" />
        <div className="mt-4 h-40 animate-pulse rounded-3xl bg-sand" />
      </main>
    );
  }

  if (load.phase === "error") {
    return (
      <main id="contenido" className="mx-auto w-full max-w-[720px] px-4 py-8 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em]">{t("settings:connectClaude.title")}</h1>
        <p role="alert" className="mt-6 text-ink">
          {t("settings:connectClaude.loadFailed")}
        </p>
        <button type="button" onClick={() => void loadConnections("initial")} className={`${BTN_DARK} mt-4`}>
          {t("common:actions.retry")}
        </button>
      </main>
    );
  }

  const { connections } = load;

  return (
    <main id="contenido" className="mx-auto w-full max-w-[720px] px-4 py-8">
      {/* Un solo aviso en vivo para «Copiado», siempre en la página. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em]">{t("settings:connectClaude.title")}</h1>

      {available ? (
        <>
          <p className="mt-2 text-ink-soft">{t("settings:connectClaude.intro")}</p>

          <section aria-labelledby="cc-step1" className={`${CARD} mt-6`}>
            <h2 id="cc-step1" className="text-[17px] font-bold">
              {t("settings:connectClaude.step1Title")}
            </h2>
            <p className="mt-1 text-[14px] text-ink-soft">{t("settings:connectClaude.step1Body")}</p>
            <p className="mt-3 break-all rounded-cv-md bg-sand px-3 py-2 font-mono text-[13px] font-semibold select-all">
              {MCP_URL}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => void copy("url", MCP_URL)} className={BTN_LIGHT}>
                {t(copied === "url" ? "app:copiedLink" : "app:copyLink")}
              </button>
              <a href={CLAUDE_CONNECTOR_URL} target="_blank" rel="noopener noreferrer" className={BTN_DARK}>
                {t("settings:connectClaude.openClaude")}
              </a>
            </div>
          </section>

          <section aria-labelledby="cc-step2" className={`${CARD} mt-4`}>
            <h2 id="cc-step2" className="text-[17px] font-bold">
              {t("settings:connectClaude.step2Title")}
            </h2>
            <p className="mt-1 text-[14px] text-ink-soft">{t("settings:connectClaude.step2Body")}</p>

            {view ? (
              <div className="mt-4">
                <p className="break-all text-center font-mono text-[32px] font-extrabold tracking-[0.1em] select-all">
                  {view.code}
                </p>
                <button type="button" onClick={() => void copy("code", view.code)} className={`${BTN_DARK} mt-3 w-full`}>
                  {t(copied === "code" ? "settings:connectClaude.copied" : "settings:connectClaude.copyCode")}
                </button>
                <p className="mt-4 text-[14px] text-ink-soft">{t("settings:connectClaude.explanation")}</p>
                <p className="mt-1 text-[14px] font-bold text-ink-soft">
                  {t("settings:connectClaude.expiresIn", { n: view.minutesLeft })}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-[14px] text-ink-soft">{t("settings:connectClaude.expiry")}</p>
            )}

            {codeError === "failed" ? (
              <p role="alert" className="mt-3 text-[14px] font-semibold text-mandarina-deep">
                {t("settings:connectClaude.createFailed")}
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void generate()}
              disabled={generating}
              aria-busy={generating}
              className={`${view ? BTN_LIGHT : BTN_DARK} mt-4 w-full`}
            >
              {generating
                ? t("settings:connectClaude.generating")
                : t(view ? "settings:connectClaude.generateAnother" : "settings:connectClaude.generate")}
            </button>
          </section>
        </>
      ) : (
        <p className="mt-4 text-ink-soft">{t("settings:connectClaude.notAvailable")}</p>
      )}

      <h2
        ref={titleRef}
        tabIndex={-1}
        className="mt-10 mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-soft outline-offset-4"
      >
        {t("settings:connectClaude.connectionsTitle")}
      </h2>

      {revokeFailed ? (
        <p role="alert" className="mb-3 text-[14px] font-semibold text-mandarina-deep">
          {t("settings:connectClaude.revokeFailed")}
        </p>
      ) : null}

      {connections.length === 0 ? (
        <p className="text-ink-soft">{t("settings:connectClaude.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {connections.map((c) => (
            <li key={c.id} className="glass flex items-center gap-3 rounded-cv-lg px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold break-words">{c.client}</p>
                <p className="mt-0.5 text-[14px] text-ink-soft">
                  {t("settings:connectClaude.connectedOn", { date: formatLongDate(c.createdAt, lang) })}
                </p>
                {c.lastUsedAt ? (
                  <p className="mt-0.5 text-[14px] text-ink-soft">
                    {t("settings:connectClaude.lastUsed", { date: formatLongDate(c.lastUsedAt, lang) })}
                  </p>
                ) : null}
                <p className="mt-0.5 text-[14px] text-ink-soft">
                  {t(c.scopes.includes(WRITE_SCOPE) ? "settings:connectClaude.canWrite" : "settings:connectClaude.readOnly")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRevokeFailed(false);
                  setConfirming(c);
                }}
                aria-label={t("settings:connectClaude.revokeA11y", { client: c.client })}
                className={BTN_LIGHT}
              >
                {t("settings:connectClaude.revoke")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirming !== null}
        title={confirming ? t("settings:connectClaude.confirmTitle", { client: confirming.client }) : ""}
        body={t("settings:connectClaude.confirmBody")}
        confirmLabel={t("settings:connectClaude.revoke")}
        cancelLabel={t("common:actions.cancel")}
        busy={revoking}
        onConfirm={() => confirming && void revoke(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </main>
  );
}
