"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type {
  ProductResponse,
  PurchaseRequest,
  PurchaseResponse,
  SupplierResponse,
  UnitResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber, todayIsoDate, toPositiveInt, toPositiveNumber } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { Plus, Trash2 } from "lucide-react";

type PurchaseItemDraft = {
  maSanPham: string;
  maDonViTinh: string;
  soLuongMua: string;
  donGia: string;
};

const EMPTY_ITEM: PurchaseItemDraft = {
  maSanPham: "",
  maDonViTinh: "",
  soLuongMua: "1",
  donGia: "0",
};

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
  const [items, setItems] = useState<PurchaseItemDraft[]>([{ ...EMPTY_ITEM }]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, patch: Partial<PurchaseItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setFormError(null);
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
      setItems([{ ...EMPTY_ITEM }]);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("purchaseOrders.createError")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM5"
        title={t("purchaseOrders.title")}
        description={t("purchaseOrders.description")}
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("common.voucherNumber")}</Label>
              <Input value={soPhieuMua} onChange={(e) => setSoPhieuMua(e.target.value)} placeholder={t("common.autoGenerate")} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.dateCreated")}</Label>
              <Input type="date" value={ngayLapPhieuMua} onChange={(e) => setNgayLapPhieuMua(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.supplier")}</Label>
              <Select
                value={maNhaCungCap || ""}
                onValueChange={setMaNhaCungCap}
                options={suppliers.map((item) => ({ value: item.maNhaCungCap, label: `${item.maNhaCungCap} - ${item.tenNhaCungCap}` }))}
              />
            </div>
          </div>

          {selectedSupplier && (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p>{t("common.phone")}: {selectedSupplier.soDienThoai || "-"}</p>
              <p>{t("common.address")}: {selectedSupplier.diaChi || "-"}</p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.product")}</TableHead>
                <TableHead>{t("common.unit")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("common.unitPrice")}</TableHead>
                <TableHead>{t("common.subtotal")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const soLuong = toPositiveInt(item.soLuongMua);
                const donGia = toPositiveNumber(item.donGia);
                const thanhTien = soLuong * donGia;

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={item.maSanPham || ""}
                        onValueChange={(value) => onProductChange(index, value)}
                        options={products.map((product) => ({ value: product.maSanPham, label: `${product.maSanPham} - ${product.tenSanPham}` }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.maDonViTinh || ""}
                        onValueChange={(value) => updateItem(index, { maDonViTinh: value })}
                        options={units.map((unit) => ({ value: unit.maDonViTinh, label: unit.tenDonViTinh }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input value={item.soLuongMua} onChange={(e) => updateItem(index, { soLuongMua: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input value={item.donGia} onChange={(e) => updateItem(index, { donGia: e.target.value })} />
                    </TableCell>
                    <TableCell>{formatCurrency(thanhTien)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button variant="destructive" size="icon-sm" onClick={() => removeRow(index)} disabled={items.length <= 1}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={addRow}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t("common.addRow")}
            </Button>
            <Badge variant="outline">{t("common.total")}: {formatCurrency(totalAmount)}</Badge>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting || loading}>
              {submitting ? t("common.creating") : t("purchaseOrders.createButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {latestCreated && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="font-semibold">{t("purchaseOrders.justCreated")}: {latestCreated.soPhieuMua}</p>
            <p className="text-sm text-muted-foreground">{t("common.total")}: {formatCurrency(latestCreated.tongTien)}</p>
            <Button
              variant="outline"
              size="sm"
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

      <Card>
        <TableToolbar title={t("purchaseOrders.historyTitle")} description={t("purchaseOrders.historyDesc")} />
        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : purchaseList.length === 0 ? (
            <div className="p-4">
              <EmptyState title={t("purchaseOrders.emptyTitle")} description={t("purchaseOrders.emptyDesc")} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.voucherNumber")}</TableHead>
                  <TableHead>{t("common.dateCreated")}</TableHead>
                  <TableHead>{t("common.supplier")}</TableHead>
                  <TableHead>{t("purchaseOrders.lineCount")}</TableHead>
                  <TableHead>{t("common.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseList.map((item) => (
                  <TableRow key={item.soPhieuMua}>
                    <TableCell>{item.soPhieuMua}</TableCell>
                    <TableCell>{item.ngayLapPhieuMua}</TableCell>
                    <TableCell>{item.nhaCungCap?.tenNhaCungCap ?? item.maNhaCungCap}</TableCell>
                    <TableCell>{formatNumber(item.items.length)}</TableCell>
                    <TableCell>{formatCurrency(item.tongTien)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
