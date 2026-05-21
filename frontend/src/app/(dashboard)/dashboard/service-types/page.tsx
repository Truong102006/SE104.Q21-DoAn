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
import type { ServiceTypeRequest, ServiceTypeResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, toPositiveNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: ServiceTypeRequest = {
  tenLoaiDichVu: "",
  donGiaDichVu: 0,
};

export default function ServiceTypesPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ServiceTypeResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ServiceTypeResponse | null>(null);
  const [form, setForm] = useState<ServiceTypeRequest>(EMPTY_FORM);
  const [giaText, setGiaText] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<ServiceTypeResponse | null>(null);

  async function loadData(query?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.serviceTypes.list(query?.trim() || undefined);
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được loại dịch vụ"));
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
    return items.filter((item) => `${item.maLoaiDichVu} ${item.tenLoaiDichVu}`.toLowerCase().includes(q));
  }, [items, keyword]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setGiaText("0");
    setFormError(null);
    setOpenForm(true);
  }

  function openEdit(item: ServiceTypeResponse) {
    setEditing(item);
    setForm({
      maLoaiDichVu: item.maLoaiDichVu,
      tenLoaiDichVu: item.tenLoaiDichVu,
      donGiaDichVu: item.donGiaDichVu,
    });
    setGiaText(String(item.donGiaDichVu ?? 0));
    setFormError(null);
    setOpenForm(true);
  }

  function updateField<K extends keyof ServiceTypeRequest>(key: K, value: ServiceTypeRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenLoaiDichVu?.trim()) {
      setFormError("Tên loại dịch vụ là bắt buộc");
      return;
    }

    const gia = toPositiveNumber(giaText);
    if (gia < 0) {
      setFormError("Don gia phải >= 0");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const payload: ServiceTypeRequest = {
        ...form,
        tenLoaiDichVu: form.tenLoaiDichVu.trim(),
        donGiaDichVu: gia,
      };

      if (editing) {
        await backendApi.serviceTypes.update(editing.maLoaiDichVu, payload);
      } else {
        await backendApi.serviceTypes.create(payload);
      }

      setOpenForm(false);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Lưu loại dịch vụ thất bại"));
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!deleting) {
      return;
    }

    try {
      await backendApi.serviceTypes.remove(deleting.maLoaiDichVu);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Xóa loại dịch vụ thất bại"));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM4"
        title="Loại dịch vụ"
        description={"Qu\u1ea3n l\u00fd danh m\u1ee5c lo\u1ea1i d\u1ecbch v\u1ee5"}
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
          description="Tìm theo mã, tên loại dịch vụ"
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
                  <TableHead>Tên loại dịch vụ</TableHead>
                  <TableHead>Đơn giá dịch vụ</TableHead>
                  <TableHead className="text-right">Tac vu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <TableRow key={item.maLoaiDichVu}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.maLoaiDichVu}</TableCell>
                    <TableCell>{item.tenLoaiDichVu}</TableCell>
                    <TableCell>{formatCurrency(item.donGiaDichVu)}</TableCell>
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
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật" : "Thêm"} loại dịch vụ</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Tên loại dịch vụ</Label>
                  <Input value={form.tenLoaiDichVu} onChange={(e) => updateField("tenLoaiDichVu", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Đơn giá dịch vụ</Label>
                  <Input value={giaText} onChange={(e) => setGiaText(e.target.value)} />
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
        title="Xóa loại dịch vụ"
        description={deleting ? `Bạn chắc chắn muốn xóa ${deleting.tenLoaiDichVu}?` : ""}
        confirmLabel="Xóa"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
