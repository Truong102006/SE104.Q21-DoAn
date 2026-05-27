"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/dashboard/pagination";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { backendApi } from "@/services/backend-api";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/api-error";
import { useTranslation } from "@/i18n/i18n-context";
import { useAuthStore } from "@/stores/auth-store";
import { useSalesDraftStore } from "@/stores/sales-draft-store";
import { useToastStore } from "@/stores/toast-store";
import type { ProductResponse, ProductTypeResponse } from "@/types/backend";
import { Eye, Image as ImageIcon, Plus, ShoppingBag } from "lucide-react";

const PAGE_SIZE = 12;

function resolveStockStatus(tonKho: number): "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" {
  if (tonKho <= 0) return "OUT_OF_STOCK";
  if (tonKho <= 5) return "LOW_STOCK";
  return "IN_STOCK";
}

export default function ProductCatalogPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "STAFF";
  const permissions = user?.permissions ?? [];
  const canAddToSalesDraft = role === "ADMIN" || permissions.includes("QL_PBH");
  const canManageProducts = role === "ADMIN" || permissions.includes("QL_SP");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productTypes, setProductTypes] = useState<ProductTypeResponse[]>([]);
  const [items, setItems] = useState<ProductResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [stockStatus, setStockStatus] = useState<"" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("");
  const [sort, setSort] = useState<"newest" | "priceAsc" | "priceDesc" | "stockAsc" | "stockDesc">("newest");
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [draftOpen, setDraftOpen] = useState(false);

  const {
    items: draftItems,
    hydrated,
    hydrate,
    addProduct,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    removeItem,
    getItemCount,
    getEstimatedTotal,
    prepareHandoff,
  } = useSalesDraftStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function loadOptions() {
    try {
      const types = await backendApi.productTypes.list();
      setProductTypes(types.filter((type) => type.isActive !== false));
    } catch (err) {
      useToastStore.getState().error(getApiErrorMessage(err, t("products.loadOptionsError")));
    }
  }

  async function loadCatalog(nextPage = page, nextKeyword = keyword, nextProductTypeId = productTypeId, nextStockStatus = stockStatus, nextSort = sort) {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.products.catalog({
        keyword: nextKeyword.trim() || undefined,
        productTypeId: nextProductTypeId || undefined,
        stockStatus: nextStockStatus || undefined,
        sort: nextSort,
        page: nextPage,
        size: PAGE_SIZE,
      });
      setItems(data.content);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setPage(data.number ?? nextPage);
    } catch (err) {
      setError(getApiErrorMessage(err, t("productCatalog.loadError")));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog(0, keyword, productTypeId, stockStatus, sort);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, productTypeId, stockStatus, sort]);

  function handleAddToDraft(product: ProductResponse) {
    if (!canAddToSalesDraft) {
      useToastStore.getState().error("Bạn không có quyền thêm vào phiếu bán tạm");
      return;
    }
    if ((product.tonKho ?? 0) <= 0) {
      useToastStore.getState().error("Sản phẩm đã hết hàng");
      return;
    }

    addProduct({
      maSanPham: product.maSanPham,
      tenSanPham: product.tenSanPham,
      maLoaiSanPham: product.maLoaiSanPham,
      tenLoaiSanPham: product.loaiSanPham?.tenLoaiSanPham ?? product.maLoaiSanPham,
      maDonViTinh: product.maDonViTinh,
      tenDonViTinh: product.donViTinh?.tenDonViTinh ?? product.maDonViTinh,
      donGiaBan: Number(product.donGiaBan ?? 0),
      tonKho: Number(product.tonKho ?? 0),
      imageUrl: product.imageUrl,
    });
    useToastStore.getState().success("Đã thêm sản phẩm vào phiếu bán tạm");
  }

  function handleCreateSaleVoucher() {
    if (!draftItems.length) {
      useToastStore.getState().error("Phiếu bán tạm đang trống");
      return;
    }
    prepareHandoff();
    setDraftOpen(false);
    router.push("/dashboard/orders");
  }

  const draftItemCount = getItemCount();
  const draftTotal = getEstimatedTotal();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{t("productCatalog.title")}</CardTitle>
              {t("productCatalog.subtitle") && (
                <p className="text-sm text-muted-foreground mt-1">{t("productCatalog.subtitle")}</p>
              )}
            </div>
            <Button
              variant="outline"
              className="gap-2 border-amber-500/40 text-amber-700 dark:text-amber-300"
              onClick={() => setDraftOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              {t("productCatalog.draftTitle")}
              <Badge variant="secondary">{draftItemCount}</Badge>
            </Button>
          </div>

          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t("productCatalog.searchPlaceholder")}
            />
            <Select
              value={productTypeId || "all"}
              onValueChange={(value) => setProductTypeId(value === "all" ? "" : value)}
              options={[
                { value: "all", label: t("common.allTypes") },
                ...productTypes.map((type) => ({ value: type.maLoaiSanPham, label: type.tenLoaiSanPham })),
              ]}
            />
            <Select
              value={stockStatus || "all"}
              onValueChange={(value) =>
                setStockStatus(value === "all" ? "" : (value as "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK"))
              }
              options={[
                { value: "all", label: t("productCatalog.allStock") },
                { value: "IN_STOCK", label: t("productCatalog.inStock") },
                { value: "LOW_STOCK", label: t("productCatalog.lowStock") },
                { value: "OUT_OF_STOCK", label: t("productCatalog.outOfStock") },
              ]}
            />
            <Select
              value={sort}
              onValueChange={(value) =>
                setSort(value as "newest" | "priceAsc" | "priceDesc" | "stockAsc" | "stockDesc")
              }
              options={[
                { value: "newest", label: t("productCatalog.sortNewest") },
                { value: "priceAsc", label: t("productCatalog.sortPriceAsc") },
                { value: "priceDesc", label: t("productCatalog.sortPriceDesc") },
                { value: "stockAsc", label: t("productCatalog.sortStockAsc") },
                { value: "stockDesc", label: t("productCatalog.sortStockDesc") },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-3 space-y-3">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <EmptyState title={t("productCatalog.loadError")} description={error} />
          ) : items.length === 0 ? (
            <EmptyState title={t("productCatalog.empty")} description={t("common.emptyFilterDesc")} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {items.map((item) => {
                  const status = resolveStockStatus(Number(item.tonKho ?? 0));
                  const canAdd = canAddToSalesDraft && Number(item.tonKho ?? 0) > 0 && item.isActive !== false;

                  return (
                    <Card key={item.maSanPham} className="overflow-hidden border-border/70">
                      <CardContent className="p-0">
                        <div className="aspect-square bg-muted/20 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.tenSanPham} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="p-3 space-y-2">
                          <div>
                            <p className="font-semibold line-clamp-1">{item.tenSanPham}</p>
                            <p className="text-xs text-muted-foreground">{item.maSanPham}</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.loaiSanPham?.tenLoaiSanPham ?? item.maLoaiSanPham}
                          </p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(item.donGiaBan)}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Tồn kho: <span className="font-semibold">{item.tonKho} {item.donViTinh?.tenDonViTinh ?? ""}</span>
                            </p>
                            <Badge
                              variant={status === "OUT_OF_STOCK" ? "destructive" : "outline"}
                              className={status === "LOW_STOCK" ? "border-amber-500/40 text-amber-700 dark:text-amber-300" : ""}
                            >
                              {status === "IN_STOCK" ? t("productCatalog.inStock") : status === "LOW_STOCK" ? t("productCatalog.lowStock") : t("productCatalog.outOfStock")}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => setSelectedProduct(item)}>
                              <Eye className="h-3.5 w-3.5" />
                              {t("productCatalog.detail")}
                            </Button>
                            <Button size="sm" className="gap-1" onClick={() => handleAddToDraft(item)} disabled={!canAdd}>
                              <Plus className="h-3.5 w-3.5" />
                              {t("productCatalog.addToDraft")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-center pt-4">
                <Pagination currentPage={page + 1} totalPages={totalPages} onPageChange={(next) => loadCatalog(next - 1)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.tenSanPham}</DialogTitle>
                <DialogDescription>{selectedProduct.maSanPham}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                <div className="rounded-lg border border-border/70 overflow-hidden bg-muted/20 aspect-square">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.tenSanPham} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Loại:</span> {selectedProduct.loaiSanPham?.tenLoaiSanPham ?? selectedProduct.maLoaiSanPham}</p>
                  <p><span className="font-semibold">Đơn vị:</span> {selectedProduct.donViTinh?.tenDonViTinh ?? selectedProduct.maDonViTinh}</p>
                  <p><span className="font-semibold">Giá bán:</span> {formatCurrency(selectedProduct.donGiaBan)}</p>
                  <p><span className="font-semibold">Tồn kho:</span> {selectedProduct.tonKho}</p>
                  {canManageProducts && (
                    <div className="pt-2">
                      <Link href="/dashboard/products">
                        <Button variant="outline" size="sm">{t("productCatalog.editProduct")}</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={draftOpen} onOpenChange={setDraftOpen}>
        <SheetContent className="sm:max-w-lg w-full">
          <SheetHeader>
            <SheetTitle>{t("productCatalog.draftTitle")}</SheetTitle>
            <SheetDescription>
              {draftItems.length} sản phẩm, tạm tính {formatCurrency(draftTotal)}
            </SheetDescription>
          </SheetHeader>

          {!hydrated ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : draftItems.length === 0 ? (
            <div className="px-4 py-6">
              <EmptyState title={t("productCatalog.draftTitle")} description={t("productCatalog.draftEmpty")} />
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                {draftItems.map((item) => (
                  <div key={item.maSanPham} className="rounded-lg border border-border/70 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{item.tenSanPham}</p>
                        <p className="text-xs text-muted-foreground">{item.maSanPham}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(item.maSanPham)}>
                        Xóa
                      </Button>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.donGiaBan)}</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => decreaseQuantity(item.maSanPham)}>-</Button>
                        <Input
                          className="h-8 w-16 text-center"
                          value={item.soLuong}
                          type="number"
                          min={1}
                          max={Math.max(1, item.tonKho)}
                          onChange={(e) => setQuantity(item.maSanPham, Number(e.target.value))}
                        />
                        <Button variant="outline" size="sm" onClick={() => increaseQuantity(item.maSanPham)}>+</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("productCatalog.qty")}: {item.soLuong}/{item.tonKho}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-right">{formatCurrency(item.donGiaBan * item.soLuong)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/70 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(draftTotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setDraftOpen(false)}>
                    {t("productCatalog.continueSelecting")}
                  </Button>
                  <Button onClick={handleCreateSaleVoucher} disabled={!canAddToSalesDraft}>
                    {t("productCatalog.createSale")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
