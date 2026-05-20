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
import type { CustomerRequest, CustomerResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { isValidPhone10Digits } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: CustomerRequest = {
  tenKhachHang: "",
  soDienThoaiKhachHang: "",
  diaChiKhachHang: "",
  ghiChu: "",
};

export default function CustomersPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CustomerResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<CustomerResponse | null>(null);
  const [form, setForm] = useState<CustomerRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<CustomerResponse | null>(null);

  async function loadData(query?: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.customers.list(query?.trim() || undefined);
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Khong tai duoc khach hang"));
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
      `${item.maKhachHang} ${item.tenKhachHang} ${item.soDienThoaiKhachHang} ${item.diaChiKhachHang ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [items, keyword]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setOpenForm(true);
  }

  function openEdit(item: CustomerResponse) {
    setEditing(item);
    setForm({
      maKhachHang: item.maKhachHang,
      tenKhachHang: item.tenKhachHang,
      soDienThoaiKhachHang: item.soDienThoaiKhachHang,
      diaChiKhachHang: item.diaChiKhachHang ?? "",
      ghiChu: item.ghiChu ?? "",
    });
    setFormError(null);
    setOpenForm(true);
  }

  function updateField<K extends keyof CustomerRequest>(key: K, value: CustomerRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenKhachHang?.trim()) {
      setFormError("Ten khach hang la bat buoc");
      return;
    }

    if (!isValidPhone10Digits(form.soDienThoaiKhachHang ?? "")) {
      setFormError("So dien thoai phai dung 10 chu so");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await backendApi.customers.update(editing.maKhachHang, {
          ...form,
          tenKhachHang: form.tenKhachHang.trim(),
          soDienThoaiKhachHang: form.soDienThoaiKhachHang.trim(),
          diaChiKhachHang: form.diaChiKhachHang?.trim(),
          ghiChu: form.ghiChu?.trim(),
        });
      } else {
        await backendApi.customers.create({
          ...form,
          tenKhachHang: form.tenKhachHang.trim(),
          soDienThoaiKhachHang: form.soDienThoaiKhachHang.trim(),
          diaChiKhachHang: form.diaChiKhachHang?.trim(),
          ghiChu: form.ghiChu?.trim(),
        });
      }

      setOpenForm(false);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Luu khach hang that bai"));
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!deleting) {
      return;
    }

    try {
      await backendApi.customers.remove(deleting.maKhachHang);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Xoa khach hang that bai"));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM2"
        title="Khach hang"
        description="Quan ly danh muc khach hang"
        badges={<Badge variant="outline">{items.length} ban ghi</Badge>}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Them
          </Button>
        }
      />

      <Card>
        <TableToolbar
          title="Danh sach"
          description="Tim theo ma, ten, so dien thoai"
          search={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Nhap tu khoa..." className="pl-9" />
            </div>
          }
        />
        <CardContent className="px-0">
          {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Dang tai...</p>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Khong co du lieu" description="Thu doi tu khoa hoac them moi" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Ma</TableHead>
                  <TableHead>Ten</TableHead>
                  <TableHead>So dien thoai</TableHead>
                  <TableHead>Dia chi</TableHead>
                  <TableHead>Ghi chu</TableHead>
                  <TableHead className="text-right">Tac vu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <TableRow key={item.maKhachHang}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.maKhachHang}</TableCell>
                    <TableCell>{item.tenKhachHang}</TableCell>
                    <TableCell>{item.soDienThoaiKhachHang}</TableCell>
                    <TableCell>{item.diaChiKhachHang || "-"}</TableCell>
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
              <h2 className="text-lg font-semibold">{editing ? "Cap nhat" : "Them"} khach hang</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Ten khach hang</Label>
                  <Input value={form.tenKhachHang} onChange={(e) => updateField("tenKhachHang", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>So dien thoai</Label>
                  <Input
                    value={form.soDienThoaiKhachHang}
                    onChange={(e) => updateField("soDienThoaiKhachHang", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dia chi</Label>
                  <Input value={form.diaChiKhachHang ?? ""} onChange={(e) => updateField("diaChiKhachHang", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Ghi chu</Label>
                  <Input value={form.ghiChu ?? ""} onChange={(e) => updateField("ghiChu", e.target.value)} />
                </div>
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>
                  Huy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Dang luu..." : "Luu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Xoa khach hang"
        description={deleting ? `Ban chac chan muon xoa ${deleting.tenKhachHang}?` : ""}
        confirmLabel="Xoa"
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
