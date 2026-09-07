import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/dashboard/", "/inventory/", "/cart/", "/settings/", "/notifications/", "/studio/"] }], sitemap: "https://vennetofficial.vercel.app/sitemap.xml" };
}
