import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Mail,
  Phone as PhoneIcon,
  Calendar,
  Flame,
  Trophy,
  Target,
  ArrowLeft,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Fingerprint,
  KeyRound,
  Link2,
  Hourglass,
} from "lucide-react";
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
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      accounts: { select: { id: true, provider: true, type: true, providerAccountId: true } },
      _count: { select: { sessions: true, quizzes: true } },
    },
  });
  if (!user) notFound();

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    include: { quiz: { select: { title: true, slug: true, coverEmoji: true } } },
  });

  const completed = attempts.filter((a) => a.status === "COMPLETED");
  const inProgress = attempts.filter((a) => a.status === "IN_PROGRESS").length;
  const abandoned = attempts.filter((a) => a.status === "ABANDONED").length;
  const avg =
    completed.length > 0
      ? Math.round(
          completed.reduce((a, x) => a + scorePercent(x.score, x.total), 0) / completed.length
        )
      : 0;
  const totalTimeSec = completed.reduce((a, x) => a + (x.durationSec ?? 0), 0);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-brand-600 dark:text-brand-300 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        كل المستخدمين
      </Link>

      <Card className="p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar name={user.name} image={user.image} />
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-900 dark:text-brand-50 break-words">
                {user.name ?? "بلا اسم"}
              </h1>
              {user.role === "ADMIN" && <Badge tone="gold">مشرف</Badge>}
              {user.emailVerified ? (
                <Badge tone="brand" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  بريد مؤكَّد
                </Badge>
              ) : (
                <Badge tone="amber" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  غير مؤكَّد
                </Badge>
              )}
              {user.password && (
                <Badge tone="neutral" className="gap-1">
                  <KeyRound className="h-3 w-3" />
                  كلمة مرور
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-brand-700/80 dark:text-brand-200/80">
              <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="البريد">
                {user.email ? <span dir="ltr" className="break-all">{user.email}</span> : <Muted />}
              </InfoRow>
              <InfoRow icon={<PhoneIcon className="h-3.5 w-3.5" />} label="الهاتف">
                {user.phone ? (
                  <span dir="ltr">{user.phone}</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-300 font-semibold">لم يُقدَّم بعد</span>
                )}
              </InfoRow>
              <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="انضم">
                {new Date(user.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </InfoRow>
              <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="آخر تحديث">
                {new Date(user.updatedAt).toLocaleString("ar-EG")}
              </InfoRow>
              <InfoRow icon={<Hourglass className="h-3.5 w-3.5" />} label="آخر محاولة">
                {user.lastQuizAt ? (
                  new Date(user.lastQuizAt).toLocaleString("ar-EG")
                ) : (
                  <Muted />
                )}
              </InfoRow>
              <InfoRow icon={<ShieldCheck className="h-3.5 w-3.5" />} label="الصلاحية">
                {user.role === "ADMIN" ? "مشرف" : "مستخدم"}
              </InfoRow>
              <InfoRow icon={<Fingerprint className="h-3.5 w-3.5" />} label="المعرِّف" full>
                <code
                  dir="ltr"
                  className="text-[11px] bg-brand-50 dark:bg-brand-900/60 px-2 py-0.5 rounded break-all"
                >
                  {user.id}
                </code>
              </InfoRow>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard icon={<Flame className="h-5 w-5 text-orange-500" />} label="السلسلة" value={toArabicDigits(user.streak)} sub="أسبوع" />
        <StatCard icon={<Trophy className="h-5 w-5 text-gold-500" />} label="أفضل نتيجة" value={`${toArabicDigits(user.bestScore)}٪`} />
        <StatCard icon={<Target className="h-5 w-5 text-brand-500" />} label="المعدل" value={`${toArabicDigits(avg)}٪`} />
        <StatCard icon={<Trophy className="h-5 w-5 text-brand-500" />} label="المحاولات" value={toArabicDigits(completed.length)} />
        <StatCard icon={<Clock className="h-5 w-5 text-brand-500" />} label="وقت اللعب" value={formatDuration(totalTimeSec)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-1">
          <h3 className="font-bold text-brand-900 dark:text-brand-50 mb-4 flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            الحسابات المرتبطة
          </h3>
          {user.accounts.length === 0 ? (
            <div className="text-sm text-brand-700/70 dark:text-brand-200/70">
              لا توجد حسابات خارجية مرتبطة.
            </div>
          ) : (
            <ul className="space-y-2">
              {user.accounts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 dark:border-brand-900 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-brand-900 dark:text-brand-50 capitalize">
                      {a.provider}
                    </div>
                    <div className="text-[11px] text-brand-700/60 dark:text-brand-200/60 truncate" dir="ltr">
                      {a.providerAccountId}
                    </div>
                  </div>
                  <Badge tone="neutral">{a.type}</Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 pt-4 border-t border-brand-100 dark:border-brand-900 grid grid-cols-2 gap-3 text-xs">
            <SmallStat label="الجلسات النشطة" value={toArabicDigits(user._count.sessions)} />
            <SmallStat label="اختبارات أنشأها" value={toArabicDigits(user._count.quizzes)} />
            <SmallStat label="قيد التقدم" value={toArabicDigits(inProgress)} />
            <SmallStat label="غير مكتمل" value={toArabicDigits(abandoned)} />
          </div>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-brand-100 dark:border-brand-900">
            <h3 className="font-bold text-brand-900 dark:text-brand-50">جميع الاختبارات</h3>
            <p className="text-xs text-brand-700/70 dark:text-brand-200/70 mt-1">
              كل محاولات هذا المستخدم بترتيب زمني ({toArabicDigits(attempts.length)}).
            </p>
          </div>
          {attempts.length === 0 ? (
            <div className="p-10 text-center text-brand-700/70 dark:text-brand-200/70">
              لا توجد محاولات.
            </div>
          ) : (
            <div className="divide-y divide-brand-100 dark:divide-brand-900 max-h-[560px] overflow-y-auto">
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
                      <div className="text-xs text-brand-700/70 dark:text-brand-200/70 truncate">
                        {new Date(date).toLocaleString("ar-EG")}
                        {a.status !== "COMPLETED" && (
                          <span className="text-amber-600 dark:text-amber-300 ms-2 font-semibold">
                            · {a.status === "IN_PROGRESS" ? "قيد التقدم" : "غير مكتمل"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
  full,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`min-w-0 ${full ? "sm:col-span-2" : ""}`}>
      <div className="text-[11px] font-semibold text-brand-600/80 dark:text-brand-300/80 uppercase tracking-wide mb-0.5 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Muted() {
  return <span className="text-brand-700/50 dark:text-brand-200/50">—</span>;
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-brand-700/60 dark:text-brand-200/60">{label}</div>
      <div className="text-sm font-bold text-brand-900 dark:text-brand-50 arabic-numerals truncate">
        {value}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300 text-xs font-semibold mb-2">
        {icon} {label}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-brand-900 dark:text-brand-50 arabic-numerals">
        {value}
        {sub && <span className="text-xs sm:text-sm text-brand-600 dark:text-brand-300 ms-1 font-semibold">{sub}</span>}
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
