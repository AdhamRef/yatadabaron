"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { X, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { loginSchema } from "@/lib/validators";

export function AuthGateModal({
  open,
  onClose,
  onGuest,
  redirectTo,
}: {
  open: boolean;
  onClose: () => void;
  onGuest: () => void;
  redirectTo: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"choice" | "email">("choice");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[String(i.path[0])] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await signIn("credentials", { ...parsed.data, redirect: false });
      if (res?.error) {
        toast.error("بيانات الدخول غير صحيحة");
      } else {
        toast.success("تم الدخول");
        router.push(redirectTo);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-brand-950/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-md rounded-3xl bg-white dark:bg-brand-950 border border-brand-100 dark:border-brand-900 p-7 shadow-glow"
          >
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="absolute top-3 end-3 h-9 w-9 grid place-items-center rounded-xl text-brand-600 hover:bg-brand-100 dark:hover:bg-brand-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🕌</div>
              <h2 className="font-display text-2xl font-bold text-brand-900 dark:text-brand-50">
                لنبدأ الاختبار
              </h2>
              <p className="text-sm text-brand-700/80 dark:text-brand-200/80 mt-1">
                سجّل دخولك لحفظ نتيجتك وسلسلة إنجازاتك.
              </p>
            </div>

            {mode === "choice" ? (
              <div className="space-y-3">
                <button
                  onClick={() => signIn("google", { callbackUrl: redirectTo })}
                  className="w-full h-12 rounded-2xl bg-white dark:bg-brand-900/60 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900 font-semibold text-sm text-brand-900 dark:text-brand-50 flex items-center justify-center gap-3 transition-colors"
                >
                  <GoogleIcon />
                  المتابعة باستخدام Google
                </button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => setMode("email")}
                >
                  <Mail className="h-4 w-4" />
                  الدخول بالبريد الإلكتروني
                </Button>
                <Link href={`/register?callbackUrl=${encodeURIComponent(redirectTo)}`} className="block">
                  <Button variant="ghost" size="lg" className="w-full">
                    إنشاء حساب جديد
                  </Button>
                </Link>

                <div className="relative flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-brand-100 dark:bg-brand-900" />
                  <span className="text-xs text-brand-600/70 dark:text-brand-300/70 font-semibold">أو</span>
                  <div className="flex-1 h-px bg-brand-100 dark:bg-brand-900" />
                </div>

                <Button variant="outline" size="lg" className="w-full" onClick={onGuest}>
                  المتابعة كضيف
                </Button>
                <p className="text-[11px] text-brand-600/70 dark:text-brand-300/70 text-center leading-relaxed">
                  كضيف لن تُحفظ نتائجك في سجلك، ولن تتراكم سلسلة الإنجازات.
                </p>
              </div>
            ) : (
              <form onSubmit={onEmailSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="gate-email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                    <Input id="gate-email" name="email" type="email" dir="ltr" className="text-start pe-10" />
                  </div>
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="gate-password">كلمة السر</Label>
                  <div className="relative">
                    <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                    <Input id="gate-password" name="password" type="password" className="pe-10" />
                  </div>
                  {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                </div>
                <Button type="submit" loading={loading} size="lg" className="w-full">
                  دخول ومتابعة
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setMode("choice")}
                >
                  ← العودة للخيارات
                </Button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
