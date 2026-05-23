"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Smile,
  User,
  Users,
  Store,
  FileText,
  PlusCircle,
  Truck,
  History,
  FileBarChart
} from "lucide-react"
import { Command } from "cmdk"
import { useTranslation } from "@/i18n/i18n-context"
import { cn } from "@/lib/utils"

export function CommandMenu() {
  const [open, setIsOpen] = React.useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setIsOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg lg:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setIsOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-[15vh] backdrop-blur-sm"
      >
        <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-2xl animate-in zoom-in-95 duration-150">
          <div className="flex items-center border-b border-border/50 px-4 py-3">
            <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground opacity-50" />
            <Command.Input
              placeholder="Nhập tên trang hoặc hành động (Ctrl+K)..."
              className="flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">ESC</span>
            </kbd>
          </div>
          <Command.List className="max-h-[360px] overflow-y-auto overflow-x-hidden p-2 app-scrollbar">
            <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
              Không tìm thấy kết quả nào.
            </Command.Empty>

            <Command.Group heading="Điều hướng nhanh" className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              <CommandItem icon={LayoutDashboard} onSelect={() => runCommand(() => router.push("/dashboard"))}>
                Dashboard
              </CommandItem>
              <CommandItem icon={Package} onSelect={() => runCommand(() => router.push("/dashboard/products"))}>
                {t("nav.products")}
              </CommandItem>
              <CommandItem icon={Store} onSelect={() => runCommand(() => router.push("/dashboard/suppliers"))}>
                {t("nav.suppliers")}
              </CommandItem>
              <CommandItem icon={Users} onSelect={() => runCommand(() => router.push("/dashboard/customers"))}>
                {t("nav.customers")}
              </CommandItem>
            </Command.Group>

            <Command.Separator className="my-2 h-px bg-border/50" />

            <Command.Group heading="Nghiệp vụ" className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              <CommandItem icon={PlusCircle} onSelect={() => runCommand(() => router.push("/dashboard/orders"))}>
                {t("nav.salesOrders")}
              </CommandItem>
              <CommandItem icon={Truck} onSelect={() => runCommand(() => router.push("/dashboard/service-orders"))}>
                {t("nav.serviceOrders")}
              </CommandItem>
              <CommandItem icon={History} onSelect={() => runCommand(() => router.push("/dashboard/purchase-orders"))}>
                {t("nav.purchaseOrders")}
              </CommandItem>
            </Command.Group>

            <Command.Separator className="my-2 h-px bg-border/50" />

            <Command.Group heading="Báo cáo & Cài đặt" className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              <CommandItem icon={FileBarChart} onSelect={() => runCommand(() => router.push("/dashboard/reports"))}>
                {t("nav.reports")}
              </CommandItem>
              <CommandItem icon={Settings} onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                {t("nav.settings")}
              </CommandItem>
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  )
}

function CommandItem({ children, icon: Icon, onSelect }: { children: React.ReactNode, icon: any, onSelect: () => void }) {
    return (
        <Command.Item
            onSelect={onSelect}
            className="flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-all aria-selected:bg-primary/10 aria-selected:text-primary active:scale-[0.99]"
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30">
                <Icon className="h-4 w-4" />
            </div>
            {children}
        </Command.Item>
    )
}
