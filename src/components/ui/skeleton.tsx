import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-xl bg-brand-100/60 dark:bg-brand-900/40 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 shimmer opacity-40" />
    </div>
  );
}
