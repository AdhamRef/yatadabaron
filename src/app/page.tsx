import Link from "next/link";
import { ArrowLeft, Sparkles, Trophy, Flame, Users, BookOpen } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { QuizCard } from "@/components/quiz-card";
import { HeroOrbit } from "@/components/hero-orbit";
import { toArabicDigits } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const [quizzes, attemptCount, quizCount] = await Promise.all([
    prisma.quiz.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { questions: true, attempts: true } } },
    }),
    prisma.attempt.count({ where: { status: "COMPLETED" } }),
    prisma.quiz.count({ where: { published: true } }),
  ]).catch(() => [[], 0, 0] as const);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Container className="pt-16 pb-24 sm:pt-24 sm:pb-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-start">
              <Badge tone="gold" className="mb-5">
                <Sparkles className="h-3 w-3" />
                تجربة تعلم جديدة
              </Badge>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-900 dark:text-brand-50 leading-[1.15] text-balance">
                اختبر فهمك بعد كل حلقة
                <span className="block bg-gradient-to-l from-brand-500 via-brand-600 to-gold-500 bg-clip-text text-transparent mt-2">
                  بطريقة ممتعة ومُلهمة
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-brand-700/90 dark:text-brand-200/90 leading-relaxed text-balance max-w-xl mx-auto lg:mx-0">
                منصة إسلامية عصرية تحوّل متابعة البودكاست إلى رحلة معرفية.
                جرّب الاختبارات، اجمع النقاط، وحافظ على سلسلة إنجازاتك.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/quizzes">
                  <Button size="lg" className="w-full sm:w-auto">
                    ابدأ اختبارًا الآن
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    إنشاء حساب مجاني
                  </Button>
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
                <Stat icon={<BookOpen className="h-4 w-4" />} label="اختبار" value={toArabicDigits(quizCount)} />
                <Stat icon={<Users className="h-4 w-4" />} label="محاولة" value={toArabicDigits(attemptCount)} />
                <Stat icon={<Flame className="h-4 w-4" />} label="بلا حدود" value="∞" />
              </div>
            </div>

            <div className="hidden lg:block">
              <HeroOrbit />
            </div>
          </div>
        </Container>
      </section>

      {/* FEATURED QUIZZES */}
      <section className="py-16">
        <Container>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 dark:text-brand-50">
                أحدث الاختبارات
              </h2>
              <p className="mt-2 text-brand-700/80 dark:text-brand-200/80">
                مختارات من أحدث ما تم نشره.
              </p>
            </div>
            <Link href="/quizzes" className="text-sm font-semibold text-brand-600 dark:text-brand-300 hover:underline">
              عرض الكل ←
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-brand-700 dark:text-brand-200">
                لا توجد اختبارات منشورة بعد. كن أول من يضيف!
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
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <Container>
          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Trophy className="h-6 w-6" />}
              title="نتائج تفاعلية"
              body="مراجعة تفصيلية لكل سؤال مع شرح الإجابات الصحيحة والاحتفال بإنجازك."
            />
            <FeatureCard
              icon={<Flame className="h-6 w-6" />}
              title="سلسلة يومية"
              body="حافظ على سلسلة إنجازاتك واجعل التعلم عادة ثابتة كل يوم."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="وضع الضيف"
              body="ابدأ مباشرة دون تسجيل، أو أنشئ حسابًا لحفظ تقدمك."
            />
          </div>
        </Container>
      </section>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center lg:text-start">
      <div className="flex items-center gap-1.5 justify-center lg:justify-start text-brand-600 dark:text-brand-300 text-xs font-semibold mb-1">
        {icon} {label}
      </div>
      <div className="text-2xl font-bold text-brand-900 dark:text-brand-50 arabic-numerals">{value}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="p-7 hover:shadow-soft transition-all hover:-translate-y-0.5 duration-300">
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center mb-4 shadow-soft">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-brand-900 dark:text-brand-50 mb-1.5">{title}</h3>
      <p className="text-sm text-brand-700/80 dark:text-brand-200/80 leading-relaxed">{body}</p>
    </Card>
  );
}
