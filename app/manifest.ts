import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Padel Ledger",
    short_name: "Padel Ledger",
    description: "Gestiona tus clases, alumnos y pagos de pádel.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f2",
    theme_color: "#064e3b",
    lang: "es",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
