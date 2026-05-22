"use client";

import * as React from "react";
import { ChevronDown, Check, Plus, Loader2, X, UserPlus, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { backendApi } from "@/services/backend-api";
import type { CustomerResponse, CustomerRequest } from "@/types/backend";
import { useToastStore } from "@/stores/toast-store";
import { isValidPhone10Digits } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface CustomerSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomerSelect({
  id,
  value,
  onValueChange,
  placeholder = "Nhập Số điện thoại khách hàng...",
  className,
  disabled = false,
}: CustomerSelectProps) {
  const { t } = useTranslation();
  const toast = useToastStore();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const [customers, setCustomers] = React.useState<CustomerResponse[]>([]);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const [selectedCustomerDetail, setSelectedCustomerDetail] = React.useState<CustomerResponse | null>(null);

  // Quick Create Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalForm, setModalForm] = React.useState<CustomerRequest>({
    tenKhachHang: "",
    soDienThoaiKhachHang: "",
    diaChiKhachHang: "",
    ghiChu: "",
  });
  const [modalError, setModalError] = React.useState<string | null>(null);
  const [submittingModal, setSubmittingModal] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch helper
  const fetchCustomers = async (query: string, pageNum: number, append: boolean) => {
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const size = 30;
      const res = await backendApi.customers.list(query.trim() || undefined, pageNum, size);
      if (append) {
        setCustomers((prev) => {
          const existingIds = new Set(prev.map((c) => c.maKhachHang));
          const filteredNew = res.filter((c) => !existingIds.has(c.maKhachHang));
          return [...prev, ...filteredNew];
        });
      } else {
        setCustomers(res);
      }
      setHasMore(res.length === size);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    fetchCustomers("", 0, false);
  }, []);

  // Sync selectedCustomerDetail
  React.useEffect(() => {
    if (value) {
      if (selectedCustomerDetail?.maKhachHang === value) {
        return;
      }
      const found = customers.find((c) => c.maKhachHang === value);
      if (found) {
        setSelectedCustomerDetail(found);
      } else {
        backendApi.customers.getById(value)
          .then((res) => {
            setSelectedCustomerDetail(res);
            setCustomers((prev) => {
              if (prev.some((c) => c.maKhachHang === res.maKhachHang)) return prev;
              return [res, ...prev];
            });
          })
          .catch((err) => console.error("Error fetching customer detail", err));
      }
    } else {
      if (selectedCustomerDetail !== null) {
        setSelectedCustomerDetail(null);
      }
    }
  }, [value, customers, selectedCustomerDetail]);

  // Set input query to selected label when not focused
  React.useEffect(() => {
    if (!isFocused) {
      setSearchQuery(
        selectedCustomerDetail
          ? selectedCustomerDetail.soDienThoaiKhachHang
          : ""
      );
    }
  }, [selectedCustomerDetail, isFocused]);

  // Debounced search on query changes
  React.useEffect(() => {
    if (!isFocused) return;

    const currentLabel = selectedCustomerDetail
      ? selectedCustomerDetail.soDienThoaiKhachHang
      : "";

    if (selectedCustomerDetail && searchQuery === currentLabel) return;

    const timer = setTimeout(() => {
      fetchCustomers(searchQuery, 0, false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, isFocused, selectedCustomerDetail]);

  // Scroll handler for lazy loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop - target.clientHeight < 15 &&
      hasMore &&
      !loadingMore &&
      !loading
    ) {
      fetchCustomers(searchQuery, page + 1, true);
    }
  };

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
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
          prev < customers.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : customers.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (customers[highlightedIndex]) {
          const opt = customers[highlightedIndex];
          onValueChange(opt.maKhachHang);
          setSearchQuery(opt.soDienThoaiKhachHang);
          setIsOpen(false);
          setIsFocused(false);
          inputRef.current?.blur();
        } else if (searchQuery.trim().length > 0) {
          handleOpenCreate();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
        break;
      case "Tab":
        setIsOpen(false);
        setIsFocused(false);
        break;
    }
  };

  const handleOpenCreate = () => {
    const query = searchQuery.trim();
    let soDienThoaiKhachHang = "";

    if (query) {
      // Clean phone number: keep only digits
      soDienThoaiKhachHang = query.replace(/\D/g, "");
    }

    setModalForm({
      tenKhachHang: "",
      soDienThoaiKhachHang,
      diaChiKhachHang: "",
      ghiChu: "",
    });
    setModalError(null);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const name = modalForm.tenKhachHang.trim();
    const phone = modalForm.soDienThoaiKhachHang.trim();

    if (!name) {
      setModalError("Tên khách hàng không được để trống");
      return;
    }

    if (!isValidPhone10Digits(phone)) {
      setModalError("Số điện thoại phải gồm đúng 10 chữ số");
      return;
    }

    setSubmittingModal(true);
    try {
      const created = await backendApi.customers.create({
        ...modalForm,
        tenKhachHang: name,
        soDienThoaiKhachHang: phone,
        diaChiKhachHang: modalForm.diaChiKhachHang?.trim() || undefined,
        ghiChu: modalForm.ghiChu?.trim() || undefined,
      });

      toast.success(`Đã thêm mới khách hàng: ${created.tenKhachHang}`);

      // Update local state and select newly created customer
      setCustomers((prev) => [created, ...prev]);
      onValueChange(created.maKhachHang);

      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("đã tồn tại")) {
        setModalError(err.message);
      } else {
        setModalError("Lỗi hệ thống khi thêm khách hàng. Vui lòng thử lại.");
      }
    } finally {
      setSubmittingModal(false);
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
                value={isOpen || isFocused ? searchQuery : (selectedCustomerDetail ? selectedCustomerDetail.soDienThoaiKhachHang : "")}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onFocus={(e) => {
                  setIsFocused(true);
                  setIsOpen(true);
                  setSearchQuery(selectedCustomerDetail ? selectedCustomerDetail.soDienThoaiKhachHang : "");
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
            {selectedCustomerDetail && !isOpen && !isFocused && (
              <TooltipContent side="top" className="text-xs">
                {selectedCustomerDetail.tenKhachHang} ({selectedCustomerDetail.soDienThoaiKhachHang})
              </TooltipContent>
            )}
          </Tooltip>

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              if (isOpen) {
                setIsOpen(false);
                setIsFocused(false);
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
            ref={dropdownRef}
            onScroll={handleScroll}
            className={cn(
              "absolute z-50 min-w-full w-max max-w-[400px] mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-xl p-1",
              "animate-in fade-in-0 slide-in-from-top-1 duration-200"
            )}
          >
            {loading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                Đang tìm kiếm...
              </div>
            ) : (
              <>
                {customers.length === 0 ? (
                  <div className="py-1 px-1">
                    <div className="py-2.5 px-3 text-sm text-muted-foreground text-center font-medium italic">
                      Không tìm thấy kết quả
                    </div>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleOpenCreate();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-gold hover:bg-gold/10 hover:text-gold-dark cursor-pointer text-left border-none bg-transparent transition-colors mt-1"
                    >
                      <UserPlus className="h-4 w-4 shrink-0" />
                      Thêm mới khách hàng &quot;{searchQuery}&quot;
                    </button>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {customers.map((customer, idx) => {
                      const isSelected = customer.maKhachHang === value;
                      const isHighlighted = idx === highlightedIndex;

                      return (
                        <Tooltip key={customer.maKhachHang} delayDuration={300}>
                          <TooltipTrigger asChild>
                            <div
                              onMouseDown={(e) => {
                                e.preventDefault();
                                onValueChange(customer.maKhachHang);
                                setSearchQuery(customer.soDienThoaiKhachHang);
                                setIsOpen(false);
                                setIsFocused(false);
                                inputRef.current?.blur();
                              }}
                              onMouseEnter={() => setHighlightedIndex(idx)}
                              className={cn(
                                "relative flex flex-col justify-center cursor-pointer select-none rounded-lg px-3 py-1.5 outline-none transition-colors whitespace-nowrap pr-12",
                                isHighlighted && "bg-accent text-accent-foreground",
                                isSelected ? "bg-primary/10 text-primary" : "text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">
                                  {customer.soDienThoaiKhachHang}
                                </span>
                                <span className="text-xs text-muted-foreground/80">
                                  - {customer.tenKhachHang}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center text-primary">
                                  <Check className="h-4 w-4 animate-scale-in" />
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            <p><strong>{customer.tenKhachHang}</strong></p>
                            <p className="text-[10px] opacity-80">Mã: {customer.maKhachHang}</p>
                            <p className="text-[10px] opacity-80">ĐC: {customer.diaChiKhachHang || "N/A"}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    {loadingMore && (
                      <div className="py-2.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Loader2 className="h-3 w-3 animate-spin text-gold" />
                        Đang tải thêm...
                      </div>
                    )}
                    <div className="border-t border-border/40 mt-1 pt-1">
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleOpenCreate();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-gold hover:bg-gold/10 hover:text-gold-dark cursor-pointer text-left border-none bg-transparent transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5 shrink-0" />
                        Thêm mới khách hàng
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* QUICK CREATE POPUP MODAL */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-xl border border-border/80 bg-background shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-gold" />
                  <h3 className="text-base font-bold text-foreground">Thêm nhanh khách hàng mới</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted/65 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="quick-name" className="text-sm font-semibold text-muted-foreground">Tên khách hàng *</Label>
                    <Input
                      id="quick-name"
                      value={modalForm.tenKhachHang}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, tenKhachHang: e.target.value }))}
                      placeholder="Nhập tên khách hàng"
                      className="h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="quick-phone" className="text-sm font-semibold text-muted-foreground">Số điện thoại *</Label>
                    <Input
                      id="quick-phone"
                      value={modalForm.soDienThoaiKhachHang}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, soDienThoaiKhachHang: e.target.value }))}
                      placeholder="Nhập số điện thoại (10 chữ số)"
                      className="h-9 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="quick-address" className="text-sm font-semibold text-muted-foreground">Địa chỉ</Label>
                    <Input
                      id="quick-address"
                      value={modalForm.diaChiKhachHang || ""}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, diaChiKhachHang: e.target.value }))}
                      placeholder="Nhập địa chỉ (Không bắt buộc)"
                      className="h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="quick-note" className="text-sm font-semibold text-muted-foreground">Ghi chú</Label>
                    <Input
                      id="quick-note"
                      value={modalForm.ghiChu || ""}
                      onChange={(e) => setModalForm((prev) => ({ ...prev, ghiChu: e.target.value }))}
                      placeholder="Ghi chú thêm"
                      className="h-9"
                    />
                  </div>
                </div>

                {modalError && (
                  <div className="text-xs font-medium text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">
                    {modalError}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 border-t border-border/60 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="h-9 text-xs px-4"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingModal}
                    className="bg-gold-gradient text-gold-foreground font-bold hover:brightness-105 active:scale-95 h-9 text-xs px-4 rounded-lg flex items-center gap-1 border-none shadow-sm shadow-gold/25"
                  >
                    {submittingModal && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Lưu & Chọn
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
