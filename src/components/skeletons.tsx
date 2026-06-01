import { cn } from "@/lib/utils";

function Box({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <Box className="h-8 w-48" />
        <Box className="h-4 w-80 max-w-full" />
      </div>
      <div className="mb-6 space-y-3">
        <Box className="h-7 w-full max-w-lg" />
        <Box className="h-7 w-full max-w-md" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Box className="aspect-[4/3] w-full" />
            <Box className="h-4 w-3/4" />
            <Box className="h-5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Box className="mb-6 h-4 w-24" />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.4fr]">
        <Box className="aspect-square w-full" />
        <div className="space-y-3">
          <Box className="h-6 w-32" />
          <Box className="h-8 w-full" />
          <Box className="h-4 w-2/3" />
        </div>
      </div>
      <div className="mt-10 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
