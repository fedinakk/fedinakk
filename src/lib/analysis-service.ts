import { cacheGet, cacheSet } from "@/lib/cache";
import { analyzeAccount } from "@/lib/engine/analyzer";
import type { AnalysisResult } from "@/lib/engine/types";
import { prisma, safeDb } from "@/lib/prisma";
import { generateShareId } from "@/lib/utils";

/** How long an identical request is served from memory. */
const MEMORY_TTL_MS = 15 * 60 * 1000;
/** How long a stored snapshot is reused instead of re-hitting OpenDota. */
const DB_REUSE_WINDOW_MS = 30 * 60 * 1000;

export interface AnalysisEnvelope {
  /** null when the database is unavailable — the result is still returned. */
  shareId: string | null;
  result: AnalysisResult;
  cached: boolean;
}

/** Stored snapshots from older engine versions are not renderable — recompute. */
function isCurrentSchema(value: unknown): value is AnalysisResult {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { schemaVersion?: number }).schemaVersion === 2
  );
}

function memoryKey(accountId: number, currentMmr: number): string {
  return `analysis:${accountId}:${currentMmr}`;
}

export async function runAnalysis(accountId: number, currentMmr: number): Promise<AnalysisEnvelope> {
  const key = memoryKey(accountId, currentMmr);

  const memory = cacheGet<AnalysisEnvelope>(key);
  if (memory) return { ...memory, cached: true };

  const recent = await safeDb(() =>
    prisma.analysis.findFirst({
      where: {
        accountId: BigInt(accountId),
        currentMmr,
        createdAt: { gt: new Date(Date.now() - DB_REUSE_WINDOW_MS) },
      },
      orderBy: { createdAt: "desc" },
    }),
  );
  if (recent && isCurrentSchema(recent.result)) {
    const envelope: AnalysisEnvelope = {
      shareId: recent.shareId,
      result: recent.result,
      cached: true,
    };
    cacheSet(key, envelope, MEMORY_TTL_MS);
    return envelope;
  }

  const result = await analyzeAccount(accountId, currentMmr);

  const shareId = generateShareId();
  const stored = await safeDb(() =>
    prisma.analysis.create({
      data: {
        shareId,
        accountId: BigInt(accountId),
        personaName: result.player.personaName,
        avatarUrl: result.player.avatarUrl,
        currentMmr,
        result: result as unknown as object,
      },
    }),
  );

  const envelope: AnalysisEnvelope = {
    shareId: stored ? shareId : null,
    result,
    cached: false,
  };
  cacheSet(key, envelope, MEMORY_TTL_MS);
  return envelope;
}

export async function getAnalysisByShareId(shareId: string): Promise<AnalysisEnvelope | null> {
  const row = await safeDb(() => prisma.analysis.findUnique({ where: { shareId } }));
  if (!row || !isCurrentSchema(row.result)) return null;
  return {
    shareId: row.shareId,
    result: row.result,
    cached: true,
  };
}
