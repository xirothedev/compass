import { TRUONGS, toCard } from "../../mocks";
import { FollowingList } from "../../islands";

export const metadata = { title: "Danh sách theo dõi - Compass" };

export default function FollowingPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.04em] text-accent uppercase">Quan tâm</p>
      <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-ink">
        Danh sách theo dõi
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">
        Các trường bạn lưu để đối chiếu điểm chuẩn và tạo gợi ý nguyện vọng.
      </p>
      <div className="mt-8">
        <FollowingList schools={TRUONGS.map(toCard)} />
      </div>
    </div>
  );
}
