import type { Metadata, Viewport } from "next";
import { Tajawal, Amiri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { auth } from "@/auth";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "أفلا يتدبرون — اختبارات ما بعد الحلقات",
    template: "%s · أفلا يتدبرون",
  },
  description:
    "منصة إسلامية عصرية لاختبارات البودكاست. تعلم، راجع، واحصد النقاط بطريقة ممتعة.",
  keywords: ["اختبارات", "إسلامي", "بودكاست", "تعليم", "quiz", "islamic"],
  openGraph: {
    title: "أفلا يتدبرون — اختبارات ما بعد الحلقات",
    description: "اختبارات ممتعة ومصممة بعناية لمتابعي البودكاست.",
    type: "website",
    locale: "ar_SA",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8faf6" },
    { media: "(prefers-color-scheme: dark)", color: "#081412" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${tajawal.variable} ${amiri.variable}`}>
      <body className="min-h-screen bg-app antialiased font-sans">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar user={session?.user ?? null} />
            <main className="relative z-10 flex-1">{children}</main>
            <Footer />
          </div>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 pattern-islamic opacity-[0.35] dark:opacity-[0.18]"
          />
        </Providers>
      </body>
    </html>
  );
}
