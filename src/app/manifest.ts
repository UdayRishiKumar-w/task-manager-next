import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Task manager",
    short_name: "Task manager",
    description: "A personal task manager application",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
    orientation: "any",
    scope: "/",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "64x64",
        type: "image/x-icon",
        purpose: "maskable",
      },
      {
        src: "/task-manager.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/task-manager.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
