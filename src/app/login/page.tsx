import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata = { title: "تسجيل الدخول" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <Container className="py-10 sm:py-16">
      <AuthShell
        title="مرحبًا بعودتك"
        subtitle="سجّل الدخول لتحفظ تقدّمك وتحافظ على سلسلة إنجازاتك."
        mode="login"
      >
        <Suspense>
          <LoginForm />
        </Suspense>
      </AuthShell>
    </Container>
  );
}
