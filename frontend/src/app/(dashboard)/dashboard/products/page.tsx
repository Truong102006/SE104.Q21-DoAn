"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND, MOCK_PRODUCTS } from "@/lib/mock-data";
import { Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";

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
    setFormMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
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
    if (!draft.code.trim()) {
      setErrorMessage("Vui long nhap ma san pham.");
      return { valid: false, price: 0, stock: 0 };
    }
    if (!draft.name.trim()) {
      setErrorMessage("Vui long nhap ten san pham.");
      return { valid: false, price: 0, stock: 0 };
    }
    if (!draft.category.trim()) {
      setErrorMessage("Vui long nhap loai san pham.");
      return { valid: false, price: 0, stock: 0 };
    }

    const price = parseNonNegativeInt(draft.price);
    if (price <= 0) {
      setErrorMessage("Vui long nhap don gia hop le (> 0).");
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
      const nextId =
        products.length === 0
          ? 1
          : Math.max(...products.map((product) => product.id)) + 1;
      setProducts((previous) => [
        ...previous,
        {
          id: nextId,
          code: draft.code.trim(),
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
              code: draft.code.trim(),
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
      `Xoa san pham "${product.name}"? Hanh dong nay khong the hoan tac.`,
    );
    if (!confirmed) {
      return;
    }
    setProducts((previous) => previous.filter((item) => item.id !== product.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">San pham</h1>
          <p className="mt-1 text-muted-foreground">
            Danh sach san pham theo BM8 voi thao tac them, sua, xoa nhanh.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="cursor-pointer bg-gradient-to-r from-gold to-amber-400 text-gold-foreground ring-1 ring-gold/50 shadow-lg shadow-gold/35 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-gold hover:shadow-xl hover:shadow-gold/45"
        >
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
            <Plus className="h-3.5 w-3.5" />
          </span>
          Them san pham
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-gold/10 p-2 text-gold">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tong san pham</p>
              <p className="text-xl font-semibold">{products.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tong ton kho</p>
              <p className="text-xl font-semibold">{totalStock}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Danh sach san pham</CardTitle>
              <CardDescription>
                Cot du lieu: STT, Ma san pham, Ten san pham, Loai san pham, Don gia, Ton kho.
              </CardDescription>
            </div>
            <Badge variant="outline">{filteredProducts.length} ban ghi</Badge>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tim theo ma, ten, loai san pham..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 pl-6 text-center">STT</TableHead>
                <TableHead>Ma san pham</TableHead>
                <TableHead>Ten san pham</TableHead>
                <TableHead>Loai san pham</TableHead>
                <TableHead>Don gia</TableHead>
                <TableHead>Ton kho</TableHead>
                <TableHead className="w-28 pr-6 text-right">Tac vu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Khong tim thay san pham phu hop.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell className="pl-6 text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.code}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="font-semibold text-gold">{formatVND(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => openEditModal(product)}
                          aria-label="Sua san pham"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => removeProduct(product)}
                          aria-label="Xoa san pham"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
                  {formMode === "create" ? "Them san pham" : "Cap nhat san pham"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dien day du thong tin san pham va luu thay doi.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={closeModal}
                aria-label="Dong cua so"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={submitProduct} className="space-y-4 px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-code">Ma san pham</Label>
                  <Input
                    id="product-code"
                    value={draft.code}
                    onChange={(event) => updateDraft("code", event.target.value)}
                    placeholder="VD: SP-010"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Loai san pham</Label>
                  <Input
                    id="product-category"
                    value={draft.category}
                    onChange={(event) => updateDraft("category", event.target.value)}
                    placeholder="VD: Vang"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="product-name">Ten san pham</Label>
                  <Input
                    id="product-name"
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    placeholder="VD: Nhan vang 24K"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">Don gia</Label>
                  <Input
                    id="product-price"
                    value={draft.price}
                    onChange={(event) => updateDraft("price", event.target.value)}
                    inputMode="numeric"
                    placeholder="VD: 1500000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Ton kho</Label>
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
                  Huy
                </Button>
                <Button type="submit" className="cursor-pointer">
                  {formMode === "create" ? "Them moi" : "Luu thay doi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
