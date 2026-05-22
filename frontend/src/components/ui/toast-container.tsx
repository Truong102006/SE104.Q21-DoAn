"use client";

import { useToastStore, Toast } from "@/stores/toast-store";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const toastIcons = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
  error: <XCircle className="h-5 w-5 text-rose-500 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
  info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
};

const toastThemeStyles = {
  success: "border-emerald-500/20 bg-card/90 shadow-emerald-500/5 focus:border-emerald-500/40",
  error: "border-rose-500/20 bg-card/90 shadow-rose-500/5 focus:border-rose-500/40",
  warning: "border-amber-500/20 bg-card/90 shadow-amber-500/5 focus:border-amber-500/40",
  info: "border-blue-500/20 bg-card/90 shadow-blue-500/5 focus:border-blue-500/40",
};

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast: Toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border",
              "bg-background/95 backdrop-blur-md shadow-2xl transition-all",
              "ring-1 ring-black/5 dark:ring-white/5",
              toastThemeStyles[toast.type]
            )}
          >
            {/* Left side: Icon + Content */}
            <div className="flex gap-3 flex-1 min-w-0">
              {toastIcons[toast.type]}
              <div className="flex flex-col gap-1 flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-foreground leading-relaxed break-words">
                  {toast.message}
                </p>
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      dismiss(toast.id);
                    }}
                    className={cn(
                      "mt-2 w-fit px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs",
                      "bg-primary text-primary-foreground hover:bg-primary/95",
                      "hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    <RotateCcw className="h-3 w-3" />
                    {toast.action.label}
                  </button>
                )}
              </div>
            </div>

            {/* Right side: Dismiss X button */}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/60 transition-colors shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
