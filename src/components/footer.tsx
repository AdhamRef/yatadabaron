import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-100/60 dark:border-brand-900/60 bg-white/50 dark:bg-brand-950/40 backdrop-blur-sm">
      <Container className="py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-brand-700/80 dark:text-brand-200/80">
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-900 dark:text-brand-50">أفلا يتدبرون</span>
          <span className="opacity-60">— اختبارات ما بعد الحلقات.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/quizzes" className="hover:text-brand-900 dark:hover:text-brand-50">الاختبارات</Link>
          <Link href="/login" className="hover:text-brand-900 dark:hover:text-brand-50">الدخول</Link>
          <span className="opacity-60">© {new Date().getFullYear()}</span>
        </div>
      </Container>
    </footer>
  );
}
