"use client";

import { create } from "zustand";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  toast: (
    message: string,
    options?: {
      type?: Toast["type"];
      duration?: number;
      action?: ToastAction;
    }
  ) => string;
  success: (message: string, action?: ToastAction) => string;
  error: (message: string) => string;
  warning: (message: string) => string;
  info: (message: string) => string;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  toast: (message, options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    const type = options.type ?? "info";
    const duration = options.duration ?? 5000;
    const action = options.action;

    const newToast: Toast = { id, message, type, duration, action };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  success: (message, action) => {
    return get().toast(message, { type: "success", action, duration: 6000 });
  },

  error: (message) => {
    return get().toast(message, { type: "error" });
  },

  warning: (message) => {
    return get().toast(message, { type: "warning" });
  },

  info: (message) => {
    return get().toast(message, { type: "info" });
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
