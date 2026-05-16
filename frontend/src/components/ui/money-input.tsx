"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatMoneyInput(value: string): string {
  const digits = onlyDigits(value);
  if (!digits) {
    return "";
  }
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseMoneyInput(value: string): number {
  const digits = onlyDigits(value);
  if (!digits) {
    return 0;
  }
  return Number.parseInt(digits, 10);
}

function MoneyInput({
  value,
  onValueChange,
  id,
  placeholder,
  className,
  inputClassName,
  disabled,
  readOnly,
  autoFocus,
}: MoneyInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Input
        id={id}
        value={formatMoneyInput(value)}
        onChange={(event) => onValueChange(onlyDigits(event.target.value))}
        placeholder={placeholder}
        inputMode="numeric"
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        className={cn("w-full pr-8 text-right font-medium tabular-nums", inputClassName)}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        đ
      </span>
    </div>
  );
}

export { MoneyInput, formatMoneyInput, parseMoneyInput };
