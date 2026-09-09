// Mock catalog data. Shape follows domain glossary (catalog): Trường, Ngành,
// Điểm chuẩn per year, Phương thức xét tuyển, Tổ hợp xét tuyển.
export type Truong = {
  ma: string;
  ten: string;
  tenTiengAnh: string;
  diaChi: string;
  loaiHinh: string;
  khuVuc: string;
  nhomNganh: string[];
  hocPhi: string;
  toHopChuLuc: string[];
  xuHuong: "up" | "flat" | "down";
  diemChuan2024: number;
};

export type Nganh = {
  maNganh: string;
  ten: string;
  truong: string;
  toHop: string[];
  phuongThuc: string[];
  diemChuan: { y2022: number; y2023: number; y2024: number };
  chiTieu: string;
  hocPhi: string;
};

export type Review = { tacGia: string; vaiTro: string; noiDung: string; truong: string };

export const CURRENT_USER = { maSo: "HS-2025-HN9", diem: 26.85, toHop: "A00" };

export const TRUONGS: Truong[] = [
  { ma: "BKA", ten: "Đại học Bách khoa Hà Nội", tenTiengAnh: "Hanoi University of Science and Technology", diaChi: "Số 1 Đại Cồ Việt, Hà Nội", loaiHinh: "Đại học công lập", khuVuc: "Hà Nội", nhomNganh: ["Kỹ thuật - Công nghệ"], hocPhi: "28 - 32 triệu/năm", toHopChuLuc: ["A00", "A01", "K01"], xuHuong: "up", diemChuan2024: 28.5 },
  { ma: "NEU", ten: "Trường Đại học Kinh tế Quốc dân", tenTiengAnh: "National Economics University", diaChi: "207 Giải Phóng, Hà Nội", loaiHinh: "Đại học công lập", khuVuc: "Hà Nội", nhomNganh: ["Kinh tế - Quản trị"], hocPhi: "16 - 22 triệu/năm", toHopChuLuc: ["A00", "A01", "D01"], xuHuong: "flat", diemChuan2024: 27.2 },
  { ma: "FTU", ten: "Trường Đại học Ngoại thương", tenTiengAnh: "Foreign Trade University", diaChi: "91 Chùa Láng, Hà Nội", loaiHinh: "Đại học công lập", khuVuc: "Hà Nội", nhomNganh: ["Kinh tế - Quản trị"], hocPhi: "22 - 28 triệu/năm", toHopChuLuc: ["A00", "D01"], xuHuong: "up", diemChuan2024: 28.1 },
  { ma: "UET", ten: "Trường Đại học Công nghệ - ĐHQGHN", tenTiengAnh: "VNU University of Engineering and Technology", diaChi: "144 Xuân Thủy, Hà Nội", loaiHinh: "Đại học công lập", khuVuc: "Hà Nội", nhomNganh: ["Kỹ thuật - Công nghệ"], hocPhi: "Dưới 25 triệu/năm", toHopChuLuc: ["A00", "A01"], xuHuong: "up", diemChuan2024: 26.4 },
  { ma: "HMU", ten: "Trường Đại học Y Hà Nội", tenTiengAnh: "Hanoi Medical University", diaChi: "Số 1 Tôn Thất Tùng, Hà Nội", loaiHinh: "Đại học công lập", khuVuc: "Hà Nội", nhomNganh: ["Sức khỏe"], hocPhi: "24 - 30 triệu/năm", toHopChuLuc: ["B00"], xuHuong: "flat", diemChuan2024: 27.8 },
  { ma: "PTIT", ten: "Học viện Công nghệ Bưu chính Viễn thông", tenTiengAnh: "Posts and Telecommunications Institute of Technology", diaChi: "122 Hoàng Quốc Việt, Hà Nội", loaiHinh: "Học viện công lập", khuVuc: "Hà Nội", nhomNganh: ["Kỹ thuật - Công nghệ"], hocPhi: "22 - 27 triệu/năm", toHopChuLuc: ["A00", "A01"], xuHuong: "up", diemChuan2024: 25.6 },
  { ma: "TMU", ten: "Trường Đại học Thương mại", tenTiengAnh: "Thuongmai University", diaChi: "79 Hồ Tùng Mậu, Hà Nội", loaiHinh: "Đại học công lập", khuVuc: "Hà Nội", nhomNganh: ["Kinh tế - Quản trị"], hocPhi: "18 - 24 triệu/năm", toHopChuLuc: ["A00", "D01"], xuHuong: "flat", diemChuan2024: 25.1 },
  { ma: "AOF", ten: "Học viện Tài chính", tenTiengAnh: "Academy of Finance", diaChi: "58 Lê Văn Hiến, Hà Nội", loaiHinh: "Học viện công lập", khuVuc: "Hà Nội", nhomNganh: ["Kinh tế - Quản trị"], hocPhi: "Dưới 25 triệu/năm", toHopChuLuc: ["A00", "D01"], xuHuong: "flat", diemChuan2024: 24.8 },
  { ma: "HCMUT", ten: "Trường Đại học Bách khoa - ĐHQG TP.HCM", tenTiengAnh: "HCMUT - VNUHCM", diaChi: "268 Lý Thường Kiệt, TP.HCM", loaiHinh: "Đại học công lập", khuVuc: "TP.HCM", nhomNganh: ["Kỹ thuật - Công nghệ"], hocPhi: "27 - 32 triệu/năm", toHopChuLuc: ["A00", "A01"], xuHuong: "up", diemChuan2024: 27.5 },
  { ma: "UEH", ten: "Trường Đại học Kinh tế TP.HCM", tenTiengAnh: "University of Economics Ho Chi Minh City", diaChi: "59C Nguyễn Đình Chiểu, TP.HCM", loaiHinh: "Đại học công lập", khuVuc: "TP.HCM", nhomNganh: ["Kinh tế - Quản trị"], hocPhi: "22 - 30 triệu/năm", toHopChuLuc: ["A00", "D01"], xuHuong: "flat", diemChuan2024: 26.2 },
  { ma: "DAV", ten: "Học viện Ngoại giao", tenTiengAnh: "Diplomatic Academy of Vietnam", diaChi: "69 Chùa Láng, Hà Nội", loaiHinh: "Học viện công lập", khuVuc: "Hà Nội", nhomNganh: ["Xã hội - Nhân văn"], hocPhi: "Dưới 25 triệu/năm", toHopChuLuc: ["D01", "C00"], xuHuong: "up", diemChuan2024: 26.8 },
  { ma: "ULIS", ten: "Trường Đại học Ngoại ngữ - ĐHQGHN", tenTiengAnh: "VNU University of Languages and International Studies", diaChi: "2 Phạm Văn Đồng, Hà Nội", loaiHinh: "Đại học công lập", khuVuc: "Hà Nội", nhomNganh: ["Ngoại ngữ"], hocPhi: "Dưới 25 triệu/năm", toHopChuLuc: ["D01"], xuHuong: "flat", diemChuan2024: 24.2 },
];

const nganh = (
  maNganh: string,
  ten: string,
  truong: string,
  toHop: string[],
  diemChuan: [number, number, number],
  chiTieu: string,
  hocPhi?: string,
): Nganh => ({
  maNganh,
  ten,
  truong,
  toHop,
  phuongThuc: ["Thi tốt nghiệp THPTQG", "Đánh giá tư duy (TSA)"],
  diemChuan: { y2022: diemChuan[0], y2023: diemChuan[1], y2024: diemChuan[2] },
  chiTieu,
  hocPhi: hocPhi ?? "28 - 32 triệu/năm",
});

export const NGANHS: Nganh[] = [
  nganh("IT1", "Khoa học Máy tính - Chương trình Chuẩn", "BKA", ["A00", "A01", "K01"], [27.8, 28.2, 28.5], "Chỉ tiêu A00: ~240 sinh viên"),
  nganh("IT2", "Kỹ thuật Máy tính", "BKA", ["A00", "A01"], [27.1, 27.5, 27.9], "Chỉ tiêu: ~200 sinh viên"),
  nganh("EE2", "Kỹ thuật Điều khiển và Tự động hóa", "BKA", ["A00", "A01"], [26.4, 26.9, 27.3], "Chỉ tiêu: ~320 sinh viên"),
  nganh("ME1", "Kỹ thuật Cơ điện tử (Mechatronics Engineering)", "BKA", ["A00", "A01"], [25.8, 26.2, 26.6], "Chỉ tiêu: ~280 sinh viên"),
  nganh("CH1", "Kỹ thuật Hóa học", "BKA", ["A00", "B00"], [23.5, 23.9, 24.3], "Chỉ tiêu: ~250 sinh viên"),
  nganh("EV1", "Kỹ thuật Môi trường", "BKA", ["A00", "B00", "D07"], [22.1, 22.6, 23.0], "Chỉ tiêu: ~150 sinh viên"),
  nganh("EC1", "Điện tử - Viễn thông", "BKA", ["A00", "A01"], [26.0, 26.5, 26.9], "Chỉ tiêu: ~400 sinh viên"),
  nganh("EM1", "Quản trị Kinh doanh (chương trình BKA)", "BKA", ["A00", "D01"], [24.2, 24.7, 25.1], "Chỉ tiêu: ~180 sinh viên"),
  nganh("QTKD", "Quản trị Kinh doanh", "NEU", ["A00", "A01", "D01"], [26.5, 26.9, 27.2], "Chỉ tiêu: ~500 sinh viên", "16 - 22 triệu/năm"),
  nganh("KT", "Kinh tế", "NEU", ["A00", "D01"], [25.9, 26.3, 26.6], "Chỉ tiêu: ~450 sinh viên", "16 - 22 triệu/năm"),
  nganh("TCNH", "Tài chính - Ngân hàng", "NEU", ["A00", "A01", "D01"], [25.5, 26.0, 26.4], "Chỉ tiêu: ~480 sinh viên", "16 - 22 triệu/năm"),
  nganh("KTQT", "Kế toán", "NEU", ["A00", "D01"], [25.2, 25.6, 26.0], "Chỉ tiêu: ~420 sinh viên", "16 - 22 triệu/năm"),
  nganh("KTQT2", "Kinh tế quốc tế", "FTU", ["A00", "D01"], [27.4, 27.8, 28.1], "Chỉ tiêu: ~350 sinh viên", "22 - 28 triệu/năm"),
  nganh("KDQT", "Kinh doanh quốc tế", "FTU", ["A00", "D01"], [27.0, 27.5, 27.9], "Chỉ tiêu: ~300 sinh viên", "22 - 28 triệu/năm"),
  nganh("NNA", "Ngôn ngữ Anh (Thương mại)", "FTU", ["D01"], [26.2, 26.6, 27.0], "Chỉ tiêu: ~250 sinh viên", "22 - 28 triệu/năm"),
  nganh("TCDN", "Tài chính doanh nghiệp", "FTU", ["A00", "D01"], [26.4, 26.8, 27.1], "Chỉ tiêu: ~280 sinh viên", "22 - 28 triệu/năm"),
  nganh("CN1", "Công nghệ Thông tin", "UET", ["A00", "A01"], [25.6, 26.0, 26.4], "Chỉ tiêu: ~380 sinh viên", "Dưới 25 triệu/năm"),
  nganh("CN8", "Trí tuệ Nhân tạo", "UET", ["A00", "A01"], [26.1, 26.5, 26.9], "Chỉ tiêu: ~120 sinh viên", "Dưới 25 triệu/năm"),
  nganh("CN2", "Kỹ thuật Máy tính", "UET", ["A00", "A01"], [24.8, 25.2, 25.6], "Chỉ tiêu: ~200 sinh viên", "Dưới 25 triệu/năm"),
  nganh("CN12", "Công nghệ Nông nghiệp", "UET", ["A00", "B00"], [21.5, 22.0, 22.4], "Chỉ tiêu: ~100 sinh viên", "Dưới 25 triệu/năm"),
  nganh("YDK", "Y đa khoa", "HMU", ["B00"], [27.3, 27.5, 27.8], "Chỉ tiêu: ~600 sinh viên", "24 - 30 triệu/năm"),
  nganh("RH", "Răng - Hàm - Mặt", "HMU", ["B00"], [26.8, 27.0, 27.3], "Chỉ tiêu: ~150 sinh viên", "24 - 30 triệu/năm"),
  nganh("DD", "Điều dưỡng", "HMU", ["B00"], [22.5, 23.0, 23.5], "Chỉ tiêu: ~300 sinh viên", "24 - 30 triệu/năm"),
  nganh("CNTT", "Công nghệ Thông tin", "PTIT", ["A00", "A01"], [24.9, 25.3, 25.6], "Chỉ tiêu: ~700 sinh viên", "22 - 27 triệu/năm"),
  nganh("DTVT", "Kỹ thuật Điện tử - Viễn thông", "PTIT", ["A00", "A01"], [23.8, 24.2, 24.6], "Chỉ tiêu: ~400 sinh viên", "22 - 27 triệu/năm"),
  nganh("ATTT", "An toàn Thông tin", "PTIT", ["A00", "A01"], [24.5, 24.9, 25.2], "Chỉ tiêu: ~250 sinh viên", "22 - 27 triệu/năm"),
  nganh("TM01", "Marketing", "TMU", ["A00", "D01"], [24.4, 24.8, 25.1], "Chỉ tiêu: ~350 sinh viên", "18 - 24 triệu/năm"),
  nganh("TM02", "Thương mại điện tử", "TMU", ["A00", "A01", "D01"], [24.6, 25.0, 25.4], "Chỉ tiêu: ~300 sinh viên", "18 - 24 triệu/năm"),
  nganh("TC01", "Tài chính - Ngân hàng", "AOF", ["A00", "D01"], [24.1, 24.5, 24.8], "Chỉ tiêu: ~600 sinh viên", "Dưới 25 triệu/năm"),
  nganh("KT01", "Kế toán doanh nghiệp", "AOF", ["A00", "D01"], [23.8, 24.2, 24.5], "Chỉ tiêu: ~550 sinh viên", "Dưới 25 triệu/năm"),
  nganh("BK01", "Khoa học Máy tính", "HCMUT", ["A00", "A01"], [26.8, 27.2, 27.5], "Chỉ tiêu: ~300 sinh viên", "27 - 32 triệu/năm"),
  nganh("BK02", "Kỹ thuật Cơ khí", "HCMUT", ["A00", "A01"], [24.9, 25.3, 25.7], "Chỉ tiêu: ~450 sinh viên", "27 - 32 triệu/năm"),
  nganh("BK03", "Kỹ thuật Điện", "HCMUT", ["A00", "A01"], [24.5, 24.9, 25.3], "Chỉ tiêu: ~400 sinh viên", "27 - 32 triệu/năm"),
  nganh("UE01", "Kinh doanh quốc tế", "UEH", ["A00", "D01"], [25.5, 25.9, 26.2], "Chỉ tiêu: ~400 sinh viên", "22 - 30 triệu/năm"),
  nganh("UE02", "Marketing", "UEH", ["A00", "D01"], [25.2, 25.6, 25.9], "Chỉ tiêu: ~350 sinh viên", "22 - 30 triệu/năm"),
  nganh("QH01", "Quan hệ quốc tế", "DAV", ["D01", "C00"], [26.1, 26.5, 26.8], "Chỉ tiêu: ~200 sinh viên", "Dưới 25 triệu/năm"),
  nganh("TT01", "Truyền thông quốc tế", "DAV", ["D01", "C00"], [25.6, 26.0, 26.3], "Chỉ tiêu: ~180 sinh viên", "Dưới 25 triệu/năm"),
  nganh("NN01", "Ngôn ngữ Anh", "ULIS", ["D01"], [23.5, 23.9, 24.2], "Chỉ tiêu: ~300 sinh viên", "Dưới 25 triệu/năm"),
  nganh("NN02", "Ngôn ngữ Trung Quốc", "ULIS", ["D01"], [24.8, 25.1, 25.4], "Chỉ tiêu: ~200 sinh viên", "Dưới 25 triệu/năm"),
];

export const REVIEWS: Review[] = [
  { tacGia: "Minh Anh", vaiTro: "Thí sinh trúng tuyển IT1 - 2024", noiDung: "Điểm chuẩn các năm ổn định, đề án tuyển sinh minh bạch. Mình đối chiếu phổ điểm tổ hợp A00 rồi mới chốt thứ tự nguyện vọng.", truong: "BKA" },
  { tacGia: "Đức Huy", vaiTro: "Sinh viên năm 2 - EE2", noiDung: "Chương trình học nặng nhưng cơ sở vật chất tốt. Nên xét thêm phương thức TSA để tăng cơ hội.", truong: "BKA" },
  { tacGia: "Thu Trang", vaiTro: "Phụ huynh thí sinh 2025", noiDung: "Bảng điểm chuẩn 3 năm và xu hướng giúp gia đình tôi đánh giá đúng sức con, không đặt nguyện vọng quá sức.", truong: "BKA" },
];

export function getTruong(ma: string): Truong | undefined {
  return TRUONGS.find((t) => t.ma.toLowerCase() === ma.toLowerCase());
}

// ponytail: one mapper for TRUONGS -> SchoolCard shape, shared by home + schools pages
export function toCard(t: Truong) {
  return {
    code: t.ma,
    name: t.ten,
    combos: t.toHopChuLuc,
    cutoff2024: t.diemChuan2024,
    trend: t.xuHuong,
    tuition: t.hocPhi,
    region: t.khuVuc,
    groups: t.nhomNganh,
  };
}

export function getNganhsByTruong(ma: string): Nganh[] {
  return NGANHS.filter((n) => n.truong.toLowerCase() === ma.toLowerCase());
}
