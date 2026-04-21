"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { loginSchema } from "@/lib/validators";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        ...parsed.data,
        redirect: false,
      });
      if (res?.error) {
        toast.error("بيانات الدخول غير صحيحة");
      } else {
        toast.success("تم الدخول بنجاح");
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full h-12 rounded-2xl bg-white dark:bg-brand-900/60 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900 font-semibold text-sm text-brand-900 dark:text-brand-50 flex items-center justify-center gap-3 transition-colors"
      >
        <GoogleIcon />
        المتابعة باستخدام Google
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-brand-100 dark:bg-brand-900" />
        <span className="text-xs text-brand-600/70 dark:text-brand-300/70 font-semibold">أو</span>
        <div className="flex-1 h-px bg-brand-100 dark:bg-brand-900" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" dir="ltr" className="text-start pe-10" />
          </div>
          {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="password">كلمة السر</Label>
          <div className="relative">
            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
            <Input id="password" name="password" type="password" autoComplete="current-password" className="pe-10" />
          </div>
          {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          دخول
        </Button>
      </form>
    </div>
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
