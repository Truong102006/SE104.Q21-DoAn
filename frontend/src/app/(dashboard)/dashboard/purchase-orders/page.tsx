"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SYSTEM_CODE_INPUT_CLASS, SYSTEM_CODE_NOTE_CLASS } from "@/lib/form-styles";
import { formatVND } from "@/lib/mock-data";
import { Plus, Save, Trash2 } from "lucide-react";

interface SupplierOption {
  id: number;
  name: string;
  phone: string;
  address: string;
}

interface ProductOption {
  id: number;
  name: string;
  type: string;
  unit: string;
  defaultPrice: number;
}

interface PurchaseLine {
  id: number;
  productId: number;
  quantity: string;
  unitPrice: string;
}

const SUPPLIERS: SupplierOption[] = [
  {
    id: 1,
    name: "Công ty Vàng Bạc A",
    phone: "0909000111",
    address: "Q1, TP.HCM",
  },
  {
    id: 2,
    name: "Nhà phân phối Kim Hoàn B",
    phone: "0909000222",
    address: "Hà Nội",
  },
  {
    id: 3,
    name: "Đối tác nguyên liệu C",
    phone: "0909000333",
    address: "Đà Nẵng",
  },
];

const PRODUCTS: ProductOption[] = [
  {
    id: 1,
    name: "Vàng 24K nguyên liệu",
    type: "Vàng",
    unit: "Lượng",
    defaultPrice: 92_500_000,
  },
  {
    id: 2,
    name: "Bạc 925 nguyên liệu",
    type: "Bạc",
    unit: "Kg",
    defaultPrice: 22_000_000,
  },
  {
    id: 3,
    name: "Đá CZ trang sức",
    type: "Đá quý",
    unit: "Viên",
    defaultPrice: 120_000,
  },
];

function getTodayValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function getVoucherCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `PMH-${y}${m}${d}-001`;
}

function parsePositiveNumber(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 0;
  }
  return parsed;
}

function buildDefaultLine(id: number): PurchaseLine {
  return {
    id,
    productId: PRODUCTS[0].id,
    quantity: "1",
    unitPrice: PRODUCTS[0].defaultPrice.toString(),
  };
}

export default function PurchaseOrdersPage() {
  const [voucherCode] = useState(getVoucherCode());
  const [createdDate, setCreatedDate] = useState(getTodayValue());
  const [supplierId, setSupplierId] = useState<number>(SUPPLIERS[0].id);
  const [lines, setLines] = useState<PurchaseLine[]>([buildDefaultLine(1)]);
  const [message, setMessage] = useState<string>("");

  const selectedSupplier = useMemo(
    () => SUPPLIERS.find((supplier) => supplier.id === supplierId) ?? SUPPLIERS[0],
    [supplierId],
  );

  const lineWithMeta = useMemo(() => {
    return lines.map((line) => {
      const product = PRODUCTS.find((item) => item.id === line.productId) ?? PRODUCTS[0];
      const quantity = parsePositiveNumber(line.quantity);
      const unitPrice = parsePositiveNumber(line.unitPrice);
      return {
        ...line,
        product,
        quantity,
        unitPrice,
        amount: quantity * unitPrice,
      };
    });
  }, [lines]);

  const totalAmount = useMemo(
    () => lineWithMeta.reduce((sum, line) => sum + line.amount, 0),
    [lineWithMeta],
  );
  const invalidLineIndexes = useMemo(
    () =>
      lineWithMeta
        .map((line, index) => (line.quantity <= 0 || line.unitPrice <= 0 ? index + 1 : null))
        .filter((value): value is number => value !== null),
    [lineWithMeta],
  );
  const hasDateError = !createdDate;
  const hasSupplierError = !supplierId;
  const hasLineError = invalidLineIndexes.length > 0;
  const hasTotalError = totalAmount <= 0;
  const canSaveOrder = !hasDateError && !hasSupplierError && !hasLineError && !hasTotalError;

  function handleAddLine() {
    setLines((previous) => {
      const nextId =
        previous.length === 0 ? 1 : Math.max(...previous.map((line) => line.id)) + 1;
      return [...previous, buildDefaultLine(nextId)];
    });
  }

  function handleRemoveLine(id: number) {
    setLines((previous) => {
      if (previous.length === 1) {
        return previous;
      }
      return previous.filter((line) => line.id !== id);
    });
  }

  function handleUpdateLine(
    id: number,
    field: "productId" | "quantity" | "unitPrice",
    value: string,
  ) {
    setLines((previous) =>
      previous.map((line) => {
        if (line.id !== id) {
          return line;
        }

        if (field === "productId") {
          const productId = Number.parseInt(value, 10);
          const product = PRODUCTS.find((item) => item.id === productId) ?? PRODUCTS[0];
          return {
            ...line,
            productId: product.id,
            unitPrice: product.defaultPrice.toString(),
          };
        }

        return {
          ...line,
          [field]: value,
        };
      }),
    );
  }

  function handleResetForm() {
    setCreatedDate(getTodayValue());
    setSupplierId(SUPPLIERS[0].id);
    setLines([buildDefaultLine(1)]);
    setMessage("Đã reset phiếu mua hàng.");
  }

  function handleSaveOrder() {
    if (hasLineError) {
      setMessage("Vui lòng nhập số lượng và đơn giá hợp lệ cho tất cả dòng.");
      return;
    }

    if (hasTotalError) {
      setMessage("Tổng tiền phải lớn hơn 0.");
      return;
    }

    setMessage("Đã lưu phiếu mua hàng thành công (dữ liệu demo frontend).");
  }

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base tracking-tight">Phiếu mua hàng</CardTitle>
              <CardDescription className="text-xs">BM5 - Quản lý nhà cung cấp và sản phẩm nhập.</CardDescription>
            </div>
            <span className="rounded border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
              Nhập kho
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-3">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="voucher-code">Số phiếu</Label>
              <Input
                id="voucher-code"
                value={voucherCode}
                readOnly
                className={SYSTEM_CODE_INPUT_CLASS}
                aria-describedby="voucher-code-note"
              />
              <p id="voucher-code-note" className={SYSTEM_CODE_NOTE_CLASS}>
                Số phiếu tự phát sinh.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="created-date">Ngày lập</Label>
              <DatePickerInput
                id="created-date"
                value={createdDate}
                onValueChange={setCreatedDate}
              />
              {hasDateError && (
                <p className="text-xs text-destructive">Vui lòng chọn ngày lập.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Nhà cung cấp</Label>
              <Select
                id="supplier"
                value={supplierId}
                onValueChange={(value) => setSupplierId(Number.parseInt(value, 10))}
                options={SUPPLIERS.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.name,
                }))}
              />
              {hasSupplierError && (
                <p className="text-xs text-destructive">Vui lòng chọn nhà cung cấp.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Số điện thoại</Label>
              <Input id="supplier-phone" value={selectedSupplier.phone} readOnly />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplier-address">Địa chỉ</Label>
              <Input id="supplier-address" value={selectedSupplier.address} readOnly />
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Chi tiết sản phẩm nhập</h2>
              <Button onClick={handleAddLine} variant="outline" size="sm" className="h-7 cursor-pointer">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Thêm dòng
              </Button>
            </div>

            <div className="rounded-lg border">
              <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-14 text-center">STT</TableHead>
                    <TableHead className="w-[27%]">Sản phẩm</TableHead>
                    <TableHead className="w-[14%]">Loại sản phẩm</TableHead>
                    <TableHead className="w-[11%]">Số lượng</TableHead>
                    <TableHead className="w-[11%]">Đơn vị tính</TableHead>
                    <TableHead className="w-[15%]">Đơn giá</TableHead>
                    <TableHead className="w-[16%]">Thành tiền</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineWithMeta.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Select
                          value={line.productId}
                          onValueChange={(value) =>
                            handleUpdateLine(line.id, "productId", value)
                          }
                          options={PRODUCTS.map((product) => ({
                            value: product.id,
                            label: product.name,
                          }))}
                        />
                      </TableCell>
                      <TableCell className="truncate text-sm">{line.product.type}</TableCell>
                      <TableCell>
                        <Input
                          value={line.quantity}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "quantity", event.target.value)
                          }
                          inputMode="decimal"
                        />
                      </TableCell>
                      <TableCell className="truncate text-sm">{line.product.unit}</TableCell>
                      <TableCell>
                        <Input
                          value={line.unitPrice}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "unitPrice", event.target.value)
                          }
                          inputMode="numeric"
                        />
                      </TableCell>
                      <TableCell className="truncate text-sm font-semibold">
                        {formatVND(line.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon-sm"
                          variant="destructive"
                          onClick={() => handleRemoveLine(line.id)}
                          className="cursor-pointer"
                          aria-label="Xóa dòng"
                          disabled={lineWithMeta.length === 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/25 px-3 py-2">
            <span className="text-sm font-semibold">Tổng tiền</span>
            <span className="text-lg font-bold text-gold">{formatVND(totalAmount)}</span>
          </div>

          {hasLineError && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              Dòng không hợp lệ: {invalidLineIndexes.join(", ")}. Số lượng và đơn giá phải lớn hơn 0.
            </p>
          )}

          {message && (
            <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              {message}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleResetForm}
              className="cursor-pointer"
            >
              Làm mới
            </Button>
            <Button onClick={handleSaveOrder} className="cursor-pointer" disabled={!canSaveOrder}>
              <Save className="mr-2 h-4 w-4" />
              Lưu phiếu mua hàng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
