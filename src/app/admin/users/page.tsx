import { prisma } from "@/lib/prisma";
import { toArabicDigits } from "@/lib/utils";
import { UsersList, type AdminUserListItem } from "@/components/admin/users-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "المستخدمون" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { attempts: true } } },
  });

  const items: AdminUserListItem[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    image: u.image,
    role: u.role,
    streak: u.streak,
    bestScore: u.bestScore,
    createdAt: u.createdAt.toISOString(),
    attemptCount: u._count.attempts,
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-900 dark:text-brand-50">المستخدمون</h2>
        <p className="text-sm text-brand-700/80 dark:text-brand-200/80 mt-1">
          {toArabicDigits(users.length)} مستخدم مسجّل.
        </p>
      </div>
      <UsersList users={items} />
    </div>
  );
}
