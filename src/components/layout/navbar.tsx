import Link from "next/link";
import { Flame } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-ember-500 to-red-700 shadow-glow-sm transition-shadow group-hover:shadow-glow">
            <Flame className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-lg font-bold tracking-wider">
            MMR <span className="text-gradient-ember">ORACLE</span>
          </span>
        </Link>

        <Link
          href="/"
          className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
        >
          Новый анализ
        </Link>
      </div>
      <div aria-hidden className="teamline h-px w-full" />
    </header>
  );
}
