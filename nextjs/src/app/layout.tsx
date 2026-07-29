import type { Metadata } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/martian-mono";
import "@/app/globals.css";
import { Analytics } from "@/components/analytics";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "M&W Labs | Digital systems for ambitious growth", template: "%s | M&W Labs" },
  description: "M&W Labs builds digital products, growth systems, and AI automation for businesses ready to scale.",
  applicationName: "M&W Labs",
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: "M&W Labs", locale: "en_US" },
  twitter: { card: "summary_large_image" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body id="top" className="min-h-screen font-sans antialiased">{children}<Analytics /></body></html>;
}
