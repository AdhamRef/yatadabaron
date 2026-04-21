"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { quizSchema, type QuizInput } from "@/lib/validators";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

export async function createQuiz(input: QuizInput) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "غير مصرح" };

  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  const data = parsed.data;

  const quiz = await prisma.quiz.create({
    data: {
      slug: slugify(data.title),
      title: data.title,
      description: data.description ?? null,
      coverEmoji: data.coverEmoji,
      episode: data.episode ?? null,
      difficulty: data.difficulty,
      published: data.published,
      authorId: admin.id,
      questions: {
        create: data.questions.map((q, i) => ({
          order: i,
          text: q.text,
          options: q.options,
          correctIdx: q.correctIdx,
          explanation: q.explanation ?? null,
        })),
      },
    },
    select: { id: true, slug: true },
  });

  revalidatePath("/");
  revalidatePath("/quizzes");
  revalidatePath("/admin");
  revalidatePath("/admin/quizzes");
  return { ok: true as const, id: quiz.id, slug: quiz.slug };
}

export async function updateQuiz(id: string, input: QuizInput) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "غير مصرح" };

  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  const data = parsed.data;

  // Transactional replacement: delete old questions + answers, create fresh.
  // MongoDB + Prisma: use separate calls (no interactive $transaction on MongoDB).
  const existing = await prisma.quiz.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false as const, error: "الاختبار غير موجود" };

  await prisma.question.deleteMany({ where: { quizId: id } });

  await prisma.quiz.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description ?? null,
      coverEmoji: data.coverEmoji,
      episode: data.episode ?? null,
      difficulty: data.difficulty,
      published: data.published,
      questions: {
        create: data.questions.map((q, i) => ({
          order: i,
          text: q.text,
          options: q.options,
          correctIdx: q.correctIdx,
          explanation: q.explanation ?? null,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/quizzes");
  revalidatePath("/admin");
  revalidatePath("/admin/quizzes");
  return { ok: true as const, id };
}

export async function deleteQuiz(id: string) {
  const admin = await requireAdmin();
  if (!admin) return { ok: false as const, error: "غير مصرح" };

  await prisma.quiz.delete({ where: { id } }).catch(() => null);

  revalidatePath("/");
  revalidatePath("/quizzes");
  revalidatePath("/admin");
  revalidatePath("/admin/quizzes");
  return { ok: true as const };
}
