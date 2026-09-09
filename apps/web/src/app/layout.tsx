import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { SiteFooter, SiteHeader } from "@compass/ui";
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#f8f9ff] font-sans text-[#141c26]">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
