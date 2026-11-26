"use client";

// Los pasos del wizard de /app/bienvenida. Cada uno es un `StepScaffold` con su
// contenido; el estado vive en `Wizard.tsx`.

import { useMemo, useState } from "react";
import { useLang, useT } from "@/components/app/LanguageProvider";
import type {
  OnboardingApplyResponse,
  OnboardingCatalog,
  OnboardingCatalogBudget,
  OnboardingCatalogSubscription,
  OnboardingInviteStatus,
} from "@/lib/app/api";
import type { SiteLang } from "@/lib/lang";
import {
  addInvite,
  budgetAmount,
  currencyOptions,
  filterCurrencies,
  isValidTripName,
  subscriptionAmount,
  TRIP_NAME_MAX,
  type Picks,
} from "./logic";
import { ChoiceCard, FOCUS_WITHIN, PrimaryButton, StepScaffold, TextField, ToggleAmountCard } from "./ui";

export type CatalogState = { phase: "loading" } | { phase: "error" } | { phase: "ready"; catalog: OnboardingCatalog };

type Chrome = { onSkip: () => void; skipDisabled: boolean; error: string | null };

// ─── 1 · Moneda e idioma ─────────────────────────────────────────────────────

export function CurrencyStep({
  currency,
  onCurrency,
  onContinue,
  ...chrome
}: Chrome & { currency: string; onCurrency: (code: string) => void; onContinue: () => void }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const [query, setQuery] = useState("");
  const options = useMemo(() => currencyOptions(lang), [lang]);
  const shown = useMemo(() => filterCurrencies(options, query), [options, query]);

  const langs: { value: SiteLang; label: string }[] = [
    { value: "es", label: t("onboarding:web.languageEs") },
    { value: "en", label: t("onboarding:web.languageEn") },
  ];

  return (
    <StepScaffold
      eyebrow={t("onboarding:currency.eyebrow")}
      title={t("onboarding:currency.title")}
      subtitle={t("onboarding:currency.subtitle")}
      onSkip={chrome.onSkip}
      skipDisabled={chrome.skipDisabled}
      error={chrome.error}
      footer={<PrimaryButton onClick={onContinue}>{t("onboarding:continue")}</PrimaryButton>}
    >
      <fieldset className="mb-6">
        <legend className="mb-2 text-[14px] font-bold">{t("onboarding:web.language")}</legend>
        <div className="flex gap-2">
          {langs.map((l) => (
            <label
              key={l.value}
              className={`glass-lite flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full px-4 text-[15px] font-bold ${FOCUS_WITHIN} ${
                lang === l.value ? "border-mandarina bg-peach" : ""
              }`}
            >
              <input
                type="radio"
                name="idioma"
                value={l.value}
                checked={lang === l.value}
                onChange={() => setLang(l.value)}
                className="sr-only"
              />
              {l.label}
            </label>
          ))}
        </div>
      </fieldset>

      <TextField
        id="moneda-buscar"
        type="search"
        label={t("onboarding:web.currencySearch")}
        placeholder={t("onboarding:web.currencySearchPlaceholder")}
        value={query}
        onChange={setQuery}
        autoComplete="off"
      />

      <fieldset className="mt-3">
        <legend className="sr-only">{t("onboarding:web.currencyList")}</legend>
        <div className="glass-lite max-h-[min(46vh,360px)] overflow-y-auto rounded-2xl p-1.5">
          {shown.length === 0 ? (
            <p role="status" className="px-3 py-4 text-[14px] text-ink-soft">
              {t("onboarding:web.currencyNone")}
            </p>
          ) : (
            shown.map((o) => (
              <label
                key={o.code}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-1.5 text-[15px] ${FOCUS_WITHIN} ${
                  currency === o.code ? "bg-peach font-bold" : "hover:bg-sand"
                }`}
              >
                <input
                  type="radio"
                  name="moneda"
                  value={o.code}
                  checked={currency === o.code}
                  onChange={() => onCurrency(o.code)}
                  className="sr-only"
                />
                <span className="w-10 shrink-0 font-display font-extrabold tracking-[-0.01em]">{o.code}</span>
                <span className="min-w-0 flex-1 truncate">{o.name}</span>
                {currency === o.code ? (
                  <span aria-hidden className="text-mandarina-deep">
                    ✓
                  </span>
                ) : null}
              </label>
            ))
          )}
        </div>
      </fieldset>
    </StepScaffold>
  );
}

// ─── 2 · Propósito ───────────────────────────────────────────────────────────

export function PurposeStep({
  onBack,
  onChoose,
  ...chrome
}: Chrome & { onBack: () => void; onChoose: (purpose: "personal" | "trip") => void }) {
  const t = useT();
  return (
    <StepScaffold
      eyebrow={t("onboarding:purpose.eyebrow")}
      title={t("onboarding:purpose.title")}
      onBack={onBack}
      onSkip={chrome.onSkip}
      skipDisabled={chrome.skipDisabled}
      error={chrome.error}
    >
      <div className="flex flex-col gap-3">
        <ChoiceCard
          icon="💼"
          title={t("onboarding:purpose.personalTitle")}
          description={t("onboarding:purpose.personalDesc")}
          onChoose={() => onChoose("personal")}
        />
        <ChoiceCard
          icon="✈️"
          title={t("onboarding:purpose.tripTitle")}
          description={t("onboarding:purpose.tripDesc")}
          onChoose={() => onChoose("trip")}
        />
      </div>
    </StepScaffold>
  );
}

// ─── 3 y 4 · Presupuestos y suscripciones ────────────────────────────────────

function CatalogGate({ catalog, onRetry, empty, children }: {
  catalog: CatalogState;
  onRetry: () => void;
  empty: boolean;
  children: React.ReactNode;
}) {
  const t = useT();
  if (catalog.phase === "loading") {
    return (
      <div role="status" aria-label={t("common:loading")} className="flex flex-col gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-sand" />
        ))}
      </div>
    );
  }
  if (catalog.phase === "error") {
    return (
      <div role="alert" className="text-center">
        <p className="text-[15px] font-semibold text-red">{t("onboarding:budgets.loadError")}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 min-h-11 rounded-full border border-rule-strong px-5 text-[15px] font-bold"
        >
          {t("common:actions.retry")}
        </button>
      </div>
    );
  }
  if (empty) return <p className="text-center text-[15px] text-ink-soft">{t("onboarding:budgets.empty")}</p>;
  return <ul className="flex flex-col gap-2.5">{children}</ul>;
}

function Mark({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[20px]"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

const categoryColor = (category: string) => `var(--color-cat-${category}, var(--color-cat-other))`;

export function BudgetsStep({
  onBack,
  currency,
  catalog,
  onRetry,
  picks,
  onPicks,
  onContinue,
  ...chrome
}: Chrome & {
  onBack: () => void;
  currency: string;
  catalog: CatalogState;
  onRetry: () => void;
  picks: Picks;
  onPicks: (picks: Picks) => void;
  onContinue: () => void;
}) {
  const t = useT();
  const items: readonly OnboardingCatalogBudget[] = catalog.phase === "ready" ? catalog.catalog.budgets : [];

  return (
    <StepScaffold
      eyebrow={t("onboarding:budgets.eyebrow")}
      title={t("onboarding:budgets.title")}
      subtitle={t("onboarding:budgets.subtitle")}
      onBack={onBack}
      onSkip={chrome.onSkip}
      skipDisabled={chrome.skipDisabled}
      error={chrome.error}
      footer={
        <PrimaryButton
          disabled={catalog.phase !== "ready"}
          onClick={onContinue}
        >
          {t("onboarding:continue")}
        </PrimaryButton>
      }
    >
      <CatalogGate catalog={catalog} onRetry={onRetry} empty={items.length === 0}>
        {items.map((b) => {
          const amount = budgetAmount(picks, b);
          return (
            <ToggleAmountCard
              key={b.key}
              id={`presupuesto-${b.key}`}
              mark={<Mark color={categoryColor(b.category)}>{b.emoji}</Mark>}
              name={b.name}
              currency={currency}
              selected={!!picks.sel[b.key]}
              amount={amount}
              amountLabel={t("onboarding:budgets.amountLabel")}
              onToggle={() => onPicks({ ...picks, sel: { ...picks.sel, [b.key]: !picks.sel[b.key] } })}
              onAmountChange={(v) => onPicks({ ...picks, amt: { ...picks.amt, [b.key]: v } })}
            />
          );
        })}
      </CatalogGate>
    </StepScaffold>
  );
}

export function SubscriptionsStep({
  onBack,
  currency,
  catalog,
  onRetry,
  picks,
  onPicks,
  busy,
  onFinish,
  ...chrome
}: Chrome & {
  onBack: () => void;
  currency: string;
  catalog: CatalogState;
  onRetry: () => void;
  picks: Picks;
  onPicks: (picks: Picks) => void;
  busy: boolean;
  onFinish: () => void;
}) {
  const t = useT();
  const items: readonly OnboardingCatalogSubscription[] = catalog.phase === "ready" ? catalog.catalog.subscriptions : [];

  return (
    <StepScaffold
      eyebrow={t("onboarding:subscriptions.eyebrow")}
      title={t("onboarding:subscriptions.title")}
      subtitle={t("onboarding:subscriptions.subtitle")}
      onBack={onBack}
      onSkip={chrome.onSkip}
      skipDisabled={chrome.skipDisabled || busy}
      error={chrome.error}
      footer={
        <PrimaryButton
          disabled={catalog.phase !== "ready" || busy}
          onClick={onFinish}
        >
          {busy ? t("onboarding:web.working") : t("onboarding:subscriptions.finish")}
        </PrimaryButton>
      }
    >
      <CatalogGate catalog={catalog} onRetry={onRetry} empty={items.length === 0}>
        {items.map((s) => {
          const amount = subscriptionAmount(picks, s);
          return (
            <ToggleAmountCard
              key={s.key}
              id={`suscripcion-${s.key}`}
              mark={<Mark color={categoryColor(s.category)}>{s.emoji}</Mark>}
              name={s.name}
              currency={currency}
              selected={!!picks.sel[s.key]}
              amount={amount}
              amountLabel={t("onboarding:budgets.amountLabel")}
              onToggle={() => onPicks({ ...picks, sel: { ...picks.sel, [s.key]: !picks.sel[s.key] } })}
              onAmountChange={(v) => onPicks({ ...picks, amt: { ...picks.amt, [s.key]: v } })}
            />
          );
        })}
      </CatalogGate>
    </StepScaffold>
  );
}

// ─── 5 · Nombre del viaje ────────────────────────────────────────────────────

export function TripNameStep({
  onBack,
  name,
  onName,
  onContinue,
  ...chrome
}: Chrome & { onBack: () => void; name: string; onName: (name: string) => void; onContinue: () => void }) {
  const t = useT();
  const [touched, setTouched] = useState(false);
  const valid = isValidTripName(name);
  const next = () => {
    if (valid) onContinue();
    else setTouched(true);
  };

  return (
    <StepScaffold
      eyebrow={t("onboarding:tripName.eyebrow")}
      title={t("onboarding:tripName.title")}
      subtitle={t("onboarding:tripName.subtitle")}
      onBack={onBack}
      onSkip={chrome.onSkip}
      skipDisabled={chrome.skipDisabled}
      error={chrome.error}
      footer={<PrimaryButton onClick={next}>{t("onboarding:continue")}</PrimaryButton>}
    >
      <TextField
        id="viaje-nombre"
        label={t("onboarding:web.nameLabel")}
        value={name}
        onChange={onName}
        maxLength={TRIP_NAME_MAX}
        placeholder={t("onboarding:tripName.placeholder")}
        autoComplete="off"
        error={touched && !valid ? t("onboarding:tripName.required") : null}
        onEnter={next}
      />
    </StepScaffold>
  );
}

// ─── 6 · Invitar ─────────────────────────────────────────────────────────────

export function InvitesStep({
  onBack,
  ownEmail,
  emails,
  onEmails,
  busy,
  onFinish,
  ...chrome
}: Chrome & {
  onBack: () => void;
  ownEmail?: string | null;
  emails: string[];
  onEmails: (emails: string[]) => void;
  busy: boolean;
  onFinish: (emails: string[]) => void;
}) {
  const t = useT();
  const [input, setInput] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // Devuelve la lista nueva, o null si el correo escrito no sirve (el error ya se mostró).
  const tryAdd = (): string[] | null => {
    const result = addInvite(emails, input, ownEmail);
    if ("error" in result) {
      const key = {
        invalidEmail: "onboarding:tripInvites.invalidEmail",
        ownEmail: "onboarding:tripInvites.ownEmail",
        duplicate: "onboarding:tripInvites.duplicate",
        max: "onboarding:tripInvites.max",
      } as const;
      setAddError(t(key[result.error]));
      return null;
    }
    onEmails(result.emails);
    setInput("");
    return result.emails;
  };

  const add = () => {
    if (input.trim() !== "") tryAdd();
  };

  // Un correo escrito y sin «Agregar» no se pierde al crear el viaje.
  const finish = () => {
    if (input.trim() === "") return onFinish(emails);
    const next = tryAdd();
    if (next) onFinish(next);
  };

  return (
    <StepScaffold
      eyebrow={t("onboarding:tripInvites.eyebrow")}
      title={t("onboarding:tripInvites.title")}
      subtitle={t("onboarding:tripInvites.subtitle")}
      onBack={onBack}
      onSkip={chrome.onSkip}
      skipDisabled={chrome.skipDisabled || busy}
      error={chrome.error}
      footer={
        <PrimaryButton disabled={busy} onClick={finish}>
          {busy ? t("onboarding:web.working") : t("onboarding:tripInvites.finish")}
        </PrimaryButton>
      }
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <TextField
            id="viaje-correo"
            type="email"
            inputMode="email"
            label={t("onboarding:web.emailLabel")}
            placeholder={t("onboarding:tripInvites.placeholder")}
            value={input}
            onChange={(v) => {
              setInput(v);
              if (addError) setAddError(null);
            }}
            autoComplete="off"
            error={addError}
            onEnter={add}
          />
        </div>
        <button
          type="button"
          onClick={add}
          className="mt-[30px] min-h-12 shrink-0 rounded-2xl bg-ink px-5 text-[15px] font-bold text-bg focus-visible:outline-yolk"
        >
          {t("onboarding:tripInvites.add")}
        </button>
      </div>

      {emails.length > 0 ? (
        <ul aria-label={t("onboarding:web.invitedList")} className="mt-5 flex flex-col gap-2">
          {emails.map((email) => (
            <li key={email} className="glass-lite flex min-h-11 items-center gap-2 rounded-xl pl-4 pr-1">
              <span className="min-w-0 flex-1 truncate text-[15px]">{email}</span>
              <button
                type="button"
                aria-label={t("onboarding:web.removeInvite", { email })}
                onClick={() => onEmails(emails.filter((e) => e !== email))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[20px] text-ink-soft hover:text-ink"
              >
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </StepScaffold>
  );
}

// ─── Resumen del viaje ───────────────────────────────────────────────────────

const STATUS_KEY = {
  invited: "onboarding:done.statusInvited",
  invited_pending: "onboarding:done.statusInvitedPending",
  already_member: "onboarding:done.statusAlreadyMember",
  failed: "onboarding:done.statusFailed",
} as const satisfies Record<OnboardingInviteStatus, string>;

export function DoneStep({
  invites,
  busy,
  error,
  onDone,
}: {
  invites: NonNullable<OnboardingApplyResponse["invites"]>;
  busy: boolean;
  error: string | null;
  onDone: () => void;
}) {
  const t = useT();
  return (
    <StepScaffold
      title={t("onboarding:done.title")}
      subtitle={t("onboarding:done.subtitle")}
      error={error}
      footer={
        <PrimaryButton disabled={busy} onClick={onDone}>
          {busy ? t("onboarding:web.working") : t("onboarding:done.goToApp")}
        </PrimaryButton>
      }
    >
      <ul className="flex flex-col gap-2">
        {invites.map((inv) => (
          <li key={inv.email} className="glass-lite flex items-center gap-3 rounded-xl px-4 py-3">
            <span aria-hidden className={inv.status === "failed" ? "text-red" : "text-green"}>
              {inv.status === "failed" ? "!" : "✓"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold">{inv.email}</span>
              <span className="block text-[13px] text-ink-soft">{t(STATUS_KEY[inv.status])}</span>
            </span>
          </li>
        ))}
      </ul>
    </StepScaffold>
  );
}
