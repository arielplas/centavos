"use client";

// Piezas del wizard de /app/bienvenida: el marco de cada paso y las tarjetas.
// Mismo orden que `StepScaffold` / `ToggleAmountCard` de la app móvil
// (src/screens/onboarding/shared.tsx), con el vidrio y los tokens del sitio.

import { useEffect, useRef, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useT } from "@/components/app/LanguageProvider";
import { sanitizeAmount } from "./logic";

const FOCUS_WITHIN = "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mandarina-deep";

/** Botón principal, de tinta, a lo ancho. Alto mínimo 48 px. */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="min-h-12 w-full rounded-full bg-ink px-6 text-[16px] font-bold text-bg transition-opacity focus-visible:outline-yolk disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Texto de la cabecera (Atrás, Omitir): botón sin caja, con zona de toque de 44 px. */
function HeaderButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="-mx-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl px-3 text-[15px] font-extrabold text-ink-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/**
 * El marco de un paso: Atrás y Omitir arriba, el encabezado (al que va el foco
 * al entrar, para quien usa lector de pantalla), el cuerpo y, al pie, el error
 * y el botón principal. Cada paso lo monta de nuevo (`key`), así el foco se
 * mueve solo.
 */
export function StepScaffold({
  eyebrow,
  title,
  subtitle,
  onBack,
  onSkip,
  skipDisabled,
  error,
  footer,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSkip?: () => void;
  skipDisabled?: boolean;
  error?: string | null;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  const t = useT();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main id="contenido" aria-label={t("onboarding:web.stepLabel")} className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col px-4 pb-6 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="min-w-11">
          {onBack ? <HeaderButton onClick={onBack}>{`← ${t("onboarding:back")}`}</HeaderButton> : <Logo size={22} href={null} />}
        </div>
        {onSkip ? (
          <HeaderButton onClick={onSkip} disabled={skipDisabled}>
            {t("onboarding:skip")}
          </HeaderButton>
        ) : null}
      </div>

      <div className="signup-step flex-1">
        {eyebrow ? <p className="mt-4 text-[12px] font-extrabold uppercase tracking-[0.12em] text-mandarina-deep">{eyebrow}</p> : null}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.03em] outline-none"
        >
          {title}
        </h1>
        {subtitle ? <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">{subtitle}</p> : null}
        <div className="mt-6">{children}</div>
      </div>

      {footer || error ? (
        <div className="sticky bottom-0 -mx-4 mt-4 bg-gradient-to-t from-bg via-bg/90 to-transparent px-4 pb-2 pt-6">
          {error ? (
            <p role="alert" className="mb-3 text-center text-[14px] font-semibold text-red">
              {error}
            </p>
          ) : null}
          {footer}
        </div>
      ) : null}
    </main>
  );
}

/** Una opción grande del paso de propósito: al elegirla se sigue de una vez. */
export function ChoiceCard({
  title,
  description,
  icon,
  onChoose,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onChoose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChoose}
      className="glass flex min-h-[84px] w-full items-center gap-4 rounded-3xl p-4 text-left transition-colors hover:border-rule-strong"
    >
      <span aria-hidden className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-peach text-[26px]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[19px] font-extrabold tracking-[-0.02em]">{title}</span>
        <span className="mt-0.5 block text-[14px] leading-snug text-ink-soft">{description}</span>
      </span>
      <span aria-hidden className="text-[22px] text-ink-mute">
        ›
      </span>
    </button>
  );
}

/**
 * Una tarjeta que se activa y, activada, deja editar su monto (presupuestos y
 * suscripciones). El casillero y el monto son controles de formulario reales.
 */
export function ToggleAmountCard({
  id,
  mark,
  name,
  currency,
  selected,
  amount,
  amountLabel,
  amountError,
  onToggle,
  onAmountChange,
}: {
  id: string;
  mark: ReactNode;
  name: string;
  currency: string;
  selected: boolean;
  amount: string;
  amountLabel: string;
  amountError?: string;
  onToggle: () => void;
  onAmountChange: (value: string) => void;
}) {
  const inputId = `${id}-amount`;
  const errorId = `${id}-error`;
  return (
    <li className={`glass rounded-2xl ${selected ? "border-mandarina" : ""}`}>
      <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-4 py-2.5 ${FOCUS_WITHIN}`}>
        {mark}
        <span className="min-w-0 flex-1 text-[16px] font-bold">{name}</span>
        <input type="checkbox" checked={selected} onChange={onToggle} className="peer sr-only" />
        <span
          aria-hidden
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[14px] font-extrabold ${
            selected ? "border-mandarina bg-mandarina text-bg" : "border-rule-strong text-transparent"
          }`}
        >
          ✓
        </span>
      </label>
      {selected ? (
        <div className="mx-4 flex items-center gap-2 border-t border-rule py-3">
          <label htmlFor={inputId} className="sr-only">
            {`${name}: ${amountLabel}`}
          </label>
          <span aria-hidden className="text-[18px] text-ink-soft">
            $
          </span>
          <input
            id={inputId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            placeholder="0"
            aria-invalid={amountError ? true : undefined}
            aria-describedby={amountError ? errorId : undefined}
            onChange={(e) => onAmountChange(sanitizeAmount(e.target.value))}
            className="min-h-11 min-w-0 flex-1 rounded-lg bg-transparent px-1 font-display text-[20px] font-extrabold tracking-[-0.02em] text-ink placeholder:text-ink-mute"
          />
          <span className="text-[13px] font-bold text-ink-mute">{currency}</span>
        </div>
      ) : null}
      {selected && amountError ? (
        <p id={errorId} role="alert" className="-mt-1 px-4 pb-3 text-[13px] font-semibold text-red">
          {amountError}
        </p>
      ) : null}
    </li>
  );
}

/** Un campo de texto de una línea con su etiqueta visible. */
export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  maxLength,
  autoComplete,
  inputMode,
  onEnter,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  type?: "text" | "email" | "search";
  maxLength?: number;
  autoComplete?: string;
  inputMode?: "email" | "search" | "text";
  onEnter?: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-bold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        autoCapitalize="none"
        spellCheck={false}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className="glass-lite min-h-12 w-full rounded-2xl px-4 text-[17px] font-semibold text-ink placeholder:font-normal placeholder:text-ink-mute"
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-[13px] font-semibold text-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FOCUS_WITHIN };
