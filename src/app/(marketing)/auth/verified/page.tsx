import Link from "next/link";

export default function VerifiedPage() {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-24 text-center sm:px-0">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Email confirmed</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tighter">Your account is verified.</h1>
      <p className="mt-4 leading-7 text-muted-foreground">You can continue into M&W Command.</p>
      <Link href="/auth/continue" className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-semibold text-background">Continue</Link>
    </div>
  );
}