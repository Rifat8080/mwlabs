"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Headphones, LoaderCircle, MessageCircle, Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";

const fieldClass = "block h-13 w-full rounded-2xl border border-blue-100 bg-blue-50/35 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100/60";

export function ProjectEnquiryForm() {
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    setPending(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Your enquiry could not be sent.");
      form.reset();
      toast.success("Enquiry received", { description: "M&W Labs will review it and respond with a focused next step." });
    } catch (error) {
      toast.error("Could not send the enquiry", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[2.5rem] border border-blue-100 bg-white p-6 shadow-[0_35px_100px_rgba(37,99,235,0.13)] sm:p-9">
      <div className="mb-6 border-b border-blue-50 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-blue-700">
          Project Enquiry <Send className="size-3" />
        </div>
        <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950">Send a focused project brief.</h2>
        <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">Perfect for websites, software, campaigns, branding, content, and automation ideas.</p>
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-black text-slate-700">Name<input name="name" required autoComplete="name" placeholder="Your name" className={fieldClass} /></label>
        <label className="space-y-2 text-sm font-black text-slate-700">Email<input name="email" required type="email" autoComplete="email" placeholder="you@company.com" className={fieldClass} /></label>
        <label className="space-y-2 text-sm font-black text-slate-700">Phone / WhatsApp<input name="phone" autoComplete="tel" placeholder="+880..." className={fieldClass} /></label>
        <label className="space-y-2 text-sm font-black text-slate-700">Company / Brand<input name="company" autoComplete="organization" placeholder="Company or brand" className={fieldClass} /></label>
        <label className="space-y-2 text-sm font-black text-slate-700 sm:col-span-2">
          Service Interest
          <select name="service" className={fieldClass} defaultValue="">
            <option value="" disabled>Select a service</option>
            <option>Software & Web Development</option>
            <option>Digital Marketing</option>
            <option>Branding & Design</option>
            <option>Video Editing & Content</option>
            <option>AI & Automation</option>
            <option>Growth Strategy</option>
          </select>
        </label>
      </div>
      <label className="mt-5 block space-y-2 text-sm font-black text-slate-700">
        What do you want to build or grow?
        <textarea name="message" required rows={4} placeholder="Tell us about your idea, audience, timeline, and the result you want." className={`${fieldClass} h-auto resize-y py-3`} />
      </label>
      <button disabled={pending} type="submit" className="button-primary mt-6 inline-flex h-13 w-full items-center justify-center rounded-2xl px-7 text-sm font-extrabold disabled:pointer-events-none disabled:opacity-60 sm:w-auto">
        {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
        {pending ? "Sending…" : "Submit Enquiry"}
      </button>
      <p className="mt-4 text-xs font-semibold leading-6 text-slate-500">By sending this request, you agree that M&amp;W Labs can contact you about your enquiry.</p>
    </form>
  );
}

const testimonials = [
  { quote: "The team at M&W Labs is exceptional. They built our website, ran amazing ads and the results exceeded our expectations.", initials: "JB", name: "Jessica Brown", role: "Marketing Manager, Brandco", gradient: "from-blue-600 to-cyan-400" },
  { quote: "Highly professional and creative team. They understand our needs and deliver solutions that actually grow our business.", initials: "ML", name: "Michael Lee", role: "Founder, Shopwise", gradient: "from-brand-navy to-blue-600" },
  { quote: "From branding to video editing, everything was top quality. Communication was smooth and timely.", initials: "SJ", name: "Sarah Johnson", role: "CEO, Skyhigh", gradient: "from-cyan-500 to-blue-700" },
];

export function TestimonialsCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function move(direction: number) {
    const next = (active + direction + testimonials.length) % testimonials.length;
    setActive(next);
    const card = track.current?.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  function show(index: number) {
    setActive(index);
    const card = track.current?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  return (
    <div className="relative mt-9">
      <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial" className="absolute -left-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-xl shadow-blue-100 transition hover:bg-blue-600 hover:text-white sm:-left-5"><ArrowLeft className="size-4" /></button>
      <div ref={track} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {testimonials.map((item) => (
          <article key={item.name} className="min-w-full snap-center rounded-[1.75rem] border border-blue-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_80px_rgba(37,99,235,0.12)] sm:min-w-[calc(50%-0.625rem)] lg:min-w-[calc(33.333%-0.875rem)]">
            <span className="text-5xl font-black leading-none text-blue-100">“</span>
            <blockquote className="mt-1 min-h-24 text-sm font-semibold leading-7 text-slate-600">{item.quote}</blockquote>
            <div className="mt-6 flex items-center gap-4">
              <div className={`grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br ${item.gradient} text-sm font-black text-white shadow-lg`}>{item.initials}</div>
              <div><p className="font-black text-slate-950">{item.name}</p><p className="mt-1 text-xs font-bold text-slate-500">{item.role}</p></div>
            </div>
          </article>
        ))}
      </div>
      <button type="button" onClick={() => move(1)} aria-label="Next testimonial" className="absolute -right-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-blue-100 bg-white text-blue-600 shadow-xl shadow-blue-100 transition hover:bg-blue-600 hover:text-white sm:-right-5"><ArrowRight className="size-4" /></button>
      <div className="mt-5 flex justify-center gap-2">{testimonials.map((item, index) => <button key={item.name} onClick={() => show(index)} aria-label={`Show testimonial ${index + 1}`} className={`h-2.5 rounded-full transition-all ${active === index ? "w-8 bg-blue-600" : "w-2.5 bg-blue-100"}`} />)}</div>
    </div>
  );
}

type ReceptionMessage = { role: "assistant" | "user"; text: string };

export function MarketingReception() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ReceptionMessage[]>([
    { role: "assistant", text: "Hi, this is M&W Labs. What are you looking to build or grow today?" },
  ]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;
    setMessages((current) => [...current, { role: "user", text: value }, { role: "assistant", text: "Thanks—your idea sounds like a good fit for a strategy conversation. Use the project enquiry form and the team will respond with a focused next step." }]);
    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:right-6">
      {open && (
        <section className="mb-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-blue-100 bg-slate-50 shadow-2xl shadow-slate-950/20">
          <header className="flex items-center justify-between border-b border-blue-100 bg-white px-4 py-3">
            <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white"><Headphones className="size-4" /></span><div><p className="text-sm font-black text-slate-950">M&amp;W Labs Reception</p><p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span className="size-1.5 rounded-full bg-emerald-500" />Local assistant ready</p></div></div>
            <button onClick={() => setOpen(false)} aria-label="Close reception chat" className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="size-4" /></button>
          </header>
          <div className="h-72 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm font-semibold leading-6 ${message.role === "user" ? "bg-blue-600 text-white" : "border border-blue-100 bg-white text-slate-700"}`}>{message.text}</div></div>)}
          </div>
          <form onSubmit={submit} className="border-t border-blue-100 bg-white p-3">
            <div className="flex items-end gap-2"><button type="button" className="grid size-10 place-items-center rounded-lg text-slate-400" aria-label="Attach context"><Paperclip className="size-4" /></button><textarea value={input} onChange={(event) => setInput(event.target.value)} rows={2} placeholder="Type your message…" className="min-h-12 flex-1 resize-none rounded-xl border border-blue-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50" /><button type="submit" className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700" aria-label="Send message"><Send className="size-4" /></button></div>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-ink px-4 py-3 text-sm font-black text-white shadow-2xl shadow-slate-950/25 transition hover:-translate-y-1 hover:bg-blue-600"><span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400"><MessageCircle className="size-4" /></span>{open ? "Close Reception" : "AI Reception"}</button>
    </div>
  );
}
