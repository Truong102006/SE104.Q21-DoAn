export interface ApiErrorItem {
  field: string;
  message: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiErrorItem[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AuthLoginPayload {
  accessToken: string;
  tokenType: string;
  username: string;
  groupCode: string;
  roles: string[];
  permissions: string[];
}

export interface AuthMePayload {
  username: string;
  groupCode: string;
  roles: string[];
  permissions: string[];
}

export interface SupplierResponse {
  maNhaCungCap: string;
  tenNhaCungCap: string;
  soDienThoai: string;
  diaChi?: string;
  ghiChu?: string;
  isActive?: boolean;
}

export interface SupplierRequest {
  maNhaCungCap?: string;
  tenNhaCungCap: string;
  soDienThoai: string;
  diaChi?: string;
  ghiChu?: string;
  isActive?: boolean;
}

export interface CustomerResponse {
  maKhachHang: string;
  tenKhachHang: string;
  soDienThoaiKhachHang: string;
  diaChiKhachHang?: string;
  ghiChu?: string;
}

export interface CustomerRequest {
  maKhachHang?: string;
  tenKhachHang: string;
  soDienThoaiKhachHang: string;
  diaChiKhachHang?: string;
  ghiChu?: string;
}

export interface UnitResponse {
  maDonViTinh: string;
  tenDonViTinh: string;
  loaiDonVi?: string;
  heSoQuyDoi?: number;
  ghiChu?: string;
  isActive?: boolean;
}

export interface UnitRequest {
  maDonViTinh?: string;
  tenDonViTinh: string;
  loaiDonVi?: string;
  heSoQuyDoi?: number;
  ghiChu?: string;
  isActive?: boolean;
}

export interface ProductTypeResponse {
  maLoaiSanPham: string;
  tenLoaiSanPham: string;
  tiLeLoiNhuan: number;
  maDonViTinh: string;
  isActive?: boolean;
}

export interface ProductTypeRequest {
  maLoaiSanPham?: string;
  tenLoaiSanPham: string;
  tiLeLoiNhuan: number;
  maDonViTinh: string;
  isActive?: boolean;
}

export interface ServiceTypeResponse {
  maLoaiDichVu: string;
  tenLoaiDichVu: string;
  donGiaDichVu: number;
  isActive?: boolean;
}

export interface ServiceTypeRequest {
  maLoaiDichVu?: string;
  tenLoaiDichVu: string;
  donGiaDichVu: number;
  isActive?: boolean;
}

export interface ProductResponse {
  maSanPham: string;
  tenSanPham: string;
  maLoaiSanPham: string;
  maDonViTinh: string;
  donGiaMua: number;
  donGiaBan: number;
  tonKho: number;
  imageUrl?: string | null;
  isActive?: boolean;
  loaiSanPham?: {
    maLoaiSanPham: string;
    tenLoaiSanPham: string;
  };
  donViTinh?: {
    maDonViTinh: string;
    tenDonViTinh: string;
    loaiDonVi?: string;
  };
}

export interface ProductRequest {
  maSanPham?: string;
  tenSanPham: string;
  maLoaiSanPham: string;
  donGiaMua: number;
  donGiaBan?: number;
  tonKho?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface UploadImageResponse {
  imageUrl: string;
  publicId?: string | null;
}

export interface PurchaseRequest {
  soPhieuMua?: string;
  ngayLapPhieuMua: string;
  maNhaCungCap: string;
  items: Array<{
    maSanPham: string;
    soLuongMua: number;
    maDonViTinh: string;
    donGia: number;
  }>;
}

export interface PurchaseResponse {
  soPhieuMua: string;
  ngayLapPhieuMua: string;
  maNhaCungCap: string;
  tongTien: number;
  nhaCungCap?: {
    maNhaCungCap: string;
    tenNhaCungCap: string;
    soDienThoai?: string;
    diaChi?: string;
  };
  items: Array<{
    maSanPham: string;
    tenSanPham: string;
    maLoaiSanPham: string;
    tenLoaiSanPham: string;
    soLuongMua: number;
    maDonViTinh: string;
    tenDonViTinh: string;
    donGia: number;
    thanhTien: number;
  }>;
}

export interface SaleRequest {
  soPhieuBan?: string;
  ngayLapPhieuBan: string;
  maKhachHang: string;
  items: Array<{
    maSanPham: string;
    soLuong: number;
  }>;
}

export interface SaleResponse {
  soPhieuBan: string;
  ngayLapPhieuBan: string;
  maKhachHang: string;
  tongTien: number;
  khachHang?: {
    maKhachHang: string;
    tenKhachHang: string;
    soDienThoai?: string;
    diaChi?: string;
  };
  items: Array<{
    maSanPham: string;
    tenSanPham: string;
    maLoaiSanPham: string;
    tenLoaiSanPham: string;
    soLuong: number;
    maDonViTinh: string;
    tenDonViTinh: string;
    donGia: number;
    thanhTien: number;
  }>;
}

export interface ServiceTicketRequest {
  soPhieuDichVu?: string;
  ngayLapPhieuDichVu: string;
  maKhachHang: string;
  items: Array<{
    maLoaiDichVu: string;
    soLuongDichVu: number;
    chiPhiRieng?: number;
    donGiaDuocTinh?: number;
    tienTraTruoc: number;
    ngayGiao?: string;
  }>;
}

export interface ServiceTicketResponse {
  soPhieuDichVu: string;
  ngayLapPhieuDichVu: string;
  maKhachHang: string;
  tongTienTraTruoc: number;
  tongTienConLai: number;
  tongTien: number;
  tinhTrangDichVu: string;
  khachHang?: {
    maKhachHang: string;
    tenKhachHang: string;
    soDienThoai?: string;
    diaChi?: string;
  };
  items: Array<{
    maLoaiDichVu: string;
    tenLoaiDichVu: string;
    soLuongDichVu: number;
    donGiaDichVu: number;
    donGiaDuocTinh: number;
    thanhTien: number;
    tienTraTruoc: number;
    tienConLai: number;
    ngayGiao?: string;
    tinhTrang: string;
  }>;
}

export interface SearchProductResponse {
  maSanPham: string;
  tenSanPham: string;
  tenLoaiSanPham: string;
  donGiaBan: number;
  tonKho: number;
  tenDonViTinh: string;
}

export interface SearchServiceTicketResponse {
  soPhieuDichVu: string;
  ngayLapPhieuDichVu: string;
  tenKhachHang: string;
  tongTien: number;
  tongTienTraTruoc: number;
  tongTienConLai: number;
  tinhTrangDichVu: string;
  ngayGiao?: string;
}

export interface InventoryReportResponse {
  maBaoCaoTonKho: string;
  thang: number;
  nam: number;
  chiTiet: Array<{
    stt: number;
    maSanPham: string;
    tenSanPham: string;
    tonDau: number;
    soLuongMuaVao: number;
    soLuongBanRa: number;
    tonCuoi: number;
    tenDonViTinh: string;
  }>;
}

export interface ProductRevenueReportResponse {
  maBaoCaoDoanhThuSp: string;
  thang: number;
  nam: number;
  tongDoanhThuSanPham: number;
  chiTiet: Array<{
    stt: number;
    maSanPham: string;
    tenSanPham: string;
    soLuongBan: number;
    doanhThu: number;
    tiLe: number;
  }>;
}

export interface ServiceRevenueReportResponse {
  maBaoCaoDoanhThuDv: string;
  thang: number;
  nam: number;
  tongDoanhThuDichVu: number;
  chiTiet: Array<{
    stt: number;
    maLoaiDichVu: string;
    tenLoaiDichVu: string;
    doanhThu: number;
    tiLe: number;
  }>;
}

export interface ServicePrepaymentRateResponse {
  key: string;
  value: number;
}

export interface ServicePrepaymentRateRequest {
  value: number;
}

export interface UserResponse {
  tenDangNhap: string;
  maNhom: string;
  isActive?: boolean;
}

export interface UserRequest {
  tenDangNhap?: string;
  matKhau?: string;
  maNhom: string;
  isActive?: boolean;
}

export interface UserGroupResponse {
  maNhom: string;
  tenNhom: string;
}
