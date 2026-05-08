import type { Product, User, Category, GoldPrice } from "@/types";

/* ──────────────────────────────────────────────────────────────
   Mock data for development — replace with real API calls later
   ────────────────────────────────────────────────────────── */

/* ── Demo Users ──────────────────────────────────────────── */
export const MOCK_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin123",
    user: {
      id: 1,
      username: "admin",
      fullName: "Nguyễn Văn An",
      email: "admin@goldstore.vn",
      role: "ADMIN",
    },
  },
  staff: {
    password: "staff123",
    user: {
      id: 2,
      username: "staff",
      fullName: "Trần Thị Bích",
      email: "staff@goldstore.vn",
      role: "STAFF",
    },
  },
};

/* ── Categories ──────────────────────────────────────────── */
export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Vàng", description: "Trang sức vàng 24K, 18K, 14K" },
  { id: 2, name: "Bạc", description: "Trang sức bạc 925, bạc Ý" },
  { id: 3, name: "Đá quý", description: "Kim cương, ruby, sapphire, emerald" },
  { id: 4, name: "Vàng trắng", description: "Trang sức vàng trắng 18K" },
  { id: 5, name: "Platinum", description: "Trang sức platinum cao cấp" },
];

/* ── Products ────────────────────────────────────────────── */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Nhẫn vàng 24K hoa văn rồng phụng",
    categoryId: 1,
    categoryName: "Vàng",
    weight: 3.75,
    weightUnit: "chỉ",
    costPrice: 27_500_000,
    sellingPrice: 29_200_000,
    stock: 12,
    status: "IN_STOCK",
    createdAt: "2026-04-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Dây chuyền vàng 18K mặt đá CZ",
    categoryId: 1,
    categoryName: "Vàng",
    weight: 2.5,
    weightUnit: "chỉ",
    costPrice: 15_800_000,
    sellingPrice: 17_500_000,
    stock: 8,
    status: "IN_STOCK",
    createdAt: "2026-04-18T14:15:00Z",
  },
  {
    id: 3,
    name: "Bông tai bạc Ý 925 hình giọt nước",
    categoryId: 2,
    categoryName: "Bạc",
    weight: 5.0,
    weightUnit: "gram",
    costPrice: 450_000,
    sellingPrice: 680_000,
    stock: 25,
    status: "IN_STOCK",
    createdAt: "2026-04-20T09:00:00Z",
  },
  {
    id: 4,
    name: "Nhẫn kim cương solitaire 0.5 carat",
    categoryId: 3,
    categoryName: "Đá quý",
    weight: 3.2,
    weightUnit: "gram",
    costPrice: 45_000_000,
    sellingPrice: 52_800_000,
    stock: 3,
    status: "LOW_STOCK",
    createdAt: "2026-04-22T11:45:00Z",
  },
  {
    id: 5,
    name: "Lắc tay vàng trắng 18K đính sapphire",
    categoryId: 4,
    categoryName: "Vàng trắng",
    weight: 8.5,
    weightUnit: "gram",
    costPrice: 22_000_000,
    sellingPrice: 25_600_000,
    stock: 5,
    status: "IN_STOCK",
    createdAt: "2026-04-25T16:20:00Z",
  },
  {
    id: 6,
    name: "Mặt dây chuyền ruby đỏ thiên nhiên",
    categoryId: 3,
    categoryName: "Đá quý",
    weight: 2.1,
    weightUnit: "gram",
    costPrice: 35_000_000,
    sellingPrice: 41_200_000,
    stock: 2,
    status: "LOW_STOCK",
    createdAt: "2026-04-28T08:30:00Z",
  },
  {
    id: 7,
    name: "Nhẫn cưới platinum couple",
    categoryId: 5,
    categoryName: "Platinum",
    weight: 6.0,
    weightUnit: "gram",
    costPrice: 18_500_000,
    sellingPrice: 21_900_000,
    stock: 0,
    status: "OUT_OF_STOCK",
    createdAt: "2026-05-01T13:00:00Z",
  },
  {
    id: 8,
    name: "Vòng tay vàng 24K trơn bóng 1 chỉ",
    categoryId: 1,
    categoryName: "Vàng",
    weight: 1.0,
    weightUnit: "chỉ",
    costPrice: 7_400_000,
    sellingPrice: 8_100_000,
    stock: 20,
    status: "IN_STOCK",
    createdAt: "2026-05-03T10:00:00Z",
  },
];

/* ── Gold Prices ─────────────────────────────────────────── */
export const MOCK_GOLD_PRICES: GoldPrice[] = [
  {
    id: 1,
    type: "Vàng SJC 1 lượng",
    buyPrice: 92_500_000,
    sellPrice: 94_500_000,
    updatedAt: "2026-05-08T08:00:00Z",
  },
  {
    id: 2,
    type: "Vàng nhẫn SJC 99.99",
    buyPrice: 90_200_000,
    sellPrice: 91_700_000,
    updatedAt: "2026-05-08T08:00:00Z",
  },
  {
    id: 3,
    type: "Vàng 18K",
    buyPrice: 62_000_000,
    sellPrice: 64_500_000,
    updatedAt: "2026-05-08T08:00:00Z",
  },
];

/* ── Helpers ─────────────────────────────────────────────── */

/** Format VND currency */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/** Simulate API delay */
export function fakeDelay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mock login */
export async function mockLogin(
  username: string,
  password: string,
): Promise<{ token: string; user: User }> {
  await fakeDelay(800);
  const account = MOCK_USERS[username];
  if (!account || account.password !== password) {
    throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
  }
  return {
    token: `mock-jwt-${account.user.role.toLowerCase()}-${Date.now()}`,
    user: account.user,
  };
}
