import { redirect } from "next/navigation";
import Link from "next/link";
import { Flame, Trophy, Target, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scorePercent, gradeLabel, toArabicDigits, formatDuration } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "ملفي" };
export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile");

  console.log(session?.user)

  const [user, attempts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, streak: true, bestScore: true, lastQuizAt: true, createdAt: true },
    }),
    prisma.attempt.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      orderBy: { finishedAt: "desc" },
      take: 20,
      include: { quiz: { select: { title: true, slug: true, coverEmoji: true } } },
    }),
  ]);

  if (!user) redirect("/login");

  const totalAttempts = attempts.length;
  const avgPercent =
    totalAttempts > 0
      ? Math.round(attempts.reduce((a, x) => a + scorePercent(x.score, x.total), 0) / totalAttempts)
      : 0;

  return (
    <Container className="py-10 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-4xl font-bold text-brand-900 dark:text-brand-50">
          مرحبًا، {user.name ?? "صديقي"}
        </h1>
        <p className="text-brand-700/80 dark:text-brand-200/80 mt-1 text-sm">
          انضممت منذ {new Date(user.createdAt).toLocaleDateString("ar-EG")}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="السلسلة" value={toArabicDigits(user.streak)} sub="أسبوع" />
        <StatCard icon={<Trophy className="h-5 w-5 text-gold-500" />} label="أفضل نتيجة" value={`${toArabicDigits(user.bestScore)}٪`} />
        <StatCard icon={<Target className="h-5 w-5 text-brand-500" />} label="المعدل" value={`${toArabicDigits(avgPercent)}٪`} />
        <StatCard icon={<Trophy className="h-5 w-5 text-brand-500" />} label="المحاولات" value={toArabicDigits(totalAttempts)} />
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-brand-900 dark:text-brand-50 mb-4">آخر محاولاتي</h2>
        {attempts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-brand-700/80 dark:text-brand-200/80 mb-4">
              لم تجرّب أي اختبار بعد.
            </p>
            <Link href="/quizzes" className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300 hover:underline text-sm font-semibold">
              ابدأ الآن <ArrowLeft className="h-4 w-4" />
            </Link>
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
                  className="flex items-center gap-3 py-3 hover:bg-brand-50/40 dark:hover:bg-brand-900/30 rounded-xl px-2 -mx-2 transition-colors"
                >
                  <div className="text-2xl">{a.quiz.coverEmoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-brand-900 dark:text-brand-50 truncate">
                      {a.quiz.title}
                    </div>
                    <div className="text-xs text-brand-700/70 dark:text-brand-200/70">
                      {formatDuration(a.durationSec)} · {new Date(a.finishedAt!).toLocaleDateString("ar-EG")}
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <div className={`text-sm font-bold ${g.tone}`}>{toArabicDigits(p)}٪</div>
                    <div className="text-[11px] text-brand-700/60 dark:text-brand-200/60">
                      {toArabicDigits(a.score)}/{toArabicDigits(a.total)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </Container>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-2">
        {icon} {label}
      </div>
      <div className="text-2xl font-bold text-brand-900 dark:text-brand-50 arabic-numerals">
        {value}
        {sub && <span className="text-sm text-brand-600 dark:text-brand-300 ms-1 font-semibold">{sub}</span>}
      </div>
    </Card>
  );
}
