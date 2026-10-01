import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HR SaaS Admin",
    short_name: "HR Admin",
    description: "Admin dashboard for HR SaaS application",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#9ae600",
    lang: "id-ID",
    icons: [
      {
        src: "/aksesplus-desk.png",
        sizes: "1688x1688",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
