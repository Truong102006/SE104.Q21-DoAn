import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onKeyDown, ...props }, ref) => {
    const localRef = React.useRef<HTMLInputElement>(null);
    
    // Merge the forwarded ref and our local ref to support react-hook-form
    React.useImperativeHandle(ref, () => localRef.current!);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onKeyDown) {
        onKeyDown(e);
      }

      if (e.defaultPrevented) return;

      // Only handle if it's ArrowUp, ArrowDown, or Enter
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Enter") {
        return;
      }

      // Get the form containing this input
      const formElement = e.currentTarget.closest("form");
      if (!formElement) return;

      // Find all visible, non-disabled input/select elements in the form
      const selectors = 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [data-slot="select-trigger"]:not([disabled])';
      const inputs = (Array.from(formElement.querySelectorAll(selectors)) as HTMLElement[])
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

      const currentIndex = inputs.indexOf(e.currentTarget);
      if (currentIndex === -1) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextInput = inputs[currentIndex + 1];
        if (nextInput) {
          nextInput.focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevInput = inputs[currentIndex - 1];
        if (prevInput) {
          prevInput.focus();
        }
      } else if (e.key === "Enter") {
        // If it's the last input, let the form submit natively
        if (currentIndex < inputs.length - 1) {
          e.preventDefault();
          const nextInput = inputs[currentIndex + 1];
          if (nextInput) {
            nextInput.focus();
          }
        }
      }
    };

    React.useEffect(() => {
      if (!localRef.current) return;

      const formElement = localRef.current.closest("form");
      if (!formElement) return;

      // Only auto-focus and handle Escape if this form is inside a fixed/dialog modal
      const isInsideDialog = localRef.current.closest(".fixed, [role='dialog']");
      if (!isInsideDialog) return;

      // Register global Escape key listener to close this specific dialog
      const handleGlobalEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          // Find the dismiss button inside this specific dialog
          const buttons = Array.from(isInsideDialog.querySelectorAll('button')) as HTMLButtonElement[];
          const dismissButton = buttons.find(btn => {
            const text = btn.textContent?.toLowerCase() || "";
            const hasXIcon = btn.querySelector('svg'); // Lucide X or close icon
            return text.includes("hủy") || text.includes("cancel") || text.includes("đóng") || text.includes("close") || hasXIcon;
          });
          
          if (dismissButton) {
            dismissButton.click();
          }
        }
      };

      window.addEventListener("keydown", handleGlobalEscape);

      const selectors = 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [data-slot="select-trigger"]:not([disabled])';
      const inputs = (Array.from(formElement.querySelectorAll(selectors)) as HTMLElement[])
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

      if (inputs[0] === localRef.current) {
        const timer = setTimeout(() => {
          localRef.current?.focus();
        }, 80);
        
        return () => {
          clearTimeout(timer);
          window.removeEventListener("keydown", handleGlobalEscape);
        };
      }

      return () => {
        window.removeEventListener("keydown", handleGlobalEscape);
      };
    }, []);

    return (
      <input
        ref={localRef}
        type={type}
        data-slot="input"
        autoComplete="off"
        className={cn(
          "h-9 w-full min-w-0 rounded-lg border border-input/90 bg-background px-3 py-2 text-base shadow-[inset_0_1px_2px_rgb(16_24_40/0.03)] transition-[border-color,box-shadow,background-color] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/45 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
