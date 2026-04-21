"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, Home, Trophy, Clock, ChevronDown, Phone, UserCircle2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatDuration, gradeLabel, scorePercent, toArabicDigits } from "@/lib/utils";
import { useSound } from "@/components/sound-provider";
import { phoneSchema } from "@/lib/validators";
import { savePhone } from "@/app/actions/auth";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

type Q = { id: string; text: string; options: string[]; correctIdx: number; explanation: string | null; order: number };

export function ResultView({
  attempt,
  quiz,
  answers,
  needsPhone = false,
}: {
  attempt: { id: string; score: number; total: number; durationSec: number; guestName: string | null };
  quiz: { id: string; slug: string; title: string; coverEmoji: string };
  answers: { questionId: string; selected: number; correct: boolean; question: Q }[];
  needsPhone?: boolean;
}) {
  const percent = scorePercent(attempt.score, attempt.total);
  const grade = gradeLabel(percent);
  const celebrate = percent >= 70;
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [confettiOn, setConfettiOn] = useState(celebrate);
  const [gated, setGated] = useState(needsPhone);
  const { play } = useSound();

  useEffect(() => {
    setSize({ w: window.innerWidth, h: window.innerHeight });
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    // Suppress confetti/sound until the phone gate is passed; otherwise the
    // celebration plays while the user is still staring at the phone form.
    if (celebrate && !gated) {
      play("win");
      const t = setTimeout(() => setConfettiOn(false), 5500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("resize", onResize);
      };
    }
    return () => window.removeEventListener("resize", onResize);
  }, [celebrate, gated, play]);

  if (gated) {
    return (
      <Container className="py-10 sm:py-16 max-w-xl">
        <PhoneGate onDone={() => setGated(false)} />
      </Container>
    );
  }

  return (
    <>
      {celebrate && confettiOn && (
        <Confetti
          width={size.w}
          height={size.h}
          numberOfPieces={280}
          recycle={false}
          gravity={0.22}
          colors={["#2f9770", "#d99329", "#83cdab", "#efc870", "#1f7a5a"]}
        />
      )}

      <Container className="py-10 sm:py-16 max-w-3xl">
        {/* HERO score */}
        <Card className="p-8 sm:p-12 text-center relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 pattern-islamic opacity-10 dark:opacity-[0.05]"
          />
          <div className="relative">
            <div className="text-5xl mb-2">{quiz.coverEmoji}</div>
            <div className="text-sm text-brand-600 dark:text-brand-300 font-semibold mb-1">
              {quiz.title}
            </div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              className="my-6"
            >
              <div className="inline-grid place-items-center h-44 w-44 mx-auto rounded-full bg-gradient-to-br from-brand-400 via-brand-600 to-brand-800 shadow-glow">
                <div className="h-[164px] w-[164px] rounded-full bg-white dark:bg-brand-950 grid place-items-center">
                  <div>
                    <div className="text-5xl font-bold text-brand-900 dark:text-brand-50 arabic-numerals">
                      {toArabicDigits(percent)}
                      <span className="text-xl">٪</span>
                    </div>
                    <div className={cn("text-sm font-bold mt-1", grade.tone)}>{grade.label}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Badge tone="brand">
                <Trophy className="h-3 w-3" />
                {toArabicDigits(attempt.score)} / {toArabicDigits(attempt.total)}
              </Badge>
              <Badge tone="neutral">
                <Clock className="h-3 w-3" />
                {formatDuration(attempt.durationSec)}
              </Badge>
              {attempt.guestName && <Badge tone="gold">{attempt.guestName}</Badge>}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/quizzes/${quiz.slug}/play`}>
                <Button size="lg" className="w-full sm:w-auto">
                  <RotateCcw className="h-4 w-4" />
                  أعد الاختبار
                </Button>
              </Link>
              <Link href="/quizzes">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Home className="h-4 w-4" />
                  اختبار آخر
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Review */}
        <div className="mt-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-900 dark:text-brand-50 mb-1">
            المراجعة
          </h2>
          <p className="text-sm text-brand-700/80 dark:text-brand-200/80 mb-6">
            تصفّح جميع الأسئلة مع الإجابات الصحيحة والشروحات.
          </p>
          <div className="space-y-3">
            {answers.map((a, idx) => (
              <ReviewItem key={a.questionId} index={idx} {...a} />
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <Card className="mt-10 p-8 sm:p-10 text-center relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 pattern-islamic opacity-10 dark:opacity-[0.05]" />
          <div className="relative">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-900 dark:text-brand-50 mb-2">
              ما الخطوة التالية؟
            </h3>
            <p className="text-sm text-brand-700/80 dark:text-brand-200/80 mb-7 max-w-md mx-auto leading-relaxed">
              تابع تقدّمك وسلسلة إنجازاتك من ملفك الشخصي، أو أعد الاختبار لتحسين نتيجتك.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/profile">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  <UserCircle2 className="h-4 w-4" />
                  الذهاب إلى ملفي
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/quizzes/${quiz.slug}/play`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <RotateCcw className="h-4 w-4" />
                  إعادة الاختبار
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </>
  );
}

function ReviewItem({
  index,
  question,
  selected,
  correct,
}: {
  index: number;
  question: Q;
  selected: number;
  correct: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      className={cn(
        "p-5 sm:p-6 transition-all",
        correct ? "border-brand-300/70 dark:border-brand-700/60" : "border-rose-300/60 dark:border-rose-700/50"
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 text-start"
      >
        <div
          className={cn(
            "mt-1 h-8 w-8 rounded-full grid place-items-center shrink-0",
            correct
              ? "bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-200"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
          )}
        >
          {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-brand-600 dark:text-brand-300 mb-1">
            سؤال {toArabicDigits(index + 1)}
          </div>
          <div className="font-bold text-brand-900 dark:text-brand-50 leading-relaxed">
            {question.text}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-brand-500 transition-transform shrink-0 mt-1",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-2"
        >
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correctIdx;
            const isChosen = i === selected;
            return (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-xl border flex items-center gap-3",
                  isCorrect
                    ? "border-brand-400 bg-brand-50 dark:bg-brand-900/50"
                    : isChosen
                    ? "border-rose-300 bg-rose-50 dark:bg-rose-900/30"
                    : "border-brand-100 dark:border-brand-900"
                )}
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded-lg grid place-items-center text-xs font-bold shrink-0",
                    isCorrect
                      ? "bg-brand-600 text-white"
                      : isChosen
                      ? "bg-rose-500 text-white"
                      : "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200"
                  )}
                >
                  {["أ", "ب", "ج", "د", "ه", "و"][i] ?? i + 1}
                </div>
                <div className="flex-1 text-sm text-brand-900 dark:text-brand-50">{opt}</div>
                {isCorrect && <Badge tone="brand">الإجابة الصحيحة</Badge>}
                {isChosen && !isCorrect && <Badge tone="rose">إجابتك</Badge>}
              </div>
            );
          })}
          {question.explanation && (
            <div className="p-4 rounded-xl bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-900 text-sm text-brand-800 dark:text-brand-100 leading-relaxed mt-3">
              <div className="text-xs font-bold text-gold-700 dark:text-gold-300 mb-1">
                شرح
              </div>
              {question.explanation}
            </div>
          )}
        </motion.div>
      )}
    </Card>
  );
}

function PhoneGate({ onDone }: { onDone: () => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = phoneSchema.safeParse({ phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "رقم غير صالح");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await savePhone(parsed.data);
      if (!res.ok) {
        toast.error(res.error || "تعذر الحفظ");
        return;
      }
      toast.success("تم الحفظ، مبارك على نتيجتك!");
      onDone();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8 sm:p-10 text-center">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white grid place-items-center mx-auto mb-5 shadow-soft">
        <Phone className="h-7 w-7" />
      </div>
      <h1 className="font-display text-2xl font-bold text-brand-900 dark:text-brand-50 mb-2">
        خطوة واحدة قبل عرض نتيجتك
      </h1>
      <p className="text-sm text-brand-700/80 dark:text-brand-200/80 mb-6 leading-relaxed">
        نحتاج رقم هاتفك مرة واحدة فقط للتواصل معك في المفاجآت والجوائز.
        لن نطلبه منك مجددًا.
      </p>
      <form onSubmit={submit} className="text-start">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          type="tel"
          dir="ltr"
          className="text-start"
          placeholder="+20 1X XXX XXXX"
          autoFocus
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        <Button type="submit" size="lg" className="w-full mt-5" loading={loading}>
          حفظ ومتابعة
        </Button>
      </form>
    </Card>
  );
}
