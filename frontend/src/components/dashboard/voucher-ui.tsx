"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface VoucherSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

function VoucherSection({ title, description, icon: Icon, children, className }: VoucherSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/40 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

interface ContactPanelProps {
  rows: Array<{ label: string; value?: React.ReactNode }>;
  emptyText: string;
}

function ContactPanel({ rows, emptyText }: ContactPanelProps) {
  if (rows.length === 0) {
    return (
      <div className="flex h-[60px] items-end pb-0.5">
        <div className="flex h-9 w-full items-center rounded-lg border border-dashed border-border bg-muted/20 px-3 text-sm italic text-muted-foreground">
          {emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {rows.map((row) => (
        <div key={row.label} className="space-y-2 flex-1 min-w-0">
          <Label className="text-sm font-semibold text-muted-foreground">{row.label}</Label>
          <Input type="text" className="h-9 text-sm font-medium" value={String(row.value || "")} disabled />
        </div>
      ))}
    </div>
  );
}

interface LineErrorProps {
  children?: React.ReactNode;
}

function LineError({ children }: LineErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-md border border-destructive/20 bg-destructive/5 px-2 py-1.5 text-xs text-destructive">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

interface StickySummaryBarProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

function StickySummaryBar({ children, action, className }: StickySummaryBarProps) {
  return (
    <div className={cn("sticky bottom-3 z-20 rounded-xl border border-border/80 bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/85", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">{children}</div>
        {action && <div className="flex shrink-0 justify-end">{action}</div>}
      </div>
    </div>
  );
}

interface DetailModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onPrint?: () => void;
  children: React.ReactNode;
}

function DetailModal({ open, title, subtitle, onClose, onPrint, children }: DetailModalProps) {
  React.useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {onPrint && (
              <Button type="button" variant="outline" size="sm" onClick={onPrint}>
                In phiếu
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label="Đóng">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}

interface DetailGridProps {
  items: Array<{ label: string; value: React.ReactNode }>;
}

function DetailGrid({ items }: DetailGridProps) {
  return (
    <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <div className="mt-1 break-words text-sm font-medium text-foreground">{item.value || "-"}</div>
        </div>
      ))}
    </div>
  );
}

export { ContactPanel, DetailGrid, DetailModal, LineError, StickySummaryBar, VoucherSection };
