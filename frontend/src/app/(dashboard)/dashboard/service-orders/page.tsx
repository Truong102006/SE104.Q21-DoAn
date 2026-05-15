"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/mock-data";
import { Plus, Save, Trash2 } from "lucide-react";

interface CustomerOption {
  id: number;
  name: string;
  phone: string;
}

interface ServiceTypeOption {
  id: number;
  name: string;
  servicePrice: number;
}

type ServiceStatus = "PENDING" | "IN_PROGRESS" | "DONE";

interface ServiceLine {
  id: number;
  serviceTypeId: number;
  chargedPrice: string;
  quantity: string;
  prepaid: string;
  deliveryDate: string;
  status: ServiceStatus;
}

const CUSTOMERS: CustomerOption[] = [
  { id: 1, name: "Nguyen Van Minh", phone: "0908000111" },
  { id: 2, name: "Tran Thi Lan", phone: "0908000222" },
  { id: 3, name: "Le Quang Huy", phone: "0908000333" },
];

const SERVICE_TYPES: ServiceTypeOption[] = [
  { id: 1, name: "Danh bong trang suc", servicePrice: 120_000 },
  { id: 2, name: "Khac ten tren nhan", servicePrice: 150_000 },
  { id: 3, name: "Thu mua vang cu", servicePrice: 80_000 },
];

const STATUS_LABELS: Record<ServiceStatus, string> = {
  PENDING: "Cho tiep nhan",
  IN_PROGRESS: "Dang xu ly",
  DONE: "Da giao",
};

function getTodayValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function getVoucherCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `PDV-${y}${m}${d}-001`;
}

function parsePositiveNumber(raw: string): number {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 0;
  }
  return parsed;
}

function buildDefaultLine(id: number): ServiceLine {
  return {
    id,
    serviceTypeId: SERVICE_TYPES[0].id,
    chargedPrice: SERVICE_TYPES[0].servicePrice.toString(),
    quantity: "1",
    prepaid: "0",
    deliveryDate: getTodayValue(),
    status: "PENDING",
  };
}

export default function ServiceOrdersPage() {
  const [voucherCode] = useState(getVoucherCode());
  const [createdDate, setCreatedDate] = useState(getTodayValue());
  const [customerId, setCustomerId] = useState<number>(CUSTOMERS[0].id);
  const [lines, setLines] = useState<ServiceLine[]>([buildDefaultLine(1)]);
  const [message, setMessage] = useState("");

  const selectedCustomer = useMemo(
    () => CUSTOMERS.find((customer) => customer.id === customerId) ?? CUSTOMERS[0],
    [customerId],
  );

  const lineWithMeta = useMemo(() => {
    return lines.map((line) => {
      const serviceType =
        SERVICE_TYPES.find((item) => item.id === line.serviceTypeId) ?? SERVICE_TYPES[0];
      const quantity = parsePositiveNumber(line.quantity);
      const chargedPrice = parsePositiveNumber(line.chargedPrice);
      const amount = quantity * chargedPrice;
      const prepaidRaw = parsePositiveNumber(line.prepaid);
      const prepaid = Math.min(prepaidRaw, amount);
      const remaining = Math.max(amount - prepaid, 0);

      return {
        ...line,
        serviceType,
        quantity,
        chargedPrice,
        amount,
        prepaid,
        remaining,
      };
    });
  }, [lines]);

  const totalAmount = useMemo(
    () => lineWithMeta.reduce((sum, line) => sum + line.amount, 0),
    [lineWithMeta],
  );
  const totalPrepaid = useMemo(
    () => lineWithMeta.reduce((sum, line) => sum + line.prepaid, 0),
    [lineWithMeta],
  );
  const totalRemaining = useMemo(() => Math.max(totalAmount - totalPrepaid, 0), [totalAmount, totalPrepaid]);

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
    field:
      | "serviceTypeId"
      | "chargedPrice"
      | "quantity"
      | "prepaid"
      | "deliveryDate"
      | "status",
    value: string,
  ) {
    setLines((previous) =>
      previous.map((line) => {
        if (line.id !== id) {
          return line;
        }

        if (field === "serviceTypeId") {
          const serviceTypeId = Number.parseInt(value, 10);
          const serviceType =
            SERVICE_TYPES.find((item) => item.id === serviceTypeId) ?? SERVICE_TYPES[0];
          return {
            ...line,
            serviceTypeId: serviceType.id,
            chargedPrice: serviceType.servicePrice.toString(),
          };
        }

        if (field === "status") {
          return {
            ...line,
            status: value as ServiceStatus,
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
    setMessage("Da reset phieu dich vu.");
  }

  function handleSaveVoucher() {
    const hasInvalid = lineWithMeta.some(
      (line) => line.quantity <= 0 || line.chargedPrice <= 0,
    );
    if (hasInvalid) {
      setMessage("Vui long nhap so luong va don gia duoc tinh hop le.");
      return;
    }

    if (totalAmount <= 0) {
      setMessage("Tong tien phai lon hon 0.");
      return;
    }

    setMessage("Da luu phieu dich vu thanh cong (du lieu demo frontend).");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Phieu dich vu</h1>
        <p className="mt-1 text-muted-foreground">
          Lap phieu dich vu theo doi thanh toan tra truoc va so tien con lai.
        </p>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-sky-50/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl tracking-tight">Chi tiet phieu dich vu</CardTitle>
              <CardDescription>
                Quan ly loai dich vu, don gia tinh, tien thanh toan va ngay giao.
              </CardDescription>
            </div>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700">
              Dich vu
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">So dien thoai</Label>
              <Input id="customer-phone" value={selectedCustomer.phone} readOnly />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-slate-50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Tong tien</p>
              <p className="text-lg font-semibold">{formatVND(totalAmount)}</p>
            </div>
            <div className="rounded-xl border bg-emerald-50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Tong tien tra truoc</p>
              <p className="text-lg font-semibold text-emerald-700">{formatVND(totalPrepaid)}</p>
            </div>
            <div className="rounded-xl border bg-amber-50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Tong tien con lai</p>
              <p className="text-lg font-semibold text-amber-700">{formatVND(totalRemaining)}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Danh sach dich vu</h2>
              <Button onClick={handleAddLine} variant="outline" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Them dong
              </Button>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead rowSpan={2} className="w-14 text-center align-middle">
                      STT
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[190px] align-middle">
                      Loai dich vu
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[140px] align-middle">
                      Don gia dich vu
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[150px] align-middle">
                      Don gia duoc tinh
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[120px] align-middle">
                      So luong
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[150px] align-middle">
                      Thanh tien
                    </TableHead>
                    <TableHead colSpan={2} className="min-w-[250px] text-center">
                      Thanh toan
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[150px] align-middle">
                      Ngay giao
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[130px] align-middle">
                      Tinh trang
                    </TableHead>
                    <TableHead rowSpan={2} className="w-12 align-middle"></TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="min-w-[120px] text-center">Tra truoc</TableHead>
                    <TableHead className="min-w-[120px] text-center">Con lai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineWithMeta.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <select
                          value={line.serviceTypeId}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "serviceTypeId", event.target.value)
                          }
                          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {SERVICE_TYPES.map((serviceType) => (
                            <option key={serviceType.id} value={serviceType.id}>
                              {serviceType.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatVND(line.serviceType.servicePrice)}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.chargedPrice}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "chargedPrice", event.target.value)
                          }
                          inputMode="numeric"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.quantity}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "quantity", event.target.value)
                          }
                          inputMode="decimal"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">{formatVND(line.amount)}</TableCell>
                      <TableCell>
                        <Input
                          value={line.prepaid}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "prepaid", event.target.value)
                          }
                          inputMode="numeric"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-amber-700">
                        {formatVND(line.remaining)}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={line.deliveryDate}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "deliveryDate", event.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          value={line.status}
                          onChange={(event) =>
                            handleUpdateLine(line.id, "status", event.target.value)
                          }
                          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          {(Object.keys(STATUS_LABELS) as ServiceStatus[]).map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>
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
            <Button onClick={handleSaveVoucher} className="cursor-pointer">
              <Save className="mr-2 h-4 w-4" />
              Luu phieu dich vu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
