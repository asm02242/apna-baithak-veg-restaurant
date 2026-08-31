import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://apna-baithak-vegeterian-restaurant.vercel.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/menu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/combos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/offers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/checkout`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/account`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/orders`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/wishlist`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/cart`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];
}
