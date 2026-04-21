import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "إنشاء حساب" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <Container className="py-10 sm:py-16">
      <AuthShell
        title="أهلًا بك في أفلا يتدبرون"
        subtitle="أنشئ حسابك وابدأ رحلتك المعرفية."
        mode="register"
      >
        <Suspense>
          <RegisterForm />
        </Suspense>
      </AuthShell>
    </Container>
  );
}
