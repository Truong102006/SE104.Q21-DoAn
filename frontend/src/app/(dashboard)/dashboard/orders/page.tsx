"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactPanel, DetailGrid, DetailModal, LineError, StickySummaryBar, VoucherSection } from "@/components/dashboard/voucher-ui";
import { Combobox } from "@/components/ui/combobox";
import { CustomerSelect } from "@/components/dashboard/customer-select";
import { Pagination } from "@/components/dashboard/pagination";
import { useToastStore } from "@/stores/toast-store";
import { useSalesDraftStore } from "@/stores/sales-draft-store";
import { backendApi } from "@/services/backend-api";
import type {
  CustomerResponse,
  ProductResponse,
  SaleRequest,
  SaleResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber, todayIsoDate, toPositiveInt } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";
import { ClipboardList, Eye, Plus, ReceiptText, Trash2, Search } from "lucide-react";


type SaleItemDraft = {
  keyId: string;
  maSanPham: string;
  soLuong: string;
};

const createEmptyItem = (): SaleItemDraft => ({
  keyId: Math.random().toString(36).substring(2, 9),
  maSanPham: "",
  soLuong: "1",
});

export default function SalesPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const [salesList, setSalesList] = useState<SaleResponse[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const [soPhieuBan, setSoPhieuBan] = useState("");
  const [ngayLapPhieuBan, setNgayLapPhieuBan] = useState(todayIsoDate());
  const [maKhachHang, setMaKhachHang] = useState("");
  const [items, setItems] = useState<SaleItemDraft[]>([createEmptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleResponse | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { hydrate: hydrateSalesDraft, hydrated: salesDraftHydrated, consumeHandoff, clearDraft } = useSalesDraftStore();

  useEffect(() => {
    hydrateSalesDraft();
  }, [hydrateSalesDraft]);

  useEffect(() => {
    if (maKhachHang) {
      backendApi.customers.getById(maKhachHang)
        .then(setSelectedCustomer)
        .catch((err) => {
          console.error("Error loading selected customer", err);
          setSelectedCustomer(null);
        });
    } else {
      setSelectedCustomer(null);
    }
  }, [maKhachHang]);

  const estimatedTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = products.find((p) => p.maSanPham === item.maSanPham);
        const soLuong = toPositiveInt(item.soLuong);
        const donGia = Number(product?.donGiaBan ?? 0);
        return sum + soLuong * donGia;
      }, 0),
    [items, products],
  );

  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [productPage] = await Promise.all([
        backendApi.products.list({ page: 0, size: 100 }),
      ]);

      setProducts(productPage.content);
      await loadHistory(1, historyQuery);
    } catch (err) {
      setError(getApiErrorMessage(err, t("salesOrders.loadError")));
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(page: number, keyword: string) {
    try {
      const response = await backendApi.sales.list({
        keyword: keyword.trim() || undefined,
        page: page - 1,
        size: itemsPerPage
      });

      if (Array.isArray(response)) {
        setSalesList(response);
        setTotalRecords(response.length);
      } else {
        setSalesList(response.content);
        setTotalRecords(response.totalElements);
      }
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, "Không thể tải lịch sử phiếu bán"));
    }
  }

  async function openDetail(soPhieuBan: string) {
    try {
      const response = await backendApi.sales.getById(soPhieuBan);
      setSelectedSale(response);
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, "Không thể tải chi tiết phiếu bán"));
    }
  }


  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!salesDraftHydrated || products.length === 0) {
      return;
    }

    const handoffItems = consumeHandoff();
    if (!handoffItems.length) {
      return;
    }

    const nextItems = handoffItems
      .map((draft) => {
        const product = products.find((p) => p.maSanPham === draft.maSanPham);
        if (!product) {
          return null;
        }
        const maxStock = Math.max(0, Number(product.tonKho ?? 0));
        if (maxStock <= 0) {
          return null;
        }
        return {
          keyId: Math.random().toString(36).substring(2, 9),
          maSanPham: draft.maSanPham,
          soLuong: String(Math.max(1, Math.min(draft.soLuong, maxStock))),
        } satisfies SaleItemDraft;
      })
      .filter((item): item is SaleItemDraft => Boolean(item));

    if (nextItems.length) {
      setItems(nextItems);
      setFormError(null);
      useToastStore.getState().success("Đã nạp sản phẩm từ phiếu bán tạm");
    }
  }, [consumeHandoff, products, salesDraftHydrated]);

  // Update history when page or search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory(currentPage, historyQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, historyQuery]);

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [historyQuery]);

  // Ref-based keyboard listener to avoid resetting event handler on state updates
  const submitRef = useRef(submit);
  const addRowRef = useRef(addRow);

  useEffect(() => {
    submitRef.current = submit;
    addRowRef.current = addRow;
  });

  useEffect(() => {
    function handleGlobalKeys(e: KeyboardEvent) {
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        addRowRef.current();
      }
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        submitRef.current();
      }
    }
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, []);

  function addRow() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function removeRow(index: number) {
    const itemToDelete = items[index];
    if (!itemToDelete) return;

    const product = products.find((p) => p.maSanPham === itemToDelete.maSanPham);
    const productName = product ? product.tenSanPham : itemToDelete.maSanPham || "chưa chọn";

    setItems((prev) => prev.filter((_, i) => i !== index));

    useToastStore.getState().success(`Đã xóa dòng sản phẩm: ${productName}`, {
      label: "Hoàn tác",
      onClick: () => {
        setItems((prev) => {
          const updated = [...prev];
          updated.splice(index, 0, itemToDelete);
          return updated;
        });
      },
    });
  }

  function updateItem(index: number, patch: Partial<SaleItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setFormError(null);
  }

  function getItemError(item: SaleItemDraft) {
    if (!item.maSanPham) {
      return t("salesOrders.productRequired");
    }
    const product = products.find((p) => p.maSanPham === item.maSanPham);
    const soLuong = toPositiveInt(item.soLuong);
    if (soLuong <= 0) {
      return t("salesOrders.quantityInvalid");
    }
    if (product && soLuong > Number(product.tonKho ?? 0)) {
      return t("salesOrders.stockExceeded").replace("{name}", product.tenSanPham);
    }
    return null;
  }

  async function submit() {
    setFormError(null);

    if (!maKhachHang) {
      setFormError(t("salesOrders.customerRequired"));
      return;
    }

    if (items.length === 0) {
      setFormError(t("salesOrders.minOneItem"));
      return;
    }

    const seen = new Set<string>();
    for (const item of items) {
      if (!item.maSanPham) {
        setFormError(t("salesOrders.productRequired"));
        return;
      }

      if (seen.has(item.maSanPham)) {
        setFormError(t("salesOrders.duplicateProduct"));
        return;
      }
      seen.add(item.maSanPham);

      const product = products.find((p) => p.maSanPham === item.maSanPham);
      const soLuong = toPositiveInt(item.soLuong);

      if (soLuong <= 0) {
        setFormError(t("salesOrders.quantityInvalid"));
        return;
      }

      if (product && soLuong > Number(product.tonKho ?? 0)) {
        setFormError(t("salesOrders.stockExceeded").replace("{name}", product.tenSanPham));
        return;
      }
    }

    const payload: SaleRequest = {
      soPhieuBan: soPhieuBan.trim() || undefined,
      ngayLapPhieuBan,
      maKhachHang,
      items: items.map((item) => ({
        maSanPham: item.maSanPham,
        soLuong: toPositiveInt(item.soLuong),
      })),
    };

    setSubmitting(true);
    try {
      const created = await backendApi.sales.create(payload);
      setSoPhieuBan("");
      setItems([createEmptyItem()]);
      clearDraft();
      await loadData();
      useToastStore.getState().success(`Đã lập phiếu bán hàng ${created.soPhieuBan} thành công!`);
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("salesOrders.createError")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            {t("salesOrders.title")}
          </h1>
        </div>
      </div>

      {/* KHỐI FORM LẬP PHIẾU BÁN HÀNG - Ở TRÊN */}
      <Card className="glass-card hover-elevate shadow-sm">
        <CardContent className="space-y-6 p-6">
          <VoucherSection title="Thông tin chung" icon={ClipboardList}>
            <div className="grid gap-4 lg:grid-cols-[220px_220px_1fr] lg:items-end">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.dateCreated")}</Label>
                <DatePickerInput value={ngayLapPhieuBan} onValueChange={setNgayLapPhieuBan} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.phone")}</Label>
                <CustomerSelect
                  value={maKhachHang || ""}
                  onValueChange={setMaKhachHang}
                  className="h-9"
                  placeholder="Nhập Số điện thoại..."
                />
              </div>
              <ContactPanel
                emptyText="Chưa chọn khách hàng"
                rows={selectedCustomer ? [
                  { label: "Tên khách hàng", value: selectedCustomer.tenKhachHang },
                  { label: t("common.address"), value: selectedCustomer.diaChiKhachHang },
                ] : []}
              />
            </div>
          </VoucherSection>

          <VoucherSection title="Chi tiết bán hàng" icon={ReceiptText}>
            <div className="rounded-md border border-border/80 overflow-visible [&_[data-slot=table-container]]:overflow-visible mt-2">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 text-center py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider min-w-[200px]">{t("common.product")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("products.productType")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("products.stock")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider w-32">{t("common.quantity")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("products.sellingPrice")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.subtotal")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-right w-16">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const product = products.find((p) => p.maSanPham === item.maSanPham);
                  const soLuong = toPositiveInt(item.soLuong);
                  const donGia = Number(product?.donGiaBan ?? 0);
                  const thanhTien = soLuong * donGia;

                  return (
                    <Fragment key={item.keyId}>
                    <TableRow className="table-row-hover border-b border-border/60">
                      <TableCell className="py-3.5 px-4 text-center font-bold text-sm text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Combobox
                          value={item.maSanPham || ""}
                          onValueChange={(value) => updateItem(index, { maSanPham: value })}
                          options={products
                            .filter((p) => (p.isActive !== false || p.maSanPham === item.maSanPham) && !items.some((draftItem, idx) => idx !== index && draftItem.maSanPham === p.maSanPham))
                            .map((productOption) => ({
                              value: productOption.maSanPham,
                              label: `[${productOption.maSanPham}] ${productOption.tenSanPham}`,
                            }))}
                          className="h-9"
                          placeholder="Chọn sản phẩm..."
                        />
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-medium text-muted-foreground">{product?.loaiSanPham?.tenLoaiSanPham ?? "-"}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-medium text-muted-foreground">{formatNumber(product?.tonKho ?? 0)}</TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center w-28 h-9 border rounded-lg bg-background overflow-hidden focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25 focus-within:shadow-[0_0_8px_rgba(212,163,89,0.12)]">
                          <button
                            type="button"
                            className="h-full w-8 border-r border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center font-bold text-sm select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {
                              const val = toPositiveInt(item.soLuong) || 1;
                              updateItem(index, { soLuong: String(Math.max(1, val - 1)) });
                            }}
                            disabled={toPositiveInt(item.soLuong) <= 1}
                          >
                            -
                          </button>
                          <input
                             value={item.soLuong}
                             type="number"
                             min="1"
                             onChange={(e) => updateItem(index, { soLuong: e.target.value })}
                             onBlur={(e) => {
                               const val = toPositiveInt(e.target.value);
                               if (val <= 0) {
                                 updateItem(index, { soLuong: "1" });
                               }
                             }}
                             className="h-full w-full min-w-0 border-0 bg-transparent text-center focus:outline-none focus:ring-0 text-sm font-semibold px-1"
                           />
                          <button
                            type="button"
                            className="h-full w-8 border-l border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center font-bold text-sm select-none cursor-pointer"
                            onClick={() => {
                              const val = toPositiveInt(item.soLuong) || 1;
                              updateItem(index, { soLuong: String(val + 1) });
                            }}
                          >
                            +
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-medium text-muted-foreground">{formatCurrency(donGia)}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(thanhTien)}</TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        <Button variant="destructive" size="icon-sm" className="h-8 w-8" onClick={() => removeRow(index)} disabled={items.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {getItemError(item) && (
                      <TableRow className="border-b border-border/60 hover:bg-transparent">
                        <TableCell colSpan={8} className="px-4 py-0">
                          <LineError>Dòng {index + 1}: {getItemError(item)}</LineError>
                        </TableCell>
                      </TableRow>
                    )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          </VoucherSection>

          <StickySummaryBar
            action={(
              <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/20 shadow-xs flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {t("salesOrders.estimatedTotal")}:
                  </span>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(estimatedTotal)}
                  </div>
                </div>
                <Button
                  size="default"
                  className="bg-gold-gradient text-gold-foreground font-bold hover:brightness-105 active:scale-95 shadow-md shadow-gold/25 h-10 text-sm px-6 cursor-pointer rounded-xl transition-all border-none"
                  onClick={submit}
                  disabled={submitting || loading}
                >
                  {submitting ? t("common.creating") : t("salesOrders.createButton")}
                </Button>
              </div>
            )}
          >
            <Button
              variant="outline"
              className="border-blue-500/40 text-blue-600 hover:bg-blue-500/10 active:scale-95 transition-all shadow-xs h-10 text-sm px-5 font-bold rounded-xl cursor-pointer border"
              onClick={addRow}
            >
              <Plus className="mr-1.5 h-4.5 w-4.5 stroke-[2.5]" />
              {t("common.addRow")}
            </Button>
          </StickySummaryBar>

          {formError && <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-3">{formError}</p>}
          {error && <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-3">{error}</p>}

        </CardContent>
      </Card>

      {/* KHỐI LỊCH SỬ PHIẾU BÁN HÀNG - Ở DƯỚI */}
      <Card className="glass-card hover-elevate shadow-sm">
        <TableToolbar
          title={t("salesOrders.historyTitle")}
          search={
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="Tìm mã phiếu hoặc khách hàng"
                className="h-9 pl-9 pr-4"
              />
            </div>
          }
        />
        <CardContent className="p-6">
          {salesList.length === 0 && loading ? (
            <p className="py-4 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : salesList.length === 0 ? (
            <EmptyState title={t("salesOrders.emptyTitle")} description={t("salesOrders.emptyDesc")} />
          ) : (
            <>
              <div className={cn("rounded-md border border-border/80 overflow-hidden transition-opacity duration-200", loading && "opacity-50 pointer-events-none")}>
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-14 text-center py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.voucherNumber")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.dateCreated")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.customer")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-center">{t("salesOrders.lineCount")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right">{t("common.total")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right w-20">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesList.map((item, idx) => (
                      <TableRow key={item.soPhieuBan} className="table-row-hover border-b border-border/60">
                        <TableCell className="py-1.5 px-3 text-center font-bold text-xs text-muted-foreground">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-xs font-semibold">{item.soPhieuBan}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{item.ngayLapPhieuBan}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs">{item.khachHang?.tenKhachHang ?? item.maKhachHang}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-center font-medium text-muted-foreground">{formatNumber(item.items?.length ?? 0)}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(item.tongTien)}</TableCell>
                        <TableCell className="py-1.5 px-3 text-right">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 cursor-pointer" title="Xem chi tiết" onClick={() => openDetail(item.soPhieuBan)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-center border-t border-border/60 pt-4 mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <DetailModal
        open={Boolean(selectedSale)}
        title={`Phiếu bán ${selectedSale?.soPhieuBan ?? ""}`}
        subtitle="Chi tiết bán hàng và tổng thanh toán"
        onClose={() => setSelectedSale(null)}
        onPrint={() => window.print()}
      >
        {selectedSale && (
          <div className="space-y-4">
            <DetailGrid
              items={[
                { label: "Ngày lập", value: selectedSale.ngayLapPhieuBan },
                { label: "Khách hàng", value: selectedSale.khachHang?.tenKhachHang ?? selectedSale.maKhachHang },
                { label: "Tổng tiền", value: formatCurrency(selectedSale.tongTien) },
              ]}
            />
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead className="text-right">SL</TableHead>
                    <TableHead className="text-right">Đơn giá bán</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSale.items.map((item) => (
                    <TableRow key={item.maSanPham}>
                      <TableCell>{item.tenSanPham}</TableCell>
                      <TableCell>{item.tenDonViTinh}</TableCell>
                      <TableCell className="text-right">{item.soLuong}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.donGia)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(item.thanhTien)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}

// Force recompile
