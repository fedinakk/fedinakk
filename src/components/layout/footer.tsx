import Link from "next/link";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-10">
      <div className="container flex flex-col items-center gap-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-ember-500" />
          <span className="font-display font-semibold tracking-wider text-foreground">MMR ORACLE</span>
          <span className="text-muted-foreground/60">· аналитика Dota 2</span>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground/70">
          Данные — <Link href="https://www.opendota.com" className="underline-offset-2 hover:text-ember-400 hover:underline">OpenDota API</Link>.
          Dota 2 является товарным знаком Valve Corporation. Сайт не аффилирован с Valve.
        </p>
      </div>
    </footer>
  );
}
