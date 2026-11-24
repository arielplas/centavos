import type { SiteLang } from "@/lib/lang";

export type ObstacleKind = "ant" | "cup" | "receipt";

export type RunnerCopy = {
  dialogLabel: string;
  kicker: string;
  title: [string, string, string];
  intro: string;
  play: string;
  orPress: string;
  space: string;
  tapHint: string;
  close: string;
  saved: string;
  best: string;
  oops: string;
  caughtBy: Record<ObstacleKind, string>;
  newBest: string;
  again: string;
  exit: string;
  antLabel: string;
  cupLabel: string;
};

export const RUNNER_COPY: Record<SiteLang, RunnerCopy> = {
  es: {
    dialogLabel: "Corre, centavo: un minijuego",
    kicker: "corre, centavo",
    title: ["Corre, ", "centavo", "."],
    intro: "Salta los gastos hormiga y junta monedas. Cada peso que esquivas es un peso que ahorras.",
    play: "Jugar",
    orPress: "o presiona",
    space: "espacio",
    tapHint: "toca en cualquier lado para saltar",
    close: "Cerrar juego",
    saved: "Ahorrado",
    best: "Récord",
    oops: "ups…",
    caughtBy: {
      ant: "Te ganó un gasto hormiga.",
      cup: "Te ganó un café.",
      receipt: "Te ganó un ticket.",
    },
    newBest: "¡nuevo récord!",
    again: "Otra vez",
    exit: "Salir",
    antLabel: "gasto hormiga",
    cupLabel: "café $65",
  },
  en: {
    dialogLabel: "Run, centavo: a mini game",
    kicker: "run, centavo",
    title: ["Run, ", "centavo", "."],
    intro: "Jump over the little everyday expenses and grab coins. Every peso you dodge is a peso you save.",
    play: "Play",
    orPress: "or press",
    space: "space",
    tapHint: "tap anywhere to jump",
    close: "Close game",
    saved: "Saved",
    best: "Best",
    oops: "oops…",
    caughtBy: {
      ant: "A little expense got you.",
      cup: "A coffee got you.",
      receipt: "A receipt got you.",
    },
    newBest: "new best!",
    again: "Again",
    exit: "Exit",
    antLabel: "little expense",
    cupLabel: "coffee $65",
  },
};
