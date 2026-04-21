import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Users, HelpCircle } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";
import { DeleteQuizButton } from "@/components/admin/delete-quiz-button";

export const dynamic = "force-dynamic";

export default async function AdminQuizzesPage() {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, attempts: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-brand-900 dark:text-brand-50">الاختبارات</h2>
        <Link href="/admin/quizzes/new">
          <Button>
            <Plus className="h-4 w-4" />
            اختبار جديد
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-brand-700 dark:text-brand-200">لا توجد اختبارات — أضف أول اختبار.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((q) => (
            <Card key={q.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="min-w-0 flex-1 flex items-start gap-4">
                <div className="text-4xl shrink-0">{q.coverEmoji}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-brand-900 dark:text-brand-50 truncate">{q.title}</h3>
                    {q.published ? (
                      <Badge tone="brand">منشور</Badge>
                    ) : (
                      <Badge tone="amber">مسودة</Badge>
                    )}
                    <Badge tone="neutral">{q.difficulty === "EASY" ? "سهل" : q.difficulty === "HARD" ? "صعب" : "متوسط"}</Badge>
                  </div>
                  {q.episode && (
                    <div className="text-xs text-brand-600 dark:text-brand-300 font-semibold mb-1">{q.episode}</div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-brand-700/70 dark:text-brand-200/70">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" />
                      {toArabicDigits(q._count.questions)} سؤال
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {toArabicDigits(q._count.attempts)} محاولة
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/quizzes/${q.id}`}>
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4" />
                    تعديل
                  </Button>
                </Link>
                <DeleteQuizButton id={q.id} title={q.title} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
