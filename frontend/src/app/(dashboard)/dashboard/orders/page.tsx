"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SYSTEM_CODE_INPUT_CLASS, SYSTEM_CODE_NOTE_CLASS } from "@/lib/form-styles";
import { formatVND, MOCK_PRODUCTS } from "@/lib/mock-data";
import { Plus, Save, Trash2 } from "lucide-react";

interface CustomerOption {
  id: number;
  name: string;
}

interface SaleLine {
  id: number;
  productId: number;
  quantity: string;
  unitPrice: string;
}

const CUSTOMERS: CustomerOption[] = [
  { id: 1, name: "Nguyễn Văn Minh" },
  { id: 2, name: "Trần Thị Lan" },
  { id: 3, name: "Lê Quang Huy" },
];

function getTodayValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function getVoucherCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `PBH-${y}${m}${d}-001`;
}

function parsePositiveNumber(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 0;
  }
  return parsed;
}

function buildDefaultLine(id: number): SaleLine {
  return {
    id,
    productId: MOCK_PRODUCTS[0].id,
    quantity: "1",
    unitPrice: MOCK_PRODUCTS[0].sellingPrice.toString(),
  };
}

export default function OrdersPage() {
  const [voucherCode] = useState(getVoucherCode());
  const [createdDate, setCreatedDate] = useState(getTodayValue());
  const [customerId, setCustomerId] = useState<number>(CUSTOMERS[0].id);
  const [lines, setLines] = useState<SaleLine[]>([buildDefaultLine(1)]);
  const [message, setMessage] = useState<string>("");

  const selectedCustomer = useMemo(
    () => CUSTOMERS.find((customer) => customer.id === customerId) ?? CUSTOMERS[0],
    [customerId],
  );

  const lineWithMeta = useMemo(() => {
    return lines.map((line) => {
      const product = MOCK_PRODUCTS.find((item) => item.id === line.productId) ?? MOCK_PRODUCTS[0];
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
          const product = MOCK_PRODUCTS.find((item) => item.id === productId) ?? MOCK_PRODUCTS[0];
          return {
            ...line,
            productId: product.id,
            unitPrice: product.sellingPrice.toString(),
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
    setCustomerId(CUSTOMERS[0].id);
    setLines([buildDefaultLine(1)]);
    setMessage("Đã reset phiếu bán hàng.");
  }

  function handleSaveOrder() {
    const hasInvalidLine = lineWithMeta.some(
      (line) => line.quantity <= 0 || line.unitPrice <= 0,
    );

    if (hasInvalidLine) {
      setMessage("Vui lòng nhập số lượng và đơn giá hợp lệ cho tất cả dòng.");
      return;
    }

    if (totalAmount <= 0) {
      setMessage("Tổng tiền phải lớn hơn 0.");
      return;
    }

    setMessage("Đã lưu phiếu bán hàng thành công (dữ liệu demo frontend).");
  }

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base tracking-tight">Phiếu bán hàng</CardTitle>
              <CardDescription className="text-xs">BM6 - Quản lý khách hàng và sản phẩm bán.</CardDescription>
            </div>
            <span className="rounded border border-emerald-600/30 bg-emerald-600/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Bán hàng
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
              <Input
                id="created-date"
                type="date"
                value={createdDate}
                onChange={(event) => setCreatedDate(event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customer">Khách hàng</Label>
              <Select
                id="customer"
                value={customerId}
                onValueChange={(value) => setCustomerId(Number.parseInt(value, 10))}
                options={CUSTOMERS.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Đã chọn: <span className="font-medium text-foreground">{selectedCustomer.name}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Chi tiết sản phẩm bán</h2>
              <Button onClick={handleAddLine} variant="outline" size="sm" className="h-7 cursor-pointer">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Thêm dòng
              </Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-14 text-center">STT</TableHead>
                    <TableHead className="min-w-[220px]">Sản phẩm</TableHead>
                    <TableHead className="min-w-[150px]">Loại sản phẩm</TableHead>
                    <TableHead className="min-w-[120px]">Số lượng</TableHead>
                    <TableHead className="min-w-[120px]">Đơn vị tính</TableHead>
                    <TableHead className="min-w-[150px]">Đơn giá</TableHead>
                    <TableHead className="min-w-[160px]">Thành tiền</TableHead>
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
                          options={MOCK_PRODUCTS.map((product) => ({
                            value: product.id,
                            label: product.name,
                          }))}
                        />
                      </TableCell>
                      <TableCell>{line.product.categoryName}</TableCell>
                      <TableCell>
                        <Input
                          value={line.quantity}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "quantity", event.target.value)
                          }
                          inputMode="decimal"
                        />
                      </TableCell>
                      <TableCell>{line.product.weightUnit}</TableCell>
                      <TableCell>
                        <Input
                          value={line.unitPrice}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "unitPrice", event.target.value)
                          }
                          inputMode="numeric"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">
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
            <Button onClick={handleSaveOrder} className="cursor-pointer">
              <Save className="mr-2 h-4 w-4" />
              Lưu phiếu bán hàng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
