"use client";

import { useState, type Ref } from "react";
import { useT } from "@/components/app/LanguageProvider";
import { errorClass, fieldClass, labelClass } from "./styles";

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Mensaje ya traducido. Se liga con `aria-describedby` y `aria-invalid`. */
  error?: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  inputMode?: "email" | "text";
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  /** Espacio a la derecha para un botón dentro del campo. */
  trailing?: React.ReactNode;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  maxLength,
  disabled,
  autoFocus,
  inputRef,
  trailing,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoFocus={autoFocus}
          autoCapitalize={type === "text" ? undefined : "none"}
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${fieldClass} ${trailing ? "pr-28" : ""}`}
        />
        {trailing}
      </div>
      {error && (
        <p id={errorId} role="alert" className={`${errorClass} mt-1.5`}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Contraseña con el botón de ver / ocultar (`common:fields.*`). */
export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const t = useT();
  const [shown, setShown] = useState(false);
  return (
    <TextField
      {...props}
      type={shown ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          disabled={props.disabled}
          className="absolute inset-y-0 right-1 min-w-11 px-3 text-[12px] font-bold text-ink-soft hover:text-ink cursor-pointer"
        >
          {shown ? t("common:fields.hidePassword") : t("common:fields.showPassword")}
        </button>
      }
    />
  );
}

/** Error del formulario, anunciado de inmediato. */
export function FormError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className={errorClass}>
      <span aria-hidden>⚠ </span>
      {children}
    </p>
  );
}
