import { Section } from "@compass/ui";
import { CURRENT_USER } from "../../mocks";
import { LookupForm } from "../../islands";

export const metadata = { title: "Tra cứu Thứ hạng & Phổ điểm - Compass" };

export default function LookupPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.04em] text-accent uppercase">Tra cứu</p>
      <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-ink">
        Tra cứu Thứ hạng &amp; Phổ điểm THPTQG
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">
        Nhập điểm và tổ hợp xét tuyển để biết thứ hạng ước tính của bạn so với phổ điểm toàn quốc.
      </p>
      <div className="mt-8">
        <LookupForm defaultScore={CURRENT_USER.diem} />
      </div>
      <Section title="Cách đọc kết quả" sub="Thứ hạng càng nhỏ càng tốt. Top 5% nghĩa là điểm của bạn cao hơn 95% thí sinh cùng tổ hợp.">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-body">
          <li>Đối chiếu thứ hạng với chỉ tiêu và điểm chuẩn 3 năm của ngành mục tiêu.</li>
          <li>Phổ điểm mỗi năm dao động theo độ khó đề thi và chương trình (CT2018 / CT2006).</li>
        </ul>
      </Section>
    </div>
  );
}
