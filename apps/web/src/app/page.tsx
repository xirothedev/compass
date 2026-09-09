import Link from "next/link";
import { Section, SchoolCard, TierBadge } from "@compass/ui";
import { TRUONGS, toCard } from "../mocks";

const SOLUTIONS = [
  {
    href: "/lookup",
    title: "Tra cứu Thứ hạng & Phổ điểm",
    desc: "Biết thứ hạng điểm thi của bạn theo từng tổ hợp, đối chiếu phổ điểm qua các năm.",
  },
  {
    href: "/schools",
    title: "Catalog Trường & Điểm chuẩn",
    desc: "Tra cứu đề án tuyển sinh, biến động điểm chuẩn 3 năm của các trường đại học.",
  },
  {
    href: "/suggestions",
    title: "Gợi ý Nguyện vọng Thông minh",
    desc: "Thuật toán đối sánh điểm số của bạn với điểm chuẩn, chia giỏ An toàn - Vừa sức - Thử thách.",
  },
];

export default function Home() {
  const featured = TRUONGS.slice(0, 3).map(toCard);
  return (
    <div>
      {/* Hero */}
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-6 px-6 py-16 md:py-24">
          <div className="flex flex-wrap gap-2">
            <TierBadge tier="safe" />
            <TierBadge tier="match" />
            <TierBadge tier="reach" />
          </div>
          <h1 className="max-w-3xl text-[32px] font-bold leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-[48px]">
            Định vị thứ hạng, chọn đúng ngành, vững bước tương lai.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-body">
            Tra cứu thứ hạng điểm thi theo tổ hợp, phân tích phổ điểm qua các năm và nhận gợi ý
            nguyện vọng phù hợp với sức học của bạn.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/lookup"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-cta px-6 text-sm font-semibold text-on-cta transition-transform hover:bg-cta-hover active:scale-[0.98]"
            >
              Tra cứu thứ hạng ngay
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-line px-6 text-sm font-semibold text-ink hover:bg-surface-2"
            >
              Làm bài khảo sát
            </Link>
          </div>
          <form action="/schools" className="w-full max-w-xl" role="search">
            <label htmlFor="q" className="sr-only">
              Tìm ngành, trường
            </label>
            <input
              id="q"
              name="q"
              placeholder="Tìm ngành, trường..."
              className="h-12 w-full rounded-lg border border-line bg-canvas px-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
            />
          </form>
        </div>
      </div>

      <Section
        eyebrow="Giải pháp"
        title="Bộ giải pháp khoa học dành riêng cho kỳ thi tuyển sinh 2025"
        sub="Ba công cụ liên thông: tra cứu thứ hạng, catalog trường và gợi ý nguyện vọng."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {SOLUTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl border border-line bg-surface p-6 shadow-[0_1px_3px_rgba(13,44,84,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(13,44,84,0.08)]"
            >
              <h3 className="text-lg font-semibold text-ink group-hover:underline">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{s.desc}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-accent">Khám phá →</span>
            </Link>
          ))}
        </div>
      </Section>

      <div className="border-y border-line bg-surface">
        <Section
          eyebrow="Nổi bật"
          title="Trường top đầu theo điểm chuẩn 2024"
          sub="Dữ liệu tham khảo từ đề án tuyển sinh các trường."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((t) => (
              <SchoolCard key={t.code} school={t} />
            ))}
          </div>
        </Section>
      </div>

      <Section title="Bắt đầu định hướng nguyện vọng của bạn ngay hôm nay" sub="Hoàn thiện khảo sát 2 phút để nhận giỏ nguyện vọng đầu tiên.">
        <Link
          href="/onboarding"
          className="inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-on-cta hover:bg-accent-hover"
        >
          Bắt đầu khảo sát
        </Link>
      </Section>
    </div>
  );
}
