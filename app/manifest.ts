import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Centavos",
    short_name: "Centavos",
    description: "App para anotar tus gastos y armar presupuestos, sin conectar tu banco.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf3e3",
    theme_color: "#faf3e3",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    lang: "es-MX",
  };
}
