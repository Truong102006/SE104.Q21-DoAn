"use client";

import { toast as sonnerToast } from "sonner";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

/**
 * Compatibility hook around sonner toast system.
 * Keeps existing interface for components while using modern sonner under the hood.
 */
export const useToastStore = () => {
  return {
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
  };
};

// Also export as a static object for non-hook usage (getState pattern)
// @ts-ignore
useToastStore.getState = () => {
    const hook = useToastStore();
    return hook;
};
