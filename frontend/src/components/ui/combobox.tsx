"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  id?: string;
  value: string;
  options: ComboboxOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function removeAccents(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function Combobox({
  id,
  value,
  options,
  onValueChange,
  placeholder = "Chọn...",
  className,
  disabled = false,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [value, options]);

  // Sync searchQuery when value or options change (only when not focused/typing)
  React.useEffect(() => {
    if (!isFocused) {
      setSearchQuery(selectedOption ? selectedOption.label : "");
    }
  }, [selectedOption, isFocused]);

  // Filter options based on query (fuzzy search supporting accents)
  const filteredOptions = React.useMemo(() => {
    const queryClean = removeAccents(searchQuery.trim().toLowerCase());
    const selectedLabelClean = selectedOption
      ? removeAccents(selectedOption.label.trim().toLowerCase())
      : "";

    // If query is empty or matches the selected option's label exactly, show full list
    if (!queryClean || queryClean === selectedLabelClean) return options;

    return options.filter((opt) => {
      const labelClean = removeAccents(opt.label.toLowerCase());
      const valClean = removeAccents(opt.value.toLowerCase());
      return labelClean.includes(queryClean) || valClean.includes(queryClean);
    });
  }, [searchQuery, options, selectedOption]);

  // Reset highlight index when filtered list changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
        setSearchQuery(selectedOption ? selectedOption.label : "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedOption]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          const option = filteredOptions[highlightedIndex];
          onValueChange(option.value);
          setSearchQuery(option.label);
          setIsOpen(false);
          inputRef.current?.blur();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery(selectedOption ? selectedOption.label : "");
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <TooltipProvider>
      <div ref={containerRef} className="relative w-full">
        <div className="relative flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <input
                id={id}
                ref={inputRef}
                type="text"
                disabled={disabled}
                spellCheck={false}
                value={isOpen || isFocused ? searchQuery : (selectedOption ? selectedOption.label : "")}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onFocus={(e) => {
                  setIsFocused(true);
                  setIsOpen(true);
                  setSearchQuery(selectedOption ? selectedOption.label : "");
                  // Select all content inside input so user can instantly overwrite
                  setTimeout(() => {
                    e.target.select();
                  }, 50);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={cn(
                  "flex h-9 w-full rounded-lg border border-input bg-card pl-3 pr-9 text-sm text-foreground shadow-xs outline-none",
                  "hover:border-gold/45 focus:border-gold focus:ring-2 focus:ring-gold/25 focus:shadow-[0_0_12px_rgba(212,163,89,0.18)]",
                  "disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium truncate",
                  className
                )}
              />
            </TooltipTrigger>
            {selectedOption && !isOpen && !isFocused && (
              <TooltipContent side="top" className="text-xs">
                {selectedOption.label}
              </TooltipContent>
            )}
          </Tooltip>

          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              if (disabled) return;
              if (isOpen) {
                setIsOpen(false);
                inputRef.current?.blur();
              } else {
                inputRef.current?.focus();
              }
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer p-0.5"
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
            />
          </button>
        </div>

        {isOpen && (
          <div
            className={cn(
              "absolute z-50 min-w-full w-max max-w-[400px] mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-xl p-1",
              "animate-in fade-in-0 slide-in-from-top-1 duration-200"
            )}
          >
            {filteredOptions.length === 0 ? (
              <div className="py-2.5 px-3 text-sm text-muted-foreground text-center font-medium italic">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = option.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <Tooltip key={option.value} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div
                        onMouseDown={(e) => {
                          // Prevent input from losing focus immediately, letting selection happen smoothly
                          e.preventDefault();
                          onValueChange(option.value);
                          setSearchQuery(option.label);
                          setIsOpen(false);
                          setIsFocused(false);
                          inputRef.current?.blur();
                        }}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={cn(
                          "relative flex h-9 cursor-pointer select-none items-center rounded-lg px-3 pr-10 text-sm outline-none transition-colors font-medium gap-2 whitespace-nowrap",
                          isHighlighted && "bg-accent text-accent-foreground",
                          isSelected ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <span className="absolute right-3 inline-flex items-center text-primary">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      {option.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
