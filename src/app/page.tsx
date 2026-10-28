import Link from "next/link";

export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] tracking-[0.12em] text-ink-3 uppercase">Crumb Bakehouse · East Austin</p>
        <h1 className="mt-4 font-serif text-[52px] leading-[1] tracking-[-0.01em]">
          Small-batch bread, <span className="italic">made to order.</span>
        </h1>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white transition hover:bg-[#2c2a27]"
        >
          Open owner dashboard →
        </Link>
      </div>
    </main>
  );
}
