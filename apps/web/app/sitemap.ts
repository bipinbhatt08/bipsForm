import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL!

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.7, changeFrequency: "monthly" },
    { path: "/explore", priority: 0.6, changeFrequency: "weekly" },
    { path: "/login", priority: 0.3, changeFrequency: "monthly" },
    { path: "/signup", priority: 0.5, changeFrequency: "monthly" },
  ]

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
