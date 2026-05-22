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
import { useTranslation } from "@/i18n/i18n-context";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: CustomerRequest = {
  tenKhachHang: "",
  soDienThoaiKhachHang: "",
  diaChiKhachHang: "",
  ghiChu: "",
};

export default function CustomersPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");
  const { t } = useTranslation();

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
      setError(getApiErrorMessage(err, t("customers.loadError")));
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
      setFormError(t("customers.nameRequired"));
      return;
    }

    if (!isValidPhone10Digits(form.soDienThoaiKhachHang ?? "")) {
      setFormError(t("common.phoneRequired"));
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
      setFormError(getApiErrorMessage(err, t("customers.saveError")));
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
      setError(getApiErrorMessage(err, t("customers.deleteError")));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM2"
        title={t("customers.title")}
        description={t("customers.description")}
        badges={<Badge variant="outline">{items.length} {t("common.records")}</Badge>}
        actions={
          <Button
            size="default"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/35 active:scale-95 shadow-lg shadow-blue-500/20 gap-2 h-11 px-6 rounded-xl cursor-pointer transition-all text-sm sm:text-base border-none"
            onClick={openCreate}
          >
            <Plus className="h-5 w-5 stroke-[3]" />
            {t("common.add")}
          </Button>
        }
      />

      <Card>
        <TableToolbar
          title={t("common.list")}
          description={t("customers.searchDesc")}
          search={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t("common.searchPlaceholder")}
                className="pl-9 pr-8"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          }
        />
        <CardContent className="px-0">
          {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title={t("common.emptyTitle")} description={t("common.emptyDesc")} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.stt")}</TableHead>
                  <TableHead>{t("common.code")}</TableHead>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.phone")}</TableHead>
                  <TableHead>{t("common.address")}</TableHead>
                  <TableHead>{t("common.note")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
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
              <h2 className="text-lg font-semibold">{editing ? t("customers.editTitle") : t("customers.addTitle")}</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("customers.name")}</Label>
                  <Input value={form.tenKhachHang} onChange={(e) => updateField("tenKhachHang", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.phone")}</Label>
                  <Input
                    value={form.soDienThoaiKhachHang}
                    onChange={(e) => updateField("soDienThoaiKhachHang", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.address")}</Label>
                  <Input value={form.diaChiKhachHang ?? ""} onChange={(e) => updateField("diaChiKhachHang", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("common.note")}</Label>
                  <Input value={form.ghiChu ?? ""} onChange={(e) => updateField("ghiChu", e.target.value)} />
                </div>
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t("common.saving") : t("common.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title={t("customers.deleteTitle")}
        description={deleting ? t("common.deleteConfirm").replace("{name}", deleting.tenKhachHang) : ""}
        confirmLabel={t("common.delete")}
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
