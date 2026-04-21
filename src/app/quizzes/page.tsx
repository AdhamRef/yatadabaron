import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { QuizCard } from "@/components/quiz-card";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export const metadata = { title: "جميع الاختبارات" };
export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, attempts: true } } },
  });

  return (
    <Container className="py-10 sm:py-16">
      <div className="mb-10 text-center sm:text-start">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-brand-900 dark:text-brand-50">
          الاختبارات
        </h1>
        <p className="mt-3 text-brand-700/80 dark:text-brand-200/80 max-w-2xl">
          اختر اختبارًا وابدأ رحلتك المعرفية. كل اختبار يقيس فهمك لحلقة معينة.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-14 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-brand-400 mb-4" />
          <h3 className="text-xl font-bold text-brand-900 dark:text-brand-50 mb-2">
            لم يتم نشر اختبارات بعد
          </h3>
          <p className="text-brand-700/80 dark:text-brand-200/80">
            تابعنا قريبًا — يتم تحديث المحتوى باستمرار.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((q) => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
      )}
    </Container>
  );
}
