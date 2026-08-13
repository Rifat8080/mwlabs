import "server-only";

import { cache } from "react";
import type { Metadata } from "next";

import { db } from "@/lib/db";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.BETTER_AUTH_URL?.startsWith("http") ? process.env.BETTER_AUTH_URL : undefined) ??
    "https://mwlabs.digital",
);

const publishedAtOrBeforeNow = () => ({ status: "Published", publishedAt: { lte: new Date() } });

function absoluteUrl(value: string) {
  return new URL(value, siteUrl).toString();
}

function descriptionFallback(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 160);
}

type SeoRecord = {
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
};

export function createContentMetadata(
  record: SeoRecord,
  options: {
    pathname: string;
    description: string;
    type?: "article" | "website";
    publishedAt?: Date | null;
    noIndex?: boolean;
  },
): Metadata {
  const title = record.metaTitle || record.title;
  const description = record.metaDescription || descriptionFallback(options.description);
  const canonical = record.canonicalUrl ? absoluteUrl(record.canonicalUrl) : absoluteUrl(options.pathname);
  const images = record.ogImage ? [absoluteUrl(record.ogImage)] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: options.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: options.type ?? "website",
      title,
      description,
      url: canonical,
      siteName: "M&W Labs",
      images,
      ...(options.type === "article" && options.publishedAt
        ? { publishedTime: options.publishedAt.toISOString() }
        : {}),
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export async function getPublishedBlogPosts() {
  return db.blogPost.findMany({
    where: publishedAtOrBeforeNow(),
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      authorName: true,
      featured: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
}

export const getPublishedBlogPost = cache(async (slug: string) => {
  return db.blogPost.findFirst({
    where: { slug, ...publishedAtOrBeforeNow() },
  });
});

export async function getPublishedWorkPosts() {
  return db.workPost.findMany({
    where: publishedAtOrBeforeNow(),
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      clientName: true,
      industry: true,
      services: true,
      summary: true,
      coverImage: true,
      featured: true,
      completedAt: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
}

export const getPublishedWorkPost = cache(async (slug: string) => {
  return db.workPost.findFirst({
    where: { slug, ...publishedAtOrBeforeNow() },
  });
});

export const getPublishedSeoPage = cache(async (slug: string) => {
  return db.seoPage.findFirst({
    where: { slug, ...publishedAtOrBeforeNow() },
  });
});

export async function getSitemapContent() {
  const where = publishedAtOrBeforeNow();
  const [blogPosts, workPosts, seoPages] = await Promise.all([
    db.blogPost.findMany({ where, select: { slug: true, updatedAt: true } }),
    db.workPost.findMany({ where, select: { slug: true, updatedAt: true } }),
    db.seoPage.findMany({ where: { ...where, noIndex: false }, select: { slug: true, updatedAt: true } }),
  ]);
  return { blogPosts, workPosts, seoPages };
}
