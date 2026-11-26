"use client";

// <Dropdown>: un desplegable accesible (botón + lista `role="listbox"`), el
// `Dropdown` de la app. Lo usan el MonthPicker de Presupuestos y el filtro de
// categoría de Gastos.
//
//   <Dropdown
//     label={t("expenses:history.filterByCategory")}   // nombre accesible del botón y de la lista
//     options={[{ key: "all", label: t("expenses:history.allCategories") }, …]}
//     selectedKey={category ?? "all"}
//     onSelect={(key) => …}
//   />
//
// Teclado: Enter / Espacio / ↓ abren; ↑ ↓ Inicio Fin mueven; Enter / Espacio eligen;
// Esc cierra y devuelve el foco al botón; Tab cierra. Clic fuera cierra.
// Una opción NO se deshabilita para mostrar un candado: queda tocable y quien
// usa el desplegable decide qué hacer (el MonthPicker muestra el aviso de Centavos+).

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./Icon";

export type DropdownOption = {
  key: string;
  label: string;
  /** Una segunda línea chica (el año de un mes que no es de este año). */
  sublabel?: string;
  /** A la derecha de la etiqueta: la insignia «Centavos+». */
  badge?: ReactNode;
  /** A la izquierda: el ícono de una categoría. */
  icon?: ReactNode;
};

export type DropdownProps = {
  options: readonly DropdownOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  /** Nombre accesible del botón y de la lista. */
  label: string;
  className?: string;
  /** Alinea la lista al borde derecho del botón. */
  alignEnd?: boolean;
};

export function Dropdown({ options, selectedKey, onSelect, label, className, alignEnd }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const listId = useId();
  // Espacio elige al apretar y suelta sobre el botón (donde ya está el foco): sin esto, el «clic» de ese soltar la reabriría.
  const chosenAt = useRef(0);

  const selectedIndex = Math.max(0, options.findIndex((o) => o.key === selectedKey));
  const selected = options[selectedIndex];

  const openList = useCallback(() => {
    setActive(selectedIndex);
    setOpen(true);
  }, [selectedIndex]);

  const closeList = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }, []);

  // El foco sigue a la opción activa mientras está abierta.
  useEffect(() => {
    if (open) items.current[active]?.focus();
  }, [open, active]);

  // Clic o toque fuera cierra.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    chosenAt.current = Date.now();
    closeList(true);
    onSelect(option.key);
  };

  const onButtonKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openList();
    }
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        closeList(true);
        break;
      case "Tab":
        closeList(false);
        break;
    }
  };

  return (
    <div ref={root} className={`relative ${className ?? ""}`}>
      <button
        ref={button}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${selected?.label ?? ""}`}
        onClick={() => {
          if (Date.now() - chosenAt.current < 400) return;
          if (open) closeList(false);
          else openList();
        }}
        onKeyDown={onButtonKey}
        className="glass-lite flex min-h-[44px] w-full items-center gap-2 rounded-2xl px-4 py-2 text-left text-body-bold font-bold text-ink"
      >
        {selected?.icon}
        <span className="min-w-0 flex-1 truncate">
          {selected?.label}
          {selected?.sublabel ? <span className="ml-1.5 text-small font-normal text-ink-soft">{selected.sublabel}</span> : null}
        </span>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={20} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={onListKey}
          className={`absolute z-30 mt-2 max-h-72 min-w-full overflow-auto rounded-2xl border border-rule bg-surface py-1 shadow-cv-md ${alignEnd ? "right-0" : "left-0"}`}
        >
          {options.map((o, i) => (
            <li
              key={o.key}
              ref={(el) => {
                items.current[i] = el;
              }}
              role="option"
              aria-selected={o.key === selectedKey}
              tabIndex={i === active ? 0 : -1}
              onClick={() => choose(i)}
              className={`flex min-h-[44px] cursor-pointer items-center gap-3 px-4 py-2 text-body text-ink hover:bg-sand/60 focus:bg-sand/60 ${o.key === selectedKey ? "font-bold" : ""}`}
            >
              {o.icon}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{o.label}</span>
                {o.sublabel ? <span className="block text-small text-ink-soft">{o.sublabel}</span> : null}
              </span>
              {o.badge}
              {o.key === selectedKey ? (
                // La app marca la elegida con «✓» en un disco tinta (§4.7: sin íconos inventados).
                <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-extrabold leading-none text-bg">
                  ✓
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
