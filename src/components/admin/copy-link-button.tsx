"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Size = "sm" | "md";

export function CopyLinkButton({
  path,
  label = "نسخ الرابط",
  variant = "outline",
  size = "sm",
  className,
}: {
  path: string;
  label?: string;
  variant?: "outline" | "ghost" | "secondary" | "gold";
  size?: Size;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    // Prevent bubbling so clicking inside a link-row doesn't navigate.
    e.preventDefault();
    e.stopPropagation();

    const url =
      typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("تعذر النسخ");
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={copy}
      className={cn(className, copied && "border-brand-500 text-brand-700 dark:text-brand-200")}
      aria-label={label}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {label}
    </Button>
  );
}
