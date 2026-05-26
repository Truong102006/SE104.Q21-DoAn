"use client";

import { create } from "zustand";

const SALES_DRAFT_STORAGE_KEY = "gold-store-sales-draft-v1";

export interface SalesDraftItem {
  maSanPham: string;
  tenSanPham: string;
  maLoaiSanPham: string;
  tenLoaiSanPham: string;
  maDonViTinh: string;
  tenDonViTinh: string;
  donGiaBan: number;
  tonKho: number;
  imageUrl?: string | null;
  soLuong: number;
}

interface SalesDraftState {
  items: SalesDraftItem[];
  handoffPending: boolean;
  hydrated: boolean;
  hydrate: () => void;
  addProduct: (product: Omit<SalesDraftItem, "soLuong">) => void;
  increaseQuantity: (maSanPham: string) => void;
  decreaseQuantity: (maSanPham: string) => void;
  setQuantity: (maSanPham: string, soLuong: number) => void;
  removeItem: (maSanPham: string) => void;
  clearDraft: () => void;
  prepareHandoff: () => void;
  consumeHandoff: () => SalesDraftItem[];
  getItemCount: () => number;
  getEstimatedTotal: () => number;
}

type PersistedState = Pick<SalesDraftState, "items" | "handoffPending">;

function persistDraft(state: PersistedState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SALES_DRAFT_STORAGE_KEY, JSON.stringify(state));
}

function clampQuantity(quantity: number, stock: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(Math.floor(quantity), Math.max(1, stock)));
}

export const useSalesDraftStore = create<SalesDraftState>((set, get) => ({
  items: [],
  handoffPending: false,
  hydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") {
      set({ hydrated: true });
      return;
    }

    try {
      const raw = localStorage.getItem(SALES_DRAFT_STORAGE_KEY);
      if (!raw) {
        set({ hydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      const loadedItems = Array.isArray(parsed.items)
        ? parsed.items
            .filter((item): item is SalesDraftItem => !!item && typeof item.maSanPham === "string")
            .map((item) => ({
              ...item,
              soLuong: clampQuantity(Number(item.soLuong ?? 1), Number(item.tonKho ?? 1)),
            }))
        : [];

      set({
        items: loadedItems,
        handoffPending: Boolean(parsed.handoffPending),
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  addProduct: (product) => {
    set((state) => {
      if (product.tonKho <= 0) return state;

      const existing = state.items.find((item) => item.maSanPham === product.maSanPham);
      let nextItems: SalesDraftItem[];

      if (existing) {
        nextItems = state.items.map((item) => {
          if (item.maSanPham !== product.maSanPham) return item;
          const nextQuantity = Math.min(item.soLuong + 1, Math.max(1, item.tonKho));
          return { ...item, soLuong: nextQuantity, tonKho: product.tonKho };
        });
      } else {
        nextItems = [...state.items, { ...product, soLuong: 1 }];
      }

      const nextState = { ...state, items: nextItems };
      persistDraft({ items: nextItems, handoffPending: state.handoffPending });
      return nextState;
    });
  },

  increaseQuantity: (maSanPham) => {
    set((state) => {
      const nextItems = state.items.map((item) => {
        if (item.maSanPham !== maSanPham) return item;
        return { ...item, soLuong: Math.min(item.soLuong + 1, Math.max(1, item.tonKho)) };
      });
      persistDraft({ items: nextItems, handoffPending: state.handoffPending });
      return { ...state, items: nextItems };
    });
  },

  decreaseQuantity: (maSanPham) => {
    set((state) => {
      const nextItems = state.items
        .map((item) => {
          if (item.maSanPham !== maSanPham) return item;
          return { ...item, soLuong: Math.max(1, item.soLuong - 1) };
        });
      persistDraft({ items: nextItems, handoffPending: state.handoffPending });
      return { ...state, items: nextItems };
    });
  },

  setQuantity: (maSanPham, soLuong) => {
    set((state) => {
      const nextItems = state.items.map((item) => {
        if (item.maSanPham !== maSanPham) return item;
        return { ...item, soLuong: clampQuantity(soLuong, item.tonKho) };
      });
      persistDraft({ items: nextItems, handoffPending: state.handoffPending });
      return { ...state, items: nextItems };
    });
  },

  removeItem: (maSanPham) => {
    set((state) => {
      const nextItems = state.items.filter((item) => item.maSanPham !== maSanPham);
      persistDraft({ items: nextItems, handoffPending: state.handoffPending });
      return { ...state, items: nextItems };
    });
  },

  clearDraft: () => {
    set((state) => {
      const nextState = { ...state, items: [], handoffPending: false };
      persistDraft({ items: [], handoffPending: false });
      return nextState;
    });
  },

  prepareHandoff: () => {
    set((state) => {
      persistDraft({ items: state.items, handoffPending: true });
      return { ...state, handoffPending: true };
    });
  },

  consumeHandoff: () => {
    const state = get();
    if (!state.handoffPending) return [];

    set((prev) => {
      persistDraft({ items: prev.items, handoffPending: false });
      return { ...prev, handoffPending: false };
    });

    return state.items;
  },

  getItemCount: () => get().items.reduce((sum, item) => sum + item.soLuong, 0),

  getEstimatedTotal: () => get().items.reduce((sum, item) => sum + (item.donGiaBan * item.soLuong), 0),
}));
