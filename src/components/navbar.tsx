"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Moon,
  Sun,
  Volume2,
  VolumeX,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/components/sound-provider";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { UserAvatar } from "@/components/user-avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type NavUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: "USER" | "ADMIN";
} | null;

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "الرئيسية" },
  { href: "/quizzes", label: "الاختبارات" },
  { href: "/profile", label: "ملفي" },
];

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { enabled, toggle } = useSound();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close mobile menu on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  async function doSignOut() {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setSigningOut(false);
      setConfirmingSignOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/60 dark:border-brand-900/60 bg-white/75 dark:bg-brand-950/70 backdrop-blur-xl">
      <Container className="flex h-16 items-center gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Logo />
          <div className="leading-tight hidden xs:block sm:block">
            <div className="font-bold text-lg text-brand-900 dark:text-brand-50 group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors">
              أفلا يتدبرون
            </div>
            <div className="text-[10px] text-brand-600 dark:text-brand-300 tracking-[0.18em] uppercase">
              Islamic Quiz
            </div>
          </div>
        </Link>

        {/* Desktop nav — pill style */}
        <nav className="hidden md:flex items-center gap-0.5 mx-auto p-1 rounded-full bg-brand-50/70 dark:bg-brand-900/50 border border-brand-100/60 dark:border-brand-900/60">
          {LINKS.map((l) => {
            const active =
              pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors",
                  active
                    ? "text-white"
                    : "text-brand-700 dark:text-brand-200 hover:text-brand-900 dark:hover:text-brand-50"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-soft"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 ms-auto md:ms-0">
          <IconButton
            aria-label={enabled ? "كتم الصوت" : "تشغيل الصوت"}
            onClick={toggle}
            className="hidden sm:inline-flex"
          >
            {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </IconButton>
          <IconButton
            aria-label="تبديل الوضع"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4 opacity-0" />
            )}
          </IconButton>

          <div className="hidden md:block w-px h-6 bg-brand-100 dark:bg-brand-900 mx-1" />

          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  دخول
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">تسجيل</Button>
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <IconButton
            className="md:hidden"
            aria-label="قائمة"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </IconButton>
        </div>
      </Container>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden overflow-hidden border-t border-brand-100/60 dark:border-brand-900/60"
          >
            <Container className="py-3 flex flex-col gap-1">
              {user && (
                <div className="flex items-center gap-3 p-2.5 mb-1.5 rounded-2xl bg-brand-50/70 dark:bg-brand-900/40 border border-brand-100 dark:border-brand-900">
                  <UserAvatar size="md" name={user.name} image={user.image} />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-brand-900 dark:text-brand-50 truncate">
                      {user.name ?? "مستخدم"}
                    </div>
                    {user.email && (
                      <div dir="ltr" className="text-[11px] text-brand-700/70 dark:text-brand-200/70 truncate text-start">
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {LINKS.map((l) => {
                const active =
                  pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-sm font-semibold",
                      active
                        ? "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-50"
                        : "text-brand-800 dark:text-brand-100 hover:bg-brand-100/60 dark:hover:bg-brand-900/60"
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-gold-700 dark:text-gold-300 hover:bg-gold-50 dark:hover:bg-gold-900/30 flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  لوحة التحكم
                </Link>
              )}

              {user ? (
                <>
                  <div className="border-t border-brand-100/60 dark:border-brand-900/60 my-2" />
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setConfirmingSignOut(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-start"
                  >
                    <LogOut className="h-4 w-4 opacity-70" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-brand-100/60 dark:border-brand-900/60 my-2" />
                  <div className="flex gap-2">
                    <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        <UserIcon className="h-4 w-4" />
                        دخول
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">تسجيل</Button>
                    </Link>
                  </div>
                </>
              )}
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmingSignOut}
        variant="danger"
        icon={<LogOut className="h-6 w-6" />}
        title="تسجيل الخروج؟"
        description="سيتم إنهاء جلستك الحالية. يمكنك الدخول مرة أخرى في أي وقت."
        confirmLabel="تسجيل الخروج"
        cancelLabel="بقاء"
        loading={signingOut}
        onCancel={() => setConfirmingSignOut(false)}
        onConfirm={doSignOut}
      />
    </header>
  );
}

function IconButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "h-10 w-10 rounded-full grid place-items-center text-brand-700 dark:text-brand-200",
        "hover:bg-brand-100/70 dark:hover:bg-brand-900/60 transition-colors",
        "focus-visible:ring-2 focus-visible:ring-brand-400 focus:outline-none",
        className
      )}
    >
      {children}
    </button>
  );
}

function Logo() {
  return (
    <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-400 via-brand-600 to-brand-800 grid place-items-center shadow-soft overflow-hidden">
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
      <svg viewBox="0 0 32 32" className="relative h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M16 3 L29 16 L16 29 L3 16 Z" />
        <path d="M16 9 L23 16 L16 23 L9 16 Z" />
        <circle cx="16" cy="16" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}
