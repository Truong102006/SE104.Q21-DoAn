"use client";

import { toast as sonnerToast } from "sonner";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  duration?: number;
  action?: ToastAction;
}

/**
 * Compatibility wrapper around sonner toast system.
 * Keeps existing store-like interface for legacy code while using modern sonner under the hood.
 */
export const useToastStore = {
  getState: () => ({
    success: (message: string, action?: ToastAction) => {
      sonnerToast.success(message, {
        action: action ? { label: action.label, onClick: action.onClick } : undefined,
        duration: 6000,
      });
    },
    error: (message: string) => {
      sonnerToast.error(message);
    },
    warning: (message: string) => {
      sonnerToast.warning(message);
    },
    info: (message: string) => {
      sonnerToast.info(message);
    },
    dismiss: (id?: string) => {
        if (id) sonnerToast.dismiss(id);
        else sonnerToast.dismiss();
    }
  }),
  // For hooks
  success: (message: string, action?: ToastAction) => {
    sonnerToast.success(message, {
      action: action ? { label: action.label, onClick: action.onClick } : undefined,
      duration: 6000,
    });
  },
  error: (message: string) => {
    sonnerToast.error(message);
  },
  warning: (message: string) => {
    sonnerToast.warning(message);
  },
  info: (message: string) => {
    sonnerToast.info(message);
  },
};
