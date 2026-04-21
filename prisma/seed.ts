import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // admin user
  const adminEmail = "admin@nur.local";
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  const admin =
    adminExists ??
    (await prisma.user.create({
      data: {
        email: adminEmail,
        name: "مشرف أفلا يتدبرون",
        password: await bcrypt.hash("admin1234", 10),
        role: "ADMIN",
      },
    }));
  if (!adminExists) {
    console.log("✓ Admin created:", adminEmail, "/ admin1234");
  } else {
    await prisma.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    console.log("✓ Admin already exists:", adminEmail);
  }

  // Seed quizzes
  const quizzes = [
    {
      slug: "seerah-intro-" + Math.random().toString(36).slice(2, 7),
      title: "مقدمة السيرة النبوية",
      description: "اختبار تمهيدي يراجع المفاهيم الأساسية من الحلقة الأولى حول السيرة.",
      coverEmoji: "🕌",
      episode: "الحلقة ١",
      difficulty: "EASY" as const,
      published: true,
      questions: [
        {
          text: "في أي عام وُلد النبي محمد ﷺ؟",
          options: ["٥٧٠ م", "٦٠٠ م", "٥٥٠ م", "٦٢٠ م"],
          correctIdx: 0,
          explanation: "وُلد النبي ﷺ في عام الفيل الموافق ٥٧٠ ميلاديًا تقريبًا.",
        },
        {
          text: "ما اسم والدة النبي ﷺ؟",
          options: ["خديجة", "آمنة بنت وهب", "فاطمة", "حليمة"],
          correctIdx: 1,
          explanation: "هي السيدة آمنة بنت وهب، من بني زهرة.",
        },
        {
          text: "من هي أول زوجات النبي ﷺ؟",
          options: ["عائشة", "خديجة بنت خويلد", "حفصة", "أم سلمة"],
          correctIdx: 1,
          explanation: "خديجة بنت خويلد رضي الله عنها، وكانت أول من آمن به.",
        },
        {
          text: "في أي مدينة بُعث النبي ﷺ؟",
          options: ["المدينة", "الطائف", "مكة المكرمة", "صنعاء"],
          correctIdx: 2,
          explanation: "بُعث في مكة وفيها أنزل عليه الوحي لأول مرة.",
        },
        {
          text: "كم استمرت فترة الدعوة السرية؟",
          options: ["سنة", "٣ سنوات", "٥ سنوات", "١٠ سنوات"],
          correctIdx: 1,
          explanation: "نحو ثلاث سنوات تقريبًا قبل أن يُؤمر بالجهر.",
        },
      ],
    },
    {
      slug: "quran-basics-" + Math.random().toString(36).slice(2, 7),
      title: "أساسيات علوم القرآن",
      description: "راجع ما تعرفه عن القرآن الكريم وأسباب النزول.",
      coverEmoji: "📖",
      episode: "الحلقة ٤",
      difficulty: "MEDIUM" as const,
      published: true,
      questions: [
        {
          text: "كم عدد سور القرآن الكريم؟",
          options: ["١١٠", "١١٤", "١٢٠", "١٠٠"],
          correctIdx: 1,
          explanation: "القرآن الكريم يحتوي على ١١٤ سورة.",
        },
        {
          text: "ما أطول سورة في القرآن؟",
          options: ["آل عمران", "النساء", "البقرة", "المائدة"],
          correctIdx: 2,
          explanation: "سورة البقرة هي أطول سور القرآن الكريم.",
        },
        {
          text: "أين نزلت أول آية؟",
          options: ["غار ثور", "غار حراء", "المسجد الحرام", "المدينة المأفلا يتدبرونة"],
          correctIdx: 1,
          explanation: "نزلت أول آية في غار حراء على جبل الأفلا يتدبرون.",
        },
        {
          text: "ما هي أول سورة نزلت كاملة؟",
          options: ["الفاتحة", "العلق", "المدثر", "الإخلاص"],
          correctIdx: 0,
          explanation: "سورة الفاتحة هي أول سورة نزلت كاملة على القول الراجح.",
        },
      ],
    },
    {
      slug: "hadith-masters-" + Math.random().toString(36).slice(2, 7),
      title: "رجال الحديث",
      description: "اختبار متقدم حول أشهر أئمة الحديث النبوي.",
      coverEmoji: "🌿",
      episode: "الحلقة ٩",
      difficulty: "HARD" as const,
      published: true,
      questions: [
        {
          text: "مؤلف «صحيح البخاري» هو؟",
          options: ["الإمام مسلم", "الإمام البخاري", "الترمذي", "ابن ماجه"],
          correctIdx: 1,
          explanation: "الإمام محمد بن إسماعيل البخاري رحمه الله.",
        },
        {
          text: "ما اسم الكتاب الثاني من كتب الحديث الصحيحة؟",
          options: ["سنن النسائي", "صحيح مسلم", "سنن أبي داود", "موطأ مالك"],
          correctIdx: 1,
          explanation: "صحيح مسلم للإمام مسلم بن الحجاج النيسابوري.",
        },
        {
          text: "من هو صاحب أكبر مسند؟",
          options: ["الإمام أحمد", "ابن حنبل", "مالك", "الإمام أحمد بن حنبل"],
          correctIdx: 3,
          explanation: "مسند الإمام أحمد بن حنبل من أكبر مصنفات الحديث.",
        },
      ],
    },
  ];

  for (const q of quizzes) {
    const exists = await prisma.quiz.findFirst({ where: { title: q.title } });
    if (exists) {
      console.log("· Quiz exists, skipping:", q.title);
      continue;
    }
    await prisma.quiz.create({
      data: {
        ...q,
        authorId: admin.id,
        questions: { create: q.questions.map((qn, i) => ({ ...qn, order: i })) },
      },
    });
    console.log("✓ Created quiz:", q.title);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
