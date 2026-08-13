import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

function backgroundImage(value?: string | null) {
  if (!value || !(value.startsWith("/") || /^https?:\/\//i.test(value))) return undefined;
  return { backgroundImage: `linear-gradient(135deg, rgb(1 22 69 / 0.12), rgb(2 209 250 / 0.06)), url(${JSON.stringify(value)})` };
}

export function ContentCover({ image, label, className }: { image?: string | null; label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={image ? label : `${label} abstract cover`}
      style={backgroundImage(image)}
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(circle_at_72%_24%,rgba(34,211,238,0.55),transparent_22rem),linear-gradient(135deg,#011645,#155dfc_58%,#02d1fa)] bg-cover bg-center",
        className,
      )}
    >
      <div className="marketing-grid-dark absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="absolute -bottom-20 -right-12 size-56 rounded-full border-[38px] border-white/10" />
      {!image && <span className="absolute bottom-5 left-5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/60">M&amp;W Labs</span>}
    </div>
  );
}

export function PublishedContentBody({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="space-y-6 text-base font-medium leading-8 text-slate-600 sm:text-lg sm:leading-9">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) return <h3 key={index} className="pt-4 text-xl font-black tracking-[-0.025em] text-slate-950 sm:text-2xl">{block.slice(4)}</h3>;
        if (block.startsWith("## ")) return <h2 key={index} className="pt-6 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">{block.slice(3)}</h2>;

        const lines = block.split("\n");
        if (lines.every((line) => line.trim().startsWith("- "))) {
          return (
            <ul key={index} className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
              {lines.map((line) => <li key={line} className="flex gap-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-blue-600" />{line.trim().slice(2)}</li>)}
            </ul>
          );
        }

        return <p key={index}>{block}</p>;
      })}
    </div>
  );
}

export function ContentArticle({
  backHref,
  backLabel,
  eyebrow,
  title,
  summary,
  image,
  publishedAt,
  author,
  children,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  summary: string;
  image?: string | null;
  publishedAt?: Date | null;
  author?: string | null;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-white">
      <header className="relative isolate overflow-hidden bg-[#f8fbff] px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-12">
        <div className="marketing-grid pointer-events-none absolute inset-0 -z-20 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[34rem] rounded-full bg-cyan-200/35 blur-[110px]" />
        <div className="mx-auto max-w-5xl">
          <Link href={backHref} className="inline-flex items-center text-xs font-extrabold text-blue-700 transition hover:text-blue-900"><ArrowLeft className="mr-2 size-3.5" />{backLabel}</Link>
          <p className="mt-10 text-xs font-black uppercase tracking-[0.24em] text-blue-600">{eyebrow}</p>
          <h1 className="mt-5 max-w-5xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-7 max-w-3xl text-base font-semibold leading-8 text-slate-600 sm:text-xl sm:leading-9">{summary}</p>
          {(publishedAt || author) && (
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
              {publishedAt && <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-blue-500" />{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(publishedAt)}</span>}
              {author && <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5">By {author}</span>}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-12">
        <ContentCover image={image} label={title} className="aspect-[16/8] -translate-y-7 rounded-[1.75rem] border border-white shadow-[0_30px_90px_rgba(15,23,42,0.15)] sm:-translate-y-10 sm:rounded-[2.5rem]" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-4 sm:px-6 sm:pb-28">{children}</div>

      <section className="border-t border-blue-100 bg-blue-50/60 px-4 py-14 text-center sm:px-6 sm:py-18">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Ready for the next move?</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Turn the idea into measurable progress.</h2>
        <Link href="/register" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 px-6 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">Start a project <ArrowRight className="ml-3 size-4" /></Link>
      </section>
    </article>
  );
}
