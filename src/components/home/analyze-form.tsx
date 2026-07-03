"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Gauge, Link2, Loader2, Lock, Search, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AnalysisResult } from "@/lib/engine/types";
import { generateShareId } from "@/lib/utils";

interface ApiError {
  code: string;
  message: string;
}

const LOADING_STEPS = [
  "Определяем аккаунт…",
  "Загружаем последние 200 рейтинговых матчей…",
  "Определяем роли и считаем импакт…",
  "Строим модель потенциального MMR…",
  "Формируем инсайты…",
];

const ERROR_ICONS: Record<string, React.ReactNode> = {
  PRIVATE_PROFILE: <Lock className="h-5 w-5" />,
  ACCOUNT_NOT_FOUND: <UserX className="h-5 w-5" />,
  RATE_LIMITED: <Gauge className="h-5 w-5" />,
  UPSTREAM_RATE_LIMITED: <Gauge className="h-5 w-5" />,
};

export function AnalyzeForm() {
  const router = useRouter();
  const [profile, setProfile] = React.useState("");
  const [mmr, setMmr] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState<ApiError | null>(null);

  React.useEffect(() => {
    if (!loading) return;
    setStep(0);
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 2600);
    return () => clearInterval(timer);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const mmrValue = Number(mmr);
    if (!profile.trim()) {
      setError({ code: "INVALID_INPUT", message: "Вставьте ссылку на Steam или Dotabuff профиль." });
      return;
    }
    if (!Number.isInteger(mmrValue) || mmrValue < 0 || mmrValue > 15000) {
      setError({ code: "INVALID_INPUT", message: "Укажите текущий MMR числом от 0 до 15000." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profile.trim(), currentMmr: mmrValue }),
      });

      const data = (await res.json().catch(() => null)) as
        | { shareId: string | null; result: AnalysisResult }
        | { error: ApiError }
        | null;

      if (!res.ok || !data || "error" in data) {
        setError(
          data && "error" in data && data.error
            ? data.error
            : { code: "INTERNAL", message: "Что-то пошло не так. Попробуйте ещё раз." },
        );
        setLoading(false);
        return;
      }

      // If the DB is down shareId is null — fall back to a local-only id
      // that renders from sessionStorage.
      const id = data.shareId ?? `local-${generateShareId(8)}`;
      try {
        sessionStorage.setItem(`analysis:${id}`, JSON.stringify(data.result));
      } catch {
        /* sessionStorage full/unavailable — the page will refetch by id */
      }
      router.push(`/analysis/${id}`);
    } catch {
      setError({ code: "NETWORK", message: "Нет соединения с сервером. Проверьте интернет и попробуйте снова." });
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="glass-strong clip-corner corner-brackets relative rounded-sm p-5 drop-shadow-[0_0_28px_rgba(249,115,22,0.12)] sm:p-6"
      >
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder="Ссылка на Steam / Dotabuff / OpenDota профиль"
              className="pl-10"
              autoComplete="off"
              spellCheck={false}
              disabled={loading}
              aria-label="Ссылка на профиль"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Gauge className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={mmr}
                onChange={(e) => setMmr(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="Текущий MMR, например 3400"
                className="pl-10"
                inputMode="numeric"
                disabled={loading}
                aria-label="Текущий MMR"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="sm:w-56">
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Анализ…
                </>
              ) : (
                <>
                  <Search /> Анализировать
                </>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-ember-600/20 bg-ember-600/[0.07] px-4 py-3">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-500 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ember-500" />
                </span>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={step}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-sm text-ember-200/90"
                  >
                    {LOADING_STEPS[step]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              role="alert"
            >
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/25 bg-red-500/[0.08] px-4 py-3 text-red-200">
                <span className="mt-0.5 shrink-0 text-red-400">
                  {ERROR_ICONS[error.code] ?? <AlertTriangle className="h-5 w-5" />}
                </span>
                <p className="text-sm leading-relaxed">{error.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <p className="mt-3 text-center text-xs text-muted-foreground/70">
        Поддерживаются ссылки вида{" "}
        <span className="text-muted-foreground">steamcommunity.com/profiles/…</span>,{" "}
        <span className="text-muted-foreground">dotabuff.com/players/…</span>,{" "}
        <span className="text-muted-foreground">opendota.com/players/…</span> и числовой ID.
        Анализируются только рейтинговые матчи.
      </p>
    </div>
  );
}
