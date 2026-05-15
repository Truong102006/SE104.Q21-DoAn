"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    name: "Cong ty Vang Bac A",
    phone: "0909000111",
    address: "Q1, TP.HCM",
  },
  {
    id: 2,
    name: "Nha phan phoi Kim Hoan B",
    phone: "0909000222",
    address: "Ha Noi",
  },
  {
    id: 3,
    name: "Doi tac nguyen lieu C",
    phone: "0909000333",
    address: "Da Nang",
  },
];

const PRODUCTS: ProductOption[] = [
  {
    id: 1,
    name: "Vang 24K nguyen lieu",
    type: "Vang",
    unit: "Luong",
    defaultPrice: 92_500_000,
  },
  {
    id: 2,
    name: "Bac 925 nguyen lieu",
    type: "Bac",
    unit: "Kg",
    defaultPrice: 22_000_000,
  },
  {
    id: 3,
    name: "Da CZ trang suc",
    type: "Da quy",
    unit: "Vien",
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
    setMessage("Da reset phieu mua hang.");
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

    setMessage("Da luu phieu mua hang thanh cong (du lieu demo frontend).");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nhap hang</h1>
        <p className="mt-1 text-muted-foreground">
          Tao phieu mua hang voi giao dien gon gang, de nhap lieu va kiem tra.
        </p>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-amber-50/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl tracking-tight">Phieu mua hang</CardTitle>
              <CardDescription>
                Quan ly thong tin nha cung cap va danh sach san pham nhap.
              </CardDescription>
            </div>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
              Nhap kho
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
            <div className="space-y-2">
              <Label htmlFor="supplier">Nha cung cap</Label>
              <select
                id="supplier"
                value={supplierId}
                onChange={(event) => setSupplierId(Number.parseInt(event.target.value, 10))}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {SUPPLIERS.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-phone">So dien thoai</Label>
              <Input id="supplier-phone" value={selectedSupplier.phone} readOnly />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplier-address">Dia chi</Label>
              <Input id="supplier-address" value={selectedSupplier.address} readOnly />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Chi tiet san pham nhap</h2>
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
                    <TableHead className="min-w-[140px]">Loai san pham</TableHead>
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
                          {PRODUCTS.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>{line.product.type}</TableCell>
                      <TableCell>
                        <Input
                          value={line.quantity}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "quantity", event.target.value)
                          }
                          inputMode="decimal"
                        />
                      </TableCell>
                      <TableCell>{line.product.unit}</TableCell>
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
              Luu phieu mua hang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
