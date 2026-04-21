import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Phone as PhoneIcon, Mail, User as UserIcon } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "المستخدمون" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { attempts: true } } },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-900 dark:text-brand-50">المستخدمون</h2>
        <p className="text-sm text-brand-700/80 dark:text-brand-200/80 mt-1">
          {toArabicDigits(users.length)} مستخدم مسجّل.
        </p>
      </div>

      {users.length === 0 ? (
        <Card className="p-10 text-center text-brand-700/80 dark:text-brand-200/80">
          لا يوجد مستخدمون بعد.
        </Card>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <Link key={u.id} href={`/admin/users/${u.id}`}>
              <Card className="p-5 flex items-center justify-between gap-4 hover:shadow-soft hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Avatar name={u.name} image={u.image} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-brand-900 dark:text-brand-50 truncate">
                        {u.name ?? "بلا اسم"}
                      </h3>
                      {u.role === "ADMIN" && <Badge tone="gold">مشرف</Badge>}
                      {!u.phone && <Badge tone="amber">بدون هاتف</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-700/70 dark:text-brand-200/70">
                      {u.email && (
                        <span className="inline-flex items-center gap-1 truncate max-w-[240px]">
                          <Mail className="h-3 w-3" />
                          <span dir="ltr">{u.email}</span>
                        </span>
                      )}
                      {u.phone && (
                        <span className="inline-flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          <span dir="ltr">{u.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-xs">
                  <Stat icon={<Trophy className="h-3.5 w-3.5" />} label={`${toArabicDigits(u._count.attempts)} محاولة`} />
                  <Stat icon={<Flame className="h-3.5 w-3.5 text-orange-500" />} label={`${toArabicDigits(u.streak)} أسبوع`} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="hidden sm:flex items-center gap-1 font-semibold text-brand-700 dark:text-brand-200">
      {icon}
      {label}
    </div>
  );
}

function Avatar({ name, image }: { name: string | null; image: string | null }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="h-12 w-12 rounded-2xl object-cover shrink-0" />;
  }
  const initial = name?.trim()?.[0] ?? "?";
  return (
    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center font-bold text-lg shrink-0">
      {initial.toUpperCase() !== initial ? initial : <UserIcon className="h-5 w-5" />}
    </div>
  );
}
