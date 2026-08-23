import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";

import { ContentArticle, PublishedContentBody } from "@/components/marketing/published-content";
import { createContentMetadata, getPublishedWorkPost, siteUrl } from "@/lib/public-content";

export const dynamic = "force-dynamic";

type WorkPostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: WorkPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedWorkPost(slug);
  if (!post) return {};

  return createContentMetadata(post, {
    pathname: `/work/${post.slug}`,
    description: post.summary,
    type: "article",
    publishedAt: post.publishedAt,
  });
}

export default async function WorkPostPage({ params }: WorkPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedWorkPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: post.title,
    description: post.summary,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    creator: { "@type": "Organization", name: "M&W Labs", url: siteUrl.toString() },
    url: new URL(`/work/${post.slug}`, siteUrl).toString(),
    ...(post.ogImage || post.coverImage ? { image: new URL(post.ogImage || post.coverImage!, siteUrl).toString() } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ContentArticle
        backHref="/work"
        backLabel="All selected work"
        eyebrow={[post.industry, post.clientName].filter(Boolean).join(" · ") || "M&W Labs case study"}
        title={post.title}
        summary={post.summary}
        image={post.coverImage}
        publishedAt={post.publishedAt}
      >
        <div className="space-y-12">
          {post.services && <section><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Services</p><p className="mt-3 text-lg font-bold leading-8 text-slate-800">{post.services}</p></section>}
          {post.challenge && <section><h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">The challenge</h2><div className="mt-5"><PublishedContentBody content={post.challenge} /></div></section>}
          <section><h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">The solution</h2><div className="mt-5"><PublishedContentBody content={post.solution} /></div></section>
          {post.results && <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/60 p-6 sm:p-8"><h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">Results & proof</h2><div className="mt-5"><PublishedContentBody content={post.results} /></div></section>}
          {post.projectUrl && <Link href={post.projectUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-extrabold text-blue-700 transition hover:bg-blue-100">Visit live project <ArrowUpRight className="ml-2 size-4" /></Link>}
        </div>
      </ContentArticle>
    </>
  );
}
