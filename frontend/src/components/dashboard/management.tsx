"use client";

import * as React from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS_DOT_CLASS, STATUS_TONE_CLASS, type StatusTone } from "@/lib/status-styles";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badges?: React.ReactNode;
}

function PageHeader({ eyebrow, title, description, actions, badges }: PageHeaderProps) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-5 py-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 border-l-4 border-primary/70 pl-4">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {badges}
          </div>
          {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  description?: string;
  icon?: LucideIcon;
  tone?: StatusTone;
}

function MetricCard({ label, value, description, icon: Icon, tone = "neutral" }: MetricCardProps) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
            {description && <p className="mt-1 truncate text-xs text-muted-foreground">{description}</p>}
          </div>
          {Icon && (
            <span className={cn("rounded-xl border p-2", STATUS_TONE_CLASS[tone])}>
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusBadgeProps {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}

function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("h-5 gap-1 px-2 text-[10px]", STATUS_TONE_CLASS[tone], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[tone])} />
      {children}
    </Badge>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ title, description, icon: Icon = AlertTriangle, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center", className)}>
      <div className="rounded-2xl border border-border/70 bg-background p-3 text-muted-foreground shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface TableToolbarProps {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  search?: React.ReactNode;
  actions?: React.ReactNode;
}

function TableToolbar({ title, description, meta, search, actions }: TableToolbarProps) {
  return (
    <div className="grid gap-3 border-b bg-muted/20 px-3 py-3 xl:grid-cols-[auto_minmax(260px,1fr)_auto] xl:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {meta}
        </div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div>{search}</div>
      {actions && <div className="flex justify-start xl:justify-end">{actions}</div>}
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4 backdrop-blur-xs" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl border bg-background p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex gap-3">
          <span className={cn("mt-0.5 rounded-xl border p-2", destructive ? STATUS_TONE_CLASS.danger : STATUS_TONE_CLASS.warning)}>
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
            {cancelLabel}
          </Button>
          <Button type="button" variant={destructive ? "destructive" : "default"} onClick={onConfirm} className="cursor-pointer">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ConfirmDialog, EmptyState, MetricCard, PageHeader, StatusBadge, TableToolbar };
