"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, formatVND } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Product, ProductStatus } from "@/types";

/* ──────────────────────────────────────────────────────────────
   Products Table — Role-aware data display
   • ADMIN sees Cost Price ("Giá vốn") column
   • STAFF sees only Selling Price ("Giá bán")
   • Search, category filter, status badges, pagination
   ────────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  IN_STOCK: { label: "Còn hàng", variant: "default" },
  LOW_STOCK: { label: "Sắp hết", variant: "secondary" },
  OUT_OF_STOCK: { label: "Hết hàng", variant: "destructive" },
};

const PAGE_SIZE = 5;

export default function ProductsPage() {
  const { isAdmin } = useAuthStore();
  const admin = isAdmin();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Filtered data ─────────────────────────────────── */
  const filtered = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || p.categoryName === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [search, categoryFilter]);

  /* ── Pagination ────────────────────────────────────── */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  /* Reset to page 1 when filters change */
  function handleSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }
  function handleCategory(value: string) {
    setCategoryFilter(value);
    setCurrentPage(1);
  }

  return (
    <div className="space-y-6">
      {/* ─── Page header ─────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-gold" />
            Quản lý sản phẩm
          </h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} sản phẩm
            {categoryFilter !== "all" ? ` — ${categoryFilter}` : ""}
          </p>
        </div>
        {admin && (
          <Button className="cursor-pointer bg-gold text-gold-foreground hover:bg-gold/90">
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        )}
      </div>

      {/* ─── Filters ─────────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 cursor-pointer">
                  <Filter className="h-4 w-4" />
                  {categoryFilter === "all" ? "Tất cả danh mục" : categoryFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleCategory("all")}
                  className="cursor-pointer"
                >
                  Tất cả danh mục
                </DropdownMenuItem>
                {MOCK_CATEGORIES.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => handleCategory(cat.name)}
                    className="cursor-pointer"
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* ─── Table ───────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Danh sách sản phẩm
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 w-12">ID</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Trọng lượng</TableHead>

                {/* ─── ADMIN-ONLY: Giá vốn (Cost Price) ─── */}
                {admin && (
                  <TableHead className="text-right">Giá vốn</TableHead>
                )}

                <TableHead className="text-right">Giá bán</TableHead>

                {/* ─── ADMIN-ONLY: Lợi nhuận ─── */}
                {admin && (
                  <TableHead className="text-right">Lợi nhuận</TableHead>
                )}

                <TableHead className="text-center">Tồn kho</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="pr-6 w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={admin ? 10 : 8}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Không tìm thấy sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    showCostPrice={admin}
                  />
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="h-8 w-8 cursor-pointer"
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-8 w-8 cursor-pointer"
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Table Row Component ─────────────────────────────────── */

function ProductRow({
  product,
  showCostPrice,
}: {
  product: Product;
  showCostPrice: boolean;
}) {
  const status = STATUS_CONFIG[product.status];
  const profit = product.sellingPrice - product.costPrice;
  const profitPercent = ((profit / product.costPrice) * 100).toFixed(1);

  return (
    <TableRow className="group">
      <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
        #{product.id}
      </TableCell>
      <TableCell>
        <p className="font-medium leading-snug">{product.name}</p>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="font-normal"
        >
          {product.categoryName}
        </Badge>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {product.weight} {product.weightUnit}
      </TableCell>

      {/* ─── Conditionally rendered: Cost Price ────── */}
      {showCostPrice && (
        <TableCell className="text-right tabular-nums font-medium">
          {formatVND(product.costPrice)}
        </TableCell>
      )}

      <TableCell className="text-right tabular-nums font-medium text-gold">
        {formatVND(product.sellingPrice)}
      </TableCell>

      {/* ─── Conditionally rendered: Profit ──────── */}
      {showCostPrice && (
        <TableCell className="text-right">
          <span className="tabular-nums font-medium text-emerald-600">
            {formatVND(profit)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            ({profitPercent}%)
          </span>
        </TableCell>
      )}

      <TableCell className="text-center tabular-nums">{product.stock}</TableCell>
      <TableCell className="text-center">
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell className="pr-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Thao tác"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            {showCostPrice && (
              <>
                <DropdownMenuItem className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
