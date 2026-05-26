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
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type { UserGroupResponse, UserRequest, UserResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { useToastStore } from "@/stores/toast-store";
import { useTranslation } from "@/i18n/i18n-context";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

const EMPTY_FORM: UserRequest = {
  tenDangNhap: "",
  matKhau: "",
  maNhom: "",
  isActive: true,
};

export default function StaffPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [groups, setGroups] = useState<UserGroupResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<UserResponse | null>(null);

  async function loadData(search?: string) {
    setLoading(true);
    try {
      const [userData, groupData] = await Promise.all([
        backendApi.users.list(search?.trim() || undefined),
        backendApi.userGroups.list(),
      ]);
      setUsers(userData);
      setGroups(groupData);
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("staff.loadError")));
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
      return users;
    }
    return users.filter((item) => `${item.tenDangNhap} ${item.maNhom}`.toLowerCase().includes(q));
  }, [users, keyword]);

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
    setForm({ ...EMPTY_FORM, maNhom: groups[0]?.maNhom ?? "", isActive: true });
    setOpenForm(true);
  }

  function openEdit(item: UserResponse) {
    setEditing(item);
    setForm({
      tenDangNhap: item.tenDangNhap,
      matKhau: "",
      maNhom: item.maNhom,
      isActive: item.isActive !== false,
    });
    setOpenForm(true);
  }

  function updateField<K extends keyof UserRequest>(key: K, value: UserRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function toggleActive(item: UserResponse) {
    try {
      const newActive = item.isActive === false ? true : false;
      const payload: UserRequest = {
        tenDangNhap: item.tenDangNhap,
        maNhom: item.maNhom,
        isActive: newActive,
      };

      await backendApi.users.update(item.tenDangNhap, payload);
      setUsers((prev) =>
        prev.map((u) => (u.tenDangNhap === item.tenDangNhap ? { ...u, isActive: newActive } : u))
      );
      useToastStore.getState().success(
        newActive ? "Đã kích hoạt tài khoản nhân viên!" : "Đã ngưng kích hoạt tài khoản nhân viên!"
      );
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, "Không thể cập nhật trạng thái tài khoản nhân viên"));
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenDangNhap?.trim()) {
      useToastStore.getState().error(t("staff.usernameRequired"));
      return;
    }

    if (!editing && !form.matKhau?.trim()) {
      useToastStore.getState().error(t("staff.passwordRequired"));
      return;
    }

    if (!form.maNhom) {
      useToastStore.getState().error(t("staff.groupRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const payload: UserRequest = {
        tenDangNhap: form.tenDangNhap.trim(),
        matKhau: form.matKhau?.trim() || undefined,
        maNhom: form.maNhom,
        isActive: form.isActive !== false,
      };

      if (editing) {
        await backendApi.users.update(editing.tenDangNhap, payload);
      } else {
        await backendApi.users.create(payload);
      }

      setOpenForm(false);
      await loadData();
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("staff.saveError")));
    } finally {
      setSubmitting(false);
    }
  }

  async function doDelete() {
    if (!deleting) {
      return;
    }

    try {
      await backendApi.users.remove(deleting.tenDangNhap);
      setDeleting(null);
      await loadData();
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("staff.deleteError")));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <TableToolbar
          title={t("staff.title")}
          description={t("staff.description")}
          meta={<Badge variant="outline">{users.length} {t("staff.accounts")}</Badge>}
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
              {t("staff.addAccount")}
            </Button>
          }
        />

        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title={t("common.emptyTitle")} description={t("staff.emptyDesc")} />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 text-center py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("staff.username")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("staff.groupCode")}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider pl-4">{t("common.status") || "Trạng thái"}</TableHead>
                    <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right w-24">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item, index) => (
                    <TableRow
                      key={item.tenDangNhap}
                      className={cn("table-row-hover border-b border-border/60", item.isActive === false ? "opacity-60 bg-slate-50/40 dark:bg-slate-900/10" : "")}
                    >
                      <TableCell className="py-1.5 px-3 text-center font-bold text-xs text-muted-foreground">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs font-semibold text-foreground">{item.tenDangNhap}</TableCell>
                      <TableCell className="py-1.5 px-3 text-xs">{item.maNhom}</TableCell>
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
                          <Button variant="destructive" size="icon-xs" className="h-7 w-7" onClick={() => setDeleting(item)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
          <div className="w-full max-w-lg rounded-xl border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-semibold">{editing ? t("staff.editTitle") : t("staff.addTitle")}</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-3 px-5 py-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label>{t("staff.username")}</Label>
                <Input
                  value={form.tenDangNhap}
                  onChange={(e) => updateField("tenDangNhap", e.target.value)}
                  readOnly={Boolean(editing)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("staff.password")}</Label>
                <Input
                  type="password"
                  value={form.matKhau}
                  onChange={(e) => updateField("matKhau", e.target.value)}
                  placeholder={editing ? t("staff.newPasswordPlaceholder") : t("staff.passwordPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("staff.userGroup")}</Label>
                <Select
                  value={form.maNhom}
                  onValueChange={(value) => updateField("maNhom", value)}
                  options={groups.map((group) => ({ value: group.maNhom, label: `${group.maNhom} - ${group.tenNhom}` }))}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
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
        title={t("staff.deleteTitle")}
        description={deleting ? t("common.deleteConfirm").replace("{name}", deleting.tenDangNhap) : ""}
        confirmLabel={t("common.delete")}
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}

