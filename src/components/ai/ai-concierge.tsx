"use client";

import { useRef, useState } from "react";
import {
  ArrowUp,
  BrainCircuit,
  Check,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

const prompts = [
  "What needs my attention today?",
  "Where is margin at risk?",
  "Draft this week's client update",
  "How should I rebalance capacity?",
];

function RichText({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-6">
      {content.split("\n").map((line, index) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return line ? <p key={index}>{parts.map((part, partIndex) => part.startsWith("**") && part.endsWith("**") ? <strong key={partIndex} className="font-semibold text-foreground">{part.slice(2, -2)}</strong> : <span key={partIndex}>{part}</span>)}</p> : <div key={index} className="h-1" />;
      })}
    </div>
  );
}

export function AiConcierge({ organizationName, userName, geminiEnabled }: { organizationName: string; userName: string; geminiEnabled: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [threadId, setThreadId] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);

  async function ask(message: string) {
    const clean = message.trim();
    if (!clean || pending) return;
    setMessages((current) => [...current, { role: "user", content: clean }]);
    setInput("");
    setPending(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, threadId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "M&W Intelligence could not answer.");
      setThreadId(result.threadId);
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    } catch (error) {
      toast.error("M&W Intelligence could not answer", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100svh-4.25rem)] xl:grid-cols-[1fr_300px]">
      <div className="flex min-h-[calc(100svh-4.25rem)] flex-col">
        <div className="flex items-center justify-between border-b bg-white px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><BrainCircuit className="size-4" /></span><div><div className="flex items-center gap-2"><h1 className="text-sm font-semibold">M&amp;W Intelligence</h1><span className="size-1.5 rounded-full bg-emerald-500" /></div><p className="text-[10px] text-muted-foreground">Grounded in {organizationName}</p></div></div>
          <div className="flex items-center gap-2"><Badge variant="outline" className="hidden rounded-full bg-muted/40 text-[9px] sm:inline-flex">{geminiEnabled ? "Gemini connected" : "Local briefing mode"}</Badge><Button variant="outline" size="sm" onClick={() => { setMessages([]); setThreadId(undefined); }}><Plus className="size-3.5" /> New thread</Button></div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-3xl">
            {messages.length === 0 ? (
              <div className="flex min-h-[540px] flex-col justify-center py-10">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-navy text-accent shadow-[0_18px_45px_rgba(21,93,252,0.2)]"><Sparkles className="size-5" /></div>
                <h2 className="mt-6 text-center text-3xl font-semibold tracking-[-0.045em]">What are we solving, {userName.split(" ")[0]}?</h2>
                <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-muted-foreground">I can reason across pipeline, client history, delivery, people, time, cash, and the knowledge your team has approved.</p>
                <div className="mx-auto mt-8 grid w-full max-w-2xl gap-2 sm:grid-cols-2">{prompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="rounded-xl border bg-white p-4 text-left text-xs font-medium shadow-[0_8px_24px_rgba(30,38,46,0.025)] transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">{prompt}<ArrowUp className="float-right size-3.5 rotate-45 text-muted-foreground" /></button>)}</div>
              </div>
            ) : (
              <div className="space-y-7">
                {messages.map((message, index) => (
                  <div key={index} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
                    {message.role === "assistant" && <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Sparkles className="size-3.5" /></span>}
                    <div className={cn("max-w-[88%] rounded-2xl px-4 py-3", message.role === "user" ? "bg-brand-navy text-white" : "border bg-white text-muted-foreground shadow-sm")}><RichText content={message.content} /></div>
                  </div>
                ))}
                {pending && <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="grid size-8 place-items-center rounded-xl bg-accent"><LoaderCircle className="size-3.5 animate-spin text-accent-foreground" /></span>Reading the agency context…</div>}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t bg-background/90 px-4 py-4 backdrop-blur-xl sm:px-8">
          <form ref={formRef} onSubmit={(event) => { event.preventDefault(); ask(input); }} className="mx-auto max-w-3xl">
            <div className="rounded-2xl border bg-white p-2 shadow-[0_18px_55px_rgba(31,39,48,0.1)] focus-within:border-foreground/25">
              <Textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); formRef.current?.requestSubmit(); } }} placeholder="Ask about a client, decision, risk, plan, or draft…" className="min-h-16 resize-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0" />
              <div className="flex items-center justify-between px-1 pt-1"><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon-sm" aria-label="Attach context"><Paperclip className="size-3.5" /></Button><span className="hidden text-[9px] text-muted-foreground sm:inline">Enter to send · Shift + Enter for new line</span></div><Button type="submit" size="icon" className="rounded-xl" disabled={pending || !input.trim()}><ArrowUp className="size-4" /></Button></div>
            </div>
            <p className="mt-2 text-center text-[9px] text-muted-foreground">AI can make mistakes. Review financial, legal, and client-facing output before acting.</p>
          </form>
        </div>
      </div>

      <aside className="hidden border-l bg-white xl:block">
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Grounding context</p>
          <div className="mt-4 space-y-2">
            {[{ icon: Workflow, label: "Live operations", detail: "Pipeline, projects, tasks" }, { icon: FileText, label: "Agency knowledge", detail: "3 approved sources" }, { icon: Search, label: "Financial model", detail: "Invoices, cost, margin" }].map((item) => <div key={item.label} className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3"><span className="grid size-8 place-items-center rounded-lg bg-white shadow-sm"><item.icon className="size-3.5" /></span><div><p className="text-xs font-semibold">{item.label}</p><p className="mt-0.5 text-[9px] text-muted-foreground">{item.detail}</p></div><Check className="ml-auto size-3.5 text-emerald-600" /></div>)}
          </div>

          <div className="mt-7 rounded-2xl bg-brand-navy p-4 text-white">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-accent"><LockKeyhole className="size-3.5" />Approval boundary</div>
            <p className="mt-3 text-xs leading-5 text-white/55">M&amp;W Intelligence may analyze and draft. Sending client messages, changing finance, inviting people, and deleting records always requires a person.</p>
          </div>

          <div className="mt-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Recent memory</p>
            <div className="mt-3 space-y-4 border-l pl-4">{["Pricing guardrails updated", "Northstar QBR notes added", "Delivery retro synthesized"].map((item, index) => <div key={item}><p className="text-xs font-medium">{item}</p><p className="mt-1 text-[9px] text-muted-foreground">{index === 0 ? "Today" : index === 1 ? "Yesterday" : "Aug 02"}</p></div>)}</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
