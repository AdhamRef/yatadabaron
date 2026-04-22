"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Flame, Trophy, Mail, Phone as PhoneIcon, User as UserIcon, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toArabicDigits } from "@/lib/utils";

export type AdminUserListItem = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: "USER" | "ADMIN";
  streak: number;
  bestScore: number;
  createdAt: string;
  attemptCount: number;
};

export function UsersList({ users }: { users: AdminUserListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = [u.name, u.email, u.phone].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, users]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-4 h-4 w-4 text-brand-500/60 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو البريد أو الهاتف…"
          className="ps-11"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-brand-700/80 dark:text-brand-200/80">
          لا توجد نتائج مطابقة.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((u) => (
            <Link key={u.id} href={`/admin/users/${u.id}`} className="block h-full">
              <Card className="p-4 sm:p-5 h-full flex flex-col gap-4 hover:shadow-soft hover:-translate-y-0.5 transition-all">
                <div className="flex items-start gap-3 min-w-0">
                  <Avatar name={u.name} image={u.image} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-brand-900 dark:text-brand-50 truncate">
                        {u.name ?? "بلا اسم"}
                      </h3>
                      {u.role === "ADMIN" && <Badge tone="gold">مشرف</Badge>}
                    </div>
                    <div className="space-y-1 text-xs text-brand-700/70 dark:text-brand-200/70">
                      {u.email && (
                        <div className="inline-flex items-center gap-1.5 max-w-full">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span dir="ltr" className="truncate">{u.email}</span>
                        </div>
                      )}
                      {u.phone ? (
                        <div className="inline-flex items-center gap-1.5">
                          <PhoneIcon className="h-3 w-3 shrink-0" />
                          <span dir="ltr">{u.phone}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-amber-600/90 dark:text-amber-300/90 font-semibold">
                          <PhoneIcon className="h-3 w-3 shrink-0" />
                          بدون هاتف
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-brand-100 dark:border-brand-900">
                  <MiniStat
                    icon={<Trophy className="h-3.5 w-3.5" />}
                    value={toArabicDigits(u.attemptCount)}
                    label="محاولة"
                  />
                  <MiniStat
                    icon={<Flame className="h-3.5 w-3.5 text-orange-500" />}
                    value={toArabicDigits(u.streak)}
                    label="أسبوع"
                  />
                  <MiniStat
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    value={new Date(u.createdAt).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "short",
                    })}
                    label="انضم"
                  />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="min-w-0">
      <div className="inline-flex items-center gap-1 text-brand-900 dark:text-brand-50 font-bold text-sm truncate">
        {icon}
        <span className="truncate">{value}</span>
      </div>
      <div className="text-[10px] text-brand-700/60 dark:text-brand-200/60 mt-0.5">{label}</div>
    </div>
  );
}

function Avatar({ name, image }: { name: string | null; image: string | null }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="h-12 w-12 rounded-2xl object-cover shrink-0" />;
  }
  const initial = name?.trim()?.[0];
  return (
    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center font-bold text-lg shrink-0">
      {initial ? initial : <UserIcon className="h-5 w-5" />}
    </div>
  );
}
