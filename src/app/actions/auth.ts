"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, phoneSchema, type RegisterInput, type PhoneInput } from "@/lib/validators";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function savePhone(input: PhoneInput) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "غير مسجل" };

  const parsed = phoneSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "رقم غير صالح" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { phone: parsed.data.phone.trim() },
  });
  revalidatePath("/profile");
  return { ok: true as const };
}

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: "البريد الإلكتروني مستخدم بالفعل" };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashed },
  });
  return { ok: true as const };
}
