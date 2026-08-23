import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentArticle, PublishedContentBody } from "@/components/marketing/published-content";
import { createContentMetadata, getPublishedBlogPost, siteUrl } from "@/lib/public-content";

export const dynamic = "force-dynamic";

type BlogPostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) return {};

  return createContentMetadata(post, {
    pathname: `/blog/${post.slug}`,
    description: post.excerpt || post.content,
    type: "article",
    publishedAt: post.publishedAt,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPost(slug);
  if (!post) notFound();

  const summary = post.excerpt || post.metaDescription || post.content.replace(/\s+/g, " ").slice(0, 220);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: summary,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.authorName },
    publisher: { "@type": "Organization", name: "M&W Labs", url: siteUrl.toString() },
    mainEntityOfPage: new URL(`/blog/${post.slug}`, siteUrl).toString(),
    ...(post.ogImage || post.coverImage ? { image: new URL(post.ogImage || post.coverImage!, siteUrl).toString() } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ContentArticle
        backHref="/blog"
        backLabel="All insights"
        eyebrow={post.category}
        title={post.title}
        summary={summary}
        image={post.coverImage}
        publishedAt={post.publishedAt}
        author={post.authorName}
      >
        <PublishedContentBody content={post.content} />
      </ContentArticle>
    </>
  );
}
