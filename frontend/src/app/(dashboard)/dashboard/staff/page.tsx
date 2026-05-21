"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog, EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type { UserGroupResponse, UserRequest, UserResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { useTranslation } from "@/i18n/i18n-context";
import { Pencil, Plus, Trash2, X } from "lucide-react";

const EMPTY_FORM: UserRequest = {
  tenDangNhap: "",
  matKhau: "",
  maNhom: "",
};

export default function StaffPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [groups, setGroups] = useState<UserGroupResponse[]>([]);
  const [keyword, setKeyword] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [form, setForm] = useState<UserRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<UserResponse | null>(null);

  async function loadData(search?: string) {
    setLoading(true);
    setError(null);
    try {
      const [userData, groupData] = await Promise.all([
        backendApi.users.list(search?.trim() || undefined),
        backendApi.userGroups.list(),
      ]);
      setUsers(userData);
      setGroups(groupData);
    } catch (err) {
      setError(getApiErrorMessage(err, t("staff.loadError")));
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

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, maNhom: groups[0]?.maNhom ?? "" });
    setFormError(null);
    setOpenForm(true);
  }

  function openEdit(item: UserResponse) {
    setEditing(item);
    setForm({
      tenDangNhap: item.tenDangNhap,
      matKhau: "",
      maNhom: item.maNhom,
    });
    setFormError(null);
    setOpenForm(true);
  }

  function updateField<K extends keyof UserRequest>(key: K, value: UserRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.tenDangNhap?.trim()) {
      setFormError(t("staff.usernameRequired"));
      return;
    }

    if (!form.matKhau?.trim()) {
      setFormError(t("staff.passwordRequired"));
      return;
    }

    if (!form.maNhom) {
      setFormError(t("staff.groupRequired"));
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const payload: UserRequest = {
        tenDangNhap: form.tenDangNhap.trim(),
        matKhau: form.matKhau,
        maNhom: form.maNhom,
      };

      if (editing) {
        await backendApi.users.update(editing.tenDangNhap, payload);
      } else {
        await backendApi.users.create(payload);
      }

      setOpenForm(false);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("staff.saveError")));
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
      setError(getApiErrorMessage(err, t("staff.deleteError")));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Admin"
        title={t("staff.title")}
        description={t("staff.description")}
        badges={<Badge variant="outline">{users.length} {t("staff.accounts")}</Badge>}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {t("staff.addAccount")}
          </Button>
        }
      />

      <Card>
        <TableToolbar
          title={t("common.list")}
          description={t("staff.searchDesc")}
          search={<Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t("common.searchPlaceholder")} />}
          actions={
            <Button size="sm" variant="outline" onClick={() => loadData(keyword)}>
              {t("common.search")}
            </Button>
          }
        />

        <CardContent className="px-0">
          {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title={t("common.emptyTitle")} description={t("staff.emptyDesc")} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">{t("common.stt")}</TableHead>
                  <TableHead>{t("staff.username")}</TableHead>
                  <TableHead>{t("staff.groupCode")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, index) => (
                  <TableRow key={item.tenDangNhap}>
                    <TableCell className="font-semibold text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>{item.tenDangNhap}</TableCell>
                    <TableCell>{item.maNhom}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="icon-sm" onClick={() => openEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="destructive" size="icon-sm" onClick={() => setDeleting(item)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
