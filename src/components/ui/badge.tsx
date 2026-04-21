import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "brand" | "gold" | "rose" | "amber" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-100",
  gold: "bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-200",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
  neutral: "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200",
};

export function Badge({
  tone = "brand",
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...rest}
    />
  );
}
