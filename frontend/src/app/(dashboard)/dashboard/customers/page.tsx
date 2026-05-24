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
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from "lucide-react";

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
            <>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 text-center py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.code")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.name")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.phone")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.address")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.note")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right w-24">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item, index) => (
                    <TableRow key={item.maKhachHang} className="table-row-hover border-b border-border/60">
                      <TableCell className="py-1.5 px-3 text-center font-bold text-xs text-muted-foreground">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs font-semibold">{item.maKhachHang}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs">{item.tenKhachHang}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs">{item.soDienThoaiKhachHang}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs truncate max-w-[200px]">{item.diaChiKhachHang || "-"}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs truncate max-w-[200px]">{item.ghiChu || "-"}</TableCell>
                      <TableCell className="py-1.5 px-3 text-right">
                        <div className="flex justify-end gap-1">
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center border-t border-border/60 pt-4 mt-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-lg border border-border/80 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trước
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          totalPages > 5 &&
                          page !== 1 &&
                          page !== totalPages &&
                          Math.abs(page - currentPage) > 1
                        ) {
                          if (page === 2 && currentPage > 3) {
                            return <span key="ellipsis-start" className="text-muted-foreground px-1 text-sm select-none">...</span>;
                          }
                          if (page === totalPages - 1 && currentPage < totalPages - 2) {
                            return <span key="ellipsis-end" className="text-muted-foreground px-1 text-sm select-none">...</span>;
                          }
                          return null;
                        }

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 p-0 rounded-lg select-none cursor-pointer ${
                              currentPage === page
                                ? "bg-gold-gradient text-gold-foreground font-bold border-none"
                                : "border border-border/80 hover:bg-muted/50 font-medium"
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-lg border border-border/80 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
