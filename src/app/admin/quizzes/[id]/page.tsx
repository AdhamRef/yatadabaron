import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizEditor } from "@/components/admin/quiz-editor";

export const dynamic = "force-dynamic";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) notFound();

  return (
    <QuizEditor
      mode="edit"
      id={quiz.id}
      initial={{
        title: quiz.title,
        description: quiz.description ?? "",
        coverEmoji: quiz.coverEmoji,
        episode: quiz.episode ?? "",
        difficulty: quiz.difficulty,
        published: quiz.published,
        questions: quiz.questions.map((q) => ({
          text: q.text,
          options: q.options,
          correctIdx: q.correctIdx,
          explanation: q.explanation ?? "",
        })),
      }}
    />
  );
}
