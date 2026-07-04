import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAnalysis } from "@/lib/analysis-service";
import { AppError, toAppError } from "@/lib/errors";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { resolveProfileToAccountId } from "@/lib/steam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel: analysis with role backfill can take 15-30s — raise the
// serverless function limit above the default.
export const maxDuration = 60;

const BodySchema = z.object({
  profile: z.string().trim().min(1).max(300),
  currentMmr: z.coerce.number().int().min(0).max(15000),
});

const RATE_LIMIT = 6;
const RATE_WINDOW_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const ip = clientIpFrom(req.headers);
    const rl = rateLimit(`analyze:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
    if (!rl.ok) {
      const error = new AppError("RATE_LIMITED");
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status, headers: { "Retry-After": String(rl.retryAfterSec) } },
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) throw new AppError("INVALID_INPUT");

    const accountId = await resolveProfileToAccountId(parsed.data.profile);
    const envelope = await runAnalysis(accountId, parsed.data.currentMmr);

    return NextResponse.json({
      shareId: envelope.shareId,
      cached: envelope.cached,
      result: envelope.result,
    });
  } catch (error) {
    const appError = toAppError(error);
    return NextResponse.json(
      { error: { code: appError.code, message: appError.message } },
      { status: appError.status },
    );
  }
}
