import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration, gradeLabel, scorePercent, toArabicDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const attempts = await prisma.attempt.findMany({
    where: { status: "COMPLETED" },
    orderBy: { finishedAt: "desc" },
    take: 100,
    include: {
      quiz: { select: { title: true, slug: true, coverEmoji: true } },
      user: { select: { name: true, email: true, image: true } },
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-900 dark:text-brand-50 mb-1">جميع المحاولات</h2>
      <p className="text-sm text-brand-700/80 dark:text-brand-200/80 mb-6">
        آخر {toArabicDigits(attempts.length)} محاولة.
      </p>

      <Card className="overflow-hidden">
        {attempts.length === 0 ? (
          <div className="p-10 text-center text-brand-700/80 dark:text-brand-200/80">
            لا توجد محاولات بعد.
          </div>
        ) : (
          <div className="divide-y divide-brand-100 dark:divide-brand-900">
            {attempts.map((a) => {
              const p = scorePercent(a.score, a.total);
              const g = gradeLabel(p);
              return (
                <Link
                  key={a.id}
                  href={`/result/${a.id}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-brand-50/50 dark:hover:bg-brand-900/30 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3 flex-1">
                    <div className="text-2xl">{a.quiz.coverEmoji}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-brand-900 dark:text-brand-50 truncate">
                        {a.quiz.title}
                      </div>
                      <div className="text-xs text-brand-700/70 dark:text-brand-200/70 truncate">
                        {a.user?.name || a.user?.email || a.guestName || "ضيف"}
                        {a.finishedAt && (
                          <> · {new Date(a.finishedAt).toLocaleString("ar-EG")}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone="neutral" className="font-mono">{formatDuration(a.durationSec)}</Badge>
                    <div className="text-end">
                      <div className={`text-sm font-bold ${g.tone}`}>
                        {toArabicDigits(p)}٪
                      </div>
                      <div className="text-[11px] text-brand-700/60 dark:text-brand-200/60">
                        {toArabicDigits(a.score)}/{toArabicDigits(a.total)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
