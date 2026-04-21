import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Users, Trophy, ArrowLeft } from "lucide-react";
import { toArabicDigits, quizIdOrSlugWhere } from "@/lib/utils";
import { auth } from "@/auth";
import { StartQuizButton } from "@/components/quiz/start-quiz-button";

export const dynamic = "force-dynamic";

const DIFF: Record<string, { label: string; tone: "brand" | "amber" | "rose" }> = {
  EASY: { label: "سهل", tone: "brand" },
  MEDIUM: { label: "متوسط", tone: "amber" },
  HARD: { label: "صعب", tone: "rose" },
};

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: quizIdOrSlugWhere(slug),
    include: {
      _count: { select: { questions: true, attempts: true } },
    },
  });
  if (!quiz || !quiz.published) notFound();

  const session = await auth();
  const diff = DIFF[quiz.difficulty];

  return (
    <Container className="py-10 sm:py-16 max-w-3xl">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-300 hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        جميع الاختبارات
      </Link>

      <Card className="p-8 sm:p-12 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-20 -end-20 h-60 w-60 rounded-full bg-gradient-to-br from-brand-100 to-transparent dark:from-brand-900/40"
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="text-6xl sm:text-7xl">{quiz.coverEmoji}</div>
            <Badge tone={diff.tone}>{diff.label}</Badge>
          </div>
          {quiz.episode && (
            <div className="text-sm text-brand-600 dark:text-brand-300 font-bold mb-2">
              {quiz.episode}
            </div>
          )}
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 dark:text-brand-50 text-balance">
            {quiz.title}
          </h1>
          {quiz.description && (
            <p className="mt-4 text-brand-700 dark:text-brand-200 leading-relaxed text-balance">
              {quiz.description}
            </p>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3">
            <Stat label="الأسئلة" value={toArabicDigits(quiz._count.questions)} icon={<HelpCircle className="h-4 w-4" />} />
            <Stat label="محاولة" value={toArabicDigits(quiz._count.attempts)} icon={<Users className="h-4 w-4" />} />
            <Stat label="المستوى" value={diff.label} icon={<Trophy className="h-4 w-4" />} />
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-brand-50 dark:bg-brand-900/40 border border-brand-100 dark:border-brand-800">
            <h3 className="font-bold text-brand-900 dark:text-brand-50 mb-2">قبل أن تبدأ</h3>
            <ul className="text-sm text-brand-700 dark:text-brand-200 space-y-1.5 leading-relaxed">
              <li>• سؤال واحد في كل مرة — يمكنك تغيير إجابتك قبل الانتقال.</li>
              <li>• سترى المراجعة الكاملة في نهاية الاختبار.</li>
              <li>• النتائج تُحفظ في ملفك الشخصي عند تسجيل الدخول.</li>
            </ul>
          </div>

          <div className="mt-8">
            <StartQuizButton quizRef={quiz.slug} isLoggedIn={!!session?.user} />
          </div>
        </div>
      </Card>
    </Container>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs text-brand-600 dark:text-brand-300 font-semibold mb-1">
        {icon} {label}
      </div>
      <div className="text-xl font-bold text-brand-900 dark:text-brand-50">{value}</div>
    </div>
  );
}
