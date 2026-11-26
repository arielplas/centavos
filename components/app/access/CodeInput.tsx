"use client";

// El código de 6 dígitos: UN solo <input> (docs/app-web.md, Apéndice A) dibujado
// como seis casillas. Así funcionan el autocompletado del navegador
// (`one-time-code`), el pegado y los lectores de pantalla, que no ven seis
// campos sino uno. El <input> cubre las casillas, transparente; las casillas
// son solo dibujo (`aria-hidden`).

import { useState, type ClipboardEvent, type Ref } from "react";
import { codeSlots, isCodeComplete, sanitizeCode } from "./code";
import { LIMITS } from "./validation";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Se llama al llegar a 6 dígitos tecleando, pegando o autocompletando. */
  onComplete?: (code: string) => void;
  /** Id del texto que nombra el campo («Te mandamos un código a…»). */
  labelledBy: string;
  /** Id del mensaje de error, si hay. */
  errorId?: string;
  invalid?: boolean;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
};

export function CodeInput({ id, value, onChange, onComplete, labelledBy, errorId, invalid, disabled, inputRef }: Props) {
  const [focused, setFocused] = useState(false);
  const slots = codeSlots(value);
  const active = Math.min(value.length, LIMITS.CODE_LEN - 1);

  function update(raw: string) {
    const next = sanitizeCode(raw);
    onChange(next);
    if (isCodeComplete(next) && !isCodeComplete(value)) onComplete?.(next);
  }

  // `maxlength` recorta lo pegado antes de que lo veamos («123 456» queda en
  // «123 45»): se lee el portapapeles y se limpia aquí.
  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    update(event.clipboardData.getData("text"));
  }

  return (
    <div className="relative">
      <div aria-hidden className="grid grid-cols-6 gap-2">
        {slots.map((digit, i) => (
          <div
            key={i}
            className={`flex h-14 items-center justify-center rounded-[14px] border-[1.5px] bg-surface text-[24px] font-extrabold tabular-nums text-ink sm:h-16 ${
              invalid ? "border-mandarina-deep" : digit ? "border-mandarina" : "border-rule-strong"
            } ${focused && !disabled && i === active ? "ring-2 ring-ink" : ""} ${disabled ? "opacity-60" : ""}`}
          >
            {digit}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        id={id}
        name={id}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={LIMITS.CODE_LEN}
        value={value}
        onChange={(e) => update(e.target.value)}
        onPaste={onPaste}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        aria-labelledby={labelledBy}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={errorId}
        spellCheck={false}
        autoCapitalize="none"
        className="absolute inset-0 h-full w-full cursor-text opacity-0 disabled:cursor-not-allowed"
      />
    </div>
  );
}
