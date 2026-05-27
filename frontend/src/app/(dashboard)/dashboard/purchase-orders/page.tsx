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
import { Pagination } from "@/components/dashboard/pagination";
import { QuickCreateProductDialog } from "@/components/dashboard/quick-create-product-dialog";
import { useToastStore } from "@/stores/toast-store";
import { backendApi } from "@/services/backend-api";
import type {
  ProductResponse,
  ProductTypeResponse,
  PurchaseRequest,
  PurchaseResponse,
  SupplierResponse,
  UnitResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber, todayIsoDate, toPositiveInt, toPositiveNumber, formatVNCurrencyInput, parseVNCurrencyInput } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { cn } from "@/lib/utils";
import { ClipboardList, Eye, Plus, ReceiptText, Trash2, Search } from "lucide-react";

type PurchaseItemDraft = {
  keyId: string;
  maSanPham: string;
  maDonViTinh: string;
  soLuongMua: string;
  donGia: string;
};

const createEmptyItem = (): PurchaseItemDraft => ({
  keyId: Math.random().toString(36).substring(2, 9),
  maSanPham: "",
  maDonViTinh: "",
  soLuongMua: "1",
  donGia: "0",
});

export default function PurchaseOrdersPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeResponse[]>([]);

  // Quick-Create Product Dialog state
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateName, setQuickCreateName] = useState("");
  const [quickCreateTargetIndex, setQuickCreateTargetIndex] = useState(-1);

  const [purchaseList, setPurchaseList] = useState<PurchaseResponse[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [latestCreated, setLatestCreated] = useState<PurchaseResponse | null>(null);

  const [soPhieuMua, setSoPhieuMua] = useState("");
  const [ngayLapPhieuMua, setNgayLapPhieuMua] = useState(todayIsoDate());
  const [maNhaCungCap, setMaNhaCungCap] = useState("");
  const [items, setItems] = useState<PurchaseItemDraft[]>([createEmptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseResponse | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedSupplier = useMemo(
    () => suppliers.find((item) => item.maNhaCungCap === maNhaCungCap) ?? null,
    [maNhaCungCap, suppliers],
  );

  const totalAmount = useMemo(
    () =>
      items.reduce((sum, item) => {
        const soLuong = toPositiveInt(item.soLuongMua);
        const donGia = toPositiveNumber(item.donGia);
        return sum + soLuong * donGia;
      }, 0),
    [items],
  );

  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [supplierData, productPage, unitData, ptData] = await Promise.all([
        backendApi.suppliers.list(),
        backendApi.products.list({ page: 0, size: 100 }),
        backendApi.units.list(),
        backendApi.productTypes.list(),
      ]);

      setSuppliers(supplierData);
      setProducts(productPage.content);
      setUnits(unitData);
      setProductTypes(ptData);

      if (!maNhaCungCap && supplierData.length > 0) {
        setMaNhaCungCap(supplierData[0].maNhaCungCap);
      }

      await loadHistory(1, historyQuery);
    } catch (err) {
      setError(getApiErrorMessage(err, t("purchaseOrders.loadError")));
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(page: number, keyword: string) {
    try {
      const response = await backendApi.purchases.list({
        keyword: keyword.trim() || undefined,
        page: page - 1,
        size: itemsPerPage
      });

      if (Array.isArray(response)) {
        setPurchaseList(response);
        setTotalRecords(response.length);
      } else {
        setPurchaseList(response.content);
        setTotalRecords(response.totalElements);
      }
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, "Không thể tải lịch sử phiếu mua"));
    }
  }

  async function openDetail(soPhieuMua: string) {
    try {
      const response = await backendApi.purchases.getById(soPhieuMua);
      setSelectedPurchase(response);
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, "Không thể tải chi tiết phiếu mua"));
    }
  }


  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function updateItem(index: number, patch: Partial<PurchaseItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setFormError(null);
  }

  function getItemError(item: PurchaseItemDraft) {
    if (!item.maSanPham) {
      return t("purchaseOrders.productRequired");
    }
    if (toPositiveInt(item.soLuongMua) <= 0) {
      return t("purchaseOrders.quantityInvalid");
    }
    if (toPositiveNumber(item.donGia) < 0) {
      return t("purchaseOrders.priceInvalid");
    }
    if (!item.maDonViTinh) {
      return t("purchaseOrders.unitRequired");
    }
    return null;
  }

  function onProductChange(index: number, maSanPham: string) {
    const product = products.find((item) => item.maSanPham === maSanPham);
    updateItem(index, {
      maSanPham,
      maDonViTinh: product?.maDonViTinh ?? "",
      donGia: String(product?.donGiaMua ?? 0),
    });
  }

  async function submit() {
    setFormError(null);

    if (!maNhaCungCap) {
      setFormError(t("purchaseOrders.supplierRequired"));
      return;
    }

    if (items.length === 0) {
      setFormError(t("purchaseOrders.minOneItem"));
      return;
    }

    const seen = new Set<string>();
    for (const item of items) {
      if (!item.maSanPham) {
        setFormError(t("purchaseOrders.productRequired"));
        return;
      }
      if (seen.has(item.maSanPham)) {
        setFormError(t("purchaseOrders.duplicateProduct"));
        return;
      }
      seen.add(item.maSanPham);

      if (toPositiveInt(item.soLuongMua) <= 0) {
        setFormError(t("purchaseOrders.quantityInvalid"));
        return;
      }

      if (toPositiveNumber(item.donGia) < 0) {
        setFormError(t("purchaseOrders.priceInvalid"));
        return;
      }

      if (!item.maDonViTinh) {
        setFormError(t("purchaseOrders.unitRequired"));
        return;
      }
    }

    const payload: PurchaseRequest = {
      soPhieuMua: soPhieuMua.trim() || undefined,
      ngayLapPhieuMua,
      maNhaCungCap,
      items: items.map((item) => ({
        maSanPham: item.maSanPham,
        soLuongMua: toPositiveInt(item.soLuongMua),
        maDonViTinh: item.maDonViTinh,
        donGia: toPositiveNumber(item.donGia),
      })),
    };

    setSubmitting(true);
    try {
      const created = await backendApi.purchases.create(payload);
      setLatestCreated(created);
      setSoPhieuMua("");
      setItems([createEmptyItem()]);
      await loadData();
      useToastStore.getState().success(`Đã lập phiếu mua hàng ${created.soPhieuMua} thành công!`);
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("purchaseOrders.createError")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            {t("purchaseOrders.title")}
          </h1>
        </div>
      </div>

      {/* KHỐI FORM LẬP PHIẾU MUA HÀNG - Ở TRÊN */}
      <Card className="glass-card hover-elevate shadow-sm">
        <CardContent className="space-y-6 p-6">
          <VoucherSection title="Thông tin chung" icon={ClipboardList}>
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(260px,1fr)_minmax(320px,1.2fr)] lg:items-end">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.dateCreated")}</Label>
                <DatePickerInput value={ngayLapPhieuMua} onValueChange={setNgayLapPhieuMua} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.supplier")}</Label>
                <Combobox
                  value={maNhaCungCap || ""}
                  onValueChange={setMaNhaCungCap}
                  options={suppliers
                    .filter((item) => item.isActive !== false || item.maNhaCungCap === maNhaCungCap)
                    .map((item) => ({ value: item.maNhaCungCap, label: item.tenNhaCungCap }))}
                  className="h-9"
                  placeholder="Chọn nhà cung cấp..."
                />
              </div>
              <ContactPanel
                emptyText="Chưa chọn nhà cung cấp"
                rows={selectedSupplier ? [
                  { label: t("common.phone"), value: selectedSupplier.soDienThoai },
                  { label: t("common.address"), value: selectedSupplier.diaChi },
                ] : []}
              />
            </div>
          </VoucherSection>

          <VoucherSection title="Chi tiết sản phẩm" icon={ReceiptText}>
            <div className="rounded-md border border-border/80 overflow-visible [&_[data-slot=table-container]]:overflow-visible mt-2">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 text-center py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider min-w-[200px]">{t("common.product")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("products.productType")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.unit")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider w-32">{t("common.quantity")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider min-w-[140px]">{t("products.purchasePrice")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.subtotal")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-right w-16">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const product = products.find((p) => p.maSanPham === item.maSanPham);
                    const soLuong = toPositiveInt(item.soLuongMua);
                    const donGia = toPositiveNumber(item.donGia);
                    const thanhTien = soLuong * donGia;

                    return (
                      <Fragment key={item.keyId}>
                        <TableRow className="table-row-hover border-b border-border/60">
                          <TableCell className="py-3.5 px-4 text-center font-bold text-sm text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="py-3.5 px-4">
                            <Combobox
                              value={item.maSanPham || ""}
                              onValueChange={(value) => onProductChange(index, value)}
                              options={products
                                .filter((p) => (p.isActive !== false || p.maSanPham === item.maSanPham) && !items.some((draftItem, idx) => idx !== index && draftItem.maSanPham === p.maSanPham))
                                .map((productOption) => ({
                                  value: productOption.maSanPham,
                                  label: productOption.tenSanPham,
                                }))}
                              className="h-9"
                              placeholder="Chọn sản phẩm..."
                              onCreateNew={async (name) => {
                                setQuickCreateName(name);
                                setQuickCreateTargetIndex(index);
                                setQuickCreateOpen(true);
                                return null;
                              }}
                            />
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-sm font-medium text-muted-foreground">
                            {product?.loaiSanPham?.tenLoaiSanPham ?? "-"}
                          </TableCell>
                          <TableCell className="py-3.5 px-4">
                            <Combobox
                              value={item.maDonViTinh || ""}
                              onValueChange={(v) => updateItem(index, { maDonViTinh: v })}
                              options={units
                                .filter((u) => u.isActive !== false || u.maDonViTinh === item.maDonViTinh)
                                .map((u) => ({ value: u.maDonViTinh, label: u.tenDonViTinh }))}
                              className="h-9"
                              placeholder="Chọn đơn vị..."
                              onCreateNew={async (name) => {
                                try {
                                  const created = await backendApi.units.create({ tenDonViTinh: name });
                                  setUnits((prev) => [...prev, created]);
                                  useToastStore.getState().success(`Đã tạo đơn vị "${created.tenDonViTinh}"`);
                                  return { value: created.maDonViTinh, label: created.tenDonViTinh };
                                } catch (err) {
                                  useToastStore.getState().error(getApiErrorMessage(err, "Không thể tạo đơn vị"));
                                  return null;
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="py-3.5 px-4">
                            <div className="flex items-center w-28 h-9 border rounded-lg bg-background overflow-hidden focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25 focus-within:shadow-[0_0_8px_rgba(212,163,89,0.12)]">
                              <button
                                type="button"
                                className="h-full w-8 border-r border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center font-bold text-sm select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                onClick={() => {
                                  const val = toPositiveInt(item.soLuongMua) || 1;
                                  updateItem(index, { soLuongMua: String(Math.max(1, val - 1)) });
                                }}
                                disabled={toPositiveInt(item.soLuongMua) <= 1}
                              >
                                -
                              </button>
                              <input
                                value={item.soLuongMua}
                                type="number"
                                min="1"
                                onChange={(e) => updateItem(index, { soLuongMua: e.target.value })}
                                onBlur={(e) => {
                                  const val = toPositiveInt(e.target.value);
                                  if (val <= 0) {
                                    updateItem(index, { soLuongMua: "1" });
                                  }
                                }}
                                className="h-full w-full min-w-0 border-0 bg-transparent text-center focus:outline-none focus:ring-0 text-sm font-semibold px-1"
                              />
                              <button
                                type="button"
                                className="h-full w-8 border-l border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center font-bold text-sm select-none cursor-pointer"
                                onClick={() => {
                                  const val = toPositiveInt(item.soLuongMua) || 1;
                                  updateItem(index, { soLuongMua: String(val + 1) });
                                }}
                              >
                                +
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 px-4">
                            <div className="relative flex items-center w-full">
                              <Input
                                type="text"
                                value={formatVNCurrencyInput(item.donGia)}
                                onChange={(e) => updateItem(index, { donGia: parseVNCurrencyInput(e.target.value) })}
                                className="h-9 text-sm pr-9 text-right font-semibold"
                              />
                              <span className="absolute right-2.5 text-xs text-muted-foreground font-semibold pointer-events-none select-none">
                                đ
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3.5 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(thanhTien)}
                          </TableCell>
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
                    {t("common.total")}:
                  </span>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(totalAmount)}
                  </div>
                </div>
                <Button
                  size="default"
                  className="bg-gold-gradient text-gold-foreground font-bold hover:brightness-105 active:scale-95 shadow-md shadow-gold/25 h-10 text-sm px-6 cursor-pointer rounded-xl transition-all border-none"
                  onClick={submit}
                  disabled={submitting || loading}
                >
                  {submitting ? t("common.creating") : t("purchaseOrders.createButton")}
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

      {latestCreated && (
        <Card className="glass-card border border-border/80 shadow-sm bg-muted/10">
          <CardContent className="space-y-3 p-6">
            <p className="font-semibold text-sm">{t("purchaseOrders.justCreated")}: <span className="font-bold text-indigo-600 dark:text-indigo-400">{latestCreated.soPhieuMua}</span></p>
            <p className="text-sm text-muted-foreground">{t("common.total")}: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(latestCreated.tongTien)}</span></p>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3"
              onClick={async () => {
                try {
                  const printData = await backendApi.purchases.printData(latestCreated.soPhieuMua);
                  setLatestCreated(printData);
                } catch (err) {
                  setError(getApiErrorMessage(err, t("purchaseOrders.printDataError")));
                }
              }}
            >
              {t("purchaseOrders.viewPrintData")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KHỐI LỊCH SỬ PHIẾU MUA HÀNG - Ở DƯỚI */}
      <Card className="glass-card hover-elevate shadow-sm">
        <TableToolbar
          title={t("purchaseOrders.historyTitle")}
          search={
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="Tìm mã phiếu hoặc nhà cung cấp"
                className="h-9 pl-9 pr-4"
              />
            </div>
          }
        />
        <CardContent className="p-6">
          {purchaseList.length === 0 && loading ? (
            <p className="py-4 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : purchaseList.length === 0 ? (
            <EmptyState title={t("purchaseOrders.emptyTitle")} description={t("purchaseOrders.emptyDesc")} />
          ) : (
            <>
              <div className={cn("rounded-md border border-border/80 overflow-hidden transition-opacity duration-200", loading && "opacity-50 pointer-events-none")}>
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-14 text-center py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.voucherNumber")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.dateCreated")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.supplier")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-center">{t("purchaseOrders.lineCount")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right">{t("common.total")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right w-20">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseList.map((item, idx) => (
                      <TableRow key={item.soPhieuMua} className="table-row-hover border-b border-border/60">
                        <TableCell className="py-1.5 px-3 text-center font-bold text-xs text-muted-foreground">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-xs font-semibold">{item.soPhieuMua}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{item.ngayLapPhieuMua}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs">{item.nhaCungCap?.tenNhaCungCap ?? item.maNhaCungCap}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-center font-medium text-muted-foreground">{formatNumber(item.items?.length ?? 0)}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(item.tongTien)}</TableCell>
                        <TableCell className="py-1.5 px-3 text-right">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 cursor-pointer" title="Xem chi tiết" onClick={() => openDetail(item.soPhieuMua)}>
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
        open={Boolean(selectedPurchase)}
        title={`Phiếu mua ${selectedPurchase?.soPhieuMua ?? ""}`}
        subtitle="Chi tiết nhập hàng và tổng tiền"
        onClose={() => setSelectedPurchase(null)}
        onPrint={() => window.print()}
      >
        {selectedPurchase && (
          <div className="space-y-4">
            <DetailGrid
              items={[
                { label: "Ngày lập", value: selectedPurchase.ngayLapPhieuMua },
                { label: "Nhà cung cấp", value: selectedPurchase.nhaCungCap?.tenNhaCungCap ?? selectedPurchase.maNhaCungCap },
                { label: "SĐT", value: selectedPurchase.nhaCungCap?.soDienThoai },
                { label: "Tổng tiền", value: formatCurrency(selectedPurchase.tongTien) },
              ]}
            />
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead className="text-right">SL</TableHead>
                    <TableHead className="text-right">Đơn giá mua</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPurchase.items.map((item) => (
                    <TableRow key={item.maSanPham}>
                      <TableCell>{item.tenSanPham}</TableCell>
                      <TableCell>{item.tenDonViTinh}</TableCell>
                      <TableCell className="text-right">{item.soLuongMua}</TableCell>
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

      {/* Quick-Create Product Dialog */}
      <QuickCreateProductDialog
        open={quickCreateOpen}
        defaultName={quickCreateName}
        productTypes={productTypes}
        units={units}
        onCreated={(product) => {
          setProducts((prev) => [...prev, product]);
          if (quickCreateTargetIndex >= 0) {
            onProductChange(quickCreateTargetIndex, product.maSanPham);
          }
          setQuickCreateOpen(false);
        }}
        onClose={() => setQuickCreateOpen(false)}
        onProductTypeCreated={(pt) => setProductTypes((prev) => [...prev, pt])}
        onUnitCreated={(u) => setUnits((prev) => [...prev, u])}
      />
    </div>
  );
}

// Force recompile
