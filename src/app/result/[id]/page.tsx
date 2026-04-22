import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResultView } from "@/components/quiz/result-view";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          coverEmoji: true,
        },
      },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              text: true,
              options: true,
              correctIdx: true,
              explanation: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) notFound();

  const answersOrdered = attempt.answers.sort(
    (a, b) => a.question.order - b.question.order
  );

  // Phone gate: if the attempt belongs to a logged-in user AND that user has
  // no phone on file yet, force the phone-collection step before showing
  // the result. Guests and users who already gave a phone skip this.
  const session = await auth();
  let needsPhone = false;
  if (session?.user?.id && attempt.userId === session.user.id) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    });
    needsPhone = !me?.phone;
  }

  return (
    <ResultView
      attempt={{
        id: attempt.id,
        score: attempt.score,
        total: attempt.total,
        durationSec: attempt.durationSec,
        guestName: attempt.guestName,
      }}
      quiz={attempt.quiz}
      answers={answersOrdered.map((a) => ({
        questionId: a.questionId,
        selected: a.selected,
        correct: a.correct,
        question: a.question,
      }))}
      needsPhone={needsPhone}
    />
  );
}
