export type UnitType = "WEIGHT" | "QUANTITY" | "SIZE" | "OTHER";

export interface UnitDefinition {
  id: number;
  name: string;
  type: UnitType;
  conversionToGram: number;
  note: string;
}

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  WEIGHT: "Trọng lượng",
  QUANTITY: "Số lượng",
  SIZE: "Kích thước",
  OTHER: "Khác",
};

export const UNIT_TYPE_OPTIONS = (Object.keys(UNIT_TYPE_LABELS) as UnitType[]).map((type) => ({
  value: type,
  label: UNIT_TYPE_LABELS[type],
}));

export const DEFAULT_UNITS: UnitDefinition[] = [
  {
    id: 1,
    name: "Gram",
    type: "WEIGHT",
    conversionToGram: 1,
    note: "Đơn vị chuẩn để quy đổi trọng lượng.",
  },
  {
    id: 2,
    name: "Chỉ",
    type: "WEIGHT",
    conversionToGram: 3.75,
    note: "1 Chỉ = 3.75 Gram.",
  },
  {
    id: 3,
    name: "Lượng",
    type: "WEIGHT",
    conversionToGram: 37.5,
    note: "1 Lượng = 10 Chỉ = 37.5 Gram.",
  },
  {
    id: 4,
    name: "Kg",
    type: "WEIGHT",
    conversionToGram: 1000,
    note: "Dùng cho bạc/nguyên liệu khối lượng lớn.",
  },
  {
    id: 5,
    name: "Viên",
    type: "QUANTITY",
    conversionToGram: 0,
    note: "Dùng cho đá quý/phụ kiện, không quy đổi gram.",
  },
];

export const UNIT_SELECT_OPTIONS = DEFAULT_UNITS.map((unit) => ({
  value: unit.name,
  label: unit.name,
}));

export function normalizeUnitName(value: string): string {
  return value.trim().toLowerCase();
}

export function findUnitByName(name: string): UnitDefinition | undefined {
  return DEFAULT_UNITS.find((unit) => normalizeUnitName(unit.name) === normalizeUnitName(name));
}
