"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, User as UserIcon, LayoutDashboard, ChevronDown } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

type NavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "USER" | "ADMIN";
};

export function UserMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function doSignOut() {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setSigningOut(false);
      setConfirming(false);
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-full p-0.5 ps-2 transition-colors",
          "hover:bg-brand-100/60 dark:hover:bg-brand-900/60",
          open && "bg-brand-100/60 dark:bg-brand-900/60"
        )}
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-brand-600 dark:text-brand-300 transition-transform",
            open && "rotate-180"
          )}
        />
        <UserAvatar size="md" name={user.name} image={user.image} ring />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute end-0 mt-2 w-64 rounded-2xl bg-white dark:bg-brand-950 border border-brand-100 dark:border-brand-900 shadow-glow overflow-hidden z-50"
          >
            <div className="p-4 flex items-center gap-3 border-b border-brand-100 dark:border-brand-900 bg-brand-50/60 dark:bg-brand-900/40">
              <UserAvatar size="lg" name={user.name} image={user.image} />
              <div className="min-w-0">
                <div className="font-bold text-brand-900 dark:text-brand-50 truncate">
                  {user.name ?? "مستخدم"}
                </div>
                {user.email && (
                  <div
                    dir="ltr"
                    className="text-xs text-brand-700/70 dark:text-brand-200/70 truncate text-start"
                  >
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            <div className="p-1.5">
              <MenuLink href="/profile" icon={<UserIcon className="h-4 w-4" />} onClick={() => setOpen(false)}>
                ملفي الشخصي
              </MenuLink>
              {user.role === "ADMIN" && (
                <MenuLink
                  href="/admin"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={() => setOpen(false)}
                  tone="gold"
                >
                  لوحة التحكم
                </MenuLink>
              )}
            </div>

            <div className="border-t border-brand-100 dark:border-brand-900 p-1.5">
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setConfirming(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors text-start"
              >
                <LogOut className="h-4 w-4 opacity-70" />
                تسجيل الخروج
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirming}
        variant="danger"
        icon={<LogOut className="h-6 w-6" />}
        title="تسجيل الخروج؟"
        description="سيتم إنهاء جلستك الحالية. يمكنك الدخول مرة أخرى في أي وقت."
        confirmLabel="تسجيل الخروج"
        cancelLabel="بقاء"
        loading={signingOut}
        onCancel={() => setConfirming(false)}
        onConfirm={doSignOut}
      />
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
  tone = "default",
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "default" | "gold";
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
        tone === "gold"
          ? "text-gold-700 dark:text-gold-300 hover:bg-gold-50 dark:hover:bg-gold-900/30"
          : "text-brand-800 dark:text-brand-100 hover:bg-brand-50 dark:hover:bg-brand-900/60"
      )}
    >
      <span className="opacity-70">{icon}</span>
      {children}
    </Link>
  );
}
