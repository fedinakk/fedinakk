import { NextRequest, NextResponse } from "next/server";
import { getAnalysisByShareId } from "@/lib/analysis-service";
import { toAppError } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const envelope = await getAnalysisByShareId(id);
    if (!envelope) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Анализ не найден или срок его хранения истёк." } },
        { status: 404 },
      );
    }
    return NextResponse.json({ shareId: envelope.shareId, result: envelope.result });
  } catch (error) {
    const appError = toAppError(error);
    return NextResponse.json(
      { error: { code: appError.code, message: appError.message } },
      { status: appError.status },
    );
  }
}
