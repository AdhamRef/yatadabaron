"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "gold";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-soft hover:shadow-glow focus-visible:ring-brand-400",
  secondary:
    "bg-white dark:bg-brand-900/60 text-brand-900 dark:text-brand-50 hover:bg-brand-50 dark:hover:bg-brand-900 border border-brand-100 dark:border-brand-800",
  ghost:
    "bg-transparent text-brand-800 dark:text-brand-100 hover:bg-brand-100/60 dark:hover:bg-brand-900/60",
  outline:
    "bg-transparent border border-brand-300 dark:border-brand-700 text-brand-800 dark:text-brand-100 hover:bg-brand-50 dark:hover:bg-brand-900/60",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 shadow-soft",
  gold:
    "bg-gradient-to-b from-gold-400 to-gold-500 text-brand-950 hover:from-gold-500 hover:to-gold-600 shadow-glow",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl gap-1.5",
  md: "h-11 px-5 text-sm rounded-2xl gap-2",
  lg: "h-14 px-7 text-base rounded-2xl gap-2",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", loading, children, disabled, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold select-none transition-all",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          variants[variant],
          sizes[size],
          className
        )}
        {...rest}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
