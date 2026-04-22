"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2, Plus, GripVertical, Check, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { quizSchema, type QuizInput } from "@/lib/validators";
import { createQuiz, updateQuiz } from "@/app/actions/admin";
import { CopyLinkButton } from "@/components/admin/copy-link-button";

type EditorQuestion = {
  text: string;
  options: string[];
  correctIdx: number;
  explanation?: string;
};

type EditorState = {
  title: string;
  description: string;
  coverEmoji: string;
  episode: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  published: boolean;
  questions: EditorQuestion[];
};

const EMPTY: EditorState = {
  title: "",
  description: "",
  coverEmoji: "📖",
  episode: "",
  difficulty: "MEDIUM",
  published: false,
  questions: [{ text: "", options: ["", ""], correctIdx: 0, explanation: "" }],
};

export function QuizEditor({
  mode,
  id,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  initial?: EditorState;
}) {
  const router = useRouter();
  const [s, setS] = useState<EditorState>(initial ?? EMPTY);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof EditorState>(k: K, v: EditorState[K]) {
    setS((x) => ({ ...x, [k]: v }));
  }
  function updateQ(i: number, patch: Partial<EditorQuestion>) {
    setS((x) => ({ ...x, questions: x.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) }));
  }
  function addQuestion() {
    setS((x) => ({
      ...x,
      questions: [...x.questions, { text: "", options: ["", ""], correctIdx: 0, explanation: "" }],
    }));
  }
  function removeQuestion(i: number) {
    setS((x) => ({ ...x, questions: x.questions.filter((_, idx) => idx !== i) }));
  }
  function moveQuestion(i: number, dir: -1 | 1) {
    setS((x) => {
      const arr = [...x.questions];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return x;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...x, questions: arr };
    });
  }
  function addOption(qi: number) {
    setS((x) => ({
      ...x,
      questions: x.questions.map((q, idx) =>
        idx === qi && q.options.length < 6 ? { ...q, options: [...q.options, ""] } : q
      ),
    }));
  }
  function removeOption(qi: number, oi: number) {
    setS((x) => ({
      ...x,
      questions: x.questions.map((q, idx) => {
        if (idx !== qi) return q;
        if (q.options.length <= 2) return q;
        const options = q.options.filter((_, i) => i !== oi);
        const correctIdx = q.correctIdx >= options.length ? 0 : q.correctIdx === oi ? 0 : q.correctIdx > oi ? q.correctIdx - 1 : q.correctIdx;
        return { ...q, options, correctIdx };
      }),
    }));
  }
  function setOption(qi: number, oi: number, v: string) {
    setS((x) => ({
      ...x,
      questions: x.questions.map((q, idx) =>
        idx === qi
          ? { ...q, options: q.options.map((o, i) => (i === oi ? v : o)) }
          : q
      ),
    }));
  }

  async function save(publishOverride?: boolean) {
    const data: QuizInput = {
      title: s.title,
      description: s.description || null,
      coverEmoji: s.coverEmoji || "📖",
      episode: s.episode || null,
      difficulty: s.difficulty,
      published: publishOverride ?? s.published,
      questions: s.questions.map((q) => ({
        text: q.text,
        options: q.options,
        correctIdx: q.correctIdx,
        explanation: q.explanation || null,
      })),
    };
    const parsed = quizSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "راجع الحقول");
      return;
    }
    setLoading(true);
    try {
      const res =
        mode === "create" ? await createQuiz(parsed.data) : await updateQuiz(id!, parsed.data);
      if (!res.ok) {
        toast.error(res.error || "تعذر الحفظ");
        return;
      }
      toast.success("تم الحفظ");
      // After create, land on the new quiz's edit page so the "Copy link"
      // button is immediately available. After update, go back to the list.
      if (mode === "create" && "id" in res && res.id) {
        router.push(`/admin/quizzes/${res.id}`);
      } else {
        router.push("/admin/quizzes");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 sm:p-8">
        <h2 className="text-xl font-bold text-brand-900 dark:text-brand-50 mb-4">تفاصيل الاختبار</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label>العنوان</Label>
            <Input
              placeholder="مثال: الحلقة ٣ — مقدمة في السيرة"
              value={s.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={120}
            />
          </div>
          <div>
            <Label>الإيموجي</Label>
            <Input
              value={s.coverEmoji}
              onChange={(e) => update("coverEmoji", e.target.value.slice(0, 4))}
              maxLength={4}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>الوصف (اختياري)</Label>
            <Textarea
              value={s.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="وصف مختصر عن محتوى الاختبار"
              maxLength={500}
            />
          </div>
          <div>
            <Label>رقم الحلقة (اختياري)</Label>
            <Input
              value={s.episode}
              onChange={(e) => update("episode", e.target.value)}
              placeholder="الحلقة ١٢"
            />
          </div>
          <div>
            <Label>المستوى</Label>
            <div className="flex gap-2">
              {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => update("difficulty", d)}
                  className={cn(
                    "flex-1 h-12 rounded-2xl border font-semibold text-sm transition-colors",
                    s.difficulty === d
                      ? "bg-brand-600 text-white border-transparent"
                      : "bg-white dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-100"
                  )}
                >
                  {d === "EASY" ? "سهل" : d === "HARD" ? "صعب" : "متوسط"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <span className="relative inline-block">
                <input
                  type="checkbox"
                  checked={s.published}
                  onChange={(e) => update("published", e.target.checked)}
                  className="peer sr-only"
                />
                <span className="block h-7 w-12 rounded-full bg-brand-200 dark:bg-brand-900 peer-checked:bg-brand-600 transition-colors" />
                <span className="absolute top-1 end-1 h-5 w-5 rounded-full bg-white transition-all peer-checked:end-6 shadow" />
              </span>
              <span className="text-sm font-semibold text-brand-800 dark:text-brand-100">منشور</span>
            </label>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <AnimatePresence>
          {s.questions.map((q, qi) => (
            <motion.div
              key={qi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              layout
            >
              <Card className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-brand-400" />
                    <div className="font-bold text-brand-900 dark:text-brand-50">
                      السؤال {qi + 1}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => moveQuestion(qi, -1)} aria-label="أعلى">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => moveQuestion(qi, 1)} aria-label="أسفل">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeQuestion(qi)}
                      disabled={s.questions.length === 1}
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
                </div>

                <Label>نص السؤال</Label>
                <Textarea
                  value={q.text}
                  onChange={(e) => updateQ(qi, { text: e.target.value })}
                  placeholder="اكتب السؤال هنا…"
                />

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="mb-0">الخيارات (اختر الإجابة الصحيحة)</Label>
                    <Button size="sm" variant="ghost" onClick={() => addOption(qi)}>
                      <Plus className="h-4 w-4" />
                      خيار
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isCorrect = q.correctIdx === oi;
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            onClick={() => updateQ(qi, { correctIdx: oi })}
                            className={cn(
                              "h-11 w-11 rounded-2xl grid place-items-center border-2 transition-colors shrink-0",
                              isCorrect
                                ? "bg-brand-600 border-brand-600 text-white"
                                : "border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-200 hover:border-brand-400"
                            )}
                            aria-label="اختر كصحيحة"
                          >
                            {isCorrect ? <Check className="h-5 w-5" /> : <span className="text-xs font-bold">{["أ", "ب", "ج", "د", "ه", "و"][oi]}</span>}
                          </button>
                          <Input
                            value={opt}
                            onChange={(e) => setOption(qi, oi, e.target.value)}
                            placeholder={`الخيار ${oi + 1}`}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeOption(qi, oi)}
                            disabled={q.options.length <= 2}
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <Label>الشرح (اختياري)</Label>
                  <Textarea
                    value={q.explanation ?? ""}
                    onChange={(e) => updateQ(qi, { explanation: e.target.value })}
                    placeholder="شرح يظهر في صفحة النتيجة"
                    maxLength={600}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={addQuestion}
          className="w-full h-14 rounded-2xl border-2 border-dashed border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-200 font-semibold hover:bg-brand-50 dark:hover:bg-brand-900/40 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          أضف سؤالًا
        </button>
      </div>

      <div className="sticky bottom-4 z-20">
        <div className="rounded-3xl glass p-4 flex flex-col sm:flex-row items-center gap-3 shadow-soft">
          <div className="flex-1 text-sm text-brand-800 dark:text-brand-100">
            <Sparkles className="inline h-4 w-4 me-1 text-gold-500" />
            {s.questions.length} سؤال · {s.published ? "سيُنشر" : "مسودة"}
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap justify-end">
            {mode === "edit" && id && s.published && (
              <CopyLinkButton
                path={`/quizzes/${id}`}
                label="نسخ رابط الاختبار"
                variant="secondary"
              />
            )}
            <Button variant="outline" onClick={() => save(false)} loading={loading} className="flex-1 sm:flex-none">
              حفظ كمسودة
            </Button>
            <Button variant="gold" onClick={() => save(true)} loading={loading} className="flex-1 sm:flex-none">
              حفظ ونشر
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
