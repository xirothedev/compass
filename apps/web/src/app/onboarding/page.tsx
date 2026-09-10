import Link from "next/link";
import { OnboardingWizard } from "../../islands";

export const metadata = { title: "Khảo sát Định hướng Nguyện vọng - Compass" };

export default function OnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <nav aria-label="Breadcrumb" className="text-center text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Trang chủ</Link>
        <span aria-hidden> / </span>
        <span aria-current="page" className="text-ink">Onboarding khảo sát nguyện vọng</span>
      </nav>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {["Chuẩn hóa GDPT 2018 & 2006", "Bảo mật ADR-0004: Không thu thập SBD", "Thuật toán phân tích Phổ điểm 2025"].map((b) => (
          <span key={b} className="rounded-full bg-[var(--secondary-container)] px-2.5 py-1 text-xs font-semibold text-[var(--on-secondary-container)] dark:text-white">
            {b}
          </span>
        ))}
      </div>
      <h1 className="mx-auto mt-3 max-w-2xl text-center text-[32px] font-bold leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-[48px]">
        Khảo sát định hướng nguyện vọng thông minh
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-base leading-relaxed text-body">
        Hoàn thiện 5 bước khảo sát ngắn trong 2 phút để thuật toán Compass gợi ý giỏ nguyện vọng đầu tiên.
      </p>
      <div className="mt-8">
        <OnboardingWizard />
      </div>
    </div>
  );
}
