"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ProfileProvider } from "./profile";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <ProfileProvider>{children}</ProfileProvider>
    </ThemeProvider>
  );
}
