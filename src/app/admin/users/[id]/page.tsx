import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone as PhoneIcon, Calendar, Flame, Trophy, Target, ArrowLeft, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration, gradeLabel, scorePercent, toArabicDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    include: { quiz: { select: { title: true, slug: true, coverEmoji: true } } },
  });

  const completed = attempts.filter((a) => a.status === "COMPLETED");
  const avg =
    completed.length > 0
      ? Math.round(
          completed.reduce((a, x) => a + scorePercent(x.score, x.total), 0) / completed.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-300 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        كل المستخدمين
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar name={user.name} image={user.image} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-brand-50">
                {user.name ?? "بلا اسم"}
              </h1>
              {user.role === "ADMIN" && <Badge tone="gold">مشرف</Badge>}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-700/80 dark:text-brand-200/80">
              {user.email && (
                <InfoRow icon={<Mail className="h-3.5 w-3.5" />}>
                  <span dir="ltr">{user.email}</span>
                </InfoRow>
              )}
              {user.phone ? (
                <InfoRow icon={<PhoneIcon className="h-3.5 w-3.5" />}>
                  <span dir="ltr">{user.phone}</span>
                </InfoRow>
              ) : (
                <InfoRow icon={<PhoneIcon className="h-3.5 w-3.5" />}>
                  <span className="text-amber-600 dark:text-amber-300 font-semibold">لم يُقدَّم بعد</span>
                </InfoRow>
              )}
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />}>
                انضم {new Date(user.createdAt).toLocaleDateString("ar-EG")}
              </InfoRow>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="السلسلة" value={toArabicDigits(user.streak)} sub="أسبوع" />
        <StatCard icon={<Trophy className="h-5 w-5 text-gold-500" />} label="أفضل نتيجة" value={`${toArabicDigits(user.bestScore)}٪`} />
        <StatCard icon={<Target className="h-5 w-5 text-brand-500" />} label="المعدل" value={`${toArabicDigits(avg)}٪`} />
        <StatCard icon={<Trophy className="h-5 w-5 text-brand-500" />} label="المحاولات" value={toArabicDigits(completed.length)} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-brand-100 dark:border-brand-900">
          <h3 className="font-bold text-brand-900 dark:text-brand-50">جميع الاختبارات</h3>
          <p className="text-xs text-brand-700/70 dark:text-brand-200/70 mt-1">
            كل محاولات هذا المستخدم بترتيب زمني.
          </p>
        </div>
        {attempts.length === 0 ? (
          <div className="p-10 text-center text-brand-700/70 dark:text-brand-200/70">
            لا توجد محاولات.
          </div>
        ) : (
          <div className="divide-y divide-brand-100 dark:divide-brand-900">
            {attempts.map((a) => {
              const p = scorePercent(a.score, a.total);
              const g = gradeLabel(p);
              const date = a.finishedAt ?? a.startedAt;
              return (
                <Link
                  key={a.id}
                  href={`/result/${a.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-brand-50/50 dark:hover:bg-brand-900/30 transition-colors"
                >
                  <div className="text-2xl shrink-0">{a.quiz.coverEmoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-brand-900 dark:text-brand-50 truncate">
                      {a.quiz.title}
                    </div>
                    <div className="text-xs text-brand-700/70 dark:text-brand-200/70">
                      {new Date(date).toLocaleString("ar-EG")}
                      {a.status !== "COMPLETED" && (
                        <span className="text-amber-600 dark:text-amber-300 ms-2 font-semibold">
                          · {a.status === "IN_PROGRESS" ? "قيد التقدم" : "غير مكتمل"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone="neutral" className="font-mono hidden sm:inline-flex">
                      {formatDuration(a.durationSec)}
                    </Badge>
                    <div className="text-end">
                      <div className={`text-sm font-bold ${g.tone}`}>{toArabicDigits(p)}٪</div>
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

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {children}
    </span>
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

function Avatar({ name, image }: { name: string | null; image: string | null }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="h-20 w-20 rounded-3xl object-cover shrink-0" />;
  }
  const initial = (name ?? "?").trim()[0];
  return (
    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center font-bold text-2xl shrink-0">
      {initial ? initial : <UserIcon className="h-8 w-8" />}
    </div>
  );
}
