import type { MetadataRoute } from "next";

import { getSitemapContent, siteUrl } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { blogPosts, workPosts, seoPages } = await getSitemapContent();

  return [
    { url: siteUrl.toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/blog", siteUrl).toString(), changeFrequency: "weekly", priority: 0.8 },
    { url: new URL("/work", siteUrl).toString(), changeFrequency: "monthly", priority: 0.8 },
    ...blogPosts.map((post) => ({
      url: new URL(`/blog/${post.slug}`, siteUrl).toString(),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...workPosts.map((post) => ({
      url: new URL(`/work/${post.slug}`, siteUrl).toString(),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...seoPages.map((page) => ({
      url: new URL(`/${page.slug}`, siteUrl).toString(),
      lastModified: page.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
