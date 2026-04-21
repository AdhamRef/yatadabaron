"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { submitAttemptSchema, type SubmitAttemptInput } from "@/lib/validators";
import { weeksBetween } from "@/lib/utils";

export async function submitAttempt(input: SubmitAttemptInput) {
  const parsed = submitAttemptSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "بيانات غير صالحة" };
  }
  const data = parsed.data;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const quiz = await prisma.quiz.findUnique({
    where: { id: data.quizId },
    include: {
      questions: { select: { id: true, correctIdx: true } },
    },
  });
  if (!quiz || !quiz.published) {
    return { ok: false as const, error: "الاختبار غير متاح" };
  }

  const byId = new Map(quiz.questions.map((q) => [q.id, q.correctIdx]));
  const answersRaw = data.answers.filter((a) => byId.has(a.questionId));

  let score = 0;
  const answers = answersRaw.map((a) => {
    const correct = byId.get(a.questionId) === a.selected;
    if (correct) score += 1;
    return { ...a, correct };
  });

  const attempt = await prisma.attempt.create({
    data: {
      quizId: quiz.id,
      userId: userId ?? undefined,
      guestName: !userId ? data.guestName ?? null : null,
      score,
      total: quiz.questions.length,
      durationSec: data.durationSec,
      status: "COMPLETED",
      finishedAt: new Date(),
      answers: {
        create: answers.map((a) => ({
          questionId: a.questionId,
          selected: a.selected,
          correct: a.correct,
        })),
      },
    },
    select: { id: true },
  });

  // Update gamification stats for logged-in users
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bestScore: true, lastQuizAt: true, streak: true },
    });
    if (user) {
      const percent = Math.round((score / quiz.questions.length) * 100);
      const now = new Date();
      const last = user.lastQuizAt;
      let streak = user.streak;
      if (last) {
        // Weekly streak: +1 for next week, keep for same week, reset if a week is skipped.
        const diffWeeks = weeksBetween(last, now);
        if (diffWeeks === 0) {
          // same week — keep streak (counts as already active this week)
        } else if (diffWeeks === 1) {
          streak += 1;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      await prisma.user.update({
        where: { id: userId },
        data: {
          bestScore: Math.max(user.bestScore, percent),
          lastQuizAt: now,
          streak,
        },
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/quizzes/${quiz.slug}`);

  return { ok: true as const, attemptId: attempt.id };
}
