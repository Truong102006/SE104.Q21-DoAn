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
import { useToastStore } from "@/stores/toast-store";
import { useTranslation } from "@/i18n/i18n-context";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: UnitRequest = {
  tenDonViTinh: "",
  loaiDonVi: "",
  heSoQuyDoi: 0,
  ghiChu: "",
};

export default function UnitsPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UnitResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<UnitResponse | null>(null);
  const [form, setForm] = useState<UnitRequest>(EMPTY_FORM);
  const [heSoText, setHeSoText] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<UnitResponse | null>(null);

  async function loadData(query?: string) {
    setLoading(true);
    try {
      const data = await backendApi.units.list(query?.trim() || undefined);
      setItems(data);
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("units.loadError")));
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
    setForm({ ...EMPTY_FORM, isActive: true });
    setHeSoText("0");
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
      isActive: item.isActive !== false,
    });
    setHeSoText(String(item.heSoQuyDoi ?? 0));
    setOpenForm(true);
  }

  function updateField<K extends keyof UnitRequest>(key: K, value: UnitRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function toggleActive(item: UnitResponse) {
    try {
      const newActive = item.isActive === false ? true : false;
      const payload: UnitRequest = {
        tenDonViTinh: item.tenDonViTinh,
        loaiDonVi: item.loaiDonVi,
        heSoQuyDoi: item.heSoQuyDoi,
        ghiChu: item.ghiChu,
        isActive: newActive,
      };

      await backendApi.units.update(item.maDonViTinh, payload);
      setItems((prev) =>
        prev.map((u) => (u.maDonViTinh === item.maDonViTinh ? { ...u, isActive: newActive } : u))
      );
      useToastStore.getState().success(
        newActive ? "Đã kích hoạt đơn vị tính!" : "Đã ngưng kích hoạt đơn vị tính!"
      );
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, "Không thể cập nhật trạng thái đơn vị tính"));
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenDonViTinh?.trim()) {
      useToastStore.getState().error(t("units.nameRequired"));
      return;
    }

    const heSo = toPositiveNumber(heSoText);
    if (heSo < 0) {
      useToastStore.getState().error(t("units.rateInvalid"));
      return;
    }

    setSubmitting(true);
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
      useToastStore.getState().error(getApiErrorMessage(err, t("units.saveError")));
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
      useToastStore.getState().error(getApiErrorMessage(err, t("units.deleteError")));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM3"
        title={t("units.title")}
        description={t("units.description")}
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
          description={t("units.searchDesc")}
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
                  <TableHead className="w-16 pl-5">{t("common.stt")}</TableHead>
                  <TableHead className="w-24">{t("common.code")}</TableHead>
                  <TableHead className="w-48">{t("units.name")}</TableHead>
                  <TableHead className="w-36">{t("units.unitType")}</TableHead>
                  <TableHead className="w-36">{t("units.conversionRate")}</TableHead>
                  <TableHead className="min-w-[180px]">{t("common.note")}</TableHead>
                  <TableHead className="w-64 pl-4">{t("common.status") || "Trạng thái"}</TableHead>
                  <TableHead className="w-28 pr-5 text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <TableRow key={item.maDonViTinh} className={item.isActive === false ? "opacity-60 bg-slate-50/40 dark:bg-slate-900/10" : ""}>
                    <TableCell className="pl-5">{index + 1}</TableCell>
                    <TableCell>{item.maDonViTinh}</TableCell>
                    <TableCell className="font-semibold text-foreground">{item.tenDonViTinh}</TableCell>
                    <TableCell>{item.loaiDonVi || "-"}</TableCell>
                    <TableCell>{item.heSoQuyDoi ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[220px]" title={item.ghiChu ?? ""}>
                      {item.ghiChu || "-"}
                    </TableCell>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(item)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            item.isActive !== false ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          aria-label="Toggle active status"
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              item.isActive !== false ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-semibold select-none ${item.isActive !== false ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                          {item.isActive !== false ? "Đang hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-1.5">
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
              <h2 className="text-lg font-semibold">{editing ? t("units.editTitle") : t("units.addTitle")}</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("units.name")}</Label>
                  <Input value={form.tenDonViTinh} onChange={(e) => updateField("tenDonViTinh", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("units.unitType")}</Label>
                  <Input value={form.loaiDonVi ?? ""} onChange={(e) => updateField("loaiDonVi", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("units.conversionRate")}</Label>
                  <Input value={heSoText} onChange={(e) => setHeSoText(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("common.note")}</Label>
                  <Input value={form.ghiChu ?? ""} onChange={(e) => updateField("ghiChu", e.target.value)} />
                </div>
                <div className="flex items-center space-x-2 pt-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive !== false}
                    onChange={(e) => updateField("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    Kích hoạt hoạt động
                  </Label>
                </div>
              </div>

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
        title={t("units.deleteTitle")}
        description={deleting ? t("common.deleteConfirm").replace("{name}", deleting.tenDonViTinh) : ""}
        confirmLabel={t("common.delete")}
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
