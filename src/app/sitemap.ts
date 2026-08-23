import type { MetadataRoute } from "next";

import { getSitemapContent, getSitemapCounts, siteUrl } from "@/lib/public-content";

export const dynamic = "force-dynamic";

const sitemapSize = 45_000;

export async function generateSitemaps() {
  const counts = await getSitemapCounts();
  const total = counts.blogPosts + counts.workPosts + counts.seoPages;
  return Array.from({ length: Math.max(1, Math.ceil(total / sitemapSize)) }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const sitemapId = Math.max(0, Number(await id) || 0);
  const { blogPosts, workPosts, seoPages } = await getSitemapContent(sitemapId * sitemapSize, sitemapSize);

  return [
    ...(sitemapId === 0 ? [
      { url: siteUrl.toString(), changeFrequency: "weekly" as const, priority: 1 },
      { url: new URL("/blog", siteUrl).toString(), changeFrequency: "weekly" as const, priority: 0.8 },
      { url: new URL("/work", siteUrl).toString(), changeFrequency: "monthly" as const, priority: 0.8 },
    ] : []),
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
