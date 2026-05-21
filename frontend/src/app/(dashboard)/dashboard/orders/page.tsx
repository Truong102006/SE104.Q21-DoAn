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
  CustomerResponse,
  ProductResponse,
  SaleRequest,
  SaleResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber, todayIsoDate, toPositiveInt } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { Plus, Trash2 } from "lucide-react";

type SaleItemDraft = {
  maSanPham: string;
  soLuong: string;
};

const EMPTY_ITEM: SaleItemDraft = {
  maSanPham: "",
  soLuong: "1",
};

export default function SalesPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const [salesList, setSalesList] = useState<SaleResponse[]>([]);

  const [soPhieuBan, setSoPhieuBan] = useState("");
  const [ngayLapPhieuBan, setNgayLapPhieuBan] = useState(todayIsoDate());
  const [maKhachHang, setMaKhachHang] = useState("");
  const [items, setItems] = useState<SaleItemDraft[]>([{ ...EMPTY_ITEM }]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCustomer = useMemo(
    () => customers.find((item) => item.maKhachHang === maKhachHang) ?? null,
    [customers, maKhachHang],
  );

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

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [customerData, productPage, sales] = await Promise.all([
        backendApi.customers.list(),
        backendApi.products.list({ page: 0, size: 200 }),
        backendApi.sales.list(),
      ]);

      setCustomers(customerData);
      setProducts(productPage.content);
      setSalesList(sales);

      if (!maKhachHang && customerData.length > 0) {
        setMaKhachHang(customerData[0].maKhachHang);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t("salesOrders.loadError")));
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

  function updateItem(index: number, patch: Partial<SaleItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setFormError(null);
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
      await backendApi.sales.create(payload);
      setSoPhieuBan("");
      setItems([{ ...EMPTY_ITEM }]);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("salesOrders.createError")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM6"
        title={t("salesOrders.title")}
        description={t("salesOrders.description")}
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("common.voucherNumber")}</Label>
              <Input value={soPhieuBan} onChange={(e) => setSoPhieuBan(e.target.value)} placeholder={t("common.autoGenerate")} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.dateCreated")}</Label>
              <Input type="date" value={ngayLapPhieuBan} onChange={(e) => setNgayLapPhieuBan(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.customer")}</Label>
              <Select
                value={maKhachHang || ""}
                onValueChange={setMaKhachHang}
                options={customers.map((item) => ({ value: item.maKhachHang, label: `${item.maKhachHang} - ${item.tenKhachHang}` }))}
              />
            </div>
          </div>

          {selectedCustomer && (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p>{t("common.phone")}: {selectedCustomer.soDienThoaiKhachHang || "-"}</p>
              <p>{t("common.address")}: {selectedCustomer.diaChiKhachHang || "-"}</p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.product")}</TableHead>
                <TableHead>{t("products.productType")}</TableHead>
                <TableHead>{t("products.stock")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("products.sellingPrice")}</TableHead>
                <TableHead>{t("common.subtotal")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const product = products.find((p) => p.maSanPham === item.maSanPham);
                const soLuong = toPositiveInt(item.soLuong);
                const donGia = Number(product?.donGiaBan ?? 0);
                const thanhTien = soLuong * donGia;

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={item.maSanPham || ""}
                        onValueChange={(value) => updateItem(index, { maSanPham: value })}
                        options={products.map((productOption) => ({
                          value: productOption.maSanPham,
                          label: `${productOption.maSanPham} - ${productOption.tenSanPham}`,
                        }))}
                      />
                    </TableCell>
                    <TableCell>{product?.loaiSanPham?.tenLoaiSanPham ?? "-"}</TableCell>
                    <TableCell>{formatNumber(product?.tonKho ?? 0)}</TableCell>
                    <TableCell>
                      <Input value={item.soLuong} onChange={(e) => updateItem(index, { soLuong: e.target.value })} />
                    </TableCell>
                    <TableCell>{formatCurrency(donGia)}</TableCell>
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
            <Badge variant="outline">{t("salesOrders.estimatedTotal")}: {formatCurrency(estimatedTotal)}</Badge>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting || loading}>
              {submitting ? t("common.creating") : t("salesOrders.createButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <TableToolbar title={t("salesOrders.historyTitle")} description={t("salesOrders.historyDesc")} />
        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : salesList.length === 0 ? (
            <div className="p-4">
              <EmptyState title={t("salesOrders.emptyTitle")} description={t("salesOrders.emptyDesc")} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.voucherNumber")}</TableHead>
                  <TableHead>{t("common.dateCreated")}</TableHead>
                  <TableHead>{t("common.customer")}</TableHead>
                  <TableHead>{t("salesOrders.lineCount")}</TableHead>
                  <TableHead>{t("common.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesList.map((item) => (
                  <TableRow key={item.soPhieuBan}>
                    <TableCell>{item.soPhieuBan}</TableCell>
                    <TableCell>{item.ngayLapPhieuBan}</TableCell>
                    <TableCell>{item.khachHang?.tenKhachHang ?? item.maKhachHang}</TableCell>
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
