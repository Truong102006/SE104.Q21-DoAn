"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Calendar, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
  "aria-label"?: string;
}

interface PopoverPosition {
  top: number;
  left: number;
  width: number;
}

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function parseMonthValue(value: string): { year: number; month: number } | null {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }
  const [year, month] = value.split("-").map(Number);
  if (month < 1 || month > 12) {
    return null;
  }
  return { year, month: month - 1 };
}

function parseManualDateInput(raw: string): Date | null {
  const text = raw.trim();
  if (!text) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return parseDateValue(text);
  }

  const slashMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!slashMatch) return null;
  const day = Number(slashMatch[1]);
  const month = Number(slashMatch[2]);
  const year = Number(slashMatch[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function parseManualMonthInput(raw: string): { year: number; month: number } | null {
  const text = raw.trim();
  if (!text) return null;

  if (/^\d{4}-\d{2}$/.test(text)) {
    return parseMonthValue(text);
  }

  const slashMatch = text.match(/^(\d{1,2})[/-](\d{4})$/);
  if (!slashMatch) return null;
  const month = Number(slashMatch[1]);
  const year = Number(slashMatch[2]);
  if (month < 1 || month > 12) return null;
  return { year, month: month - 1 };
}

function formatDisplayDate(value: string): string {
  const date = parseDateValue(value);
  if (!date) return "Chọn ngày";
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatDisplayMonth(value: string): string {
  const parsed = parseMonthValue(value);
  if (!parsed) return "Chọn tháng";
  return `${pad2(parsed.month + 1)}/${parsed.year}`;
}

function buildCalendarDays(viewYear: number, viewMonth: number): Date[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const dayOffset = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(viewYear, viewMonth, 1 - dayOffset);

  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
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

function isMonthInRange(year: number, month: number, min?: string, max?: string): boolean {
  const value = formatMonthValue(year, month);
  if (min && value < min) return false;
  if (max && value > max) return false;
  return true;
}

function usePopoverPosition(triggerRef: React.RefObject<HTMLElement | null>, isOpen: boolean) {
  const [position, setPosition] = React.useState<PopoverPosition>({ top: 0, left: 0, width: 0 });

  React.useEffect(() => {
    if (!isOpen) return;
    function update() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    }
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
  "aria-label": ariaLabel,
}: BasePickerProps & { type: PickerType }) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);

  const initialDate = parseDateValue(value) ?? new Date();
  const initialMonth = parseMonthValue(value) ?? {
    year: initialDate.getFullYear(),
    month: initialDate.getMonth(),
  };

  const [viewYear, setViewYear] = React.useState(initialMonth.year);
  const [viewMonth, setViewMonth] = React.useState(initialMonth.month);
  const position = usePopoverPosition(triggerRef, isOpen);

  const selectedDate = type === "date" ? parseDateValue(value) : null;
  const selectedMonth = type === "month" ? parseMonthValue(value) : null;

  React.useEffect(() => {
    if (!isOpen) return;
    const date = parseDateValue(value) ?? new Date();
    const month = parseMonthValue(value);
    if (type === "date") {
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
    } else {
      setViewYear(month?.year ?? date.getFullYear());
      setViewMonth(month?.month ?? date.getMonth());
    }
  }, [isOpen, type, value]);

  React.useEffect(() => {
    if (!isOpen) return;
    function handleOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const calendarDays = React.useMemo(() => buildCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const triggerLabel = type === "date" ? formatDisplayDate(value) : formatDisplayMonth(value);
  const Icon = type === "date" ? Calendar : CalendarDays;
  const [manualValue, setManualValue] = React.useState(triggerLabel);

  const today = new Date();
  const currentYear = today.getFullYear();

  React.useEffect(() => {
    if (!isTyping) {
      setManualValue(type === "date" ? formatDisplayDate(value) : formatDisplayMonth(value));
    }
  }, [isTyping, type, value]);

  const yearOptions = React.useMemo(() => {
    const fallbackStart = currentYear - 50;
    const fallbackEnd = currentYear + 20;
    const minYear =
      type === "date"
        ? (min ? parseDateValue(min)?.getFullYear() : undefined)
        : (min ? parseMonthValue(min)?.year : undefined);
    const maxYear =
      type === "date"
        ? (max ? parseDateValue(max)?.getFullYear() : undefined)
        : (max ? parseMonthValue(max)?.year : undefined);

    const start = Math.min(minYear ?? fallbackStart, maxYear ?? fallbackEnd);
    const end = Math.max(minYear ?? fallbackStart, maxYear ?? fallbackEnd);

    const years: number[] = [];
    for (let year = start; year <= end; year += 1) years.push(year);
    return years;
  }, [currentYear, max, min, type]);

  function selectDate(date: Date) {
    if (!isDateInRange(date, min, max)) return;
    onValueChange(formatDateValue(date));
    setIsOpen(false);
  }

  function selectMonth(year: number, month: number) {
    if (!isMonthInRange(year, month, min, max)) return;
    onValueChange(formatMonthValue(year, month));
    setIsOpen(false);
  }

  function shiftMonth(delta: number) {
    const current = new Date(viewYear, viewMonth, 1);
    current.setMonth(current.getMonth() + delta);
    setViewYear(current.getFullYear());
    setViewMonth(current.getMonth());
  }

  function shiftYear(delta: number) {
    setViewYear((prev) => prev + delta);
  }

  function commitManualInput() {
    const text = manualValue.trim();
    if (!text || text === "Chọn ngày" || text === "Chọn tháng") {
      onValueChange("");
      setManualValue(type === "date" ? "Chọn ngày" : "Chọn tháng");
      return;
    }

    if (type === "date") {
      const parsed = parseManualDateInput(text);
      if (parsed && isDateInRange(parsed, min, max)) {
        onValueChange(formatDateValue(parsed));
        setManualValue(formatDisplayDate(formatDateValue(parsed)));
      } else {
        setManualValue(formatDisplayDate(value));
      }
      return;
    }

    const parsed = parseManualMonthInput(text);
    if (parsed && isMonthInRange(parsed.year, parsed.month, min, max)) {
      const next = formatMonthValue(parsed.year, parsed.month);
      onValueChange(next);
      setManualValue(formatDisplayMonth(next));
    } else {
      setManualValue(formatDisplayMonth(value));
    }
  }

  return (
    <>
      <div
        className={cn(
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-input/90 bg-background text-left text-sm shadow-[inset_0_1px_2px_rgb(16_24_40/0.03)] transition-[border-color,box-shadow,background-color]",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
          compact ? "pl-1.5 pr-1" : "pl-2.5 pr-1.5",
          disabled && "pointer-events-none cursor-not-allowed bg-input/45 opacity-50",
          className,
        )}
      >
        {!compact && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <input
          id={id}
          type="text"
          value={manualValue}
          disabled={disabled}
          aria-label={ariaLabel}
          placeholder={type === "date" ? "dd/mm/yyyy" : "mm/yyyy"}
          onFocus={() => setIsTyping(true)}
          onBlur={() => {
            setIsTyping(false);
            commitManualInput();
          }}
          onChange={(event) => setManualValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              (event.currentTarget as HTMLInputElement).blur();
            }
          }}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/75",
            compact && "text-[12px]",
          )}
        />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            compact ? "h-6 w-6" : "h-7 w-7",
          )}
        >
          <Calendar className={cn("shrink-0 text-muted-foreground", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[90] w-[300px] rounded-xl border border-border bg-card p-2 shadow-2xl"
            style={{
              top: position.top,
              left: Math.max(8, Math.min(position.left, window.innerWidth - 308)),
              minWidth: Math.max(position.width, 220),
            }}
          >
            <div className="mb-2 flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => (type === "date" ? shiftMonth(-1) : shiftYear(-1))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/80 text-muted-foreground hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {type === "date" ? (
                <div className="flex flex-1 items-center gap-1">
                  <select
                    value={viewMonth}
                    onChange={(event) => setViewMonth(Number(event.target.value))}
                    className="h-7 min-w-0 flex-1 rounded-md border border-border/80 bg-card px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                  >
                    {MONTH_NAMES.map((monthName, monthIndex) => (
                      <option key={monthName} value={monthIndex}>
                        {monthName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={viewYear}
                    onChange={(event) => setViewYear(Number(event.target.value))}
                    className="h-7 w-24 rounded-md border border-border/80 bg-card px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <select
                  value={viewYear}
                  onChange={(event) => setViewYear(Number(event.target.value))}
                  className="h-7 min-w-[116px] rounded-md border border-border/80 bg-card px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      Năm {year}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => (type === "date" ? shiftMonth(1) : shiftYear(1))}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/80 text-muted-foreground hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {type === "date" ? (
              <>
                <div className="mb-1 grid grid-cols-7 gap-1 px-1">
                  {WEEKDAY_NAMES.map((weekday) => (
                    <span key={weekday} className="py-1 text-center text-[11px] font-semibold text-muted-foreground">
                      {weekday}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date) => {
                    const isCurrentMonth = date.getMonth() === viewMonth;
                    const isSelected =
                      selectedDate && formatDateValue(date) === formatDateValue(selectedDate);
                    const isDisabled = !isDateInRange(date, min, max);

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectDate(date)}
                        className={cn(
                          "h-8 rounded-md text-xs transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : isCurrentMonth
                              ? "hover:bg-muted"
                              : "text-muted-foreground hover:bg-muted",
                          isDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                        )}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center gap-1 border-t border-border/70 pt-2">
                  <ButtonChip
                    label="Hôm nay"
                    onClick={() => selectDate(new Date())}
                    disabled={!isDateInRange(new Date(), min, max)}
                  />
                  <ButtonChip
                    label="+7 ngày"
                    onClick={() => {
                      const next = new Date();
                      next.setDate(next.getDate() + 7);
                      selectDate(next);
                    }}
                  />
                  <ButtonChip
                    label="Xóa"
                    onClick={() => {
                      onValueChange("");
                      setIsOpen(false);
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-1">
                  {MONTH_NAMES.map((monthLabel, monthIndex) => {
                    const isSelected =
                      selectedMonth &&
                      selectedMonth.year === viewYear &&
                      selectedMonth.month === monthIndex;
                    const isDisabled = !isMonthInRange(viewYear, monthIndex, min, max);

                    return (
                      <button
                        key={monthLabel}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectMonth(viewYear, monthIndex)}
                        className={cn(
                          "h-8 rounded-md px-2 text-xs transition-colors",
                          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                          isDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                        )}
                      >
                        {monthLabel.replace("Tháng ", "T")}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center gap-1 border-t border-border/70 pt-2">
                  <ButtonChip
                    label="Tháng này"
                    onClick={() => selectMonth(today.getFullYear(), today.getMonth())}
                  />
                  <ButtonChip
                    label="Tháng trước"
                    onClick={() => {
                      const previous = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      selectMonth(previous.getFullYear(), previous.getMonth());
                    }}
                  />
                  <ButtonChip
                    label="Năm nay"
                    onClick={() => setViewYear(today.getFullYear())}
                  />
                  <ButtonChip
                    label="Xóa"
                    onClick={() => {
                      onValueChange("");
                      setIsOpen(false);
                    }}
                  />
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

function ButtonChip({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center rounded-md border border-border/80 px-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      {label}
    </button>
  );
}

function DatePickerInput(props: BasePickerProps) {
  return <PickerInput type="date" {...props} />;
}

function MonthPickerInput(props: BasePickerProps) {
  return <PickerInput type="month" {...props} />;
}

export { DatePickerInput, MonthPickerInput };
