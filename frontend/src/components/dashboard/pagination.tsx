"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis-start");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis-end");
    }

    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-9 gap-1 px-4 rounded-xl border-border/60 bg-card hover:bg-accent/50 cursor-pointer transition-all active:scale-95 disabled:opacity-40 shadow-xs"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="font-bold text-xs uppercase tracking-wide">Trước</span>
      </Button>

      <div className="flex items-center gap-1.5">
        {pages.map((page, idx) => {
          if (typeof page === "string") {
            return (
              <span key={`ellipsis-${idx}`} className="flex h-9 w-6 items-center justify-center text-muted-foreground select-none font-bold">
                ...
              </span>
            );
          }

          const isActive = currentPage === page;

          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              className={cn(
                "h-9 w-9 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer active:scale-90 shadow-xs",
                isActive
                  ? "bg-gold-gradient text-gold-foreground border-none shadow-md shadow-gold/25 scale-105 z-10"
                  : "border-border/60 bg-card hover:border-gold/50 hover:bg-gold/5 text-muted-foreground hover:text-gold"
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-9 gap-1 px-4 rounded-xl border-border/60 bg-card hover:bg-accent/50 cursor-pointer transition-all active:scale-95 disabled:opacity-40 shadow-xs"
      >
        <span className="font-bold text-xs uppercase tracking-wide">Sau</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
