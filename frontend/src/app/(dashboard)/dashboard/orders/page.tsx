"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, StatusBadge } from "@/components/dashboard/management";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput, parseMoneyInput } from "@/components/ui/money-input";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SYSTEM_CODE_INPUT_CLASS, SYSTEM_CODE_NOTE_CLASS } from "@/lib/form-styles";
import { formatVND, MOCK_PRODUCTS } from "@/lib/mock-data";
import { UNIT_SELECT_OPTIONS } from "@/lib/unit-data";
import { useUnitStore } from "@/stores/unit-store";
import { Plus, Save, Trash2 } from "lucide-react";

interface CustomerOption {
  id: number;
  name: string;
}

interface SaleLine {
  id: number;
  productId: number;
  quantity: string;
  unit: string;
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
  const product = MOCK_PRODUCTS[0];
  return {
    id,
    productId: product.id,
    quantity: "1",
    unit: resolveProductUnit(product.weightUnit),
    unitPrice: product.sellingPrice.toString(),
  };
}

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

export default function OrdersPage() {
  const { units, hydrate, isHydrated } = useUnitStore();
  const [voucherCode] = useState(getVoucherCode());
  const [createdDate, setCreatedDate] = useState(getTodayValue());
  const [customerId, setCustomerId] = useState<number>(CUSTOMERS[0].id);
  const [lines, setLines] = useState<SaleLine[]>([buildDefaultLine(1)]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  const unitOptions = useMemo(
    () => units.map((unit) => ({ value: unit.name, label: unit.name })),
    [units],
  );

  const selectedCustomer = useMemo(
    () => CUSTOMERS.find((customer) => customer.id === customerId) ?? CUSTOMERS[0],
    [customerId],
  );

  const lineWithMeta = useMemo(() => {
    return lines.map((line) => {
      const product = MOCK_PRODUCTS.find((item) => item.id === line.productId) ?? MOCK_PRODUCTS[0];
      const quantity = parsePositiveNumber(line.quantity);
      const unitPrice = parseMoneyInput(line.unitPrice);
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
  const hasCustomerError = !customerId;
  const hasLineError = invalidLineIndexes.length > 0;
  const hasTotalError = totalAmount <= 0;
  const canSaveOrder = !hasDateError && !hasCustomerError && !hasLineError && !hasTotalError;
  const voucherStatus = canSaveOrder ? "Sẵn sàng lưu" : "Cần bổ sung";

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
    field: "productId" | "quantity" | "unit" | "unitPrice",
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
            unit: resolveProductUnit(product.weightUnit),
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
    if (hasLineError) {
      setMessage("Vui lòng nhập số lượng và đơn giá hợp lệ cho tất cả dòng.");
      return;
    }

    if (hasTotalError) {
      setMessage("Tổng tiền phải lớn hơn 0.");
      return;
    }

    setMessage("Đã lưu phiếu bán hàng thành công (dữ liệu demo frontend).");
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Nghiệp vụ bán hàng"
        title="Phiếu bán hàng"
        description="Tạo phiếu bán, kiểm tra số lượng/đơn giá và khóa tổng tiền trước khi lưu."
        badges={
          <>
            <Badge variant="outline" className="border-border/70 bg-background/70">BM6</Badge>
            <StatusBadge tone={canSaveOrder ? "success" : "warning"}>{voucherStatus}</StatusBadge>
          </>
        }
      />

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
              <DatePickerInput
                id="created-date"
                value={createdDate}
                onValueChange={setCreatedDate}
              />
              {hasDateError && (
                <p className="text-xs text-destructive">Vui lòng chọn ngày lập.</p>
              )}
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
              {hasCustomerError && (
                <p className="text-xs text-destructive">Vui lòng chọn khách hàng.</p>
              )}
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
                          options={MOCK_PRODUCTS.map((product) => ({
                            value: product.id,
                            label: product.name,
                          }))}
                        />
                      </TableCell>
                      <TableCell className="truncate text-sm">{line.product.categoryName}</TableCell>
                      <TableCell>
                        <QuantityStepper
                          value={String(line.quantity)}
                          onValueChange={(value) => handleUpdateLine(line.id, "quantity", value)}
                          min={1}
                          step={1}
                          inputMode="decimal"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={line.unit}
                          onValueChange={(value) => handleUpdateLine(line.id, "unit", value)}
                          options={unitOptions}
                        />
                      </TableCell>
                      <TableCell>
                        <MoneyInput
                          value={String(line.unitPrice)}
                          onValueChange={(value) => handleUpdateLine(line.id, "unitPrice", value)}
                          inputClassName="h-8 text-[13px]"
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
              Lưu phiếu bán hàng
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
