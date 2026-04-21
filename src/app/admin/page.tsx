import Link from "next/link";
import { BookOpen, HelpCircle, Users, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toArabicDigits, scorePercent, gradeLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [quizCount, questionCount, attemptCount, recentAttempts, topQuizzes] = await Promise.all([
    prisma.quiz.count(),
    prisma.question.count(),
    prisma.attempt.count({ where: { status: "COMPLETED" } }),
    prisma.attempt.findMany({
      where: { status: "COMPLETED" },
      orderBy: { finishedAt: "desc" },
      take: 8,
      include: {
        quiz: { select: { title: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.quiz.findMany({
      orderBy: { attempts: { _count: "desc" } },
      take: 5,
      include: { _count: { select: { attempts: true, questions: true } } },
    }),
  ]);

  const avg =
    recentAttempts.length > 0
      ? Math.round(
          recentAttempts.reduce((a, x) => a + scorePercent(x.score, x.total), 0) /
            recentAttempts.length
        )
      : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen className="h-5 w-5" />} label="الاختبارات" value={toArabicDigits(quizCount)} />
        <StatCard icon={<HelpCircle className="h-5 w-5" />} label="الأسئلة" value={toArabicDigits(questionCount)} />
        <StatCard icon={<Users className="h-5 w-5" />} label="المحاولات" value={toArabicDigits(attemptCount)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="متوسط الأداء" value={`${toArabicDigits(avg)}٪`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold text-brand-900 dark:text-brand-50 mb-4">آخر المحاولات</h3>
          {recentAttempts.length === 0 ? (
            <div className="text-sm text-brand-700/70 dark:text-brand-200/70">لا توجد محاولات بعد.</div>
          ) : (
            <div className="divide-y divide-brand-100 dark:divide-brand-900">
              {recentAttempts.map((a) => {
                const p = scorePercent(a.score, a.total);
                const g = gradeLabel(p);
                return (
                  <div key={a.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-brand-900 dark:text-brand-50 truncate">
                        {a.quiz.title}
                      </div>
                      <div className="text-xs text-brand-700/70 dark:text-brand-200/70 truncate">
                        {a.user?.name || a.user?.email || a.guestName || "ضيف"}
                      </div>
                    </div>
                    <div className="text-start shrink-0">
                      <div className={`text-sm font-bold ${g.tone}`}>
                        {toArabicDigits(p)}٪
                      </div>
                      <div className="text-[11px] text-brand-700/60 dark:text-brand-200/60">
                        {toArabicDigits(a.score)}/{toArabicDigits(a.total)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-brand-900 dark:text-brand-50 mb-4">الأكثر شعبية</h3>
          {topQuizzes.length === 0 ? (
            <div className="text-sm text-brand-700/70 dark:text-brand-200/70">لا توجد بيانات.</div>
          ) : (
            <div className="space-y-3">
              {topQuizzes.map((q) => (
                <Link
                  key={q.id}
                  href={`/admin/quizzes/${q.id}`}
                  className="block p-3 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-brand-900 dark:text-brand-50 truncate">
                      {q.coverEmoji} {q.title}
                    </div>
                    <Badge tone="neutral">{toArabicDigits(q._count.attempts)}</Badge>
                  </div>
                  {!q.published && (
                    <div className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold mt-1">
                      مسودة
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-2">
        {icon} {label}
      </div>
      <div className="text-3xl font-bold text-brand-900 dark:text-brand-50 arabic-numerals">{value}</div>
    </Card>
  );
}
