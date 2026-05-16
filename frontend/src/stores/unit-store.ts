"use client";

import { create } from "zustand";
import { DEFAULT_UNITS, type UnitDefinition } from "@/lib/unit-data";

const UNIT_STORAGE_KEY = "gold-store-units";

interface UnitState {
  units: UnitDefinition[];
  isHydrated: boolean;
  hydrate: () => void;
  addUnit: (unit: UnitDefinition) => void;
  updateUnit: (id: number, patch: Omit<UnitDefinition, "id">) => void;
  deleteUnit: (id: number) => void;
  getOptions: () => Array<{ value: string; label: string }>;
}

function persist(units: UnitDefinition[]) {
  localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(units));
}

export const useUnitStore = create<UnitState>((set, get) => ({
  units: DEFAULT_UNITS,
  isHydrated: false,

  hydrate: () => {
    try {
      const raw = localStorage.getItem(UNIT_STORAGE_KEY);
      if (!raw) {
        set({ units: DEFAULT_UNITS, isHydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as UnitDefinition[];
      set({ units: parsed.length > 0 ? parsed : DEFAULT_UNITS, isHydrated: true });
    } catch {
      set({ units: DEFAULT_UNITS, isHydrated: true });
    }
  },

  addUnit: (unit) => {
    const units = [...get().units, unit];
    persist(units);
    set({ units });
  },

  updateUnit: (id, patch) => {
    const units = get().units.map((unit) => (unit.id === id ? { ...unit, ...patch } : unit));
    persist(units);
    set({ units });
  },

  deleteUnit: (id) => {
    const units = get().units.filter((unit) => unit.id !== id);
    persist(units);
    set({ units });
  },

  getOptions: () => get().units.map((unit) => ({ value: unit.name, label: unit.name })),
}));
