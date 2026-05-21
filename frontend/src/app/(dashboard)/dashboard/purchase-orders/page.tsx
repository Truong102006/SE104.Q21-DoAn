"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactPanel, DetailGrid, DetailModal, LineError, StickySummaryBar, VoucherSection } from "@/components/dashboard/voucher-ui";
import { Combobox } from "@/components/ui/combobox";
import { useToastStore } from "@/stores/toast-store";
import { backendApi } from "@/services/backend-api";
import type {
  ProductResponse,
  PurchaseRequest,
  PurchaseResponse,
  SupplierResponse,
  UnitResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber, todayIsoDate, toPositiveInt, toPositiveNumber, formatVNCurrencyInput, parseVNCurrencyInput } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { ClipboardList, Eye, Plus, ReceiptText, Trash2 } from "lucide-react";

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

  const [purchaseList, setPurchaseList] = useState<PurchaseResponse[]>([]);
  const [latestCreated, setLatestCreated] = useState<PurchaseResponse | null>(null);

  const [soPhieuMua, setSoPhieuMua] = useState("");
  const [ngayLapPhieuMua, setNgayLapPhieuMua] = useState(todayIsoDate());
  const [maNhaCungCap, setMaNhaCungCap] = useState("");
  const [items, setItems] = useState<PurchaseItemDraft[]>([createEmptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseResponse | null>(null);

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

  const filteredPurchaseList = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    if (!query) {
      return purchaseList;
    }
    return purchaseList.filter((item) =>
      item.soPhieuMua.toLowerCase().includes(query)
      || (item.nhaCungCap?.tenNhaCungCap ?? item.maNhaCungCap).toLowerCase().includes(query),
    );
  }, [historyQuery, purchaseList]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [supplierData, productPage, unitData, purchases] = await Promise.all([
        backendApi.suppliers.list(),
        backendApi.products.list({ page: 0, size: 100 }),
        backendApi.units.list(),
        backendApi.purchases.list(),
      ]);

      setSuppliers(supplierData);
      setProducts(productPage.content);
      setUnits(unitData);
      setPurchaseList(purchases);
      if (!maNhaCungCap && supplierData.length > 0) {
        setMaNhaCungCap(supplierData[0].maNhaCungCap);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t("purchaseOrders.loadError")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("purchaseOrders.createError")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="BM5"
        title={t("purchaseOrders.title")}
        description={t("purchaseOrders.description")}
      />

      {/* KHỐI FORM LẬP PHIẾU MUA HÀNG - Ở TRÊN */}
      <Card className="glass-card hover-elevate shadow-sm">
        <CardContent className="space-y-6 p-6">
          <VoucherSection title="Thông tin chung" description="Chọn nhà cung cấp và ngày lập phiếu" icon={ClipboardList}>
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(260px,1fr)_minmax(320px,1.2fr)] lg:items-end">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.dateCreated")}</Label>
                <Input type="date" className="h-9 text-sm" value={ngayLapPhieuMua} onChange={(e) => setNgayLapPhieuMua(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.supplier")}</Label>
                <Combobox
                  value={maNhaCungCap || ""}
                  onValueChange={setMaNhaCungCap}
                  options={suppliers.map((item) => ({ value: item.maNhaCungCap, label: `${item.maNhaCungCap} - ${item.tenNhaCungCap}` }))}
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

          <VoucherSection title="Chi tiết sản phẩm" description="Chọn sản phẩm, đơn vị và số lượng nhập kho" icon={ReceiptText}>
          <div className="rounded-md border border-border/80 overflow-visible [&_[data-slot=table-container]]:overflow-visible">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 text-center py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider min-w-[200px]">{t("common.product")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("products.productType")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.unit")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider w-32">{t("common.quantity")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider min-w-[140px]">{t("common.unitPrice")}</TableHead>
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
                          options={products.map((productOption) => ({
                            value: productOption.maSanPham,
                            label: `${productOption.maSanPham} - ${productOption.tenSanPham}`,
                          }))}
                          className="h-9"
                          placeholder="Chọn sản phẩm..."
                        />
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-medium text-muted-foreground">
                        {product?.loaiSanPham?.tenLoaiSanPham ?? "-"}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-semibold text-muted-foreground">
                        {units.find((u) => u.maDonViTinh === item.maDonViTinh)?.tenDonViTinh ?? "-"}
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
                <Button size="default" className="h-10 text-sm font-semibold px-6 cursor-pointer" onClick={submit} disabled={submitting || loading}>
                  {submitting ? t("common.creating") : t("purchaseOrders.createButton")}
                </Button>
              </div>
            )}
          >
            <Button variant="outline" size="sm" className="h-9 text-sm px-4" onClick={addRow}>
              <Plus className="mr-1.5 h-4 w-4" />
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
          description={t("purchaseOrders.historyDesc")}
          search={<Input value={historyQuery} onChange={(e) => setHistoryQuery(e.target.value)} placeholder="Tìm mã phiếu hoặc nhà cung cấp" className="h-9" />}
        />
        <CardContent className="p-6">
          {loading ? (
            <p className="py-4 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : filteredPurchaseList.length === 0 ? (
            <EmptyState title={t("purchaseOrders.emptyTitle")} description={t("purchaseOrders.emptyDesc")} />
          ) : (
            <div className="rounded-md border border-border/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 text-center py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.voucherNumber")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.dateCreated")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.supplier")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-center">{t("purchaseOrders.lineCount")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-right">{t("common.total")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-right w-20">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseList.map((item, idx) => (
                    <TableRow key={item.soPhieuMua} className="table-row-hover border-b border-border/60">
                      <TableCell className="py-3.5 px-4 text-center font-bold text-sm text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-semibold">{item.soPhieuMua}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm text-muted-foreground">{item.ngayLapPhieuMua}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm">{item.nhaCungCap?.tenNhaCungCap ?? item.maNhaCungCap}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm text-center font-medium text-muted-foreground">{formatNumber(item.items.length)}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(item.tongTien)}</TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 cursor-pointer" title="Xem chi tiết" onClick={() => setSelectedPurchase(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                    <TableHead className="text-right">Đơn giá</TableHead>
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
    </div>
  );
}
