"use client";

import { useState, type ReactNode } from "react";

/**
 * Step 2 of the connection: where to get the code, in the app or on the web.
 * The two instructions arrive already rendered (they hold links and bold runs);
 * only the choice of tab lives here. Both stay in the HTML; the inactive one is
 * `hidden`.
 */
export function ConnectTabs({
  groupLabel,
  tabApp,
  tabWeb,
  app,
  web,
}: {
  groupLabel: string;
  tabApp: string;
  tabWeb: string;
  app: ReactNode;
  web: ReactNode;
}) {
  const [tab, setTab] = useState<"app" | "web">("app");

  const tabClass = (on: boolean) =>
    `min-h-11 rounded-full px-4 text-[14px] font-extrabold ${
      on ? "bg-surface text-ink shadow-[0_2px_8px_-3px_rgb(42_26_16/.3)]" : "text-ink-soft hover:text-ink"
    }`;

  return (
    <>
      <div role="group" aria-label={groupLabel} className="inline-flex self-start rounded-full bg-sand p-1">
        <button type="button" aria-pressed={tab === "app"} onClick={() => setTab("app")} className={tabClass(tab === "app")}>
          {tabApp}
        </button>
        <button type="button" aria-pressed={tab === "web"} onClick={() => setTab("web")} className={tabClass(tab === "web")}>
          {tabWeb}
        </button>
      </div>
      <p hidden={tab !== "app"} className="text-[15px] leading-relaxed text-ink-soft">
        {app}
      </p>
      <p hidden={tab !== "web"} className="text-[15px] leading-relaxed text-ink-soft">
        {web}
      </p>
    </>
  );
}
