"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SYSTEM_CODE_INPUT_CLASS, SYSTEM_CODE_NOTE_CLASS } from "@/lib/form-styles";
import { formatVND } from "@/lib/mock-data";
import { STATUS_DOT_CLASS, STATUS_TONE_CLASS, type StatusTone } from "@/lib/status-styles";
import { cn } from "@/lib/utils";
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

interface ServiceVoucherSummary {
  id: number;
  voucherCode: string;
  createdDate: string;
  customerName: string;
  totalAmount: number;
  totalPrepaid: number;
  totalRemaining: number;
  isCompleted: boolean;
}

const CUSTOMERS: CustomerOption[] = [
  { id: 1, name: "Nguyễn Văn Minh", phone: "0908000111" },
  { id: 2, name: "Trần Thị Lan", phone: "0908000222" },
  { id: 3, name: "Lê Quang Huy", phone: "0908000333" },
];

const SERVICE_TYPES: ServiceTypeOption[] = [
  { id: 1, name: "Đánh bóng trang sức", servicePrice: 120_000 },
  { id: 2, name: "Khắc tên trên nhẫn", servicePrice: 150_000 },
  { id: 3, name: "Thu mua vàng cũ", servicePrice: 80_000 },
];

const STATUS_LABELS: Record<ServiceStatus, string> = {
  PENDING: "Chờ tiếp nhận",
  IN_PROGRESS: "Đang xử lý",
  DONE: "Đã giao",
};

const VOUCHER_STATUS_LABELS: Record<"DONE" | "PENDING", string> = {
  DONE: "Hoàn thành",
  PENDING: "Chưa hoàn thành",
};

const SERVICE_STATUS_TONE: Record<ServiceStatus, StatusTone> = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  DONE: "success",
};

function getTodayValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function getVoucherCode(sequence: number): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(3, "0");
  return `PDV-${y}${m}${d}-${seq}`;
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
  const [voucherIndex, setVoucherIndex] = useState(1);
  const [voucherCode, setVoucherCode] = useState(() => getVoucherCode(1));
  const [createdDate, setCreatedDate] = useState(getTodayValue());
  const [customerId, setCustomerId] = useState<number>(CUSTOMERS[0].id);
  const [lines, setLines] = useState<ServiceLine[]>([buildDefaultLine(1)]);
  const [voucherSummaries, setVoucherSummaries] = useState<ServiceVoucherSummary[]>([]);
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
  const isVoucherCompleted = useMemo(
    () => lineWithMeta.length > 0 && lineWithMeta.every((line) => line.status === "DONE"),
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
    setMessage("Đã reset phiếu dịch vụ.");
  }

  function handleSaveVoucher() {
    const hasInvalid = lineWithMeta.some(
      (line) => line.quantity <= 0 || line.chargedPrice <= 0,
    );
    if (hasInvalid) {
      setMessage("Vui lòng nhập số lượng và đơn giá được tính hợp lệ.");
      return;
    }

    if (totalAmount <= 0) {
      setMessage("Tổng tiền phải lớn hơn 0.");
      return;
    }

    const summary: ServiceVoucherSummary = {
      id: Date.now(),
      voucherCode,
      createdDate,
      customerName: selectedCustomer.name,
      totalAmount,
      totalPrepaid,
      totalRemaining,
      isCompleted: isVoucherCompleted,
    };

    setVoucherSummaries((previous) => [
      summary,
      ...previous.filter((item) => item.voucherCode !== summary.voucherCode),
    ]);

    const nextVoucherIndex = voucherIndex + 1;
    setVoucherIndex(nextVoucherIndex);
    setVoucherCode(getVoucherCode(nextVoucherIndex));
    setCreatedDate(getTodayValue());
    setCustomerId(CUSTOMERS[0].id);
    setLines([buildDefaultLine(1)]);
    setMessage("Đã lưu phiếu dịch vụ vào danh sách BM9 (dữ liệu demo frontend).");
  }

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base tracking-tight">Phiếu dịch vụ</CardTitle>
              <CardDescription className="text-xs">BM7 - Quản lý dịch vụ, thanh toán và ngày giao.</CardDescription>
            </div>
            <span className="rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
              Dịch vụ
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
            <div className="space-y-2">
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Số điện thoại</Label>
              <Input id="customer-phone" value={selectedCustomer.phone} readOnly />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">Tổng tiền</p>
              <p className="text-base font-semibold">{formatVND(totalAmount)}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">Trả trước</p>
              <p className="text-base font-semibold text-emerald-700">{formatVND(totalPrepaid)}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">Còn lại</p>
              <p className="text-base font-semibold text-amber-700">{formatVND(totalRemaining)}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">Tình trạng phiếu hiện tại</p>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 h-6 gap-1 px-2 text-xs",
                  isVoucherCompleted ? STATUS_TONE_CLASS.success : STATUS_TONE_CLASS.warning,
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isVoucherCompleted ? STATUS_DOT_CLASS.success : STATUS_DOT_CLASS.warning,
                  )}
                />
                {isVoucherCompleted
                  ? VOUCHER_STATUS_LABELS.DONE
                  : VOUCHER_STATUS_LABELS.PENDING}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Danh sách dịch vụ</h2>
              <Button onClick={handleAddLine} variant="outline" size="sm" className="h-7 cursor-pointer">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Thêm dòng
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
                      Loại dịch vụ
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[140px] align-middle">
                      Đơn giá dịch vụ
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[150px] align-middle">
                      Đơn giá được tính
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[120px] align-middle">
                      Số lượng
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[150px] align-middle">
                      Thành tiền
                    </TableHead>
                    <TableHead colSpan={2} className="min-w-[250px] text-center">
                      Thanh toán
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[150px] align-middle">
                      Ngày giao
                    </TableHead>
                    <TableHead rowSpan={2} className="min-w-[130px] align-middle">
                      Tình trạng
                    </TableHead>
                    <TableHead rowSpan={2} className="w-12 align-middle"></TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="min-w-[120px] text-center">Trả trước</TableHead>
                    <TableHead className="min-w-[120px] text-center">Còn lại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineWithMeta.map((line, index) => (
                    <TableRow key={line.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Select
                          value={line.serviceTypeId}
                          onValueChange={(value) =>
                            handleUpdateLine(line.id, "serviceTypeId", value)
                          }
                          options={SERVICE_TYPES.map((serviceType) => ({
                            value: serviceType.id,
                            label: serviceType.name,
                          }))}
                        />
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
                        <div className="flex min-w-[150px] items-center gap-2">
                          <span
                            className={cn(
                              "h-2 w-2 shrink-0 rounded-full",
                              STATUS_DOT_CLASS[SERVICE_STATUS_TONE[line.status]],
                            )}
                          />
                          <Select
                            value={line.status}
                            onValueChange={(value) =>
                              handleUpdateLine(line.id, "status", value)
                            }
                            className={cn(
                              "border-current/30",
                              STATUS_TONE_CLASS[SERVICE_STATUS_TONE[line.status]],
                            )}
                            options={(Object.keys(STATUS_LABELS) as ServiceStatus[]).map((status) => ({
                              value: status,
                              label: STATUS_LABELS[status],
                              leadingClassName: STATUS_DOT_CLASS[SERVICE_STATUS_TONE[status]],
                            }))}
                          />
                        </div>
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
            <Button onClick={handleSaveVoucher} className="cursor-pointer">
              <Save className="mr-2 h-4 w-4" />
              Lưu phiếu dịch vụ
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <CardTitle className="text-base tracking-tight">BM9: Danh sách phiếu dịch vụ</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 p-3">
          <div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead className="min-w-[170px]">Số phiếu</TableHead>
                  <TableHead className="min-w-[130px]">Ngày lập</TableHead>
                  <TableHead className="min-w-[180px]">Khách hàng</TableHead>
                  <TableHead className="min-w-[140px] text-right">Tổng tiền</TableHead>
                  <TableHead className="min-w-[140px] text-right">Trả trước</TableHead>
                  <TableHead className="min-w-[140px] text-right">Còn lại</TableHead>
                  <TableHead className="min-w-[140px]">Tình trạng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voucherSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-6 text-center text-sm text-muted-foreground">
                      Chưa có phiếu dịch vụ nào. Lưu phiếu để thêm vào danh sách BM9.
                    </TableCell>
                  </TableRow>
                ) : (
                  voucherSummaries.map((voucher, index) => {
                    const tone = voucher.isCompleted ? "success" : "warning";

                    return (
                      <TableRow key={voucher.id}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{voucher.voucherCode}</TableCell>
                        <TableCell>{voucher.createdDate}</TableCell>
                        <TableCell>{voucher.customerName}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatVND(voucher.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">{formatVND(voucher.totalPrepaid)}</TableCell>
                        <TableCell className="text-right text-amber-700">
                          {formatVND(voucher.totalRemaining)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("h-5 gap-1 px-2 text-[10px]", STATUS_TONE_CLASS[tone])}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[tone])} />
                            {voucher.isCompleted
                              ? VOUCHER_STATUS_LABELS.DONE
                              : VOUCHER_STATUS_LABELS.PENDING}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
            <p className="font-semibold">QD9</p>
            <p className="mt-1 text-muted-foreground">
              Tình trạng phiếu dịch vụ là{" "}
              <span className="font-medium">{VOUCHER_STATUS_LABELS.DONE}</span> nếu tất cả loại
              dịch vụ trong phiếu đã được giao. Ngược lại là{" "}
              <span className="font-medium">{VOUCHER_STATUS_LABELS.PENDING}</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
