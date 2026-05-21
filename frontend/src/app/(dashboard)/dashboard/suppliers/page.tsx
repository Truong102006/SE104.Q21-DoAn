"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog, EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type { SupplierRequest, SupplierResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { isValidPhone10Digits } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: SupplierRequest = {
  tenNhaCungCap: "",
  soDienThoai: "",
  diaChi: "",
  ghiChu: "",
};

export default function SuppliersPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SupplierResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<SupplierResponse | null>(null);
  const [form, setForm] = useState<SupplierRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<SupplierResponse | null>(null);

  async function loadData(query?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.suppliers.list(query?.trim() || undefined);
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được nhà cung cấp"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter((item) =>
      `${item.maNhaCungCap} ${item.tenNhaCungCap} ${item.soDienThoai} ${item.diaChi ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, keyword]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setOpenForm(true);
  }

  function openEdit(item: SupplierResponse) {
    setEditing(item);
    setForm({
      maNhaCungCap: item.maNhaCungCap,
      tenNhaCungCap: item.tenNhaCungCap,
      soDienThoai: item.soDienThoai,
      diaChi: item.diaChi ?? "",
      ghiChu: item.ghiChu ?? "",
    });
    setFormError(null);
    setOpenForm(true);
  }

  function updateField<K extends keyof SupplierRequest>(key: K, value: SupplierRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenNhaCungCap?.trim()) {
      setFormError("Ten nhà cung cấp là bắt buộc");
      return;
    }

    if (!isValidPhone10Digits(form.soDienThoai ?? "")) {
      setFormError("Số điện thoại phải đúng 10 chữ số");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await backendApi.suppliers.update(editing.maNhaCungCap, {
          ...form,
          tenNhaCungCap: form.tenNhaCungCap.trim(),
          soDienThoai: form.soDienThoai.trim(),
          diaChi: form.diaChi?.trim(),
          ghiChu: form.ghiChu?.trim(),
        });
      } else {
        await backendApi.suppliers.create({
          ...form,
          tenNhaCungCap: form.tenNhaCungCap.trim(),
          soDienThoai: form.soDienThoai.trim(),
          diaChi: form.diaChi?.trim(),
          ghiChu: form.ghiChu?.trim(),
        });
      }

      setOpenForm(false);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Lưu nhà cung cấp thất bại"));
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!deleting) {
      return;
    }

    try {
      await backendApi.suppliers.remove(deleting.maNhaCungCap);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Xóa nhà cung cấp thất bại"));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM1"
        title="Nhà cung cấp"
        description="Quản lý danh mục nhà cung cấp"
        badges={<Badge variant="outline">{items.length} ban ghi</Badge>}
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
          description="Tim theo ma, ten, so dien thoai"
          search={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Nhap từ khóa..." className="pl-9" />
            </div>
          }
        />
        <CardContent className="px-0">
          {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Đang tải...</p>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Không có dữ liệu" description="Thử đổi từ khóa hoac thêm mới" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Ma</TableHead>
                  <TableHead>Ten</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Tac vu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <TableRow key={item.maNhaCungCap}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.maNhaCungCap}</TableCell>
                    <TableCell>{item.tenNhaCungCap}</TableCell>
                    <TableCell>{item.soDienThoai}</TableCell>
                    <TableCell>{item.diaChi || "-"}</TableCell>
                    <TableCell>{item.ghiChu || "-"}</TableCell>
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
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật" : "Thêm"} nhà cung cấp</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Ten nhà cung cấp</Label>
                  <Input value={form.tenNhaCungCap} onChange={(e) => updateField("tenNhaCungCap", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input value={form.soDienThoai} onChange={(e) => updateField("soDienThoai", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Địa chỉ</Label>
                  <Input value={form.diaChi ?? ""} onChange={(e) => updateField("diaChi", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Ghi chú</Label>
                  <Input value={form.ghiChu ?? ""} onChange={(e) => updateField("ghiChu", e.target.value)} />
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
        title="Xóa nhà cung cấp"
        description={deleting ? `Bạn chắc chắn muốn xóa ${deleting.tenNhaCungCap}?` : ""}
        confirmLabel="Xóa"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
