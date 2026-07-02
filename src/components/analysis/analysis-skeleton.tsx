import { Skeleton } from "@/components/ui/skeleton";

/** Full-page loading state for the analysis dashboard. */
export function AnalysisSkeleton() {
  return (
    <div className="container space-y-10 py-10" aria-busy aria-label="Загрузка анализа">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* overall card */}
      <div className="glass rounded-xl p-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr_220px]">
          <div className="flex items-center gap-4">
            <Skeleton className="h-[72px] w-[72px] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-8">
            <Skeleton className="h-24 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-28 w-36" />
          </div>
          <div className="flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* insights */}
      <div className="glass space-y-3 rounded-xl p-6">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>

      {/* role cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
