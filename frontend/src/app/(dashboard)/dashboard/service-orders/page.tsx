"use client";

import { useMemo, useState } from "react";
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
  quantity: string;
  deliveryDate: string;
  status: ServiceStatus;
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
    quantity: "1",
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
  const [voucherPrepaid, setVoucherPrepaid] = useState("0");
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
      const chargedPriceValue = serviceType.servicePrice;
      const amount = quantity * chargedPriceValue;

      return {
        ...line,
        serviceType,
        quantity,
        chargedPriceValue,
        amount,
      };
    });
  }, [lines]);

  const totalAmount = useMemo(
    () => lineWithMeta.reduce((sum, line) => sum + line.amount, 0),
    [lineWithMeta],
  );
  const totalPrepaid = Math.min(parseMoneyInput(voucherPrepaid), totalAmount);
  const totalRemaining = useMemo(() => Math.max(totalAmount - totalPrepaid, 0), [totalAmount, totalPrepaid]);
  const isVoucherCompleted = useMemo(
    () => lineWithMeta.length > 0 && lineWithMeta.every((line) => line.status === "DONE"),
    [lineWithMeta],
  );
  const hasCreatedDateError = !createdDate;
  const invalidQuantityOrPriceLines = useMemo(
    () =>
      lineWithMeta
        .map((line, index) => (line.quantity <= 0 || line.chargedPriceValue <= 0 ? index + 1 : null))
        .filter((value): value is number => value !== null),
    [lineWithMeta],
  );
  const invalidDeliveryDateLines = useMemo(
    () =>
      lineWithMeta
        .map((line, index) => (!line.deliveryDate ? index + 1 : null))
        .filter((value): value is number => value !== null),
    [lineWithMeta],
  );
  const hasPrepaidError = parseMoneyInput(voucherPrepaid) > totalAmount;
  const hasTotalError = totalAmount <= 0;
  const canSaveVoucher =
    !hasCreatedDateError &&
    invalidQuantityOrPriceLines.length === 0 &&
    invalidDeliveryDateLines.length === 0 &&
    !hasPrepaidError &&
    !hasTotalError;

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
      | "quantity"
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
    setVoucherPrepaid("0");
    setMessage("Đã reset phiếu dịch vụ.");
  }

  function handleSaveVoucher() {
    if (invalidQuantityOrPriceLines.length > 0) {
      setMessage("Vui lòng nhập số lượng và đơn giá được tính hợp lệ.");
      return;
    }

    if (invalidDeliveryDateLines.length > 0) {
      setMessage("Vui lòng nhập đầy đủ ngày giao cho các dòng dịch vụ.");
      return;
    }

    if (hasPrepaidError) {
      setMessage("Tiền trả trước không được lớn hơn tổng tiền phiếu dịch vụ.");
      return;
    }

    if (hasTotalError) {
      setMessage("Tổng tiền phải lớn hơn 0.");
      return;
    }

    const nextVoucherIndex = voucherIndex + 1;
    setVoucherIndex(nextVoucherIndex);
    setVoucherCode(getVoucherCode(nextVoucherIndex));
    setCreatedDate(getTodayValue());
    setCustomerId(CUSTOMERS[0].id);
    setLines([buildDefaultLine(1)]);
    setVoucherPrepaid("0");
    setMessage("Đã lưu phiếu dịch vụ thành công (dữ liệu demo frontend). Vào Tra cứu > Phiếu dịch vụ để xem BM9.");
  }

  return (
    <div className="space-y-2">
      <PageHeader
        eyebrow="Nghiệp vụ dịch vụ"
        title="Phiếu dịch vụ"
        description="Theo dõi dịch vụ, trả trước, ngày giao và trạng thái hoàn thành của từng dòng."
        badges={
          <>
            <Badge variant="outline" className="border-border/70 bg-background/70">BM7</Badge>
            <StatusBadge tone={canSaveVoucher ? "success" : "warning"}>
              {canSaveVoucher ? "Sẵn sàng lưu" : "Cần bổ sung"}
            </StatusBadge>
          </>
        }
      />

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-2.5 py-2">
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

        <CardContent className="space-y-2 p-2.5">
          <div className="grid gap-2 md:grid-cols-4">
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
              {hasCreatedDateError && (
                <p className="text-xs text-destructive">Vui lòng chọn ngày lập.</p>
              )}
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

          <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border bg-muted/20 px-2.5 py-1.5">
              <p className="text-xs text-muted-foreground">Tổng tiền</p>
              <p className="text-base font-semibold">{formatVND(totalAmount)}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 px-2.5 py-1.5">
              <p className="text-xs text-muted-foreground">Trả trước</p>
              <MoneyInput
                value={voucherPrepaid}
                onValueChange={setVoucherPrepaid}
                inputClassName="h-8 text-base text-emerald-700"
              />
              {hasPrepaidError && (
                <p className="mt-1 text-[11px] text-destructive">Không được vượt tổng tiền.</p>
              )}
            </div>
            <div className="rounded-lg border bg-muted/20 px-2.5 py-1.5">
              <p className="text-xs text-muted-foreground">Còn lại</p>
              <p className="text-base font-semibold text-amber-700">{formatVND(totalRemaining)}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 px-2.5 py-1.5">
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
            </div>

            <Table className="table-fixed [&_th]:px-2 [&_th]:py-3 [&_th]:text-[11px] [&_th]:leading-4 [&_th]:whitespace-normal [&_td]:px-2 [&_td]:py-2.5 [&_td]:align-middle [&_td]:text-[13px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[4%] text-center">STT</TableHead>
                  <TableHead className="w-[24%]">Loại dịch vụ</TableHead>
                  <TableHead className="w-[14%]">Ngày giao / Tình trạng</TableHead>
                  <TableHead className="w-[14%] text-right">Đơn giá</TableHead>
                  <TableHead className="w-[12%] text-center">Số lượng</TableHead>
                  <TableHead className="w-[16%] text-right">Thành tiền</TableHead>
                  <TableHead className="w-[4%] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineWithMeta.map((line, index) => (
                  <TableRow key={line.id} className="bg-card/70">
                    <TableCell className="text-center font-semibold">{index + 1}</TableCell>
                    <TableCell>
                      <Select
                        value={line.serviceTypeId}
                        onValueChange={(value) => handleUpdateLine(line.id, "serviceTypeId", value)}
                        className="h-9 text-sm [&>span]:whitespace-nowrap [&>span]:truncate"
                        contentClassName="max-w-[360px]"
                        options={SERVICE_TYPES.map((serviceType) => ({
                          value: serviceType.id,
                          label: serviceType.name,
                        }))}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <DatePickerInput
                          value={line.deliveryDate}
                          onValueChange={(value) => handleUpdateLine(line.id, "deliveryDate", value)}
                          compact
                          className="h-8 w-full text-[12px]"
                        />
                        <Select
                          value={line.status}
                          onValueChange={(value) => handleUpdateLine(line.id, "status", value)}
                          className={cn(
                            "h-8 border-current/30 px-2 text-[12px] [&>span]:truncate",
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
                    <TableCell className="text-right font-semibold whitespace-nowrap">
                      {formatVND(line.serviceType.servicePrice)}
                    </TableCell>
                    <TableCell>
                      <QuantityStepper
                        value={String(line.quantity)}
                        onValueChange={(value) => handleUpdateLine(line.id, "quantity", value)}
                        min={1}
                        step={1}
                        inputClassName="h-8 min-w-[2.4rem] text-sm"
                      />
                    </TableCell>
                    <TableCell className="text-right font-bold whitespace-nowrap">
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

            <Button onClick={handleAddLine} variant="outline" size="sm" className="h-8 w-full cursor-pointer border-dashed">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Thêm dòng dịch vụ
            </Button>
          </div>
          {message && (
            <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              {message}
            </p>
          )}

          {(invalidQuantityOrPriceLines.length > 0 ||
            invalidDeliveryDateLines.length > 0 ||
            hasPrepaidError) && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {invalidQuantityOrPriceLines.length > 0 && (
                <p>Dòng lỗi số lượng/đơn giá: {invalidQuantityOrPriceLines.join(", ")}.</p>
              )}
              {invalidDeliveryDateLines.length > 0 && (
                <p>Dòng chưa nhập ngày giao: {invalidDeliveryDateLines.join(", ")}.</p>
              )}
              {hasPrepaidError && (
                <p>Tiền trả trước không được lớn hơn tổng tiền phiếu dịch vụ.</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-1.5">
            <Button
              variant="outline"
              onClick={handleResetForm}
              className="cursor-pointer"
            >
              Làm mới
            </Button>
            <Button onClick={handleSaveVoucher} className="cursor-pointer" disabled={!canSaveVoucher}>
              <Save className="mr-2 h-4 w-4" />
              Lưu phiếu dịch vụ
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}



