import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  href = "/",
}: {
  className?: string;
  compact?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="M&W Labs home"
      className={cn("inline-flex items-center gap-2.5 font-semibold", className)}
    >
      <span className="relative grid size-8 place-items-center rounded-full bg-[linear-gradient(135deg,#011645,#155dfc_58%,#02d1fa)] shadow-[0_8px_24px_rgba(21,93,252,0.22)]">
        <span className="size-2.5 rounded-full bg-white" />
        <span className="absolute -inset-1 rounded-full border border-primary/25" />
      </span>
      {!compact && <span className="text-[17px] tracking-[-0.04em]">M&amp;W LABS</span>}
    </Link>
  );
}
