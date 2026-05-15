"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SYSTEM_CODE_INPUT_CLASS, SYSTEM_CODE_NOTE_CLASS } from "@/lib/form-styles";
import { formatVND, MOCK_PRODUCTS } from "@/lib/mock-data";
import { STATUS_DOT_CLASS, STATUS_TONE_CLASS, type StatusTone } from "@/lib/status-styles";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

interface ProductItem {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface ProductDraft {
  code: string;
  name: string;
  category: string;
  price: string;
  stock: string;
}

type FormMode = "create" | "edit";

const INITIAL_PRODUCTS: ProductItem[] = MOCK_PRODUCTS.map((product) => ({
  id: product.id,
  code: `SP-${String(product.id).padStart(3, "0")}`,
  name: product.name,
  category: product.categoryName,
  price: product.sellingPrice,
  stock: product.stock,
}));

const EMPTY_DRAFT: ProductDraft = {
  code: "",
  name: "",
  category: "",
  price: "",
  stock: "",
};

function getProductCode(id: number): string {
  return `SP-${String(id).padStart(3, "0")}`;
}

function getNextProductId(products: ProductItem[]): number {
  return products.length === 0
    ? 1
    : Math.max(...products.map((product) => product.id)) + 1;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function parseNonNegativeInt(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, "");
  if (!cleaned) {
    return 0;
  }
  return Number.parseInt(cleaned, 10);
}

function getStockState(stock: number): { label: string; tone: StatusTone } {
  if (stock <= 0) {
    return { label: "Hết hàng", tone: "danger" };
  }

  if (stock <= 3) {
    return { label: "Sắp hết", tone: "warning" };
  }

  return { label: "Còn hàng", tone: "success" };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) {
      return products;
    }
    return products.filter((product) => {
      const content = normalizeText(
        `${product.code} ${product.name} ${product.category} ${product.price} ${product.stock}`,
      );
      return content.includes(query);
    });
  }, [products, searchQuery]);

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + product.stock, 0),
    [products],
  );

  function openCreateModal() {
    const nextId = getNextProductId(products);
    setFormMode("create");
    setEditingId(null);
    setDraft({
      ...EMPTY_DRAFT,
      code: getProductCode(nextId),
    });
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(product: ProductItem) {
    setFormMode("edit");
    setEditingId(product.id);
    setDraft({
      code: product.code,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
    });
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setErrorMessage("");
  }

  function updateDraft(field: keyof ProductDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function validateDraft(): { valid: boolean; price: number; stock: number } {
    if (!draft.name.trim()) {
      setErrorMessage("Vui lòng nhập tên sản phẩm.");
      return { valid: false, price: 0, stock: 0 };
    }
    if (!draft.category.trim()) {
      setErrorMessage("Vui lòng nhập loại sản phẩm.");
      return { valid: false, price: 0, stock: 0 };
    }

    const price = parseNonNegativeInt(draft.price);
    if (price <= 0) {
      setErrorMessage("Vui lòng nhập đơn giá hợp lệ (> 0).");
      return { valid: false, price: 0, stock: 0 };
    }

    const stock = parseNonNegativeInt(draft.stock);
    return { valid: true, price, stock };
  }

  function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { valid, price, stock } = validateDraft();
    if (!valid) {
      return;
    }

    if (formMode === "create") {
      const nextId = getNextProductId(products);
      setProducts((previous) => [
        ...previous,
        {
          id: nextId,
          code: getProductCode(nextId),
          name: draft.name.trim(),
          category: draft.category.trim(),
          price,
          stock,
        },
      ]);
      closeModal();
      return;
    }

    setProducts((previous) =>
      previous.map((product) =>
        product.id === editingId
          ? {
              ...product,
              name: draft.name.trim(),
              category: draft.category.trim(),
              price,
              stock,
            }
          : product,
      ),
    );
    closeModal();
  }

  function removeProduct(product: ProductItem) {
    const confirmed = window.confirm(
      `Xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`,
    );
    if (!confirmed) {
      return;
    }
    setProducts((previous) => previous.filter((item) => item.id !== product.id));
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="border-b px-3 py-3">
          <div className="grid gap-2 xl:grid-cols-[auto_minmax(280px,1fr)_auto] xl:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Tra cứu sản phẩm</CardTitle>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                BM8
              </Badge>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                {filteredProducts.length}/{products.length} bản ghi
              </Badge>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                Tồn {totalStock}
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo mã, tên, loại sản phẩm..."
                className="pl-9"
              />
            </div>

            <Button onClick={openCreateModal} size="sm" className="h-8 cursor-pointer">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Thêm sản phẩm
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Loại sản phẩm</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Tồn</TableHead>
                <TableHead className="w-24 text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy sản phẩm phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => {
                  const stockState = getStockState(product.stock);

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {product.code}
                      </TableCell>
                      <TableCell className="max-w-[420px] truncate font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right font-semibold text-gold">{formatVND(product.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium">{product.stock}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 gap-1 px-2 text-[10px]",
                              STATUS_TONE_CLASS[stockState.tone],
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[stockState.tone])} />
                            {stockState.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className="cursor-pointer"
                            onClick={() => openEditModal(product)}
                            aria-label="Sửa sản phẩm"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            className="cursor-pointer"
                            onClick={() => removeProduct(product)}
                            aria-label="Xóa sản phẩm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl rounded-xl border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {formMode === "create" ? "Thêm sản phẩm" : "Cập nhật sản phẩm"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Điền đầy đủ thông tin sản phẩm và lưu thay đổi.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={closeModal}
                aria-label="Đóng cửa sổ"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={submitProduct} className="space-y-4 px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-code">Mã sản phẩm</Label>
                  <Input
                    id="product-code"
                    value={draft.code}
                    readOnly
                    className={SYSTEM_CODE_INPUT_CLASS}
                    aria-describedby="product-code-note"
                  />
                  <p id="product-code-note" className={SYSTEM_CODE_NOTE_CLASS}>
                    Mã tự phát sinh, không chỉnh sửa thủ công.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Loại sản phẩm</Label>
                  <Input
                    id="product-category"
                    value={draft.category}
                    onChange={(event) => updateDraft("category", event.target.value)}
                    placeholder="VD: Vàng"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="product-name">Tên sản phẩm</Label>
                  <Input
                    id="product-name"
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    placeholder="VD: Nhẫn vàng 24K"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">Đơn giá</Label>
                  <Input
                    id="product-price"
                    value={draft.price}
                    onChange={(event) => updateDraft("price", event.target.value)}
                    inputMode="numeric"
                    placeholder="VD: 1500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Tồn kho</Label>
                  <Input
                    id="product-stock"
                    value={draft.stock}
                    onChange={(event) => updateDraft("stock", event.target.value)}
                    inputMode="numeric"
                    placeholder="VD: 12"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={closeModal}
                >
                  Hủy
                </Button>
                <Button type="submit" className="cursor-pointer">
                  {formMode === "create" ? "Thêm mới" : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
