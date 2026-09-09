import { OnboardingWizard } from "../../islands";

export const metadata = { title: "Khảo sát Định hướng Nguyện vọng - Compass" };

export default function OnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <p className="text-center text-xs font-semibold tracking-[0.04em] text-accent uppercase">Onboarding</p>
      <h1 className="mx-auto mt-2 max-w-2xl text-center text-[32px] font-bold leading-[40px] tracking-tight text-ink">
        Khảo sát định hướng nguyện vọng thông minh
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-center text-base leading-relaxed text-body">
        Hoàn thiện 4 bước khảo sát ngắn trong 2 phút để thuật toán Compass gợi ý giỏ nguyện vọng đầu tiên.
      </p>
      <div className="mt-8">
        <OnboardingWizard />
      </div>
    </div>
  );
}
