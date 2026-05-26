"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog, EmptyState, TableToolbar } from "@/components/dashboard/management";
import { Pagination } from "@/components/dashboard/pagination";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type { ServiceTypeRequest, ServiceTypeResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, toPositiveNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";
import { useTranslation } from "@/i18n/i18n-context";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: ServiceTypeRequest = {
  tenLoaiDichVu: "",
  donGiaDichVu: 0,
  isActive: true,
};

export default function ServiceTypesPage() {
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServiceTypeResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ServiceTypeResponse | null>(null);
  const [form, setForm] = useState<ServiceTypeRequest>(EMPTY_FORM);
  const [giaText, setGiaText] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<ServiceTypeResponse | null>(null);

  async function loadData(query?: string) {
    setLoading(true);
    try {
      const data = await backendApi.serviceTypes.list(query?.trim() || undefined);
      setItems(data);
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("serviceTypes.loadError")));
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

  // Reset page when keyword changes
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, isActive: true });
    setGiaText("0");
    setOpenForm(true);
  }

  function openEdit(item: ServiceTypeResponse) {
    setEditing(item);
    setForm({
      maLoaiDichVu: item.maLoaiDichVu,
      tenLoaiDichVu: item.tenLoaiDichVu,
      donGiaDichVu: item.donGiaDichVu,
      isActive: item.isActive !== false,
    });
    setGiaText(String(item.donGiaDichVu ?? 0));
    setOpenForm(true);
  }

  function updateField<K extends keyof ServiceTypeRequest>(key: K, value: ServiceTypeRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function toggleActive(item: ServiceTypeResponse) {
    try {
      const newActive = item.isActive === false ? true : false;
      const payload: ServiceTypeRequest = {
        tenLoaiDichVu: item.tenLoaiDichVu,
        donGiaDichVu: item.donGiaDichVu,
        isActive: newActive,
      };

      await backendApi.serviceTypes.update(item.maLoaiDichVu, payload);
      setItems((prev) =>
        prev.map((u) => (u.maLoaiDichVu === item.maLoaiDichVu ? { ...u, isActive: newActive } : u))
      );
      useToastStore.getState().success(
        newActive ? "Đã kích hoạt loại dịch vụ!" : "Đã ngưng kích hoạt loại dịch vụ!"
      );
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, "Không thể cập nhật trạng thái loại dịch vụ"));
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenLoaiDichVu?.trim()) {
      useToastStore.getState().error(t("serviceTypes.nameRequired"));
      return;
    }

    const gia = toPositiveNumber(giaText);
    if (gia < 0) {
      useToastStore.getState().error(t("serviceTypes.priceInvalid"));
      return;
    }

    setSubmitting(true);
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
      useToastStore.getState().error(getApiErrorMessage(err, t("serviceTypes.saveError")));
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
      useToastStore.getState().error(getApiErrorMessage(err, t("serviceTypes.deleteError")));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <TableToolbar
          title={t("serviceTypes.title")}
          description={t("serviceTypes.description")}
          meta={<Badge variant="outline">{items.length} {t("common.records")}</Badge>}
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
          actions={
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/35 active:scale-95 shadow-md shadow-blue-500/20 gap-1.5 h-9 px-4 rounded-xl cursor-pointer transition-all text-xs border-none"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              {t("common.add")}
            </Button>
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
            <>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 text-center py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.code")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("serviceTypes.name")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("serviceTypes.price")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider pl-4">{t("common.status") || "Trạng thái"}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right w-24">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item, index) => (
                    <TableRow
                      key={item.maLoaiDichVu}
                      className={cn("table-row-hover border-b border-border/60", item.isActive === false ? "opacity-60 bg-slate-50/40 dark:bg-slate-900/10" : "")}
                    >
                      <TableCell className="py-1.5 px-3 text-center font-bold text-xs text-muted-foreground">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs font-semibold">{item.maLoaiDichVu}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs font-semibold text-foreground">{item.tenLoaiDichVu}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs">{formatCurrency(item.donGiaDichVu)}</TableCell>
                      <TableCell className="py-1.5 px-3 pl-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleActive(item)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              item.isActive !== false ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                            aria-label="Toggle active status"
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                item.isActive !== false ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 px-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="icon-xs" className="h-7 w-7" onClick={() => openEdit(item)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          {role === "ADMIN" && (
                            <Button variant="destructive" size="icon-xs" className="h-7 w-7" onClick={() => setDeleting(item)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-center border-t border-border/60 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setOpenForm(false)}>
          <div className="w-full max-w-xl rounded-xl border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-semibold">{editing ? t("serviceTypes.editTitle") : t("serviceTypes.addTitle")}</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>{t("serviceTypes.name")}</Label>
                  <Input value={form.tenLoaiDichVu} onChange={(e) => updateField("tenLoaiDichVu", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("serviceTypes.price")}</Label>
                  <Input value={giaText} onChange={(e) => setGiaText(e.target.value)} />
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
        title={t("serviceTypes.deleteTitle")}
        description={deleting ? t("common.deleteConfirm").replace("{name}", deleting.tenLoaiDichVu) : ""}
        confirmLabel={t("common.delete")}
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}

