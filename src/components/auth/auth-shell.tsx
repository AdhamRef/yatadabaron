import Link from "next/link";
import { Card } from "@/components/ui/card";

export function AuthShell({
  title,
  subtitle,
  mode,
  children,
}: {
  title: string;
  subtitle: string;
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
      <div className="hidden lg:block">
        <div className="relative aspect-square max-w-md">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-brand-800 shadow-glow" />
          <div className="absolute inset-0 rounded-[2.5rem] pattern-islamic opacity-30" />
          <div className="absolute inset-0 rounded-[2.5rem] grid place-items-center p-10">
            <div className="text-center text-white">
              <div className="font-display text-5xl font-bold mb-3">أفلا يتدبرون</div>
              <p className="text-white/80 leading-relaxed text-balance">
                «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ»
              </p>
              <div className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-white/70">
                تعلم. راجع. ارتقِ.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-8 sm:p-10">
        <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-brand-50">{title}</h1>
        <p className="text-sm text-brand-700/80 dark:text-brand-200/80 mt-2 mb-8 leading-relaxed">{subtitle}</p>
        {children}
        <div className="mt-8 pt-6 border-t border-brand-100 dark:border-brand-900 text-center text-sm text-brand-700/80 dark:text-brand-200/80">
          {mode === "login" ? (
            <>
              ليس لديك حساب؟{" "}
              <Link href="/register" className="font-semibold text-brand-600 dark:text-brand-300 hover:underline">
                أنشئ واحدًا
              </Link>
            </>
          ) : (
            <>
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="font-semibold text-brand-600 dark:text-brand-300 hover:underline">
                سجّل الدخول
              </Link>
            </>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link href="/quizzes" className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline">
            أو تابع كضيف ←
          </Link>
        </div>
      </Card>
    </div>
  );
}
