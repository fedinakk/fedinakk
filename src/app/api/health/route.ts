import { NextResponse } from "next/server";
import { describeNetworkError } from "@/lib/opendota/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckResult {
  ok: boolean;
  latencyMs?: number;
  status?: number;
  error?: string;
}

/**
 * Self-diagnostics for operators: verifies that the server can reach
 * OpenDota and the database. Open /api/health when the UI reports
 * "источник данных недоступен".
 */
export async function GET() {
  const [opendota, database] = await Promise.all([checkOpenDota(), checkDatabase()]);

  const hints: string[] = [];
  if (!opendota.ok) {
    hints.push(
      "Сервер не может достучаться до api.opendota.com. Проверьте: 1) есть ли у сервера/контейнера доступ в интернет; 2) не блокирует ли файрвол или корпоративный прокси исходящие HTTPS-запросы (Node fetch не использует системные настройки прокси); 3) в Docker-сетях со сломанным IPv6 помогает NODE_OPTIONS=--dns-result-order=ipv4first (в Dockerfile уже включено — пересоберите образ); 4) статус самой OpenDota: https://www.opendota.com.",
    );
  }
  if (!database.ok) {
    hints.push(
      "База данных недоступна — анализ работает, но share-ссылки и кэш не сохраняются. Проверьте DATABASE_URL и что PostgreSQL запущен (docker compose up -d db).",
    );
  }

  const status = opendota.ok ? (database.ok ? "ok" : "degraded") : "error";
  return NextResponse.json(
    { status, opendota, database, hints },
    { status: opendota.ok ? 200 : 503 },
  );
}

async function checkOpenDota(): Promise<CheckResult> {
  const started = Date.now();
  try {
    const res = await fetch("https://api.opendota.com/api/constants/patch", {
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - started };
  } catch (error) {
    return { ok: false, latencyMs: Date.now() - started, error: describeNetworkError(error) };
  }
}

async function checkDatabase(): Promise<CheckResult> {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message.split("\n").slice(-3).join(" ").trim() : String(error),
    };
  }
}
