"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { SoundProvider } from "@/components/sound-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange={false}
      >
        <SoundProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              className: "!bg-white !text-brand-900 dark:!bg-brand-950 dark:!text-brand-50 !rounded-xl !border !border-brand-100 dark:!border-brand-800",
              style: { fontFamily: "inherit" },
            }}
          />
        </SoundProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
