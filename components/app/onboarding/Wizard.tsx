"use client";

// El wizard de /app/bienvenida (docs/app-web.md §5.8, D6). Mismos pasos y orden
// que el de la app móvil:
//
//   moneda → propósito ─┬─ personal: presupuestos → suscripciones (terminar)
//                       └─ viaje:    nombre → invitar (terminar) → resumen
//
// Omitir está siempre a la mano. Terminar o omitir llama a la API, marca la
// cuenta como configurada en la sesión, la refresca y va al `next` válido o al Pulso.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useErrorText, useLang } from "@/components/app/LanguageProvider";
import { useSession } from "@/components/app/SessionProvider";
import { getOnboardingCatalog, type OnboardingApplyResponse } from "@/lib/app/api";
import { DEFAULT_AFTER_LOGIN, nextFromSearch } from "@/lib/app/next-param";
import {
  NO_PICKS,
  budgetPicks,
  createKeyHolder,
  initialCurrency,
  isValidTripName,
  personalBody,
  subscriptionPicks,
  submitApply,
  submitSkip,
  tripBody,
  type Picks,
} from "./logic";
import { BudgetsStep, CurrencyStep, DoneStep, InvitesStep, PurposeStep, SubscriptionsStep, TripNameStep, type CatalogState } from "./steps";

type StepId = "moneda" | "proposito" | "presupuestos" | "suscripciones" | "viaje_nombre" | "viaje_invitar" | "resumen";

export function Wizard() {
  const errorText = useErrorText();
  const { lang } = useLang();
  const { user, updateUser, refreshUser } = useSession();
  const router = useRouter();

  // La ruta del wizard es una pila: Atrás saca el último paso.
  const [stack, setStack] = useState<StepId[]>(["moneda"]);
  const step = stack[stack.length - 1];
  const go = useCallback((next: StepId) => setStack((s) => [...s, next]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);

  const [currency, setCurrency] = useState(() => initialCurrency(user?.currency));
  const [budgetSel, setBudgetSel] = useState<Picks>(NO_PICKS);
  const [subSel, setSubSel] = useState<Picks>(NO_PICKS);
  const [tripName, setTripName] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [invites, setInvites] = useState<NonNullable<OnboardingApplyResponse["invites"]> | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyFor = useRef(createKeyHolder()).current;

  // ─── Adónde ir al terminar ───────────────────────────────────────────────

  const goToApp = useCallback(
    async (patch: { currency?: string; language?: string } = {}) => {
      // Primero en memoria, para que la guardia no devuelva aquí si /me falla.
      updateUser({ onboarded: true, ...patch });
      await refreshUser();
      router.replace(nextFromSearch(window.location.search) ?? DEFAULT_AFTER_LOGIN);
    },
    [updateUser, refreshUser, router],
  );

  // Quien ya está configurada (otra pestaña, otro dispositivo) no ve el wizard.
  // El resumen del viaje se queda: la cuenta aún no se marca hasta «Ir a la app».
  useEffect(() => {
    if (user?.onboarded === true && invites === null) {
      router.replace(nextFromSearch(window.location.search) ?? DEFAULT_AFTER_LOGIN);
    }
  }, [user?.onboarded, invites, router]);

  // ─── Catálogo (moneda + idioma) ──────────────────────────────────────────

  const catalogKey = `${currency}|${lang}`;
  const [catalogState, setCatalogState] = useState<{ key: string; state: CatalogState } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const needsCatalog = step === "presupuestos" || step === "suscripciones";
  const haveCatalog = catalogState?.key === catalogKey && catalogState.state.phase === "ready";

  useEffect(() => {
    if (!needsCatalog || haveCatalog) return;
    let cancelled = false;
    setCatalogState({ key: catalogKey, state: { phase: "loading" } });
    getOnboardingCatalog({ currency, language: lang }).then(
      (catalog) => {
        if (cancelled) return;
        setCatalogState({ key: catalogKey, state: { phase: "ready", catalog } });
        // Otra moneda u otro idioma: los montos del catálogo anterior ya no valen.
        setBudgetSel(NO_PICKS);
        setSubSel(NO_PICKS);
      },
      () => {
        if (!cancelled) setCatalogState({ key: catalogKey, state: { phase: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
    // `attempt` reintenta tras un error.
  }, [needsCatalog, haveCatalog, catalogKey, currency, lang, attempt]);

  const catalogCurrent = useMemo<CatalogState>(
    () => (catalogState?.key === catalogKey ? catalogState.state : { phase: "loading" }),
    [catalogState, catalogKey],
  );

  // ─── Terminar ────────────────────────────────────────────────────────────

  const run = useCallback(
    async (work: () => Promise<void>) => {
      if (busy) return;
      setBusy(true);
      setError(null);
      try {
        await work();
      } catch (e) {
        setError(errorText(e as Parameters<typeof errorText>[0]));
        setBusy(false);
        return;
      }
      // Tras ir a la app la pantalla se desmonta; en el resumen se sigue aquí.
      setBusy(false);
    },
    [busy, errorText],
  );

  const skip = useCallback(
    () =>
      run(async () => {
        await submitSkip();
        await goToApp();
      }),
    [run, goToApp],
  );

  const finishPersonal = useCallback(() => {
    if (catalogCurrent.phase !== "ready") return;
    const { catalog } = catalogCurrent;
    return run(async () => {
      const body = personalBody({
        currency,
        language: lang,
        budgets: budgetPicks(catalog.budgets, budgetSel),
        subscriptions: subscriptionPicks(catalog.subscriptions, subSel),
      });
      // Un 409 (otra pestaña ya terminó) también sigue a la app.
      await submitApply(body, keyFor(body));
      await goToApp({ currency, language: lang });
    });
  }, [catalogCurrent, run, currency, lang, budgetSel, subSel, keyFor, goToApp]);

  const finishTrip = useCallback(
    (invitees: string[]) =>
      run(async () => {
        const body = tripBody({ currency, language: lang, tripName, invites: invitees });
        const outcome = await submitApply(body, keyFor(body));
        if (outcome.kind === "done" && outcome.response.invites && outcome.response.invites.length > 0) {
          // Se muestra cómo salió cada invitación antes de pasar a la app.
          setInvites(outcome.response.invites);
          setStack((s) => [...s, "resumen"]);
          return;
        }
        await goToApp({ currency, language: lang });
      }),
    [run, currency, lang, tripName, keyFor, goToApp],
  );

  const enterApp = useCallback(() => run(() => goToApp({ currency, language: lang })), [run, goToApp, currency, lang]);

  // ─── Pasos ───────────────────────────────────────────────────────────────

  const common = useMemo(() => ({ onSkip: skip, skipDisabled: busy, error }), [skip, busy, error]);

  switch (step) {
    case "moneda":
      return <CurrencyStep key={step} {...common} currency={currency} onCurrency={setCurrency} onContinue={() => go("proposito")} />;
    case "proposito":
      return <PurposeStep key={step} {...common} onBack={back} onChoose={(p) => go(p === "personal" ? "presupuestos" : "viaje_nombre")} />;
    case "presupuestos":
      return (
        <BudgetsStep
          key={step}
          {...common}
          onBack={back}
          currency={currency}
          catalog={catalogCurrent}
          onRetry={() => setAttempt((n) => n + 1)}
          picks={budgetSel}
          onPicks={setBudgetSel}
          onContinue={() => go("suscripciones")}
        />
      );
    case "suscripciones":
      return (
        <SubscriptionsStep
          key={step}
          {...common}
          onBack={back}
          currency={currency}
          catalog={catalogCurrent}
          onRetry={() => setAttempt((n) => n + 1)}
          picks={subSel}
          onPicks={setSubSel}
          busy={busy}
          onFinish={finishPersonal}
        />
      );
    case "viaje_nombre":
      return (
        <TripNameStep
          key={step}
          {...common}
          onBack={back}
          name={tripName}
          onName={setTripName}
          onContinue={() => isValidTripName(tripName) && go("viaje_invitar")}
        />
      );
    case "viaje_invitar":
      return (
        <InvitesStep
          key={step}
          {...common}
          onBack={back}
          ownEmail={user?.email}
          emails={emails}
          onEmails={setEmails}
          busy={busy}
          onFinish={finishTrip}
        />
      );
    case "resumen":
      return <DoneStep key={step} invites={invites ?? []} busy={busy} error={error} onDone={enterApp} />;
  }
}
