"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "other";

/**
 * Barra inferior fija (solo móvil) con el badge de la tienda que corresponde
 * al sistema del usuario. Aparece cuando el hero sale de pantalla y se oculta
 * mientras la sección #descargar (con los badges completos) está visible.
 * Usa scroll + getBoundingClientRect (mismo patrón que BackToTop).
 */
export function MobileDownloadBar({ storeUrl, playUrl }: { storeUrl: string; playUrl: string }) {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) setPlatform("android");
    else if (/iphone|ipad|ipod/i.test(ua)) setPlatform("ios");

    const hero = document.getElementById("hero");
    const cierre = document.getElementById("descargar");

    const update = () => {
      const heroGone = hero ? hero.getBoundingClientRect().bottom < 0 : true;
      const cierreOnScreen = cierre
        ? cierre.getBoundingClientRect().top < window.innerHeight
        : false;
      setVisible(heroGone && !cierreOnScreen);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const href = platform === "android" ? playUrl : storeUrl;
  const label = platform === "android" ? "Google Play" : "App Store";

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 transition-transform duration-200 motion-reduce:transition-none ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="mx-3 mb-3 rounded-2xl bg-ink text-bg shadow-[0_12px_30px_-8px_rgba(42,26,16,.6)] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0 leading-tight">
          <div className="text-[13px] font-bold">Descarga Centavos gratis</div>
          <div className="text-[11px] font-semibold text-bg/70">Sin conectar tu banco</div>
        </div>
        {platform === "other" ? (
          <div className="flex items-center gap-2 text-[13px] font-bold">
            <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="bg-bg text-ink rounded-full px-3 py-2">
              iOS<span className="sr-only"> · App Store (se abre en una pestaña nueva)</span>
            </a>
            <a href={playUrl} target="_blank" rel="noopener noreferrer" className="bg-bg text-ink rounded-full px-3 py-2">
              Android<span className="sr-only"> · Google Play (se abre en una pestaña nueva)</span>
            </a>
          </div>
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-mandarina text-ink rounded-full px-4 py-2.5 text-[13px] font-bold whitespace-nowrap"
          >
            Ir a {label}
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        )}
      </div>
    </div>
  );
}
