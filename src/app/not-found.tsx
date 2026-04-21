import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-24 text-center max-w-xl">
      <div className="text-7xl mb-6">🕌</div>
      <h1 className="font-display text-5xl font-bold text-brand-900 dark:text-brand-50 mb-3">
        ٤٠٤
      </h1>
      <p className="text-brand-700/80 dark:text-brand-200/80 mb-8 leading-relaxed">
        الصفحة التي تبحث عنها غير موجودة. لا بأس — ابدأ اختبارًا جديدًا.
      </p>
      <Link href="/quizzes">
        <Button size="lg">استعرض الاختبارات</Button>
      </Link>
    </Container>
  );
}
