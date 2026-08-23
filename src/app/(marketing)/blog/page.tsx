import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Sparkles } from "lucide-react";

import { ContentCover } from "@/components/marketing/published-content";
import { getPublishedBlogPosts } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insights & Ideas",
  description: "Practical thinking from M&W Labs on digital products, marketing, branding, automation, and sustainable growth.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const value = Array.isArray(params.page) ? params.page[0] : params.page;
  const requestedPage = Number(value || 1);
  const { posts, page, pages } = await getPublishedBlogPosts(Number.isFinite(requestedPage) ? requestedPage : 1);

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-[#f8fbff] px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-12">
        <div className="marketing-grid pointer-events-none absolute inset-0 -z-20 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[34rem] rounded-full bg-cyan-200/35 blur-[110px]" />
        <div className="mx-auto max-w-[104rem] text-center">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-blue-600"><Sparkles className="size-4" />Studio insights</p>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-slate-950 sm:text-7xl">Useful thinking for ambitious businesses.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-base font-semibold leading-8 text-slate-600 sm:text-lg">Practical guidance on building better digital products, creating demand, and using automation thoughtfully.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[104rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-12 2xl:px-16">
        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(37,99,235,0.13)]">
                <ContentCover image={post.coverImage} label={post.title} className="aspect-[16/9]" />
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.15em] text-blue-600">
                    <span>{post.category}</span>
                    {post.featured && <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-700">Featured</span>}
                  </div>
                  <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.035em] text-slate-950 transition group-hover:text-blue-700">{post.title}</h2>
                  <p className="mt-4 flex-1 text-sm font-semibold leading-7 text-slate-600">{post.excerpt || "Read the latest perspective from the M&W Labs studio."}</p>
                  <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                    <span className="text-[0.68rem] font-bold text-slate-500">{post.publishedAt ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(post.publishedAt) : "Recently published"}</span>
                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-xs font-extrabold text-blue-700">Read article <ArrowRight className="ml-2 size-3.5 transition group-hover:translate-x-1" /></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-blue-100 bg-blue-50/60 p-10 text-center sm:p-14">
            <BookOpenText className="mx-auto size-10 text-blue-500" />
            <h2 className="mt-5 text-2xl font-black text-slate-950">New insights are being prepared.</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">Published articles will appear here automatically.</p>
          </div>
        )}
        {pages > 1 && <nav aria-label="Blog pagination" className="mt-12 flex items-center justify-center gap-3"><Link aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} href={page <= 2 ? "/blog" : `/blog?page=${page - 1}`} className={`rounded-full border px-5 py-2.5 text-sm font-extrabold transition ${page <= 1 ? "pointer-events-none opacity-40" : "hover:border-blue-300 hover:text-blue-700"}`}>Previous</Link><span className="text-xs font-bold text-slate-500">Page {page} of {pages}</span><Link aria-disabled={page >= pages} tabIndex={page >= pages ? -1 : undefined} href={`/blog?page=${page + 1}`} className={`rounded-full border px-5 py-2.5 text-sm font-extrabold transition ${page >= pages ? "pointer-events-none opacity-40" : "hover:border-blue-300 hover:text-blue-700"}`}>Next</Link></nav>}
      </section>
    </div>
  );
}
