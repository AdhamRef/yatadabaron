import { QuizEditor } from "@/components/admin/quiz-editor";

export const metadata = { title: "اختبار جديد" };

export default function NewQuizPage() {
  return <QuizEditor mode="create" />;
}
