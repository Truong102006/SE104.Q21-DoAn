"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: string;
  onValueChange: (value: string) => void;
  min?: number;
  step?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  inputClassName?: string;
  decrementLabel?: string;
  incrementLabel?: string;
}

function parseQuantity(value: string, fallback: number): number {
  const normalized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return parsed;
}

function formatQuantity(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(Number(value.toFixed(4)));
}

function QuantityStepper({
  value,
  onValueChange,
  min = 1,
  step = 1,
  inputMode = "numeric",
  className,
  inputClassName,
  decrementLabel = "Giảm số lượng",
  incrementLabel = "Tăng số lượng",
}: QuantityStepperProps) {
  function adjust(delta: number) {
    const current = parseQuantity(value, min);
    const next = Math.max(min, current + delta);
    onValueChange(formatQuantity(next));
  }

  return (
    <div className={cn("flex w-full items-center justify-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="h-8 w-7 shrink-0 cursor-pointer"
        onClick={() => adjust(-step)}
        aria-label={decrementLabel}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        inputMode={inputMode}
        className={cn("h-8 min-w-[3rem] px-1 text-center", inputClassName)}
      />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="h-8 w-7 shrink-0 cursor-pointer"
        onClick={() => adjust(step)}
        aria-label={incrementLabel}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export { QuantityStepper };
