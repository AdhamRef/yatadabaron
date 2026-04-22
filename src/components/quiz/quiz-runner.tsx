"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitAttempt } from "@/app/actions/quiz";
import { toArabicDigits, formatDuration, cn } from "@/lib/utils";
import { useSound } from "@/components/sound-provider";

type Q = { id: string; text: string; options: string[]; order: number };

type QuizPayload = {
  id: string;
  title: string;
  coverEmoji: string;
  questions: Q[];
};

export function QuizRunner({ quiz, isLoggedIn }: { quiz: QuizPayload; isLoggedIn: boolean }) {
  const router = useRouter();
  const { play } = useSound();

  const [stage, setStage] = useState<"intro" | "playing" | "submitting">("intro");
  const [guestName, setGuestName] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);

  // tick
  useEffect(() => {
    if (stage !== "playing") return;
    const id = setInterval(() => {
      if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [stage]);

  const total = quiz.questions.length;
  const current = quiz.questions[currentIdx];
  const selectedIdx = current ? selections[current.id] : undefined;
  const hasSelection = selectedIdx !== undefined;
  const progress = total > 0 ? ((currentIdx + (hasSelection ? 1 : 0)) / total) * 100 : 0;

  const answeredCount = useMemo(() => Object.keys(selections).length, [selections]);

  function begin() {
    startedAt.current = Date.now();
    setStage("playing");
    play("tap");
  }

  function selectOption(i: number) {
    // Re-selection is allowed — user can change the answer as many times
    // as they want, until they press Next/Finish.
    setSelections((s) => ({ ...s, [current.id]: i }));
    play("tap");
  }

  function goNext() {
    if (currentIdx < total - 1) {
      setCurrentIdx((i) => i + 1);
      play("tap");
    } else {
      void submit();
    }
  }

  function goPrev() {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      play("tap");
    }
  }

  async function submit() {
    setStage("submitting");
    try {
      const res = await submitAttempt({
        quizId: quiz.id,
        guestName: !isLoggedIn ? guestName || null : null,
        durationSec: elapsed,
        answers: Object.entries(selections).map(([questionId, selected]) => ({
          questionId,
          selected,
        })),
      });
      if (!res.ok) {
        toast.error(res.error || "تعذر حفظ المحاولة");
        setStage("playing");
        return;
      }
      router.push(`/result/${res.attemptId}`);
    } catch {
      toast.error("حدث خطأ غير متوقع");
      setStage("playing");
    }
  }

  if (stage === "intro") {
    return (
      <Container className="py-10 sm:py-16 max-w-2xl">
        <Card className="p-8 sm:p-10 text-center">
          <div className="text-6xl mb-4">{quiz.coverEmoji}</div>
          <h1 className="font-display text-3xl font-bold text-brand-900 dark:text-brand-50 mb-2">
            {quiz.title}
          </h1>
          <p className="text-brand-700/80 dark:text-brand-200/80 mb-8">
            {toArabicDigits(total)} سؤال • خذ وقتك • بالتوفيق
          </p>
          {!isLoggedIn && (
            <div className="mb-6">
              <Input
                placeholder="اسمك (اختياري للضيوف)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={60}
              />
              <p className="text-xs text-brand-600/70 dark:text-brand-300/70 mt-2">
                ستُحفظ نتيجتك باسم «ضيف» إذا تركت الحقل فارغًا.
              </p>
            </div>
          )}
          <Button size="lg" onClick={begin} className="w-full sm:w-auto px-10">
            ابدأ الآن
          </Button>
        </Card>
      </Container>
    );
  }

  if (stage === "submitting") {
    return (
      <Container className="py-24">
        <div className="flex flex-col items-center gap-4 text-brand-700 dark:text-brand-200">
          <div className="h-14 w-14 rounded-full border-4 border-brand-300 border-t-brand-600 animate-spin" />
          <p className="font-semibold">يتم تقييم إجاباتك…</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6 sm:py-10 max-w-2xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-brand-900 dark:text-brand-50">
          سؤال {toArabicDigits(currentIdx + 1)} من {toArabicDigits(total)}
        </div>
        <div className="text-xs font-semibold text-brand-600 dark:text-brand-300 tabular-nums">
          {formatDuration(elapsed)}
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 w-full rounded-full bg-brand-100 dark:bg-brand-900 overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gradient-to-l from-brand-400 via-brand-600 to-gold-400"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <Card glass className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-900 dark:text-brand-50 leading-relaxed text-balance">
                {current.text}
              </h2>
            </div>

            <div className="space-y-3">
              {current.options.map((opt, i) => {
                const chosen = selectedIdx === i;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => selectOption(i)}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full text-start p-4 sm:p-5 rounded-2xl border-2 transition-all relative overflow-hidden cursor-pointer",
                      chosen
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/60 shadow-soft"
                        : "border-brand-100 dark:border-brand-900 bg-white dark:bg-brand-950/40 hover:border-brand-300 dark:hover:border-brand-700"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-xl grid place-items-center text-sm font-bold shrink-0 transition-colors",
                          chosen
                            ? "bg-brand-600 text-white"
                            : "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200"
                        )}
                      >
                        {["أ", "ب", "ج", "د", "ه", "و"][i] ?? i + 1}
                      </div>
                      <div className="flex-1 text-brand-900 dark:text-brand-50 font-semibold leading-relaxed">
                        {opt}
                      </div>
                      {chosen && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-7 w-7 rounded-full bg-brand-600 text-white grid place-items-center shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button size="lg" variant="outline" onClick={goPrev} disabled={currentIdx === 0}>
          السابق
        </Button>
        <div className="text-xs text-brand-600/80 dark:text-brand-300/80 hidden sm:block">
          تمت إجابة {toArabicDigits(answeredCount)} / {toArabicDigits(total)}
        </div>
        <Button size="lg" onClick={goNext} disabled={!hasSelection}>
          {currentIdx < total - 1 ? "التالي" : "إنهاء"}
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
    </Container>
  );
}
