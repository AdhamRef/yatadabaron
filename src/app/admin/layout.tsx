import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, PlusCircle, ArrowLeft, UserCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <Container className="py-10">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-semibold text-gold-600 dark:text-gold-300 uppercase tracking-widest mb-1">
            Admin
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-900 dark:text-brand-50">
            لوحة التحكم
          </h1>
        </div>
        <Link href="/" className="text-sm text-brand-600 dark:text-brand-300 hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          العودة للموقع
        </Link>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 w-fit">
        <AdminLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} label="نظرة عامة" />
        <AdminLink href="/admin/quizzes" icon={<BookOpen className="h-4 w-4" />} label="الاختبارات" />
        <AdminLink href="/admin/quizzes/new" icon={<PlusCircle className="h-4 w-4" />} label="إنشاء اختبار" />
        <AdminLink href="/admin/users" icon={<UserCircle2 className="h-4 w-4" />} label="المستخدمون" />
        <AdminLink href="/admin/submissions" icon={<Users className="h-4 w-4" />} label="المحاولات" />
      </nav>

      {children}
    </Container>
  );
}

function AdminLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-xl text-sm font-semibold text-brand-800 dark:text-brand-100 hover:bg-brand-100 dark:hover:bg-brand-900 flex items-center gap-2 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
