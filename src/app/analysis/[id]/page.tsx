import type { Metadata } from "next";
import { AnalysisView } from "@/components/analysis/analysis-view";
import { getAnalysisByShareId } from "@/lib/analysis-service";
import type { AnalysisResult } from "@/lib/engine/types";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadResult(id: string): Promise<AnalysisResult | null> {
  if (id.startsWith("local-")) return null; // client-side only (sessionStorage)
  const envelope = await getAnalysisByShareId(id);
  return envelope?.result ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await loadResult(id);
  if (!result) {
    return { title: "Анализ аккаунта", robots: { index: false } };
  }
  const title = `${result.player.personaName} — потенциал ${formatNumber(result.potentialMmr)} MMR`;
  const description = `Текущий MMR ${formatNumber(result.currentMmr)}, потенциал ${formatNumber(result.potentialMmr)}. Анализ ${result.matchInsights.totalMatches} рейтинговых матчей: роли, герои, стратегия подъёма.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
    robots: { index: false },
  };
}

export default async function AnalysisPage({ params }: PageProps) {
  const { id } = await params;
  const initial = await loadResult(id);
  return <AnalysisView shareId={id} initial={initial} />;
}
