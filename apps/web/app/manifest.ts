import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BipsForm — Always on form",
    short_name: "BipsForm",
    description: "Build stunning, themed forms in minutes. Share a link, watch responses roll in.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1a",
    theme_color: "#0891B2",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  }
}
