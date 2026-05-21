"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog, EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type {
  ProductRequest,
  ProductResponse,
  ProductTypeResponse,
  UnitResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber, toPositiveInt, toPositiveNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const PAGE_SIZE = 20;

const EMPTY_FORM: ProductRequest = {
  tenSanPham: "",
  maLoaiSanPham: "",
  maDonViTinh: "",
  donGiaMua: 0,
  tonKho: 0,
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [selectedType, setSelectedType] = useState("");

  const [productTypes, setProductTypes] = useState<ProductTypeResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [form, setForm] = useState<ProductRequest>(EMPTY_FORM);
  const [donGiaMuaText, setDonGiaMuaText] = useState("0");
  const [tonKhoText, setTonKhoText] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<ProductResponse | null>(null);

  async function loadOptions() {
    try {
      const [types, unitList] = await Promise.all([backendApi.productTypes.list(), backendApi.units.list()]);
      setProductTypes(types);
      setUnits(unitList);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được danh mục loại sản phẩm/đơn vị tính"));
    }
  }

  async function loadData(nextPage = page, nextKeyword = keyword, nextType = selectedType) {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.products.list({
        keyword: nextKeyword.trim() || undefined,
        productTypeId: nextType || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      });
      setItems(data.content);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setPage(data.number ?? nextPage);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được sản phẩm"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOptions();
    loadData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      maLoaiSanPham: productTypes[0]?.maLoaiSanPham ?? "",
      maDonViTinh: units[0]?.maDonViTinh ?? "",
    });
    setDonGiaMuaText("0");
    setTonKhoText("0");
    setFormError(null);
    setOpenForm(true);
  }

  function openEdit(item: ProductResponse) {
    setEditing(item);
    setForm({
      maSanPham: item.maSanPham,
      tenSanPham: item.tenSanPham,
      maLoaiSanPham: item.maLoaiSanPham,
      maDonViTinh: item.maDonViTinh,
      donGiaMua: Number(item.donGiaMua ?? 0),
      tonKho: Number(item.tonKho ?? 0),
    });
    setDonGiaMuaText(String(item.donGiaMua ?? 0));
    setTonKhoText(String(item.tonKho ?? 0));
    setFormError(null);
    setOpenForm(true);
  }

  function updateField<K extends keyof ProductRequest>(key: K, value: ProductRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenSanPham?.trim()) {
      setFormError("Tên sản phẩm là bắt buộc");
      return;
    }

    if (!form.maLoaiSanPham) {
      setFormError("Loại sản phẩm là bắt buộc");
      return;
    }

    if (!form.maDonViTinh) {
      setFormError("Đơn vị tính là bắt buộc");
      return;
    }

    const donGiaMua = toPositiveNumber(donGiaMuaText);
    const tonKho = toPositiveInt(tonKhoText);

    setSubmitting(true);
    setFormError(null);
    try {
      const payload: ProductRequest = {
        ...form,
        tenSanPham: form.tenSanPham.trim(),
        donGiaMua,
        tonKho,
      };

      if (editing) {
        await backendApi.products.update(editing.maSanPham, payload);
      } else {
        await backendApi.products.create(payload);
      }

      setOpenForm(false);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Lưu sản phẩm thất bại"));
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!deleting) {
      return;
    }

    try {
      await backendApi.products.remove(deleting.maSanPham);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Xóa sản phẩm thất bại"));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM8"
        title="Sản phẩm"
        description="Tra cứu v? quản lý sản phẩm"
        badges={<Badge variant="outline">Trang {page + 1}/{totalPages}</Badge>}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Thêm
          </Button>
        }
      />

      <Card>
        <TableToolbar
          title="Danh sách"
          description="Tìm theo mã, tên, loại sản phẩm"
          search={
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Nhap từ khóa..." className="pl-9" />
              </div>
              <Select
                value={selectedType || "all"}
                onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}
                options={[
                  { value: "all", label: "Tat ca loai" },
                  ...productTypes.map((type) => ({ value: type.maLoaiSanPham, label: type.tenLoaiSanPham })),
                ]}
              />
            </div>
          }
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => loadData(0, keyword, selectedType)}>
                Loc
              </Button>
              <Button size="sm" variant="outline" disabled={page <= 0} onClick={() => loadData(page - 1, keyword, selectedType)}>
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => loadData(page + 1, keyword, selectedType)}
              >
                Next
              </Button>
            </div>
          }
        />
        <CardContent className="px-0">
          {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Đang tải...</p>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Không có dữ liệu" description="Thử đổi bộ lọc hoac thêm mới" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ma SP</TableHead>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Loại sản phẩm</TableHead>
                  <TableHead>Don gia ban</TableHead>
                  <TableHead>Ton kho</TableHead>
                  <TableHead>Đơn vị tính</TableHead>
                  <TableHead className="text-right">Tac vu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.maSanPham}>
                    <TableCell>{item.maSanPham}</TableCell>
                    <TableCell>{item.tenSanPham}</TableCell>
                    <TableCell>{item.loaiSanPham?.tenLoaiSanPham ?? item.maLoaiSanPham}</TableCell>
                    <TableCell>{formatCurrency(item.donGiaBan)}</TableCell>
                    <TableCell>{formatNumber(item.tonKho)}</TableCell>
                    <TableCell>{item.donViTinh?.tenDonViTinh ?? item.maDonViTinh}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="icon-sm" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {role === "ADMIN" && (
                          <Button variant="destructive" size="icon-sm" onClick={() => setDeleting(item)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setOpenForm(false)}>
          <div className="w-full max-w-xl rounded-xl border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật" : "Thêm"} sản phẩm</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Tên sản phẩm</Label>
                  <Input value={form.tenSanPham} onChange={(e) => updateField("tenSanPham", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Loại sản phẩm</Label>
                  <Select
                    value={form.maLoaiSanPham || ""}
                    onValueChange={(value) => updateField("maLoaiSanPham", value)}
                    options={productTypes.map((type) => ({ value: type.maLoaiSanPham, label: type.tenLoaiSanPham }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Đơn vị tính</Label>
                  <Select
                    value={form.maDonViTinh || ""}
                    onValueChange={(value) => updateField("maDonViTinh", value)}
                    options={units.map((unit) => ({ value: unit.maDonViTinh, label: unit.tenDonViTinh }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Don gia mua</Label>
                  <Input value={donGiaMuaText} onChange={(e) => setDonGiaMuaText(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Ton kho ban dau</Label>
                  <Input value={tonKhoText} onChange={(e) => setTonKhoText(e.target.value)} />
                </div>
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>
                  Huy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Dang luu..." : "Lưu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Xóa sản phẩm"
        description={deleting ? `Bạn chắc chắn muốn xóa ${deleting.tenSanPham}?` : ""}
        confirmLabel="Xóa"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}

