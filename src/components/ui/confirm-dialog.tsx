"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Variant = "danger" | "default";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "default",
  loading,
  icon,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  // Esc closes the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-brand-950/70 backdrop-blur-sm"
            onClick={loading ? undefined : onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-brand-950 border border-brand-100 dark:border-brand-900 p-7 shadow-glow text-center"
          >
            <button
              onClick={onCancel}
              disabled={loading}
              aria-label="إغلاق"
              className="absolute top-3 end-3 h-9 w-9 grid place-items-center rounded-xl text-brand-600 hover:bg-brand-100 dark:hover:bg-brand-900 disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              className={
                "h-14 w-14 rounded-2xl grid place-items-center mx-auto mb-4 " +
                (variant === "danger"
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"
                  : "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200")
              }
            >
              {icon ?? <AlertTriangle className="h-7 w-7" />}
            </div>

            <h2 className="font-display text-xl font-bold text-brand-900 dark:text-brand-50 mb-1.5">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-brand-700/80 dark:text-brand-200/80 leading-relaxed mb-6">
                {description}
              </p>
            )}

            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="lg" onClick={onCancel} disabled={loading} className="flex-1">
                {cancelLabel}
              </Button>
              <Button
                variant={variant === "danger" ? "danger" : "primary"}
                size="lg"
                onClick={onConfirm}
                loading={loading}
                className="flex-1"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
