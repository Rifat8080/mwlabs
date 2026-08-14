import "server-only";

export type EmailResult = {
  status: "Sent" | "Deferred" | "Failed";
  messageId?: string;
  error?: string;
};

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  replyTo?: string | null;
};

export function siteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
  try {
    return new URL(candidate).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function absoluteAppUrl(path: string | null | undefined) {
  if (!path) return siteUrl();
  try {
    return new URL(path, siteUrl()).toString();
  } catch {
    return siteUrl();
  }
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function notificationEmailTemplate({
  recipientName,
  title,
  message,
  actionLabel = "Open M&W Command",
  actionUrl,
}: {
  recipientName?: string | null;
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string | null;
}) {
  const greeting = recipientName ? `Hi ${recipientName.split(" ")[0]},` : "Hello,";
  const href = absoluteAppUrl(actionUrl);
  const html = `<!doctype html><html><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#0f172a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #dbeafe;border-radius:20px;overflow:hidden"><tr><td style="padding:26px 30px;background:#0f172a;color:#ffffff"><div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#67e8f9">M&amp;W Command</div><div style="margin-top:8px;font-size:24px;font-weight:800">${escapeHtml(title)}</div></td></tr><tr><td style="padding:30px"><p style="margin:0 0 16px;font-size:15px;line-height:1.7">${escapeHtml(greeting)}</p><p style="margin:0;font-size:15px;line-height:1.7;color:#475569">${escapeHtml(message)}</p>${actionUrl ? `<p style="margin:26px 0 0"><a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 18px;border-radius:10px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800">${escapeHtml(actionLabel)}</a></p>` : ""}<p style="margin:28px 0 0;border-top:1px solid #e2e8f0;padding-top:18px;font-size:12px;line-height:1.6;color:#94a3b8">This operational notification was sent by your M&amp;W Command workspace. You can change email preferences from the notification inbox.</p></td></tr></table></td></tr></table></body></html>`;
  const text = `${greeting}\n\n${title}\n${message}${actionUrl ? `\n\n${actionLabel}: ${href}` : ""}\n\nManage notification preferences in M&W Command.`;
  return { html, text };
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.NOTIFICATION_EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    return { status: "Deferred", error: "RESEND_API_KEY and NOTIFICATION_EMAIL_FROM are not configured." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.idempotencyKey.slice(0, 256),
        "User-Agent": "mwlabs-command/1.0",
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo || process.env.NOTIFICATION_EMAIL_REPLY_TO
          ? { reply_to: message.replyTo || process.env.NOTIFICATION_EMAIL_REPLY_TO }
          : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json().catch(() => null) as { id?: string; message?: string; error?: { message?: string } } | null;
    if (!response.ok || !result?.id) {
      return { status: "Failed", error: result?.message || result?.error?.message || `Email provider returned ${response.status}.` };
    }
    return { status: "Sent", messageId: result.id };
  } catch (error) {
    return { status: "Failed", error: error instanceof Error ? error.message : "Email delivery failed." };
  }
}
