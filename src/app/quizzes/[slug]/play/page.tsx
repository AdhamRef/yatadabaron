import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { auth } from "@/auth";
import { quizIdOrSlugWhere } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PlayQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: quizIdOrSlugWhere(slug),
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          text: true,
          options: true,
          order: true,
        },
      },
    },
  });

  if (!quiz || !quiz.published || quiz.questions.length === 0) notFound();

  const session = await auth();

  return (
    <QuizRunner
      quiz={{
        id: quiz.id,
        slug: quiz.slug,
        title: quiz.title,
        coverEmoji: quiz.coverEmoji,
        questions: quiz.questions,
      }}
      isLoggedIn={!!session?.user}
    />
  );
}
