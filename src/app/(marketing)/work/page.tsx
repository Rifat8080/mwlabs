import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GalleryVerticalEnd, Sparkles } from "lucide-react";

import { ContentCover } from "@/components/marketing/published-content";
import { getPublishedWorkPosts } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Selected Work & Case Studies",
  description: "Explore digital products, growth systems, campaigns, and automation projects delivered by M&W Labs.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  const params = await searchParams;
  const value = Array.isArray(params.page) ? params.page[0] : params.page;
  const requestedPage = Number(value || 1);
  const { posts, page, pages } = await getPublishedWorkPosts(Number.isFinite(requestedPage) ? requestedPage : 1);

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-brand-ink px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-24 sm:pt-24 lg:px-12">
        <div className="marketing-grid-dark pointer-events-none absolute inset-0 -z-20 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[34rem] rounded-full bg-blue-600/25 blur-[110px]" />
        <div className="mx-auto max-w-[104rem] text-center">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-300"><Sparkles className="size-4" />Selected work</p>
          <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-7xl">Proof lives in the work and the outcome.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-base font-semibold leading-8 text-slate-400 sm:text-lg">Case studies showing how strategy, creative, technology, and growth come together around real business goals.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[104rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-12 2xl:px-16">
        {posts.length ? (
          <div className="grid gap-7 lg:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="group overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_85px_rgba(37,99,235,0.14)]">
                <ContentCover image={post.coverImage} label={post.title} className="aspect-[16/9]" />
                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2 text-[0.62rem] font-black uppercase tracking-[0.15em] text-blue-600">
                    {post.industry && <span>{post.industry}</span>}
                    {post.clientName && <span className="text-slate-400">· {post.clientName}</span>}
                    {post.featured && <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700">Featured</span>}
                  </div>
                  <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 transition group-hover:text-blue-700">{post.title}</h2>
                  <p className="mt-4 text-sm font-semibold leading-7 text-slate-600 sm:text-base">{post.summary}</p>
                  <Link href={`/work/${post.slug}`} className="mt-7 inline-flex items-center text-sm font-extrabold text-blue-700">View case study <ArrowRight className="ml-2 size-4 transition group-hover:translate-x-1" /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-blue-100 bg-blue-50/60 p-10 text-center sm:p-14">
            <GalleryVerticalEnd className="mx-auto size-10 text-blue-500" />
            <h2 className="mt-5 text-2xl font-black text-slate-950">Case studies are being prepared.</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">Published work will appear here automatically.</p>
          </div>
        )}
        {pages > 1 && <nav aria-label="Work pagination" className="mt-12 flex items-center justify-center gap-3"><Link aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} href={page <= 2 ? "/work" : `/work?page=${page - 1}`} className={`rounded-full border px-5 py-2.5 text-sm font-extrabold transition ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-blue-300 hover:text-blue-700"}`}>Previous</Link><span className="text-xs font-bold text-slate-500">Page {page} of {pages}</span><Link aria-disabled={page >= pages} tabIndex={page >= pages ? -1 : undefined} href={`/work?page=${page + 1}`} className={`rounded-full border px-5 py-2.5 text-sm font-extrabold transition ${page >= pages ? "pointer-events-none opacity-40" : "hover:border-blue-300 hover:text-blue-700"}`}>Next</Link></nav>}
      </section>
    </div>
  );
}
