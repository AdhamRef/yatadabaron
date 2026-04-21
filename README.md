# أفلا يتدبرون · Nur Quiz

منصة اختبارات إسلامية عصرية لمتابعي البودكاست — Next.js App Router + TypeScript + Tailwind + Prisma/MongoDB + NextAuth v5 + Framer Motion.

## المميزات

- 🌙 واجهة عربية (RTL) بخطوط Tajawal + Amiri
- 🔐 مصادقة عبر Google + بريد/كلمة سر + وضع ضيف
- 🎮 محرك اختبار تفاعلي (سؤال في كل مرة، شريط تقدم، انتقالات سلسة)
- 🎉 احتفال بالنتائج العالية بـ Confetti
- 🏆 نظام سلاسل وإنجازات (streaks, best score)
- 👨‍💼 لوحة تحكم كاملة للمشرفين (CRUD + analytics)
- 🌗 وضع داكن / فاتح مع حفظ الإعدادات
- 🔊 مؤثرات صوتية ذكية قابلة للتبديل
- 📱 تصميم متجاوب (mobile-first)

## متطلبات التشغيل

- Node.js ≥ 18.18
- قاعدة بيانات MongoDB (Atlas أو محلية)

## التثبيت

```bash
# 1. التبعيات
npm install --legacy-peer-deps

# 2. نسخ إعدادات البيئة
cp .env.example .env
# عدّل DATABASE_URL و AUTH_SECRET و Google OAuth (اختياري)

# 3. إنشاء الـ Prisma Client
npx prisma generate

# 4. دفع المخطط إلى MongoDB
npx prisma db push

# 5. إضافة بيانات تجريبية
npm run db:seed

# 6. تشغيل خادم التطوير
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

### حساب المشرف الافتراضي (بعد seed)

```
email:    admin@nur.local
password: admin1234
```

## متغيرات البيئة

انظر [`.env.example`](./.env.example).

| المتغير | الغرض |
| --- | --- |
| `DATABASE_URL` | اتصال MongoDB |
| `AUTH_SECRET` | سر NextAuth (`openssl rand -base64 32`) |
| `AUTH_URL` | رابط الإنتاج |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth من Google Cloud |

## بنية المشروع

```
src/
├── app/
│   ├── (public) layout.tsx, page.tsx, globals.css
│   ├── api/auth/[...nextauth]/route.ts
│   ├── login/, register/, profile/
│   ├── quizzes/           — قائمة + تفاصيل + player
│   ├── result/[id]/       — صفحة النتيجة مع Confetti
│   ├── admin/             — لوحة تحكم المشرف
│   └── actions/           — Server Actions (auth, quiz, admin)
├── components/
│   ├── ui/                — أساسيات (Button, Card, Input…)
│   ├── auth/              — نماذج تسجيل الدخول/الإنشاء
│   ├── admin/             — محرر الاختبارات + أزرار
│   ├── quiz/              — QuizRunner + ResultView
│   ├── navbar.tsx, footer.tsx, providers.tsx
│   ├── sound-provider.tsx — مؤثرات صوتية
│   └── hero-orbit.tsx     — Hero animation
├── lib/
│   ├── prisma.ts, utils.ts, validators.ts
├── auth.ts                — إعداد NextAuth كامل
├── auth.config.ts         — نسخة Edge-safe للـ middleware
└── middleware.ts
```

## أوامر شائعة

```bash
npm run dev           # تطوير
npm run build         # بناء إنتاجي
npm run start         # تشغيل إنتاجي
npm run lint          # فحص الكود
npm run db:push       # دفع مخطط Prisma إلى MongoDB
npm run db:seed       # إضافة بيانات تجريبية
```

## ملاحظات تقنية

- **Middleware + Prisma**: لأن middleware يعمل على Edge runtime، نستخدم نسخة `auth.config.ts` خالية من Prisma/bcrypt، بينما `auth.ts` يحمل الإعداد الكامل (للـ API routes و server actions).
- **MongoDB + Prisma**: لا توجد Migrations — استخدم `prisma db push`. عمليات التحديث لأسئلة الاختبار تتم عبر حذف + إعادة إنشاء (لا يدعم MongoDB interactive transactions على Prisma).
- **NextAuth v5 beta**: قد تحتاج `--legacy-peer-deps` مع React 19 RC.
- **Dark mode**: يُضاف class `dark` على `<html>` عبر `next-themes`.
- **RTL**: يتم ضبطه عبر `dir="rtl"` في `layout.tsx`، وجميع الأنماط تستخدم `ms-*` / `me-*` logical properties.

## الترخيص

MIT — صُمم وبُني بحب.
