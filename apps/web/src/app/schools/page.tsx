import { Section } from "@compass/ui";
import { TRUONGS, toCard } from "../../mocks";
import { SchoolFilters } from "../../islands";

export const metadata = { title: "Danh mục Trường & Điểm chuẩn - Compass" };

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const q = (await searchParams)?.q ?? "";
  const schools = TRUONGS.map(toCard);
  const regions = [...new Set(TRUONGS.map((t) => t.khuVuc))];
  const groups = [...new Set(TRUONGS.flatMap((t) => t.nhomNganh))];
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.04em] text-[#006972] uppercase">Catalog</p>
      <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-[#0d2c54]">
        Danh mục Trường &amp; Điểm chuẩn Đại học
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#43474e]">
        Tra cứu toàn diện đề án tuyển sinh, biến động điểm chuẩn 3 năm và tổ hợp chủ lực của từng trường.
      </p>
      <div className="mt-8">
        <SchoolFilters schools={schools} regions={regions} groups={groups} initialQuery={q} />
      </div>
      <Section title="Cam kết dữ liệu" sub="Dữ liệu vì tương lai thí sinh. Compass chỉ dùng dữ liệu công khai từ đề án tuyển sinh các trường.">
        <p className="text-sm text-[#5c6470]">Điểm chuẩn mang tính tham khảo. Thí sinh đối chiếu quy chế tuyển sinh chính thức của Bộ GD&ĐT.</p>
      </Section>
    </div>
  );
}
