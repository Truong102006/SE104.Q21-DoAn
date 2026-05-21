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
import type { ProductTypeRequest, ProductTypeResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { toPositiveNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: ProductTypeRequest = {
  tenLoaiSanPham: "",
  tiLeLoiNhuan: 0,
};

export default function ProductTypesPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductTypeResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ProductTypeResponse | null>(null);
  const [form, setForm] = useState<ProductTypeRequest>(EMPTY_FORM);
  const [tiLeText, setTiLeText] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<ProductTypeResponse | null>(null);

  async function loadData(query?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.productTypes.list(query?.trim() || undefined);
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được loại sản phẩm"));
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
    return items.filter((item) => `${item.maLoaiSanPham} ${item.tenLoaiSanPham}`.toLowerCase().includes(q));
  }, [items, keyword]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setTiLeText("0");
    setFormError(null);
    setOpenForm(true);
  }

  function openEdit(item: ProductTypeResponse) {
    setEditing(item);
    setForm({
      maLoaiSanPham: item.maLoaiSanPham,
      tenLoaiSanPham: item.tenLoaiSanPham,
      tiLeLoiNhuan: item.tiLeLoiNhuan,
    });
    setTiLeText(String(item.tiLeLoiNhuan ?? 0));
    setFormError(null);
    setOpenForm(true);
  }

  function updateField<K extends keyof ProductTypeRequest>(key: K, value: ProductTypeRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenLoaiSanPham?.trim()) {
      setFormError("Tên loại sản phẩm là bắt buộc");
      return;
    }

    const tiLe = toPositiveNumber(tiLeText);
    if (tiLe < 0) {
      setFormError("Ti le lợi nhuận phải >= 0");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const payload: ProductTypeRequest = {
        ...form,
        tenLoaiSanPham: form.tenLoaiSanPham.trim(),
        tiLeLoiNhuan: tiLe,
      };

      if (editing) {
        await backendApi.productTypes.update(editing.maLoaiSanPham, payload);
      } else {
        await backendApi.productTypes.create(payload);
      }

      setOpenForm(false);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Lưu loại sản phẩm thất bại"));
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!deleting) {
      return;
    }

    try {
      await backendApi.productTypes.remove(deleting.maLoaiSanPham);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Xóa loại sản phẩm thất bại"));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={"Q\u01106/Q\u011013"}
        title="Loại sản phẩm"
        description="Quản lý tỉ lệ lợi nhuận theo loai"
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
          description="Tim theo ma, ten loai"
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
                  <TableHead>Ten loai</TableHead>
                  <TableHead>Ti le lợi nhuận (%)</TableHead>
                  <TableHead className="text-right">Tac vu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <TableRow key={item.maLoaiSanPham}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.maLoaiSanPham}</TableCell>
                    <TableCell>{item.tenLoaiSanPham}</TableCell>
                    <TableCell>{item.tiLeLoiNhuan}</TableCell>
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
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật" : "Thêm"} loại sản phẩm</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Tên loại sản phẩm</Label>
                  <Input value={form.tenLoaiSanPham} onChange={(e) => updateField("tenLoaiSanPham", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ti le lợi nhuận (%)</Label>
                  <Input value={tiLeText} onChange={(e) => setTiLeText(e.target.value)} />
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
        title="Xóa loại sản phẩm"
        description={deleting ? `Bạn chắc chắn muốn xóa ${deleting.tenLoaiSanPham}?` : ""}
        confirmLabel="Xóa"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
