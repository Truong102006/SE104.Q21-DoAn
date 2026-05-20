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
