"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type PickerType = "date" | "month";

interface BasePickerProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
  min?: string;
  max?: string;
  placeholder?: string;
  "aria-label"?: string;
}

interface PopoverPosition {
  top: number;
  left: number;
  width: number;
}

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const WEEKDAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatMonthValue(year: number, monthZeroBased: number): string {
  return `${year}-${pad2(monthZeroBased + 1)}`;
}

function parseDateValue(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function parseMonthValue(value: string): { year: number; month: number } | null {
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  return month >= 1 && month <= 12 ? { year, month: month - 1 } : null;
}

function formatDisplayDate(value: string): string {
  const date = parseDateValue(value);
  if (!date) return "";
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatDisplayMonth(value: string): string {
  const parsed = parseMonthValue(value);
  if (!parsed) return "";
  return `${pad2(parsed.month + 1)}/${parsed.year}`;
}

function buildCalendarDays(viewYear: number, viewMonth: number): Date[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const dayOffset = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(viewYear, viewMonth, 1 - dayOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  return days;
}

function isDateInRange(date: Date, min?: string, max?: string): boolean {
  const value = formatDateValue(date);
  if (min && value < min) return false;
  if (max && value > max) return false;
  return true;
}

function usePopoverPosition(triggerRef: React.RefObject<HTMLElement | null>, isOpen: boolean) {
  const [position, setPosition] = React.useState<PopoverPosition>({ top: 0, left: 0, width: 0 });

  React.useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, triggerRef]);

  return position;
}

function PickerInput({
  type,
  id,
  value,
  onValueChange,
  disabled,
  className,
  compact = false,
  min,
  max,
  placeholder,
  "aria-label": ariaLabel,
}: BasePickerProps & { type: PickerType }) {
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const initialDate = parseDateValue(value) ?? new Date();
  const initialMonth = parseMonthValue(value) ?? {
    year: initialDate.getFullYear(),
    month: initialDate.getMonth(),
  };

  const [viewYear, setViewYear] = React.useState(initialMonth.year);
  const [viewMonth, setViewMonth] = React.useState(initialMonth.month);
  const [isSelectingYear, setIsSelectingYear] = React.useState(false);

  const position = usePopoverPosition(triggerRef, isOpen);
  const selectedDateValue = type === "date" ? parseDateValue(value) : null;
  const selectedMonthValue = type === "month" ? parseMonthValue(value) : null;

  React.useEffect(() => {
    if (isOpen) {
      const date = parseDateValue(value) ?? new Date();
      const month = parseMonthValue(value);
      setViewYear(type === "date" ? date.getFullYear() : (month?.year ?? date.getFullYear()));
      setViewMonth(type === "date" ? date.getMonth() : (month?.month ?? date.getMonth()));
      setIsSelectingYear(false);
    }
  }, [isOpen, type, value]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (popoverRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const calendarDays = React.useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const displayLabel = type === "date" ? formatDisplayDate(value) : formatDisplayMonth(value);
  const Icon = type === "date" ? CalendarIcon : CalendarDays;

  const yearRange = React.useMemo(() => {
    const years = [];
    const startYear = viewYear - 10;
    for (let i = 0; i < 24; i++) years.push(startYear + i);
    return years;
  }, [viewYear]);

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 text-sm shadow-xs transition-all",
          "hover:border-gold/45 focus-within:ring-2 focus-within:ring-gold/25",
          disabled && "cursor-not-allowed opacity-50",
          isOpen && "border-gold ring-2 ring-gold/20",
          className
        )}
      >
        <span className={cn("truncate font-medium", !displayLabel && "text-muted-foreground")}>
          {displayLabel || placeholder || (type === "date" ? "Chọn ngày..." : "Chọn tháng...")}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" />
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[100] w-[280px] overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              top: position.top,
              left: Math.max(8, Math.min(position.left, window.innerWidth - 288)),
            }}
          >
            <div className="flex items-center justify-between p-3 border-b border-border/50">
              <button
                type="button"
                onClick={() => isSelectingYear ? setViewYear(viewYear - 12) : setViewYear(viewYear - (type === 'month' ? 1 : 0) || shiftMonth(-1))}
                className="rounded-md p-1 hover:bg-muted text-muted-foreground transition-colors"
                title="Trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsSelectingYear(!isSelectingYear)}
                className="text-xs font-bold hover:text-primary transition-colors flex items-center gap-1"
              >
                {isSelectingYear ? `Năm ${yearRange[0]} - ${yearRange[yearRange.length-1]}` : `${MONTH_NAMES[viewMonth]}, ${viewYear}`}
              </button>

              <button
                type="button"
                onClick={() => isSelectingYear ? setViewYear(viewYear + 12) : setViewYear(viewYear + (type === 'month' ? 1 : 0) || shiftMonth(1))}
                className="rounded-md p-1 hover:bg-muted text-muted-foreground transition-colors"
                title="Sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="p-2">
              {isSelectingYear ? (
                <div className="grid grid-cols-3 gap-1">
                  {yearRange.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => { setViewYear(y); setIsSelectingYear(false); }}
                      className={cn(
                        "h-9 rounded-md text-xs font-medium transition-colors",
                        viewYear === y ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              ) : type === "date" ? (
                <>
                  <div className="grid grid-cols-7 mb-1">
                    {WEEKDAY_NAMES.map((d) => (
                      <span key={d} className="text-center text-[10px] font-bold text-muted-foreground/60 uppercase">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {calendarDays.map((date) => {
                      const isCurrentMonth = date.getMonth() === viewMonth;
                      const isSelected = selectedDateValue && formatDateValue(date) === formatDateValue(selectedDateValue);
                      const isToday = formatDateValue(date) === formatDateValue(new Date());
                      const isDisabled = min && formatDateValue(date) < min || max && formatDateValue(date) > max;

                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => { onValueChange(formatDateValue(date)); setIsOpen(false); }}
                          className={cn(
                            "relative h-8 w-8 rounded-full text-xs transition-all flex items-center justify-center",
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 scale-110"
                              : isCurrentMonth
                                ? "hover:bg-accent hover:text-accent-foreground text-foreground"
                                : "text-muted-foreground/30 hover:bg-transparent",
                            isToday && !isSelected && "after:content-[''] after:absolute after:bottom-1 after:h-1 after:w-1 after:bg-gold after:rounded-full",
                            isDisabled && "opacity-10 cursor-not-allowed"
                          )}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {MONTH_NAMES.map((m, idx) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { onValueChange(formatMonthValue(viewYear, idx)); setIsOpen(false); }}
                      className={cn(
                        "h-9 rounded-md text-xs font-medium transition-colors",
                        selectedMonthValue?.year === viewYear && selectedMonthValue.month === idx
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-muted"
                      )}
                    >
                      {m.replace("Tháng ", "Th")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-2 border-t border-border/50 bg-muted/20">
              <button
                type="button"
                onClick={() => { onValueChange(""); setIsOpen(false); }}
                className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
              >
                <X className="h-3 w-3" /> XÓA
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  if (type === 'date') onValueChange(formatDateValue(d));
                  else onValueChange(formatMonthValue(d.getFullYear(), d.getMonth()));
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold text-primary hover:underline px-2 py-1"
              >
                HÔM NAY
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth, 1);
    d.setMonth(d.getMonth() + delta);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
}

function DatePickerInput(props: BasePickerProps) {
  return <PickerInput type="date" {...props} />;
}

function MonthPickerInput(props: BasePickerProps) {
  return <PickerInput type="month" {...props} />;
}

export { DatePickerInput, MonthPickerInput };
