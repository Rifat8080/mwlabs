"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setStatus("sending"); setMessage("");
    try { const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data.entries())) }); if (!response.ok) throw new Error("Request failed"); form.reset(); setStatus("success"); setMessage("Brief received. We’ll reply from hello@mwlabs.example within two working days."); } catch { setStatus("error"); setMessage("Your brief did not send. Please try again or email hello@mwlabs.example."); }
  }
  return <form className="studio-form" onSubmit={submit} noValidate aria-busy={status === "sending"}><label><span>Name</span><input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your name" /></label><label><span>Email</span><input name="email" required type="email" maxLength={254} autoComplete="email" placeholder="you@company.com" /></label><label><span>What needs to move?</span><textarea name="brief" required minLength={10} maxLength={3000} rows={4} placeholder="A launch, a rebuild, more demand, less manual work…" /></label><button className="studio-cta" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending brief…" : "Send your brief"} <span aria-hidden="true">↗</span></button>{message && <p className={`form-status ${status}`} aria-live="polite">{message}</p>}</form>;
}
