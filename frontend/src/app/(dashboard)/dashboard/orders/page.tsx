"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  { id: 1, name: "Nguyen Van Minh" },
  { id: 2, name: "Tran Thi Lan" },
  { id: 3, name: "Le Quang Huy" },
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
    setMessage("Da reset phieu ban hang.");
  }

  function handleSaveOrder() {
    const hasInvalidLine = lineWithMeta.some(
      (line) => line.quantity <= 0 || line.unitPrice <= 0,
    );

    if (hasInvalidLine) {
      setMessage("Vui long nhap so luong va don gia hop le cho tat ca dong.");
      return;
    }

    if (totalAmount <= 0) {
      setMessage("Tong tien phai lon hon 0.");
      return;
    }

    setMessage("Da luu phieu ban hang thanh cong (du lieu demo frontend).");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Don hang</h1>
        <p className="mt-1 text-muted-foreground">
          Tao phieu ban hang voi giao dien gon gang, de nhap lieu va chot don nhanh.
        </p>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-emerald-50/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl tracking-tight">Phieu ban hang</CardTitle>
              <CardDescription>
                Quan ly thong tin khach hang va danh sach san pham ban.
              </CardDescription>
            </div>
            <span className="rounded-full border border-emerald-600/30 bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
              Ban hang
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="voucher-code">So phieu</Label>
              <Input id="voucher-code" value={voucherCode} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="created-date">Ngay lap</Label>
              <Input
                id="created-date"
                type="date"
                value={createdDate}
                onChange={(event) => setCreatedDate(event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customer">Khach hang</Label>
              <select
                id="customer"
                value={customerId}
                onChange={(event) => setCustomerId(Number.parseInt(event.target.value, 10))}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {CUSTOMERS.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Da chon: <span className="font-medium text-foreground">{selectedCustomer.name}</span>
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Chi tiet san pham ban</h2>
              <Button onClick={handleAddLine} variant="outline" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Them dong
              </Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-14 text-center">STT</TableHead>
                    <TableHead className="min-w-[220px]">San pham</TableHead>
                    <TableHead className="min-w-[150px]">Loai san pham</TableHead>
                    <TableHead className="min-w-[120px]">So luong</TableHead>
                    <TableHead className="min-w-[120px]">Don vi tinh</TableHead>
                    <TableHead className="min-w-[150px]">Don gia</TableHead>
                    <TableHead className="min-w-[160px]">Thanh tien</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineWithMeta.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <select
                          value={line.productId}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "productId", event.target.value)
                          }
                          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {MOCK_PRODUCTS.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
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
                          aria-label="Xoa dong"
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-50 px-4 py-3">
            <span className="text-base font-semibold">Tong tien:</span>
            <span className="text-xl font-bold text-gold">{formatVND(totalAmount)}</span>
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
              Lam moi
            </Button>
            <Button onClick={handleSaveOrder} className="cursor-pointer">
              <Save className="mr-2 h-4 w-4" />
              Luu phieu ban hang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
