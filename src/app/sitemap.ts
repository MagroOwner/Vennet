import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vennetofficial.vercel.app";
  const routes = ["/", "/marketplace", "/collections", "/discover", "/pro", "/help", "/terms", "/privacy", "/legal"];
  return routes.map((route) => ({ url: baseUrl + route, lastModified: new Date(), changeFrequency: route === "/" ? "weekly" : "monthly", priority: route === "/" ? 1 : 0.7 }));
}
