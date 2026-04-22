"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, HelpCircle, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toArabicDigits } from "@/lib/utils";

type QuizLike = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverEmoji: string;
  episode: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  _count?: { questions: number; attempts: number };
};

const DIFFICULTY_LABEL: Record<QuizLike["difficulty"], { label: string; tone: "brand" | "amber" | "rose" }> = {
  EASY: { label: "سهل", tone: "brand" },
  MEDIUM: { label: "متوسط", tone: "amber" },
  HARD: { label: "صعب", tone: "rose" },
};

export function QuizCard({ quiz }: { quiz: QuizLike }) {
  const diff = DIFFICULTY_LABEL[quiz.difficulty];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
    >
      <Link href={`/quizzes/${quiz.id}`} className="group block">
        <Card className="p-6 h-full hover:shadow-soft transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-8 -end-8 h-40 w-40 rounded-full bg-gradient-to-br from-brand-100 to-transparent dark:from-brand-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
          />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{quiz.coverEmoji}</div>
              <Badge tone={diff.tone}>{diff.label}</Badge>
            </div>
            <h3 className="text-lg font-bold text-brand-900 dark:text-brand-50 mb-1.5 line-clamp-2">
              {quiz.title}
            </h3>
            {quiz.episode && (
              <div className="text-xs text-brand-600 dark:text-brand-300 font-semibold mb-2">
                {quiz.episode}
              </div>
            )}
            {quiz.description && (
              <p className="text-sm text-brand-700/80 dark:text-brand-200/80 line-clamp-2 mb-5 leading-relaxed">
                {quiz.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-brand-100 dark:border-brand-900">
              <div className="flex items-center gap-4 text-xs font-semibold text-brand-700 dark:text-brand-200">
                {quiz._count && (
                  <>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" />
                      {toArabicDigits(quiz._count.questions)} سؤال
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {toArabicDigits(quiz._count.attempts)}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-brand-600 dark:text-brand-300 group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors">
                ابدأ
                <Play className="h-4 w-4" />
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
