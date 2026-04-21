import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم قصير جدًا").max(60),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة السر يجب ألا تقل عن ٦ أحرف").max(100),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "أدخل كلمة السر"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const questionSchema = z.object({
  text: z.string().min(3, "نص السؤال قصير جدًا"),
  options: z
    .array(z.string().min(1, "لا يمكن ترك الخيار فارغًا"))
    .min(2, "أضف خيارين على الأقل")
    .max(6, "حد أقصى ٦ خيارات"),
  correctIdx: z.number().int().min(0),
  explanation: z.string().max(600).optional().nullable(),
});

export const quizSchema = z.object({
  title: z.string().min(3, "العنوان قصير").max(120),
  description: z.string().max(500).optional().nullable(),
  coverEmoji: z.string().min(1).max(4).default("📖"),
  episode: z.string().max(120).optional().nullable(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  published: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, "أضف سؤالًا واحدًا على الأقل"),
}).superRefine((val, ctx) => {
  val.questions.forEach((q, i) => {
    if (q.correctIdx >= q.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "الإجابة الصحيحة خارج نطاق الخيارات",
        path: ["questions", i, "correctIdx"],
      });
    }
  });
});
export type QuizInput = z.infer<typeof quizSchema>;

export const submitAttemptSchema = z.object({
  quizId: z.string().min(1),
  guestName: z.string().max(60).optional().nullable(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selected: z.number().int().min(0),
      })
    )
    .min(1),
  durationSec: z.number().int().min(0).max(60 * 60 * 4),
});
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;

// Loose phone validation — allow +, digits, spaces, dashes, parens. 8–20 chars of digits.
export const phoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, "رقم الهاتف قصير جدًا")
    .max(24, "رقم الهاتف طويل جدًا")
    .regex(/^[+\d][\d\s\-()]{6,}$/, "رقم هاتف غير صالح"),
});
export type PhoneInput = z.infer<typeof phoneSchema>;
