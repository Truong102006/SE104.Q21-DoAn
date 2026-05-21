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
import type { UnitRequest, UnitResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { toPositiveNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: UnitRequest = {
  tenDonViTinh: "",
  loaiDonVi: "",
  heSoQuyDoi: 0,
  ghiChu: "",
};

export default function UnitsPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UnitResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<UnitResponse | null>(null);
  const [form, setForm] = useState<UnitRequest>(EMPTY_FORM);
  const [heSoText, setHeSoText] = useState("0");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<UnitResponse | null>(null);

  async function loadData(query?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.units.list(query?.trim() || undefined);
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được đơn vị tính"));
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
      `${item.maDonViTinh} ${item.tenDonViTinh} ${item.loaiDonVi ?? ""} ${item.ghiChu ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, keyword]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setHeSoText("0");
    setFormError(null);
    setOpenForm(true);
  }

  function openEdit(item: UnitResponse) {
    setEditing(item);
    setForm({
      maDonViTinh: item.maDonViTinh,
      tenDonViTinh: item.tenDonViTinh,
      loaiDonVi: item.loaiDonVi ?? "",
      heSoQuyDoi: item.heSoQuyDoi ?? 0,
      ghiChu: item.ghiChu ?? "",
    });
    setHeSoText(String(item.heSoQuyDoi ?? 0));
    setFormError(null);
    setOpenForm(true);
  }

  function updateField<K extends keyof UnitRequest>(key: K, value: UnitRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenDonViTinh?.trim()) {
      setFormError("Tên đơn vị tính là bắt buộc");
      return;
    }

    const heSo = toPositiveNumber(heSoText);
    if (heSo < 0) {
      setFormError("He so quy doi phải >= 0");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const payload: UnitRequest = {
        ...form,
        tenDonViTinh: form.tenDonViTinh.trim(),
        loaiDonVi: form.loaiDonVi?.trim(),
        heSoQuyDoi: heSo,
        ghiChu: form.ghiChu?.trim(),
      };

      if (editing) {
        await backendApi.units.update(editing.maDonViTinh, payload);
      } else {
        await backendApi.units.create(payload);
      }

      setOpenForm(false);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Lưu đơn vị tính thất bại"));
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!deleting) {
      return;
    }

    try {
      await backendApi.units.remove(deleting.maDonViTinh);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Xóa đơn vị tính thất bại"));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM3"
        title="Đơn vị tính"
        description={"Qu\u1ea3n l\u00fd danh m\u1ee5c \u0111\u01a1n v\u1ecb t\u00ednh"}
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
          description="Tim theo ma, ten, loai don vi"
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
                  <TableHead>Ten don vi</TableHead>
                  <TableHead>Loại đơn vị</TableHead>
                  <TableHead>He so quy doi</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Tac vu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <TableRow key={item.maDonViTinh}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.maDonViTinh}</TableCell>
                    <TableCell>{item.tenDonViTinh}</TableCell>
                    <TableCell>{item.loaiDonVi || "-"}</TableCell>
                    <TableCell>{item.heSoQuyDoi ?? 0}</TableCell>
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
              <h2 className="text-lg font-semibold">{editing ? "Cập nhật" : "Thêm"} đơn vị tính</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Tên đơn vị tính</Label>
                  <Input value={form.tenDonViTinh} onChange={(e) => updateField("tenDonViTinh", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Loại đơn vị</Label>
                  <Input value={form.loaiDonVi ?? ""} onChange={(e) => updateField("loaiDonVi", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>He so quy doi</Label>
                  <Input value={heSoText} onChange={(e) => setHeSoText(e.target.value)} />
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
        title="Xóa đơn vị tính"
        description={deleting ? `Bạn chắc chắn muốn xóa ${deleting.tenDonViTinh}?` : ""}
        confirmLabel="Xóa"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
