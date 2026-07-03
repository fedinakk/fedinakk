import type { Metadata, Viewport } from "next";
import { Inter, Russo_One } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "MMR Oracle — анализ потенциального MMR в Dota 2",
    template: "%s · MMR Oracle",
  },
  description:
    "Вставьте ссылку на Steam или Dotabuff профиль — MMR Oracle проанализирует последние 200 рейтинговых матчей и рассчитает ваш потенциальный MMR по каждой роли, лучших героев и стратегию подъёма рейтинга.",
  keywords: [
    "Dota 2",
    "MMR",
    "анализ аккаунта",
    "потенциальный MMR",
    "калькулятор MMR",
    "dotabuff",
    "opendota",
    "рейтинг дота 2",
  ],
  openGraph: {
    type: "website",
    siteName: "MMR Oracle",
    title: "MMR Oracle — анализ потенциального MMR в Dota 2",
    description:
      "Анализ последних 200 рейтинговых матчей: потенциальный MMR по ролям, лучшие герои и стратегия подъёма рейтинга.",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "MMR Oracle — анализ потенциального MMR в Dota 2",
    description:
      "Потенциальный MMR по ролям, лучшие герои и стратегия подъёма рейтинга — по последним 200 матчам.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d0a08",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={cn(inter.variable, russoOne.variable, "font-sans")}>
        <div className="relative flex min-h-dvh flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-40" />
      </body>
    </html>
  );
}
