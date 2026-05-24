"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog, EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type {
  ProductRequest,
  ProductResponse,
  ProductTypeResponse,
  UnitResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber, toPositiveInt, toPositiveNumber } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";
import { useTranslation } from "@/i18n/i18n-context";
import { Pencil, Plus, Search, Trash2, X, Loader2 } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRef } from "react";

const productSchema = z.object({
  tenSanPham: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  maLoaiSanPham: z.string().min(1, "Loại sản phẩm là bắt buộc"),
  maDonViTinh: z.string().min(1, "Đơn vị tính là bắt buộc"),
  donGiaMua: z.number().min(0, "Đơn giá mua phải >= 0"),
  tonKho: z.number().int().min(0, "Tồn kho phải >= 0"),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const PAGE_SIZE = 20;

function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border/80 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {[1, 2, 3, 4, 5, 6, 7].map(i => <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map(i => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6, 7].map(j => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const EMPTY_FORM: ProductRequest = {
  tenSanPham: "",
  maLoaiSanPham: "",
  maDonViTinh: "",
  donGiaMua: 0,
  tonKho: 0,
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const role = useAuthStore((state) => state.user?.role ?? "STAFF");
  const { t } = useTranslation();
  const isSearchMode = false;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ProductResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [selectedType, setSelectedType] = useState("");

  const [productTypes, setProductTypes] = useState<ProductTypeResponse[]>([]);
  const [units, setUnits] = useState<UnitResponse[]>([]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ProductResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<ProductResponse | null>(null);


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      tenSanPham: "",
      maLoaiSanPham: "",
      maDonViTinh: "",
      donGiaMua: 0,
      tonKho: 0,
      isActive: true,
    },
  });


  async function loadOptions() {
    try {
      const [types, unitList] = await Promise.all([backendApi.productTypes.list(), backendApi.units.list()]);
      setProductTypes(types);
      setUnits(unitList);
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("products.loadOptionsError")));
    }
  }

  async function loadData(nextPage = page, nextKeyword = keyword, nextType = selectedType) {
    setLoading(true);
    try {
      const data = await backendApi.products.list({
        keyword: nextKeyword.trim() || undefined,
        productTypeId: nextType || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      });
      setItems(data.content);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setPage(data.number ?? nextPage);
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("products.loadError")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced reactive search when keyword or product type changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(0, keyword, selectedType);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, selectedType]);

  function openCreate() {
    setEditing(null);
    form.reset({
      tenSanPham: "",
      maLoaiSanPham: productTypes[0]?.maLoaiSanPham ?? "",
      maDonViTinh: units.filter(u => u.isActive !== false)[0]?.maDonViTinh ?? units[0]?.maDonViTinh ?? "",
      donGiaMua: 0,
      tonKho: 0,
      isActive: true,
    });
    setOpenForm(true);
  }

  function openEdit(item: ProductResponse) {
    setEditing(item);
    form.reset({
      tenSanPham: item.tenSanPham,
      maLoaiSanPham: item.maLoaiSanPham,
      maDonViTinh: item.maDonViTinh,
      donGiaMua: Number(item.donGiaMua ?? 0),
      tonKho: Number(item.tonKho ?? 0),
      isActive: item.isActive !== false,
    });
    setOpenForm(true);
  }

  async function toggleActive(item: ProductResponse) {
    try {
      const newActive = item.isActive === false ? true : false;
      const payload: ProductRequest = {
        maSanPham: item.maSanPham,
        tenSanPham: item.tenSanPham,
        maLoaiSanPham: item.maLoaiSanPham,
        maDonViTinh: item.maDonViTinh,
        donGiaMua: Number(item.donGiaMua ?? 0),
        tonKho: Number(item.tonKho ?? 0),
        isActive: newActive,
      };

      await backendApi.products.update(item.maSanPham, payload);
      setItems((prev) =>
        prev.map((p) => (p.maSanPham === item.maSanPham ? { ...p, isActive: newActive } : p))
      );
      useToastStore.getState().success(
        newActive ? "Đã kích hoạt sản phẩm!" : "Đã ngưng kích hoạt sản phẩm!"
      );
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, "Không thể cập nhật trạng thái sản phẩm"));
    }
  }

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setSubmitting(true);
    try {
      const payload: ProductRequest = {
        ...data,
        tenSanPham: data.tenSanPham.trim(),
        maSanPham: editing?.maSanPham,
      };

      if (editing) {
        await backendApi.products.update(editing.maSanPham, payload);
      } else {
        await backendApi.products.create(payload);
      }

      useToastStore.getState().success(editing ? "Đã cập nhật sản phẩm!" : "Đã thêm sản phẩm mới!");
      setOpenForm(false);
      await loadData();
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("products.saveError")));
    } finally {
      setSubmitting(false);
    }
  };

  async function doDelete() {
    if (!deleting) {
      return;
    }

    try {
      await backendApi.products.remove(deleting.maSanPham);
      setDeleting(null);
      await loadData();
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("products.deleteError")));
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={isSearchMode ? "Tra cứu" : "BM8"}
        title={isSearchMode ? t("nav.productSearch") : t("products.title")}
        description={isSearchMode ? "Tra cứu thông tin sản phẩm và tình trạng tồn kho trong hệ thống" : t("products.description")}
        badges={<Badge variant="outline">{t("common.page")} {page + 1}/{totalPages}</Badge>}
        actions={
          !isSearchMode && (
            <Button
              size="default"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/35 active:scale-95 shadow-lg shadow-blue-500/20 gap-2 h-11 px-6 rounded-xl cursor-pointer transition-all text-sm sm:text-base border-none"
              onClick={openCreate}
            >
              <Plus className="h-5 w-5 stroke-[3]" />
              {t("common.add")}
            </Button>
          )
        }
      />

      <Card>
        <TableToolbar
          title={t("common.list")}
          description={t("products.searchDesc")}
          search={
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      loadData(0, keyword, selectedType);
                    }
                  }}
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
              <Select
                value={selectedType || "all"}
                onValueChange={(value) => setSelectedType(value === "all" ? "" : value)}
                options={[
                  { value: "all", label: t("common.allTypes") },
                  ...productTypes.map((type) => ({ value: type.maLoaiSanPham, label: type.tenLoaiSanPham })),
                ]}
              />
            </div>
          }
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => loadData(0, keyword, selectedType)}>
                {t("common.filter")}
              </Button>
              <Button size="sm" variant="outline" disabled={page <= 0} onClick={() => loadData(page - 1, keyword, selectedType)}>
                {t("common.prev")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => loadData(page + 1, keyword, selectedType)}
              >
                {t("common.next")}
              </Button>
            </div>
          }
        />
        <CardContent className="px-0">
          {loading ? (
            <div className="px-4 py-6">
              <ProductSkeleton />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState title={t("common.emptyTitle")} description={t("common.emptyFilterDesc")} />
            </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-16 pl-5">{t("common.stt")}</TableHead>
                        <TableHead className="w-28">{t("products.productCode")}</TableHead>
                        <TableHead className="w-60 min-w-[200px]">{t("products.name")}</TableHead>
                        <TableHead className="w-40">{t("products.productType")}</TableHead>
                        <TableHead className="w-36">{t("products.sellingPrice")}</TableHead>
                        <TableHead className="w-28">{t("products.stock")}</TableHead>
                        <TableHead className="w-32">{t("common.unit")}</TableHead>
                        <TableHead className="w-64 pl-4">{t("common.status") || "Trạng thái"}</TableHead>
                        {!isSearchMode && <TableHead className="w-28 pr-5 text-right">{t("common.actions")}</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow
                                key={item.maSanPham}
                                className={cn(
                                    "hover:bg-muted/30 transition-colors",
                                    item.isActive === false ? "opacity-60 bg-slate-50/40 dark:bg-slate-900/10" : ""
                                )}
                            >
                                <TableCell className="font-semibold text-muted-foreground pl-5">{page * PAGE_SIZE + index + 1}</TableCell>
                                <TableCell>{item.maSanPham}</TableCell>
                                <TableCell className="font-semibold text-foreground truncate max-w-[240px]">{item.tenSanPham}</TableCell>
                                <TableCell>{item.loaiSanPham?.tenLoaiSanPham ?? item.maLoaiSanPham}</TableCell>
                                <TableCell>{formatCurrency(item.donGiaBan)}</TableCell>
                                <TableCell>{formatNumber(item.tonKho)}</TableCell>
                                <TableCell>{item.donViTinh?.tenDonViTinh ?? item.maDonViTinh}</TableCell>
                                <TableCell className="pl-4">
                                    <div className="flex items-center gap-2">
                                        {isSearchMode ? (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-tight select-none",
                                                    item.isActive !== false
                                                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        : "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400"
                                                )}
                                            >
                                                {item.isActive !== false ? "Active" : "Paused"}
                                            </Badge>
                                        ) : (
                                            <>
                                                <button
                                                type="button"
                                                onClick={() => toggleActive(item)}
                                                className={cn(
                                                    "relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                                    item.isActive !== false ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                                                )}
                                                aria-label="Toggle active status"
                                                >
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                                                        item.isActive !== false ? "translate-x-5" : "translate-x-0"
                                                    )}
                                                />
                                                </button>
                                                <span className={`text-[10px] font-bold uppercase tracking-tight select-none ${item.isActive !== false ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                                                {item.isActive !== false ? "Active" : "Paused"}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                                {!isSearchMode && (
                                    <TableCell className="pr-5">
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
                                )}

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setOpenForm(false)}>
          <div className="w-full max-w-xl rounded-xl border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-semibold">{editing ? t("products.editTitle") : t("products.addTitle")}</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setOpenForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form className="space-y-4 px-5 py-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>
                    {t("products.name")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...form.register("tenSanPham")}
                    className={form.formState.errors.tenSanPham ? "border-destructive ring-destructive/20" : ""}
                  />
                  {form.formState.errors.tenSanPham && (
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{String(form.formState.errors.tenSanPham.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {t("products.productType")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.watch("maLoaiSanPham")}
                    onValueChange={(value) => form.setValue("maLoaiSanPham", value)}
                    options={productTypes
                      .filter((type) => type.isActive !== false || type.maLoaiSanPham === form.getValues("maLoaiSanPham"))
                      .map((type) => ({ value: type.maLoaiSanPham, label: type.tenLoaiSanPham }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t("common.unit")} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.watch("maDonViTinh")}
                    onValueChange={(value) => form.setValue("maDonViTinh", value)}
                    options={units.filter((unit) => unit.isActive !== false || unit.maDonViTinh === form.getValues("maDonViTinh")).map((unit) => ({ value: unit.maDonViTinh, label: unit.tenDonViTinh }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("products.purchasePrice")}</Label>
                  <Input
                    type="number"
                    {...form.register("donGiaMua", { valueAsNumber: true })}
                    className={form.formState.errors.donGiaMua ? "border-destructive ring-destructive/20" : ""}
                  />
                   {form.formState.errors.donGiaMua && (
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{String(form.formState.errors.donGiaMua.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("products.initialStock")}</Label>
                  <Input
                    type="number"
                    {...form.register("tonKho", { valueAsNumber: true })}
                    className={form.formState.errors.tonKho ? "border-destructive ring-destructive/20" : ""}
                  />
                  {form.formState.errors.tonKho && (
                    <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">{String(form.formState.errors.tonKho.message)}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...form.register("isActive")}
                    checked={form.watch("isActive")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                    Kích hoạt hoạt động
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setOpenForm(false)} className="px-6 rounded-xl font-bold">
                  {t("common.cancel")}
                </Button>
                <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gold-gradient text-gold-foreground font-extrabold px-8 rounded-xl shadow-md shadow-gold/20 border-none"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("common.saving")}
                    </div>
                  ) : t("common.save")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title={t("products.deleteTitle")}
        description={deleting ? t("common.deleteConfirm").replace("{name}", deleting.tenSanPham) : ""}
        confirmLabel={t("common.delete")}
        destructive
        onCancel={() => setDeleting(null)}
        onConfirm={doDelete}
      />
    </div>
  );
}
