"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import type { SiteLang } from "@/lib/lang";
import { RUNNER_COPY, type ObstacleKind } from "./copy";

/**
 * "Corre, centavo": the landing's hidden runner (three taps on the navbar
 * logo). The centavos coin rolls along a notebook page and jumps over gastos
 * hormiga (ants, coffees, receipts) while it picks up coins.
 *
 * The page, the header and the text are HTML; the moving scene is a <canvas>
 * drawn with the same shapes as the Claude Design comps. It opens from the
 * logo's coin (an orange burst, then the page revealed with clip-path) and
 * closes back into it. Loaded on demand, so it costs the landing nothing.
 */

type Phase = "intro" | "playing" | "over";
type Point = { x: number; y: number };
type Obstacle = { kind: ObstacleKind; x: number };
type Coin = { x: number; h: number; taken: boolean };
type Popup = { x: number; y: number; t: number };
type Result = { kind: ObstacleKind; score: number; newBest: boolean };

const INK = "#2a1a10";
const INK_SOFT = "#6e5849";
const MANDARINA = "#ed7e3c";
const DEEP = "#a84a22";
const YOLK = "#f5b833";
const SAND = "#f5dcb8";
const RULE_STRONG = "#a08a6a";
const TAU = Math.PI * 2;

/** Sprite boxes (px) and their hit boxes [x0, y0, x1, y1], a little forgiving. */
const SPRITES: Record<ObstacleKind, { w: number; h: number; hit: [number, number, number, number] }> = {
  ant: { w: 54, h: 26, hit: [3, 9, 51, 26] },
  cup: { w: 38, h: 48, hit: [6, 16, 32, 48] },
  receipt: { w: 34, h: 56, hit: [4, 6, 30, 56] },
};

const BEST_KEY = "centavos:runner-best";
const GRAVITY = 2600; // px/s²
const JUMP_V = 900; // px/s → ~155 px apex
const START_SPEED = 360; // px/s
const MAX_SPEED = 860;
const ACCEL = 9; // px/s per second
const COIN_VALUE = 5; // pesos per coin
const PX_PER_PESO = 150; // distance that earns one peso
const COIN_R = 12;
const COIN_GAP = 34; // px between coins in a row or arc
const RESTART_GUARD_MS = 450;
/** Clear ground (px) a coin arc in a gap keeps from the jumps around it. */
const ARC_MARGIN = 40;

/** Horizontal distance (px) a full jump covers at `speed`, takeoff to landing. */
function jumpSpan(speed: number) {
  return (2 * speed * JUMP_V) / GRAVITY;
}

const EASE_OUT = "cubic-bezier(.22, 1, .36, 1)";

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}
function writeBest(v: number) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* private mode: the best score just lasts this visit */
  }
}

/** Deterministic noise for the pencil dashes under the ground line. */
function hash(k: number) {
  const s = Math.sin(k * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function pickKind(): ObstacleKind {
  const r = Math.random();
  return r < 0.45 ? "ant" : r < 0.75 ? "cup" : "receipt";
}

export default function RunnerGame({
  lang,
  origin,
  onClose,
}: {
  lang: SiteLang;
  /** Viewport point the game grows out of (the logo's coin) and shrinks back into. */
  origin: Point;
  onClose: () => void;
}) {
  const t = RUNNER_COPY[lang];

  const [phase, setPhaseState] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(readBest);
  const [result, setResult] = useState<Result | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const againRef = useRef<HTMLButtonElement>(null);

  const phaseRef = useRef<Phase>("intro");
  /** What the coin ran into, for the knocked-over pose (null: no hit yet). */
  const hitRef = useRef<ObstacleKind | null>(null);
  const closingRef = useRef(false);
  const bestRef = useRef(best);
  const world = useRef({
    W: 0,
    H: 0,
    ground: 0,
    px: 0,
    r: 22,
    mobile: false,
    dist: 0,
    speed: START_SPEED,
    y: 0, // height above the ground
    vy: 0,
    bufferedAt: -1e9,
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    popups: [] as Popup[],
    nextSpawn: 0,
    coinsTaken: 0,
    score: 0,
    deadAt: 0,
  });

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const reducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Game actions ────────────────────────────────────────────────
  const start = useCallback(() => {
    const w = world.current;
    w.dist = 0;
    w.speed = START_SPEED;
    w.y = 0;
    w.vy = 0;
    w.bufferedAt = -1e9;
    w.obstacles = [];
    w.coins = [];
    w.popups = [];
    w.nextSpawn = Math.max(260, w.W * 0.55);
    w.coinsTaken = 0;
    w.score = 0;
    hitRef.current = null;
    setScore(0);
    setResult(null);
    setPhase("playing");
  }, [setPhase]);

  const jump = useCallback(() => {
    const w = world.current;
    if (w.y <= 0 && w.vy <= 0) w.vy = JUMP_V;
    else w.bufferedAt = performance.now(); // pressed just before landing: jump on touchdown
  }, []);

  /** Space / tap: jump while playing, otherwise (re)start. */
  const act = useCallback(() => {
    const p = phaseRef.current;
    if (p === "playing") jump();
    else if (p === "intro") start();
    else if (performance.now() - world.current.deadAt > RESTART_GUARD_MS) start();
  }, [jump, start]);

  const die = useCallback(
    (kind: ObstacleKind) => {
      const w = world.current;
      w.deadAt = performance.now();
      hitRef.current = kind;
      const newBest = w.score > bestRef.current;
      if (newBest) {
        bestRef.current = w.score;
        setBest(w.score);
        writeBest(w.score);
      }
      setResult({ kind, score: w.score, newBest });
      setPhase("over");
    },
    [setPhase],
  );

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    phaseRef.current = phaseRef.current === "playing" ? "over" : phaseRef.current; // freeze the scene
    const dialog = dialogRef.current;
    const backdrop = backdropRef.current;
    if (!dialog || !backdrop || reducedMotion()) return onClose();
    const r = dialog.getBoundingClientRect();
    const ox = origin.x - r.left;
    const oy = origin.y - r.top;
    const far = Math.hypot(Math.max(ox, r.width - ox), Math.max(oy, r.height - oy));
    const shrink = dialog.animate(
      [{ clipPath: `circle(${far}px at ${ox}px ${oy}px)` }, { clipPath: `circle(0px at ${ox}px ${oy}px)` }],
      { duration: 380, easing: "cubic-bezier(.55, 0, .75, .2)", fill: "forwards" },
    );
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 120, fill: "forwards" });
    shrink.finished.then(onClose, onClose);
  }, [onClose, origin]);

  // ── Opening animation (before first paint, so nothing flashes) ──
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const burst = burstRef.current;
    const backdrop = backdropRef.current;
    if (!dialog || !burst || !backdrop) return;
    if (reducedMotion()) {
      burst.style.display = "none";
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const farScreen = Math.hypot(Math.max(origin.x, vw - origin.x), Math.max(origin.y, vh - origin.y));
    const at = `at ${origin.x}px ${origin.y}px`;
    burst.animate([{ clipPath: `circle(0px ${at})` }, { clipPath: `circle(${farScreen}px ${at})` }], {
      duration: 520,
      easing: EASE_OUT,
      fill: "both",
    });
    burst.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 480, fill: "forwards" });
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 220, fill: "backwards" });

    const r = dialog.getBoundingClientRect();
    const ox = origin.x - r.left;
    const oy = origin.y - r.top;
    const far = Math.hypot(Math.max(ox, r.width - ox), Math.max(oy, r.height - oy));
    dialog.animate(
      [{ clipPath: `circle(0px at ${ox}px ${oy}px)` }, { clipPath: `circle(${far}px at ${ox}px ${oy}px)` }],
      { duration: 560, delay: 140, easing: EASE_OUT, fill: "backwards" },
    );
    dialog.querySelectorAll<HTMLElement>("[data-enter]").forEach((el, i) => {
      el.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 320, delay: 520 + i * 60, easing: EASE_OUT, fill: "backwards" },
      );
    });
  }, [origin]);

  // ── Page plumbing: scroll lock, focus, keys ─────────────────────
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    playRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (closingRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab") {
        // Keep focus inside the dialog.
        const focusables = Array.from(
          rootRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        const inside = rootRef.current?.contains(active);
        if (e.shiftKey && (active === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      const isJump = e.code === "Space" || e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W";
      if (!isJump) return;
      // Outside a run, Space on a focused button activates that button.
      const onButton = (e.target as HTMLElement | null)?.closest?.("button");
      if (phaseRef.current !== "playing" && onButton && (e.code === "Space" || e.key === " ")) return;
      e.preventDefault();
      if (e.repeat) return;
      act();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
    };
  }, [act, close]);

  // Focus the main action of each screen.
  useEffect(() => {
    if (phase === "over") againRef.current?.focus({ preventScroll: true });
  }, [phase]);

  // ── The scene ───────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const box = dialogRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !box || !ctx) return;

    const css = getComputedStyle(document.documentElement);
    const hand = css.getPropertyValue("--font-caveat").trim() || "cursive";
    const display = css.getPropertyValue("--font-bricolage").trim() || "system-ui";

    const P = {
      antLegsA: new Path2D("M14 18l-4 7M20 18l0 7M27 18l4 7M33 18l-3 7M40 18l4 7"),
      antLegsB: new Path2D("M14 18l0 7M20 18l3 7M27 18l0 7M33 18l2 7M40 18l0 7"),
      antAntennae: new Path2D("M48 9c3-4 5-6 6-8M46 8c1-4 1-6 0-8"),
      steam: new Path2D("M12 2c-3 4 3 6 0 10M22 2c-3 4 3 6 0 10"),
      cup: new Path2D("M6 22h26l-3 26H9z"),
      receipt: new Path2D("M3 54V4l5 3 5-3 5 3 5-3 5 3 3-3v50z"),
      receiptLines: new Path2D("M9 16h16M9 23h12M9 30h16M9 42h16"),
      impact: new Path2D("M-20 -6l-6-8M0 -10V-24M20 -6l6-8"),
    };

    let dpr = 1;
    const resize = () => {
      const w = world.current;
      const rect = box.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w.W = rect.width;
      w.H = rect.height;
      w.mobile = !window.matchMedia("(min-width: 768px)").matches;
      w.ground = Math.round(w.mobile ? w.H * 0.64 : w.H - 80);
      w.r = w.mobile ? 20 : 22;
      w.px = w.mobile ? 48 + w.r : 96 + w.r;
      canvas.width = Math.round(w.W * dpr);
      canvas.height = Math.round(w.H * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();

    // ── simulation ──
    const spawn = () => {
      const w = world.current;
      const kind = pickKind();
      const x = w.W + 40;
      w.obstacles.push({ kind, x });
      const minGap = w.speed * 0.55 + 150;
      const gap = minGap + Math.random() * 320;
      w.nextSpawn = gap;
      const roll = Math.random();
      if (roll < 0.35) {
        // Coins on the path of a jump that peaks over the obstacle: a clean
        // jump collects them all.
        jumpArc(x + SPRITES[kind].w / 2);
      } else if (roll < 0.55 && gap >= 2 * jumpSpan(w.speed) + SPRITES[kind].w + 2 * ARC_MARGIN) {
        // The same kind of arc in the open gap, for a jump done just for coins.
        // Only when the gap fits it: land from this obstacle, jump for the
        // coins, land, and still have room to jump the next one.
        jumpArc(x + gap / 2);
      } else if (roll < 0.8) {
        // A row on the ground, collected by just rolling through.
        const n = 2 + Math.floor(Math.random() * 3);
        const mid = x + gap / 2 - ((n - 1) * COIN_GAP) / 2;
        for (let i = 0; i < n; i++) w.coins.push({ x: mid + i * COIN_GAP, h: w.r - COIN_R, taken: false });
      }
    };

    /**
     * Five coins along the coin's own jump path (same speed, gravity and jump
     * power), peaking at `apexX`. Placed a little under the path so a jump
     * that is a bit early or late still collects most of them.
     */
    const jumpArc = (apexX: number) => {
      const w = world.current;
      const apex = (JUMP_V * JUMP_V) / (2 * GRAVITY);
      for (let i = -2; i <= 2; i++) {
        const dx = i * COIN_GAP;
        const tt = dx / w.speed;
        const lift = (apex - 0.5 * GRAVITY * tt * tt) * 0.9;
        if (lift < 30) continue;
        // h is the coin's bottom above the ground; the player's centre rides at r + lift.
        w.coins.push({ x: apexX + dx, h: w.r + lift - COIN_R, taken: false });
      }
    };

    const step = (dt: number, now: number) => {
      const w = world.current;
      w.speed = Math.min(MAX_SPEED, w.speed + ACCEL * dt);
      const dx = w.speed * dt;
      w.dist += dx;

      if (w.y > 0 || w.vy > 0) {
        w.vy -= GRAVITY * dt;
        w.y += w.vy * dt;
        if (w.y <= 0) {
          w.y = 0;
          w.vy = 0;
          if (now - w.bufferedAt < 130) {
            w.vy = JUMP_V;
            w.bufferedAt = -1e9;
          }
        }
      }

      w.nextSpawn -= dx;
      if (w.nextSpawn <= 0) spawn();
      for (const o of w.obstacles) o.x -= dx;
      for (const c of w.coins) c.x -= dx;
      w.obstacles = w.obstacles.filter((o) => o.x > -80);
      w.coins = w.coins.filter((c) => c.x > -40 && !c.taken);
      for (const p of w.popups) p.t += dt;
      w.popups = w.popups.filter((p) => p.t < 0.8);

      const cx = w.px;
      const cy = w.ground - w.r - w.y;

      for (const c of w.coins) {
        const ky = w.ground - c.h - COIN_R;
        // A few px of slack: grabbing a coin should feel generous.
        if (Math.hypot(c.x - cx, ky - cy) < w.r + COIN_R + 6) {
          c.taken = true;
          w.coinsTaken++;
          w.popups.push({ x: c.x, y: ky, t: 0 });
        }
      }

      const s = w.coinsTaken * COIN_VALUE + Math.floor(w.dist / PX_PER_PESO);
      if (s !== w.score) {
        w.score = s;
        setScore(s);
      }

      for (const o of w.obstacles) {
        const sp = SPRITES[o.kind];
        const top = w.ground - sp.h + 1;
        const x0 = o.x + sp.hit[0];
        const x1 = o.x + sp.hit[2];
        const y0 = top + sp.hit[1];
        const y1 = top + sp.hit[3];
        const nx = Math.max(x0, Math.min(cx, x1));
        const ny = Math.max(y0, Math.min(cy, y1));
        if ((nx - cx) ** 2 + (ny - cy) ** 2 < (w.r - 3) ** 2) {
          die(o.kind);
          return;
        }
      }
    };

    // ── drawing ──
    const drawPlayer = (x: number, y: number, r: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = MANDARINA;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,.08)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r - 2, 0.1, Math.PI / 2 - 0.1);
      ctx.stroke();
      ctx.rotate(angle - (12 * Math.PI) / 180);
      const bw = r * 0.91;
      ctx.fillStyle = INK;
      ctx.fillRect(-bw / 2, -1.5, bw, 3); // not roundRect: missing before Safari 16
      ctx.restore();
    };

    const drawObstacle = (kind: ObstacleKind, x: number, top: number, now: number) => {
      ctx.save();
      ctx.translate(x, top);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (kind === "ant") {
        ctx.translate(0, Math.sin(now / 60) > 0 ? 0 : -0.8);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2;
        ctx.stroke(Math.floor(now / 90) % 2 ? P.antLegsA : P.antLegsB);
        ctx.stroke(P.antAntennae);
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(12, 15, 10, 7, 0, 0, TAU);
        ctx.ellipse(28, 15, 6, 5, 0, 0, TAU);
        ctx.moveTo(50, 12);
        ctx.arc(44, 12, 6, 0, TAU);
        ctx.fill();
      } else if (kind === "cup") {
        ctx.save();
        ctx.translate(Math.sin(now / 240) * 1.5, 0);
        ctx.strokeStyle = RULE_STRONG;
        ctx.lineWidth = 2;
        ctx.stroke(P.steam);
        ctx.restore();
        ctx.fillStyle = SAND;
        ctx.fill(P.cup);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.stroke(P.cup);
        ctx.fillStyle = INK;
        ctx.fillRect(3, 16, 32, 6);
        ctx.fillStyle = MANDARINA;
        ctx.fillRect(9, 30, 20, 8);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fill(P.receipt);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.stroke(P.receipt);
        ctx.strokeStyle = RULE_STRONG;
        ctx.lineWidth = 2;
        ctx.stroke(P.receiptLines);
      }
      ctx.restore();
    };

    const drawCoin = (x: number, y: number, now: number) => {
      const sx = 0.3 + 0.7 * Math.abs(Math.cos(now / 260 + x * 0.013));
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(sx, 1);
      ctx.fillStyle = YOLK;
      ctx.strokeStyle = DEEP;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, COIN_R, 0, TAU);
      ctx.fill();
      ctx.stroke();
      if (sx > 0.6) {
        ctx.fillStyle = DEEP;
        ctx.font = `800 12px ${display}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", 0, 1);
      }
      ctx.restore();
    };

    const label = (text: string, x: number, y: number) => {
      ctx.fillStyle = INK_SOFT;
      ctx.font = `500 20px ${hand}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(text, x, y);
    };

    const render = (now: number) => {
      const w = world.current;
      const { W, H, ground: g, r } = w;
      const phaseNow = phaseRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Pencil ground line, with a gentle hand-drawn wobble that scrolls.
      const off = w.dist;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = 0; x <= W + 16; x += 16) {
        const y = g + Math.sin((x + off) * 0.011) * 1.6 + Math.sin((x + off) * 0.031) * 0.6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Pencil dashes below it.
      ctx.strokeStyle = RULE_STRONG;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const period = 120;
      for (let k = Math.floor(off / period) - 1; k * period - off < W + period; k++) {
        const x = k * period - off + hash(k) * 60;
        const len = 8 + hash(k + 7) * 10;
        const y = g + (hash(k + 3) > 0.5 ? 20 : 32);
        ctx.moveTo(x, y);
        ctx.lineTo(x + len, y);
      }
      ctx.stroke();

      if (phaseNow === "intro") {
        // The cast, introduced as in the start comp.
        const antX = Math.round(W * (w.mobile ? 0.58 : 0.62));
        const cupX = Math.round(W * (w.mobile ? 0.82 : 0.84));
        drawObstacle("ant", antX, g - SPRITES.ant.h + 1, now);
        drawObstacle("cup", cupX, g - SPRITES.cup.h + 1, now);
        label(t.antLabel, antX + 27, g - 36);
        label(t.cupLabel, cupX + 19, g - 60);
      }

      // After a hit only the culprit stays on the page, so the buttons read clean.
      if (phaseNow !== "over") for (const c of w.coins) if (!c.taken) drawCoin(c.x, g - c.h - COIN_R, now);
      for (const o of w.obstacles) drawObstacle(o.kind, o.x, g - SPRITES[o.kind].h + 1, now);

      // Soft shadow that shrinks as the coin rises.
      const k = 1 - Math.min(w.y / 220, 0.6);
      ctx.fillStyle = "rgba(42,26,16,.12)";
      ctx.beginPath();
      ctx.ellipse(w.px, g + 3, r * 0.85 * k, 3 * k, 0, 0, TAU);
      ctx.fill();

      const cy = g - r - w.y;
      const angle =
        phaseNow === "over" && hitRef.current ? -Math.PI / 2 : phaseNow === "intro" ? Math.sin(now / 420) * 0.12 : w.dist / r;
      drawPlayer(w.px, cy, r, angle);

      if (phaseNow === "over" && hitRef.current && w.mobile) {
        ctx.save();
        ctx.translate(w.px, cy - r);
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.stroke(P.impact);
        ctx.restore();
      }

      if (phaseNow !== "over") for (const p of w.popups) {
        ctx.globalAlpha = 1 - p.t / 0.8;
        ctx.fillStyle = DEEP;
        ctx.font = `500 24px ${hand}`;
        ctx.textAlign = "center";
        ctx.fillText(`+$${COIN_VALUE}`, p.x, p.y - 14 - p.t * 40);
        ctx.globalAlpha = 1;
      }
    };

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (phaseRef.current === "playing" && !closingRef.current) step(dt, now);
      render(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [die, t.antLabel, t.cupLabel]);

  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    act();
  };

  const pad = "left-5 right-5 md:left-[68px] md:right-10";

  return (
    <div ref={rootRef} className="fixed inset-0 z-[60]">
      <div ref={backdropRef} className="absolute inset-0 bg-ink/55" onClick={close} aria-hidden />
      <div ref={burstRef} className="absolute inset-0 bg-mandarina pointer-events-none" aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogLabel}
        onPointerDown={onPointerDown}
        // .paper is translucent for the site's glass look; the game needs a
        // solid page so the landing doesn't show through the scene.
        style={{ backgroundColor: "var(--color-surface)" }}
        className="paper absolute inset-0 overflow-hidden select-none touch-manipulation md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(760px,calc(100vw-32px))] md:h-[480px] md:rounded-[28px] md:shadow-[0_40px_80px_-20px_rgba(42,26,16,.45)]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />

        {/* Header: kicker, best, close */}
        <div data-enter className="absolute top-0 inset-x-0 flex items-center justify-between pt-4 md:pt-[18px] pl-5 md:pl-[68px] pr-4 md:pr-5">
          <span className="font-hand text-[24px] md:text-[26px] leading-none text-mandarina-deep">{t.kicker}</span>
          <div className="flex items-center gap-4">
            {best > 0 && (
              <span className="text-[12px] font-bold uppercase tracking-[.08em] text-ink-soft">
                {t.best}{" "}
                <span className="font-display text-[16px] tracking-normal text-ink">${best}</span>
              </span>
            )}
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="w-11 h-11 rounded-full bg-bg flex items-center justify-center hover:bg-sand transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        {phase === "intro" && (
          <div className={`absolute top-[88px] md:top-[96px] ${pad} pointer-events-none`}>
            <h2 data-enter className="m-0 font-display font-extrabold text-[44px] md:text-[64px] leading-[.95] tracking-[-0.035em]">
              {t.title[0]}
              <mark className="mark">{t.title[1]}</mark>
              {t.title[2]}
            </h2>
            <p data-enter className="mt-3 mb-0 text-[16px] md:text-[17px] leading-7 text-ink-soft max-w-[420px]">
              {t.intro}
            </p>
            <div data-enter className="mt-6 flex items-center gap-3">
              <button
                ref={playRef}
                type="button"
                onClick={start}
                className="pointer-events-auto min-h-12 px-6 rounded-full bg-ink text-bg font-extrabold text-[15px] hover:opacity-85"
              >
                {t.play}
              </button>
              <span className="hidden md:flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                {t.orPress}
                <kbd className="font-body text-[12px] font-extrabold px-2.5 py-1 rounded-lg bg-bg border-[1.5px] border-b-[3px] border-rule-strong text-ink">
                  {t.space}
                </kbd>
              </span>
            </div>
          </div>
        )}

        {phase === "playing" && (
          <div className={`absolute top-[76px] ${pad} pointer-events-none flex flex-col`}>
            <span className="text-[12px] font-bold uppercase tracking-[.08em] text-ink-soft">{t.saved}</span>
            <span className="font-display font-extrabold text-[56px] leading-none tracking-[-0.035em] tabular-nums">${score}</span>
          </div>
        )}

        {phase === "over" && result && (
          <div className={`absolute top-[80px] md:top-[70px] ${pad} pointer-events-none`}>
            <span className="font-hand text-[26px] text-ink-soft">{t.oops}</span>
            <h2 className="m-0 font-display font-extrabold text-[38px] md:text-[48px] leading-none tracking-[-0.035em]">
              {t.caughtBy[result.kind]}
            </h2>
            <div className="mt-4 flex flex-wrap items-end gap-x-9 gap-y-2">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold uppercase tracking-[.08em] text-ink-soft">{t.saved}</span>
                <span className="font-display font-extrabold text-[40px] leading-[1.1] tracking-[-0.03em]">
                  <mark className="mark">${result.score}</mark>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold uppercase tracking-[.08em] text-ink-soft">{t.best}</span>
                <span className="font-display font-extrabold text-[40px] leading-[1.1] tracking-[-0.03em]">${best}</span>
              </div>
              {result.newBest && result.score > 0 && (
                <span className="font-hand text-[24px] text-mandarina-deep -rotate-6 pb-2">{t.newBest}</span>
              )}
            </div>
            <div className="mt-4 md:mt-3 flex items-center gap-3">
              <button
                ref={againRef}
                type="button"
                onClick={() => {
                  if (performance.now() - world.current.deadAt > RESTART_GUARD_MS) start();
                }}
                className="pointer-events-auto min-h-12 px-6 rounded-full bg-ink text-bg font-extrabold text-[15px] hover:opacity-85"
              >
                {t.again}
              </button>
              <button
                type="button"
                onClick={close}
                className="pointer-events-auto min-h-12 px-5 rounded-full border-[1.5px] border-rule-strong text-ink font-bold text-[15px] hover:bg-bg"
              >
                {t.exit}
              </button>
            </div>
          </div>
        )}

        {/* Always mounted, so screen readers announce the result when it fills in. */}
        <p className="sr-only" aria-live="polite">
          {phase === "over" && result ? `${t.caughtBy[result.kind]} ${t.saved}: $${result.score}. ${t.best}: $${best}.` : ""}
        </p>

        {phase !== "over" && (
          <p
            data-enter
            className="md:hidden absolute inset-x-0 bottom-[max(48px,env(safe-area-inset-bottom))] m-0 text-center font-hand text-[24px] text-ink-soft pointer-events-none"
          >
            {t.tapHint}
          </p>
        )}
      </div>
    </div>
  );
}
