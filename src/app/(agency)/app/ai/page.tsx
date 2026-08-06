import type { Metadata } from "next";

import { AiConcierge } from "@/components/ai/ai-concierge";
import { getWorkspaceContext } from "@/lib/dal";

export const metadata: Metadata = { title: "M&W Intelligence" };

export default async function AiPage() {
  const context = await getWorkspaceContext();
  return (
    <AiConcierge
      organizationName={context.organization.name}
      userName={context.user.name}
      geminiEnabled={Boolean(process.env.GEMINI_API_KEY)}
    />
  );
}
