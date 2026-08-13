import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentArticle, PublishedContentBody } from "@/components/marketing/published-content";
import { createContentMetadata, getPublishedSeoPage, siteUrl } from "@/lib/public-content";

export const dynamic = "force-dynamic";

type SeoPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: SeoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedSeoPage(slug);
  if (!page) return {};

  return createContentMetadata(page, {
    pathname: `/${page.slug}`,
    description: page.summary,
    noIndex: page.noIndex,
  });
}

export default async function SeoLandingPage({ params }: SeoPageProps) {
  const { slug } = await params;
  const page = await getPublishedSeoPage(slug);
  if (!page) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.metaDescription || page.summary,
    datePublished: page.publishedAt?.toISOString(),
    dateModified: page.updatedAt.toISOString(),
    url: new URL(`/${page.slug}`, siteUrl).toString(),
    isPartOf: { "@type": "WebSite", name: "M&W Labs", url: siteUrl.toString() },
    ...(page.primaryKeyword ? { keywords: page.primaryKeyword } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ContentArticle
        backHref="/"
        backLabel="M&W Labs home"
        eyebrow={page.eyebrow || page.primaryKeyword || "M&W Labs"}
        title={page.title}
        summary={page.summary}
        image={page.heroImage}
        publishedAt={page.publishedAt}
      >
        <PublishedContentBody content={page.content} />
      </ContentArticle>
    </>
  );
}
