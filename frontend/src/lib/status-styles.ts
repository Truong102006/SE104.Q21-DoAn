export const STATUS_TONE_CLASS = {
  success: "border-emerald-600/35 bg-emerald-600/10 text-emerald-700",
  warning: "border-amber-600/35 bg-amber-600/10 text-amber-700",
  danger: "border-rose-600/35 bg-rose-600/10 text-rose-700",
  info: "border-sky-600/35 bg-sky-600/10 text-sky-700",
  neutral: "border-border/80 bg-muted/30 text-muted-foreground",
  primary: "border-primary/35 bg-primary/10 text-primary",
} as const;

export const STATUS_DOT_CLASS = {
  success: "bg-emerald-600",
  warning: "bg-amber-500",
  danger: "bg-rose-600",
  info: "bg-sky-600",
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
} as const;

export type StatusTone = keyof typeof STATUS_TONE_CLASS;

