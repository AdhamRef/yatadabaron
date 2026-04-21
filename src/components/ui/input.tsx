import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border bg-white/60 dark:bg-brand-950/40",
          "border-brand-200 dark:border-brand-800",
          "px-4 text-sm placeholder:text-brand-700/40 dark:placeholder:text-brand-200/40",
          "text-brand-900 dark:text-brand-50",
          "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
          "transition-all",
          className
        )}
        {...rest}
      />
    );
  }
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[96px] w-full rounded-2xl border bg-white/60 dark:bg-brand-950/40",
        "border-brand-200 dark:border-brand-800",
        "px-4 py-3 text-sm placeholder:text-brand-700/40 dark:placeholder:text-brand-200/40",
        "text-brand-900 dark:text-brand-50 leading-relaxed",
        "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
        className
      )}
      {...rest}
    />
  );
});

export function Label({
  className,
  ...rest
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-sm font-semibold text-brand-800 dark:text-brand-100 mb-1.5",
        className
      )}
      {...rest}
    />
  );
}
