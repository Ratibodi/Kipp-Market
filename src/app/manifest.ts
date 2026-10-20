import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kipp Market — Retail POS & Store Management",
    short_name: "Kipp POS",
    description: "Cloud-native retail POS and retail management system with 100% offline tolerance",
    start_url: "/pos",
    display: "standalone",
    background_color: "#061a12",
    theme_color: "#061a12",
    orientation: "any",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
