import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "quiz"}-${suffix}`;
}

export function formatDuration(sec: number) {
  if (!sec || sec < 0) return "٠ث";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${toArabicDigits(s)}ث`;
  return `${toArabicDigits(m)}د ${toArabicDigits(s)}ث`;
}

export function toArabicDigits(input: number | string) {
  const map: Record<string, string> = {
    "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
    "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩",
  };
  return String(input).replace(/[0-9]/g, (d) => map[d] ?? d);
}

export function scorePercent(score: number, total: number) {
  if (!total) return 0;
  return Math.round((score / total) * 100);
}

// Accept either a Mongo ObjectId (24 hex chars) or a slug, and return the
// appropriate Prisma `where` unique filter. Useful so /quizzes/[slug] also works
// when the URL happens to contain the raw id.
export function quizIdOrSlugWhere(param: string) {
  return /^[a-f0-9]{24}$/i.test(param) ? { id: param } : { slug: param };
}

// Monday 00:00 local-time of the week containing `d`.
export function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = x.getDay(); // 0=Sun ... 6=Sat
  const daysSinceMonday = (dow + 6) % 7;
  x.setDate(x.getDate() - daysSinceMonday);
  return x;
}

export function weeksBetween(a: Date, b: Date): number {
  const MS = 1000 * 60 * 60 * 24 * 7;
  return Math.round((weekStart(b).getTime() - weekStart(a).getTime()) / MS);
}

export function gradeLabel(percent: number): { label: string; tone: string } {
  if (percent >= 90) return { label: "امتياز", tone: "text-gold-500" };
  if (percent >= 75) return { label: "جيد جدًا", tone: "text-brand-500" };
  if (percent >= 60) return { label: "جيد", tone: "text-brand-400" };
  if (percent >= 40) return { label: "مقبول", tone: "text-amber-500" };
  return { label: "تحتاج مراجعة", tone: "text-rose-500" };
}
