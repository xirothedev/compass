import Link from "next/link";
import { SCHOOLS, MAJORS, toCard } from "../../mocks";
import { FollowingList } from "../../islands";

export const metadata = { title: "Danh sách theo dõi - Compass" };

export default function FollowingPage() {
  const cards = SCHOOLS.map((t) => toCard(t));
  const majors = MAJORS.length;
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <nav aria-label="Điều hướng" className="text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Trang chủ</Link>
        <span aria-hidden> / </span>
        <span aria-current="page" className="text-ink">Danh sách theo dõi</span>
      </nav>
      <p className="mt-2 text-xs font-semibold tracking-[0.04em] text-[var(--accent)] uppercase">Quản lý quan tâm · Lưu tự động trên thiết bị</p>
      <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-[48px]">
        Danh sách theo dõi
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">
        Các Trường bạn lưu để đối chiếu Điểm chuẩn và tạo Gợi ý Nguyện vọng. Tổng hợp từ {majors} mã Ngành trong dữ liệu mẫu.
      </p>
      <div className="mt-8">
        <FollowingList schools={cards} />
      </div>
      <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-[#001736] p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between md:p-12">
        <div>
          <h2 className="text-xl font-semibold">Đặt các trường lên bàn cân để chọn chiến lược tối ưu nhất</h2>
          <p className="mt-1 text-sm text-white/75">
            Mở catalog để thêm trường vào danh sách, rồi đối chiếu điểm chuẩn 3 năm.
          </p>
        </div>
        <Link
          href="/schools"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-[#006972] px-6 text-sm font-semibold text-white hover:bg-[#00838f]"
        >
          Duyệt thêm trường
        </Link>
      </div>
    </div>
  );
}
