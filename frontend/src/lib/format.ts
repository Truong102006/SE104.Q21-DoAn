export function formatCurrency(value: number | undefined | null): string {
  const safe = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatNumber(value: number | undefined | null): string {
  const safe = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN").format(safe);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function toPositiveNumber(value: string): number {
  const normalized = value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

export function toPositiveInt(value: string): number {
  const normalized = value.replace(/\D/g, "");
  if (!normalized) {
    return 0;
  }
  return Number.parseInt(normalized, 10);
}

export function isValidPhone10Digits(value: string): boolean {
  return /^\d{10}$/.test(value.trim());
}

export function formatVNCurrencyInput(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const clean = String(value).replace(/\D/g, "");
  if (!clean) return "";
  return Number(clean).toLocaleString("vi-VN");
}

export function parseVNCurrencyInput(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatVietnameseStatus(status: string | undefined | null): string {
  if (!status) return "";
  const s = status.trim().toLowerCase();
  if (s === "hoan thanh" || s === "hoàn thành" || s === "da giao" || s === "đã giao") return "Đã giao";
  if (s === "chua hoan thanh" || s === "chưa hoàn thành" || s === "chua giao" || s === "chưa giao" || s === "dang giao" || s === "đang giao") return "Chưa giao";
  return status;
}

