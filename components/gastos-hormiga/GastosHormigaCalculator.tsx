"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AppStoreBadges } from "@/components/home/AppStoreBadges";
import { pesos, campoCls, etiquetaCls, ayudaCls, limpiarNumero } from "@/lib/format";
import {
  CATEGORIES,
  MAX_AMOUNT,
  MAX_ITEMS,
  MAX_NAME,
  MAX_TIMES,
  PERIODS,
  isValidItem,
  itemMonthly,
  itemYearly,
  round2,
  totals,
  type Category,
  type Item,
  type Period,
} from "@/lib/gastos-hormiga";
import { API_CONFIGURED, saveErrorOf, saveGastosHormiga, type SaveErrorCode } from "@/lib/gastos-hormiga-api";
import { navHref, type SiteLang } from "@/lib/lang";
import { getAppLinks } from "@/lib/store-links";
import { GASTOS_HORMIGA_COPY, PRESETS, type GastosHormigaCopy } from "./copy";

/** A row as typed: the numbers stay text until they make a valid item. */
type Row = { id: number; name: string; amount: string; times: string; period: Period; category: Category };

const STORAGE_KEY = "centavos:gastos-hormiga";

/** How far ahead the comparison under the result looks. */
const YEARS_AHEAD = 5;

/** Digits and one dot, two decimals at most, never above the limit. A keystroke that breaks that is dropped. */
function cleanAmount(value: string, previous: string): string {
  const next = limpiarNumero(value).replace(/^(\d*\.\d{0,2}).*$/, "$1");
  return next === "" || next === "." || parseFloat(next) <= MAX_AMOUNT ? next : previous;
}

/** A whole number from 1 to the limit, or empty while it is being retyped. */
function cleanTimes(value: string, previous: string): string {
  const next = value.replace(/\D/g, "").slice(0, 2);
  const n = parseInt(next, 10);
  return next === "" || (n >= 1 && n <= MAX_TIMES) ? next : previous;
}

/** The item a row stands for, or `null` while the row is incomplete. */
function toItem(row: Row): Item | null {
  const item: Item = {
    name: row.name.trim(),
    amount: parseFloat(row.amount),
    times: parseInt(row.times, 10),
    period: row.period,
    category: row.category,
  };
  return isValidItem(item) ? item : null;
}

/** The list kept from an earlier visit. Whatever cannot be read as a row is dropped. */
function readStored(): Omit<Row, "id">[] {
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.slice(0, MAX_ITEMS).flatMap((raw: unknown) => {
      if (!raw || typeof raw !== "object") return [];
      const r = raw as Record<string, unknown>;
      return [
        {
          name: typeof r.name === "string" ? r.name.slice(0, MAX_NAME) : "",
          amount: typeof r.amount === "string" ? cleanAmount(r.amount, "") : "",
          times: typeof r.times === "string" ? cleanTimes(r.times, "") : "",
          period: PERIODS.includes(r.period as Period) ? (r.period as Period) : "day",
          category: CATEGORIES.includes(r.category as Category) ? (r.category as Category) : "other",
        },
      ];
    });
  } catch {
    return [];
  }
}

const chip =
  "min-h-11 rounded-full px-4 py-2.5 text-[14px] font-bold border bg-surface text-ink border-rule-strong " +
  "hover:border-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const primaryButton =
  "bg-ink text-bg px-5 py-3 rounded-xl text-[14px] font-bold cursor-pointer hover:opacity-80 transition-opacity " +
  "duration-150 aria-disabled:opacity-60 aria-disabled:cursor-default";
const kicker = "text-[11px] font-extrabold tracking-wider text-mandarina-deep uppercase mb-2";
const bigNumber =
  "font-display text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] leading-none text-ink [overflow-wrap:anywhere]";

export function GastosHormigaCalculator({ lang }: { lang: SiteLang }) {
  const t = GASTOS_HORMIGA_COPY[lang];
  const [rows, setRows] = useState<Row[]>([]);

  // The saved list is read after mount: the server render and the first client
  // render both start empty, so they agree (no hydration mismatch). Nothing is
  // written back until that read has happened.
  const [loaded, setLoaded] = useState(false);
  const nextId = useRef(1);
  useEffect(() => {
    setRows(readStored().map((row) => ({ ...row, id: nextId.current++ })));
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {
      // Private mode, blocked or full storage: the list just does not persist.
    }
  }, [rows, loaded]);

  // Where the focus goes once the list has re-rendered: the name of a row added
  // by hand, or the add button when a row is removed (the button that had the
  // focus is gone with it).
  const focusNext = useRef<number | "add" | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const target = focusNext.current;
    if (target === null) return;
    focusNext.current = null;
    if (target === "add") addButton.current?.focus();
    else document.getElementById(`gh-${target}-name`)?.focus();
  }, [rows]);

  const full = rows.length >= MAX_ITEMS;

  function add(row: Omit<Row, "id">, focus = false) {
    if (full) return;
    const id = nextId.current++;
    if (focus) focusNext.current = id;
    setRows((list) => [...list, { ...row, id }]);
  }

  function update(id: number, patch: Partial<Row>) {
    setRows((list) => list.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function remove(id: number) {
    focusNext.current = "add";
    setRows((list) => list.filter((row) => row.id !== id));
  }

  const lines = useMemo(
    () =>
      rows.flatMap((row) => {
        const item = toItem(row);
        return item ? [{ id: row.id, item, yearly: itemYearly(item), monthly: itemMonthly(item) }] : [];
      }),
    [rows],
  );
  const items = useMemo(() => lines.map((line) => line.item), [lines]);
  const result = useMemo(() => totals(items), [items]);
  const biggestFirst = useMemo(() => [...lines].sort((a, b) => b.yearly - a.yearly), [lines]);
  const counted = new Set(lines.map((line) => line.id));

  return (
    <div className="bg-sand/40 border border-rule rounded-[28px] p-5 md:p-7">
      {/* ─── Suggestions ─── */}
      <fieldset>
        <legend className={etiquetaCls}>{t.presetsLegend}</legend>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              disabled={full}
              onClick={() =>
                add({
                  name: t.presets[preset.key],
                  amount: String(preset.amount),
                  times: String(preset.times),
                  period: preset.period,
                  category: preset.category,
                })
              }
              className={chip}
            >
              <span aria-hidden>+ </span>
              {t.presets[preset.key]}
            </button>
          ))}
        </div>
        <p className={ayudaCls}>{t.presetsHint}</p>
      </fieldset>

      {/* ─── The list ─── */}
      {rows.length > 0 && (
        <ul aria-label={t.listLabel} className="mt-5">
          {rows.map((row, index) => {
            const id = `gh-${row.id}`;
            return (
              <li key={row.id} className="border-t border-rule py-4">
                {/* On a phone: the name and the remove button, then the three numbers.
                    From md up, one line. The button comes last in the markup so the
                    keyboard reaches it after the fields. Every row repeats the same
                    four labels, so the group says which expense they belong to. */}
                <div
                  role="group"
                  aria-label={row.name.trim() || `${t.nameLabel} ${index + 1}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 gap-y-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)_auto] md:gap-x-3"
                >
                  <div className="min-w-0">
                    <label htmlFor={`${id}-name`} className={etiquetaCls}>
                      {t.nameLabel}
                    </label>
                    <input
                      id={`${id}-name`}
                      type="text"
                      autoComplete="off"
                      maxLength={MAX_NAME}
                      value={row.name}
                      onChange={(e) => update(row.id, { name: e.target.value })}
                      className={campoCls}
                      placeholder={t.namePlaceholder}
                    />
                  </div>

                  <div className="col-span-2 grid grid-cols-[minmax(0,1fr)_3rem_minmax(0,1.1fr)] gap-2 md:col-span-1">
                    <div>
                      <label htmlFor={`${id}-amount`} className={etiquetaCls}>
                        {t.amountLabel}
                      </label>
                      <div className="relative">
                        <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-ink-soft">
                          $
                        </span>
                        <input
                          id={`${id}-amount`}
                          inputMode="decimal"
                          autoComplete="off"
                          value={row.amount}
                          onChange={(e) => update(row.id, { amount: cleanAmount(e.target.value, row.amount) })}
                          className={`${campoCls} pl-7 pr-3`}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor={`${id}-times`} className={etiquetaCls}>
                        {t.timesLabel}
                      </label>
                      <input
                        id={`${id}-times`}
                        inputMode="numeric"
                        autoComplete="off"
                        value={row.times}
                        onChange={(e) => update(row.id, { times: cleanTimes(e.target.value, row.times) })}
                        className={`${campoCls} pl-2 pr-2 text-center`}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label htmlFor={`${id}-period`} className={etiquetaCls}>
                        {t.periodLabel}
                      </label>
                      <div className="relative">
                        <select
                          id={`${id}-period`}
                          value={row.period}
                          onChange={(e) => update(row.id, { period: e.target.value as Period })}
                          className={`${campoCls} appearance-none pl-3 pr-8 cursor-pointer`}
                        >
                          {PERIODS.map((period) => (
                            <option key={period} value={period}>
                              {t.periods[period]}
                            </option>
                          ))}
                        </select>
                        <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-soft">
                          ▾
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(row.id)}
                    aria-label={t.remove(row.name.trim())}
                    className="col-start-2 row-start-1 md:col-start-3 grid h-[50px] w-11 place-items-center rounded-xl border border-rule-strong bg-surface text-ink-soft hover:border-ink hover:text-ink transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M2 2l10 10M12 2L2 12" />
                    </svg>
                  </button>
                </div>
                {!counted.has(row.id) && <p className={ayudaCls}>{t.incomplete}</p>}
              </li>
            );
          })}
        </ul>
      )}

      <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${rows.length > 0 ? "border-t border-rule pt-4" : "mt-5"}`}>
        <button
          ref={addButton}
          type="button"
          disabled={full}
          onClick={() => add({ name: "", amount: "", times: "1", period: "day", category: "other" }, true)}
          className={chip}
        >
          <span aria-hidden>+ </span>
          {t.add}
        </button>
        {full && <p className="text-[12px] text-ink-soft">{t.limit(MAX_ITEMS)}</p>}
      </div>

      {/* ─── Result ─── */}
      <div className="mt-7">
        {/* Always mounted, so a screen reader hears the totals appear and change. */}
        <div aria-live="polite" aria-atomic="true">
          {result ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-surface border border-rule rounded-3xl p-6 text-center">
                <div className={kicker}>{t.monthlyKicker}</div>
                <p className={bigNumber}>{pesos.format(round2(result.monthly))}</p>
                <p className="text-[14px] text-ink-soft mt-2">{t.monthlyNote}</p>
              </div>
              <div className="bg-surface border border-rule rounded-3xl p-6 text-center">
                <div className={kicker}>{t.yearlyKicker}</div>
                <p className={bigNumber}>{pesos.format(round2(result.yearly))}</p>
                <p className="text-[14px] text-ink-soft mt-2">{t.yearlyNote}</p>
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-ink-soft text-center py-6">{t.empty}</p>
          )}
        </div>

        {result && (
          <>
            <div className="mt-4">
              <h3 className="text-[13px] font-bold text-ink mb-2">{t.breakdownHeading}</h3>
              <ol className="bg-surface border border-rule rounded-2xl divide-y divide-rule overflow-hidden">
                {biggestFirst.map(({ id, item, monthly, yearly }) => (
                  <li key={id} className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-[14px] font-bold text-ink [overflow-wrap:anywhere]">{item.name}</span>
                      <span className="block text-[12px] text-ink-soft">
                        {pesos.format(item.amount)} · {t.frequency(item.times, item.period)}
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-right tabular-nums">
                      <span className="block text-[14px] font-bold text-ink">
                        {pesos.format(round2(monthly))} <span className="font-normal text-ink-soft">{t.perMonth}</span>
                      </span>
                      <span className="block text-[12px] text-ink-soft">
                        {pesos.format(round2(yearly))} {t.perYear}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-peach border border-mandarina/40 rounded-3xl p-5 md:p-6 mt-4">
              <div className="text-[11px] font-extrabold tracking-wider text-ink/70 uppercase mb-2">{t.aheadKicker}</div>
              <p className="font-display text-2xl md:text-3xl font-extrabold tracking-[-0.02em] leading-tight text-ink mb-3">
                {t.aheadTitle(YEARS_AHEAD, pesos.format(round2(result.yearly * YEARS_AHEAD)))}
              </p>
              <p className="text-[14px] leading-relaxed text-ink/85">{t.aheadBody(YEARS_AHEAD * 12)}</p>
            </div>
          </>
        )}
      </div>

      {/* ─── Saving the list ─── */}
      {API_CONFIGURED && <SaveCard t={t} lang={lang} items={items} />}
    </div>
  );
}

type SaveStage = "ask" | "form" | "done";

/**
 * "¿Quieres guardarlo?", right under the result. Only an email is asked for and
 * no account is created here: the API keeps the list until that email signs up
 * in the app. It stays mounted while the list is empty so a typed email is not
 * lost when the result comes and goes.
 */
function SaveCard({ t, lang, items }: { t: GastosHormigaCopy; lang: SiteLang; items: Item[] }) {
  const [stage, setStage] = useState<SaveStage>("ask");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SaveErrorCode | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const savedRef = useRef<HTMLHeadingElement>(null);

  // Focus follows the step: the email field when the form opens (or the API
  // rejects the email), the confirmation once the list is saved.
  useEffect(() => {
    if (stage === "form") emailRef.current?.focus();
    if (stage === "done") savedRef.current?.focus();
  }, [stage]);
  useEffect(() => {
    if (error === "EMAIL") emailRef.current?.focus();
  }, [error]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await saveGastosHormiga(email.trim(), lang, items);
      setStage("done");
    } catch (err) {
      // The list and the typed email stay as they are: fix and send again.
      setError(saveErrorOf(err));
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) return null;

  const title = "font-display text-2xl md:text-3xl font-extrabold tracking-[-0.02em] leading-tight text-ink mb-3";
  const hand = "font-hand text-2xl leading-none text-mandarina-deep mb-1";

  if (stage === "done") {
    const { storeUrl, playUrl } = getAppLinks();
    return (
      <section aria-labelledby="gh-save-title" className="mt-4 bg-surface border-2 border-ink rounded-3xl p-5 md:p-6">
        <div role="status">
          <p className={hand}>{t.savedKicker}</p>
          {/* Focus lands here only from script; the global :focus-visible ring is
              unlayered CSS, so a utility cannot switch it off. */}
          <h2 id="gh-save-title" ref={savedRef} tabIndex={-1} style={{ outline: "none" }} className={title}>
            {t.savedTitle}
          </h2>
          <p className="text-[15px] leading-relaxed text-ink mb-3 [overflow-wrap:anywhere]">{t.savedBody(email.trim())}</p>
          <p className="text-[14px] leading-relaxed font-semibold text-ink bg-sand rounded-xl px-4 py-3 mb-3">
            {t.sameEmailNote}
          </p>
          <p className="text-[13px] leading-relaxed text-ink-soft mb-5">{t.existingAccountNote}</p>
        </div>
        <p className="text-[13px] font-bold text-ink mb-3">{t.downloadHeading}</p>
        <AppStoreBadges storeUrl={storeUrl} playUrl={playUrl} lang={lang} />
        <p className="text-[13px] leading-relaxed text-ink-soft mt-5">
          {t.saveAgainHint}{" "}
          <button
            type="button"
            onClick={() => setStage("form")}
            className="font-semibold text-mandarina-deep underline underline-offset-2 cursor-pointer py-2"
          >
            {t.saveAgain}
          </button>
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="gh-save-title" className="mt-4 bg-surface border-2 border-ink rounded-3xl p-5 md:p-6">
      <p className={hand}>{t.saveKicker}</p>
      <h2 id="gh-save-title" className={title}>
        {t.saveTitle}
      </h2>
      <p className="text-[15px] leading-relaxed text-ink-soft mb-5 max-w-xl">{t.saveBody}</p>

      {stage === "ask" ? (
        <button type="button" onClick={() => setStage("form")} className={primaryButton}>
          {t.saveYes}
        </button>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 max-w-md">
          <div>
            <label htmlFor="gh-save-email" className={etiquetaCls}>
              {t.emailLabel}
            </label>
            <input
              ref={emailRef}
              id="gh-save-email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={busy}
              placeholder={t.emailPlaceholder}
              aria-invalid={error === "EMAIL" ? true : undefined}
              aria-describedby={error ? "gh-save-error gh-save-note" : "gh-save-note"}
              className={campoCls}
            />
            <p id="gh-save-note" className={ayudaCls}>
              {t.emailNote}{" "}
              <Link href={navHref("/app/privacidad", lang)} className="font-semibold text-mandarina-deep underline underline-offset-2">
                {t.privacyLink}
              </Link>
              .
            </p>
          </div>
          {error && (
            <p id="gh-save-error" role="alert" className="text-[13px] font-semibold text-mandarina-deep">
              <span aria-hidden>⚠ </span>
              <span className="sr-only">{t.errorPrefix} </span>
              {t.errors[error]}
            </p>
          )}
          {/* Not `disabled` while sending: a disabled button drops the keyboard focus. */}
          <button type="submit" aria-disabled={busy} className={`${primaryButton} self-start`}>
            {busy ? t.saving : t.saveSubmit}
          </button>
          <p role="status" className="sr-only">
            {busy ? t.saving : ""}
          </p>
        </form>
      )}
    </section>
  );
}
