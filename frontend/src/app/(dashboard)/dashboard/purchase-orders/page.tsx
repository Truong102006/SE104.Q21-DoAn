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
        backendApi.products.list({ page: 0, size: 200 }),
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
      setError(getApiErrorMessage(err, "Khong tai duoc du lieu phieu mua"));
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
      setFormError("Nha cung cap la bat buoc");
      return;
    }

    if (items.length === 0) {
      setFormError("Can it nhat 1 dong chi tiet");
      return;
    }

    const seen = new Set<string>();
    for (const item of items) {
      if (!item.maSanPham) {
        setFormError("San pham la bat buoc");
        return;
      }
      if (seen.has(item.maSanPham)) {
        setFormError("Khong duoc trung san pham trong cung mot phieu");
        return;
      }
      seen.add(item.maSanPham);

      if (toPositiveInt(item.soLuongMua) <= 0) {
        setFormError("So luong mua phai > 0");
        return;
      }

      if (toPositiveNumber(item.donGia) < 0) {
        setFormError("Don gia phai >= 0");
        return;
      }

      if (!item.maDonViTinh) {
        setFormError("Don vi tinh la bat buoc");
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
      setFormError(getApiErrorMessage(err, "Tao phieu mua that bai"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM5"
        title="Lap phieu mua hang"
        description="Tao phieu mua, tinh thanh tien/tong tien realtime, cap nhat ton kho qua backend"
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>So phieu</Label>
              <Input value={soPhieuMua} onChange={(e) => setSoPhieuMua(e.target.value)} placeholder="De trong de tu sinh" />
            </div>
            <div className="space-y-2">
              <Label>Ngay lap</Label>
              <Input type="date" value={ngayLapPhieuMua} onChange={(e) => setNgayLapPhieuMua(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nha cung cap</Label>
              <Select
                value={maNhaCungCap || ""}
                onValueChange={setMaNhaCungCap}
                options={suppliers.map((item) => ({ value: item.maNhaCungCap, label: `${item.maNhaCungCap} - ${item.tenNhaCungCap}` }))}
              />
            </div>
          </div>

          {selectedSupplier && (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p>So dien thoai: {selectedSupplier.soDienThoai || "-"}</p>
              <p>Dia chi: {selectedSupplier.diaChi || "-"}</p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>San pham</TableHead>
                <TableHead>Don vi tinh</TableHead>
                <TableHead>So luong</TableHead>
                <TableHead>Don gia</TableHead>
                <TableHead>Thanh tien</TableHead>
                <TableHead className="text-right">Tac vu</TableHead>
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
              Them dong
            </Button>
            <Badge variant="outline">Tong tien: {formatCurrency(totalAmount)}</Badge>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting || loading}>
              {submitting ? "Dang tao..." : "Tao phieu mua"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {latestCreated && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="font-semibold">Phieu vua tao: {latestCreated.soPhieuMua}</p>
            <p className="text-sm text-muted-foreground">Tong tien: {formatCurrency(latestCreated.tongTien)}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const printData = await backendApi.purchases.printData(latestCreated.soPhieuMua);
                  setLatestCreated(printData);
                } catch (err) {
                  setError(getApiErrorMessage(err, "Khong lay duoc du lieu in phieu"));
                }
              }}
            >
              Xem du lieu in phieu
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <TableToolbar title="Lich su phieu mua" description="Danh sach phieu mua da tao" />
        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Dang tai...</p>
          ) : purchaseList.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Chua co phieu mua" description="Tao phieu mua dau tien" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>So phieu</TableHead>
                  <TableHead>Ngay lap</TableHead>
                  <TableHead>Nha cung cap</TableHead>
                  <TableHead>So dong</TableHead>
                  <TableHead>Tong tien</TableHead>
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

