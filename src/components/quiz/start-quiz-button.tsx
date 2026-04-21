"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthGateModal } from "@/components/auth/auth-gate-modal";

export function StartQuizButton({
  quizRef,
  isLoggedIn,
}: {
  quizRef: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const playUrl = `/quizzes/${quizRef}/play`;

  function start() {
    if (isLoggedIn) {
      router.push(playUrl);
    } else {
      setOpen(true);
    }
  }

  function guest() {
    setOpen(false);
    router.push(playUrl);
  }

  return (
    <>
      <Button size="lg" className="w-full" onClick={start}>
        ابدأ الاختبار
      </Button>
      <AuthGateModal open={open} onClose={() => setOpen(false)} onGuest={guest} redirectTo={playUrl} />
    </>
  );
}
