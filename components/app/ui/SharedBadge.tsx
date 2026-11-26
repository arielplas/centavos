"use client";

// <SharedBadge>: la píldora «Compartido» de un presupuesto compartido, con el
// ícono `account-multiple` sobre `sand`. La de la app, con el texto de
// `budgets:shared` (allá está escrito en español).

import { useT } from "@/components/app/LanguageProvider";
import { Icon } from "./Icon";

export function SharedBadge({ className }: { className?: string }) {
  const t = useT();
  return (
    <span
      className={`inline-flex items-center gap-[3px] rounded-full bg-sand px-2 py-0.5 text-[10px] font-extrabold leading-4 tracking-[0.3px] text-ink ${className ?? ""}`}
    >
      <Icon name="account-multiple" size={11} />
      {t("budgets:shared")}
    </span>
  );
}
