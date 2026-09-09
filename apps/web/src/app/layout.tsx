import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { SiteFooter, SiteHeader } from "@compass/ui";
import { ThemeToggle } from "../islands";
import { Providers } from "../providers";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Compass - Định hướng nguyện vọng THPTQG",
  description:
    "Tra cứu thứ hạng, điểm chuẩn và gợi ý nguyện vọng thông minh cho thí sinh kỳ thi THPTQG.",
  icons: { icon: "/logo/favicon-64.webp", apple: "/logo/compass-mark-navy.webp" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        <Providers>
          <SiteHeader actions={<ThemeToggle />} />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
