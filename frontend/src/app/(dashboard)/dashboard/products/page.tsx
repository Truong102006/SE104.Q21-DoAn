"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog, EmptyState, PageHeader, StatusBadge, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput, parseMoneyInput } from "@/components/ui/money-input";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SYSTEM_CODE_INPUT_CLASS, SYSTEM_CODE_NOTE_CLASS } from "@/lib/form-styles";
import { formatVND, MOCK_PRODUCTS } from "@/lib/mock-data";
import { type StatusTone } from "@/lib/status-styles";
import { UNIT_SELECT_OPTIONS } from "@/lib/unit-data";
import { useUnitStore } from "@/stores/unit-store";
import { PackageSearch, Pencil, Plus, Search, Trash2, X } from "lucide-react";

interface ProductItem {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
}

interface ProductDraft {
  code: string;
  name: string;
  category: string;
  unit: string;
  price: string;
  stock: string;
}

type FormMode = "create" | "edit";

const INITIAL_PRODUCTS: ProductItem[] = MOCK_PRODUCTS.map((product) => ({
  id: product.id,
  code: `SP-${String(product.id).padStart(3, "0")}`,
  name: product.name,
  category: product.categoryName,
  unit: resolveProductUnit(product.weightUnit),
  price: product.sellingPrice,
  stock: product.stock,
}));

const EMPTY_DRAFT: ProductDraft = {
  code: "",
  name: "",
  category: "",
  unit: UNIT_SELECT_OPTIONS[0]?.value ?? "Gram",
  price: "",
  stock: "",
};

function resolveProductUnit(rawUnit: string): string {
  const normalized = rawUnit.trim().toLowerCase();
  const match = UNIT_SELECT_OPTIONS.find((unit) => unit.value.toLowerCase() === normalized);
  if (match) {
    return match.value;
  }
  if (normalized.includes("ch")) {
    return "Chỉ";
  }
  if (normalized.includes("kg")) {
    return "Kg";
  }
  if (normalized.includes("vi")) {
    return "Viên";
  }
  return "Gram";
}

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
  const { units, hydrate, isHydrated } = useUnitStore();
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  const unitOptions = useMemo(
    () => units.map((unit) => ({ value: unit.name, label: unit.name })),
    [units],
  );

  const filteredProducts = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) {
      return products;
    }
    return products.filter((product) => {
      const content = normalizeText(
        `${product.code} ${product.name} ${product.category} ${product.unit} ${product.price} ${product.stock}`,
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
      unit: unitOptions[0]?.value ?? EMPTY_DRAFT.unit,
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
      unit: product.unit,
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
    if (!draft.unit.trim()) {
      setErrorMessage("Vui lòng chọn đơn vị tính từ danh sách BM3.");
      return { valid: false, price: 0, stock: 0 };
    }

    const price = parseMoneyInput(draft.price);
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
          unit: draft.unit,
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
              unit: draft.unit,
              price,
              stock,
            }
          : product,
      ),
    );
    closeModal();
  }

  function removeProduct(product: ProductItem) {
    setProducts((previous) => previous.filter((item) => item.id !== product.id));
    setDeletingProduct(null);
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Danh mục hàng hóa"
        title="Quản lý sản phẩm"
        description="Chuẩn hóa mã sản phẩm, giá bán và tồn kho để các phiếu bán/nhập dùng dữ liệu nhất quán."
        badges={
          <>
            <Badge variant="outline" className="border-border/70 bg-background/70">BM8</Badge>
            <Badge variant="outline" className="border-border/70 bg-background/70">Tồn {totalStock}</Badge>
          </>
        }
        actions={
          <Button onClick={openCreateModal} size="sm" className="h-8 cursor-pointer">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Thêm sản phẩm
          </Button>
        }
      />

      <Card>
        <TableToolbar
          title="Tra cứu sản phẩm"
          description="Tìm nhanh theo mã, tên, loại sản phẩm, giá hoặc tồn kho."
          meta={<Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">{filteredProducts.length}/{products.length} bản ghi</Badge>}
          search={
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo mã, tên, loại sản phẩm..."
                className="pl-9"
              />
            </div>
          }
        />

        <CardContent className="px-0">
          {filteredProducts.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={PackageSearch}
                title="Không tìm thấy sản phẩm phù hợp"
                description="Thử đổi từ khóa tìm kiếm hoặc thêm sản phẩm mới nếu đây là mặt hàng chưa có trong danh mục."
                action={
                  <Button onClick={openCreateModal} size="sm" className="cursor-pointer">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Thêm sản phẩm
                  </Button>
                }
              />
            </div>
          ) : (
          <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead className="w-[12%]">Mã</TableHead>
                <TableHead className="w-[28%]">Tên sản phẩm</TableHead>
                <TableHead className="w-[15%]">Loại sản phẩm</TableHead>
                <TableHead className="w-[10%]">Đơn vị tính</TableHead>
                <TableHead className="w-[15%] text-right">Đơn giá</TableHead>
                <TableHead className="w-[12%] text-right">Tồn</TableHead>
                <TableHead className="w-24 text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredProducts.map((product, index) => {
                  const stockState = getStockState(product.stock);

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {product.code}
                      </TableCell>
                      <TableCell className="truncate font-medium">{product.name}</TableCell>
                      <TableCell className="truncate">{product.category}</TableCell>
                      <TableCell className="truncate">{product.unit}</TableCell>
                      <TableCell className="text-right font-semibold text-gold">{formatVND(product.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium">{product.stock}</span>
                          <StatusBadge tone={stockState.tone}>
                            {stockState.label}
                          </StatusBadge>
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
                            onClick={() => setDeletingProduct(product)}
                            aria-label="Xóa sản phẩm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          )}
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
                <div className="space-y-2">
                  <Label htmlFor="product-unit">Đơn vị tính</Label>
                  <Select
                    id="product-unit"
                    value={draft.unit}
                    onValueChange={(value) => updateDraft("unit", value)}
                    options={unitOptions}
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
                  <MoneyInput
                    id="product-price"
                    value={draft.price}
                    onValueChange={(value) => updateDraft("price", value)}
                    placeholder="VD: 1.500.000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Tồn kho</Label>
                  <QuantityStepper
                    value={draft.stock}
                    onValueChange={(value) => updateDraft("stock", value)}
                    min={0}
                    step={1}
                    inputMode="numeric"
                    decrementLabel="Giảm tồn kho"
                    incrementLabel="Tăng tồn kho"
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

      <ConfirmDialog
        open={deletingProduct !== null}
        title="Xóa sản phẩm?"
        description={
          deletingProduct
            ? `Sản phẩm "${deletingProduct.name}" sẽ bị xóa khỏi danh mục demo. Hành động này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa sản phẩm"
        destructive
        onCancel={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) {
            removeProduct(deletingProduct);
          }
        }}
      />
    </div>
  );
}
