// Mock catalog data. Shape follows domain glossary (catalog): Trường, Ngành,
// Điểm chuẩn per year, Phương thức xét tuyển, Tổ hợp xét tuyển.
import { cutoffForYear } from "@compass/ui";

export { cutoffForYear };
export type School = {
  code: string;
  name: string;
  name_en: string;
  address: string;
  kind: string;
  region: string;
  groups: string[];
  tuition: string;
  main_combos: string[];
  trend: "up" | "flat" | "down";
  cutoff2024: number;
};

export type Major = {
  code: string;
  name: string;
  school_code: string;
  combos: string[];
  methods: string[];
  cutoffs: { y2022: number; y2023: number; y2024: number; y2025: number };
  quota: string;
  tuition: string;
};

export type Review = { author: string; role: string; content: string; school_code: string; rating?: number; criteria?: Record<string, number> };

export const CURRENT_USER = { application_code: "HS-2025-HN9", score: 26.85, combo: "A00" };

export const SCHOOLS: School[] = [
  { code: "BKA", name: "Đại học Bách khoa Hà Nội", name_en: "Hanoi University of Science and Technology", address: "Số 1 Đại Cồ Việt, Hà Nội", kind: "Đại học công lập", region: "Hà Nội", groups: ["Kỹ thuật - Công nghệ"], tuition: "28 - 32 triệu/năm", main_combos: ["A00", "A01", "K01"], trend: "up", cutoff2024: 28.5 },
  { code: "KHA", name: "Trường Đại học Kinh tế Quốc dân", name_en: "National Economics University", address: "207 Giải Phóng, Hà Nội", kind: "Đại học công lập", region: "Hà Nội", groups: ["Kinh tế - Quản trị"], tuition: "16 - 22 triệu/năm", main_combos: ["A00", "A01", "D01"], trend: "flat", cutoff2024: 27.2 },
  { code: "NTH", name: "Trường Đại học Ngoại thương", name_en: "Foreign Trade University", address: "91 Chùa Láng, Hà Nội", kind: "Đại học công lập", region: "Hà Nội", groups: ["Kinh tế - Quản trị"], tuition: "22 - 28 triệu/năm", main_combos: ["A00", "D01"], trend: "up", cutoff2024: 28.1 },
  { code: "QHI", name: "Trường Đại học Công nghệ - ĐHQGHN", name_en: "VNU University of Engineering and Technology", address: "144 Xuân Thủy, Hà Nội", kind: "Đại học công lập", region: "Hà Nội", groups: ["Kỹ thuật - Công nghệ"], tuition: "Dưới 25 triệu/năm", main_combos: ["A00", "A01"], trend: "up", cutoff2024: 26.4 },
  { code: "YHB", name: "Trường Đại học Y Hà Nội", name_en: "Hanoi Medical University", address: "Số 1 Tôn Thất Tùng, Hà Nội", kind: "Đại học công lập", region: "Hà Nội", groups: ["Sức khỏe"], tuition: "24 - 30 triệu/năm", main_combos: ["B00"], trend: "flat", cutoff2024: 27.8 },
  { code: "BVH", name: "Học viện Công nghệ Bưu chính Viễn thông", name_en: "Posts and Telecommunications Institute of Technology", address: "122 Hoàng Quốc Việt, Hà Nội", kind: "Học viện công lập", region: "Hà Nội", groups: ["Kỹ thuật - Công nghệ"], tuition: "22 - 27 triệu/năm", main_combos: ["A00", "A01"], trend: "up", cutoff2024: 25.6 },
  { code: "TMU", name: "Trường Đại học Thương mại", name_en: "Thuongmai University", address: "79 Hồ Tùng Mậu, Hà Nội", kind: "Đại học công lập", region: "Hà Nội", groups: ["Kinh tế - Quản trị"], tuition: "18 - 24 triệu/năm", main_combos: ["A00", "D01"], trend: "flat", cutoff2024: 25.1 },
  { code: "HTC", name: "Học viện Tài chính", name_en: "Academy of Finance", address: "58 Lê Văn Hiến, Hà Nội", kind: "Học viện công lập", region: "Hà Nội", groups: ["Kinh tế - Quản trị"], tuition: "Dưới 25 triệu/năm", main_combos: ["A00", "D01"], trend: "flat", cutoff2024: 24.8 },
  { code: "QSB", name: "Trường Đại học Bách khoa - ĐHQG TP.HCM", name_en: "QSB - VNUHCM", address: "268 Lý Thường Kiệt, TP.HCM", kind: "Đại học công lập", region: "TP.HCM", groups: ["Kỹ thuật - Công nghệ"], tuition: "27 - 32 triệu/năm", main_combos: ["A00", "A01"], trend: "up", cutoff2024: 27.5 },
  { code: "KSA", name: "Trường Đại học Kinh tế TP.HCM", name_en: "University of Economics Ho Chi Minh City", address: "59C Nguyễn Đình Chiểu, TP.HCM", kind: "Đại học công lập", region: "TP.HCM", groups: ["Kinh tế - Quản trị"], tuition: "22 - 30 triệu/năm", main_combos: ["A00", "D01"], trend: "flat", cutoff2024: 26.2 },
  { code: "HQT", name: "Học viện Ngoại giao", name_en: "Diplomatic Academy of Vietnam", address: "69 Chùa Láng, Hà Nội", kind: "Học viện công lập", region: "Hà Nội", groups: ["Xã hội - Nhân văn"], tuition: "Dưới 25 triệu/năm", main_combos: ["D01", "C00"], trend: "up", cutoff2024: 26.8 },
  { code: "QHF", name: "Trường Đại học Ngoại ngữ - ĐHQGHN", name_en: "VNU University of Languages and International Studies", address: "2 Phạm Văn Đồng, Hà Nội", kind: "Đại học công lập", region: "Hà Nội", groups: ["Ngoại ngữ"], tuition: "Dưới 25 triệu/năm", main_combos: ["D01"], trend: "flat", cutoff2024: 24.2 },
];

const major = (
  code: string,
  name: string,
  school_code: string,
  combos: string[],
  cutoffs: [number, number, number],
  quota: string,
  tuition?: string,
): Major => ({
  code,
  name,
  school_code,
  combos,
  methods: ["Thi tốt nghiệp THPTQG", "Đánh giá tư duy (TSA)"],
  // ponytail: mock y2025 = y2024 + 0.15 until live 2025 rows land
  cutoffs: { y2022: cutoffs[0], y2023: cutoffs[1], y2024: cutoffs[2], y2025: Math.min(30, Math.round((cutoffs[2] + 0.15) * 100) / 100) },
  quota,
  tuition: tuition ?? "28 - 32 triệu/năm",
});

export const MAJORS: Major[] = [
  major("IT1", "Khoa học Máy tính - Chương trình Chuẩn", "BKA", ["A00", "A01", "K01"], [27.8, 28.2, 28.5], "Chỉ tiêu A00: ~240 sinh viên"),
  major("IT2", "Kỹ thuật Máy tính", "BKA", ["A00", "A01"], [27.1, 27.5, 27.9], "Chỉ tiêu: ~200 sinh viên"),
  major("EE2", "Kỹ thuật Điều khiển và Tự động hóa", "BKA", ["A00", "A01"], [26.4, 26.9, 27.3], "Chỉ tiêu: ~320 sinh viên"),
  major("ME1", "Kỹ thuật Cơ điện tử", "BKA", ["A00", "A01"], [25.8, 26.2, 26.6], "Chỉ tiêu: ~280 sinh viên"),
  major("CH1", "Kỹ thuật Hóa học", "BKA", ["A00", "B00"], [23.5, 23.9, 24.3], "Chỉ tiêu: ~250 sinh viên"),
  major("EV1", "Kỹ thuật Môi trường", "BKA", ["A00", "B00", "D07"], [22.1, 22.6, 23.0], "Chỉ tiêu: ~150 sinh viên"),
  major("EC1", "Điện tử - Viễn thông", "BKA", ["A00", "A01"], [26.0, 26.5, 26.9], "Chỉ tiêu: ~400 sinh viên"),
  major("EM1", "Quản trị Kinh doanh (chương trình BKA)", "BKA", ["A00", "D01"], [24.2, 24.7, 25.1], "Chỉ tiêu: ~180 sinh viên"),
  major("QTKD", "Quản trị Kinh doanh", "KHA", ["A00", "A01", "D01"], [26.5, 26.9, 27.2], "Chỉ tiêu: ~500 sinh viên", "16 - 22 triệu/năm"),
  major("KT", "Kinh tế", "KHA", ["A00", "D01"], [25.9, 26.3, 26.6], "Chỉ tiêu: ~450 sinh viên", "16 - 22 triệu/năm"),
  major("TCNH", "Tài chính - Ngân hàng", "KHA", ["A00", "A01", "D01"], [25.5, 26.0, 26.4], "Chỉ tiêu: ~480 sinh viên", "16 - 22 triệu/năm"),
  major("KTQT", "Kế toán", "KHA", ["A00", "D01"], [25.2, 25.6, 26.0], "Chỉ tiêu: ~420 sinh viên", "16 - 22 triệu/năm"),
  major("KTQT2", "Kinh tế quốc tế", "NTH", ["A00", "D01"], [27.4, 27.8, 28.1], "Chỉ tiêu: ~350 sinh viên", "22 - 28 triệu/năm"),
  major("KDQT", "Kinh doanh quốc tế", "NTH", ["A00", "D01"], [27.0, 27.5, 27.9], "Chỉ tiêu: ~300 sinh viên", "22 - 28 triệu/năm"),
  major("NNA", "Ngôn ngữ Anh (Thương mại)", "NTH", ["D01"], [26.2, 26.6, 27.0], "Chỉ tiêu: ~250 sinh viên", "22 - 28 triệu/năm"),
  major("TCDN", "Tài chính doanh nghiệp", "NTH", ["A00", "D01"], [26.4, 26.8, 27.1], "Chỉ tiêu: ~280 sinh viên", "22 - 28 triệu/năm"),
  major("CN1", "Công nghệ Thông tin", "QHI", ["A00", "A01"], [25.6, 26.0, 26.4], "Chỉ tiêu: ~380 sinh viên", "Dưới 25 triệu/năm"),
  major("CN8", "Trí tuệ Nhân tạo", "QHI", ["A00", "A01"], [26.1, 26.5, 26.9], "Chỉ tiêu: ~120 sinh viên", "Dưới 25 triệu/năm"),
  major("CN2", "Kỹ thuật Máy tính", "QHI", ["A00", "A01"], [24.8, 25.2, 25.6], "Chỉ tiêu: ~200 sinh viên", "Dưới 25 triệu/năm"),
  major("CN12", "Công nghệ Nông nghiệp", "QHI", ["A00", "B00"], [21.5, 22.0, 22.4], "Chỉ tiêu: ~100 sinh viên", "Dưới 25 triệu/năm"),
  major("YDK", "Y đa khoa", "YHB", ["B00"], [27.3, 27.5, 27.8], "Chỉ tiêu: ~600 sinh viên", "24 - 30 triệu/năm"),
  major("RH", "Răng - Hàm - Mặt", "YHB", ["B00"], [26.8, 27.0, 27.3], "Chỉ tiêu: ~150 sinh viên", "24 - 30 triệu/năm"),
  major("DD", "Điều dưỡng", "YHB", ["B00"], [22.5, 23.0, 23.5], "Chỉ tiêu: ~300 sinh viên", "24 - 30 triệu/năm"),
  major("CNTT", "Công nghệ Thông tin", "BVH", ["A00", "A01"], [24.9, 25.3, 25.6], "Chỉ tiêu: ~700 sinh viên", "22 - 27 triệu/năm"),
  major("DTVT", "Kỹ thuật Điện tử - Viễn thông", "BVH", ["A00", "A01"], [23.8, 24.2, 24.6], "Chỉ tiêu: ~400 sinh viên", "22 - 27 triệu/năm"),
  major("ATTT", "An toàn Thông tin", "BVH", ["A00", "A01"], [24.5, 24.9, 25.2], "Chỉ tiêu: ~250 sinh viên", "22 - 27 triệu/năm"),
  major("TM01", "Marketing", "TMU", ["A00", "D01"], [24.4, 24.8, 25.1], "Chỉ tiêu: ~350 sinh viên", "18 - 24 triệu/năm"),
  major("TM02", "Thương mại điện tử", "TMU", ["A00", "A01", "D01"], [24.6, 25.0, 25.4], "Chỉ tiêu: ~300 sinh viên", "18 - 24 triệu/năm"),
  major("TC01", "Tài chính - Ngân hàng", "HTC", ["A00", "D01"], [24.1, 24.5, 24.8], "Chỉ tiêu: ~600 sinh viên", "Dưới 25 triệu/năm"),
  major("KT01", "Kế toán doanh nghiệp", "HTC", ["A00", "D01"], [23.8, 24.2, 24.5], "Chỉ tiêu: ~550 sinh viên", "Dưới 25 triệu/năm"),
  major("BK01", "Khoa học Máy tính", "QSB", ["A00", "A01"], [26.8, 27.2, 27.5], "Chỉ tiêu: ~300 sinh viên", "27 - 32 triệu/năm"),
  major("BK02", "Kỹ thuật Cơ khí", "QSB", ["A00", "A01"], [24.9, 25.3, 25.7], "Chỉ tiêu: ~450 sinh viên", "27 - 32 triệu/năm"),
  major("BK03", "Kỹ thuật Điện", "QSB", ["A00", "A01"], [24.5, 24.9, 25.3], "Chỉ tiêu: ~400 sinh viên", "27 - 32 triệu/năm"),
  major("UE01", "Kinh doanh quốc tế", "KSA", ["A00", "D01"], [25.5, 25.9, 26.2], "Chỉ tiêu: ~400 sinh viên", "22 - 30 triệu/năm"),
  major("UE02", "Marketing", "KSA", ["A00", "D01"], [25.2, 25.6, 25.9], "Chỉ tiêu: ~350 sinh viên", "22 - 30 triệu/năm"),
  major("QH01", "Quan hệ quốc tế", "HQT", ["D01", "C00"], [26.1, 26.5, 26.8], "Chỉ tiêu: ~200 sinh viên", "Dưới 25 triệu/năm"),
  major("TT01", "Truyền thông quốc tế", "HQT", ["D01", "C00"], [25.6, 26.0, 26.3], "Chỉ tiêu: ~180 sinh viên", "Dưới 25 triệu/năm"),
  major("NN01", "Ngôn ngữ Anh", "QHF", ["D01"], [23.5, 23.9, 24.2], "Chỉ tiêu: ~300 sinh viên", "Dưới 25 triệu/năm"),
  major("NN02", "Ngôn ngữ Trung Quốc", "QHF", ["D01"], [24.8, 25.1, 25.4], "Chỉ tiêu: ~200 sinh viên", "Dưới 25 triệu/năm"),
];

export const REVIEWS: Review[] = [
  { author: "Minh Anh", role: "Thí sinh trúng tuyển IT1 - 2024", content: "Điểm chuẩn các năm ổn định, đề án tuyển sinh minh bạch. Mình đối chiếu phổ điểm tổ hợp A00 rồi mới chốt thứ tự nguyện vọng.", school_code: "BKA" },
  { author: "Đức Huy", role: "Sinh viên năm 2 - EE2", content: "Chương trình học nặng nhưng cơ sở vật chất tốt. Nên xét thêm phương thức TSA để tăng cơ hội.", school_code: "BKA" },
  { author: "Thu Trang", role: "Phụ huynh thí sinh 2025", content: "Bảng điểm chuẩn 3 năm và xu hướng giúp gia đình tôi đánh giá đúng sức con, không đặt nguyện vọng quá sức.", school_code: "BKA" },
];

export function getSchool(code: string): School | undefined {
  return SCHOOLS.find((t) => t.code.toLowerCase() === code.toLowerCase());
}

// ponytail: one mapper for SCHOOLS -> SchoolCard shape, shared by home + schools pages

// ponytail: 0 = no data for that year; cards render — instead of a stale year
export function getSchoolCutoff(code: string, year: number): number {
  const majors = MAJORS.filter((n) => n.school_code === code);
  const vals = majors.map((m) => cutoffForYear(m.cutoffs, year)).filter((v) => v > 0);
  if (!vals.length) return 0;
  return Math.max(...vals);
}

export function toCard(t: School, year = 2024) {
  return {
    code: t.code,
    name: t.name,
    combos: t.main_combos,
    cutoff: getSchoolCutoff(t.code, year),
    year,
    trend: t.trend,
    tuition: t.tuition,
    region: t.region,
    groups: t.groups,
  };
}

export function getMajorsBySchool(code: string): Major[] {
  return MAJORS.filter((n) => n.school_code.toLowerCase() === code.toLowerCase());
}
