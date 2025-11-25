import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TradesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="mb-6 space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-full max-w-lg" />
      </div>

      {/* Trades Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-8 w-8 mx-auto" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
