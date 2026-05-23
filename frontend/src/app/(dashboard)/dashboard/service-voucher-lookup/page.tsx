"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  EmptyState,
  PageHeader,
  TableToolbar,
  StatusBadge,
} from "@/components/dashboard/management";
import { DetailModal, DetailGrid } from "@/components/dashboard/voucher-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DatePickerInput } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type { SearchServiceTicketResponse, ServiceTicketResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatVietnameseStatus } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import {
  Search,
  Eye,
  Filter,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function ServiceVoucherLookupPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<SearchServiceTicketResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [detail, setDetail] = useState<ServiceTicketResponse | null>(null);

  async function loadData(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const data = await backendApi.search.serviceTickets({
        keyword: keyword.trim() || undefined,
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      });

      setItems(data.content);
      setPage(data.number ?? nextPage);
      setTotalPages(Math.max(1, data.totalPages || 1));
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceLookup.loadError")));
    } finally {
      setLoading(false);
    }
  }

  // Debounced search when any filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(0);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, status, fromDate, toDate]);

  async function openDetail(soPhieuDichVu: string) {
    try {
      const data = await backendApi.serviceTickets.getById(soPhieuDichVu);
      setDetail(data);
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceLookup.detailError")));
    }
  }

  function handleReset() {
    setKeyword("");
    setStatus("");
    setFromDate("");
    setToDate("");
  }


  function getStatusBadge(statusStr: string) {
    const s = statusStr.toLowerCase();
    const displayStatus = formatVietnameseStatus(statusStr);
    if (s.includes("hoan thanh") || s.includes("hoàn thành") || s.includes("da giao") || s.includes("đã giao")) {
      return <StatusBadge tone="success">{displayStatus}</StatusBadge>;
    }
    return <StatusBadge tone="warning">{displayStatus}</StatusBadge>;
  }

  function ServiceStatusStepper({ status }: { status: string }) {
    const steps = [
      { label: "Lập phiếu", desc: "Tạo yêu cầu" },
      { label: "Nhận máy / Gia công", desc: "Đang xử lý" },
      { label: "Đã hoàn thành", desc: "Sẵn sàng giao" },
      { label: "Đã giao khách", desc: "Hoàn tất giao" }
    ];

    const lowerStatus = status.toLowerCase();
    let activeStep = 1; // "Nhận máy / Gia công" by default
    if (lowerStatus.includes("hoan thanh") || lowerStatus.includes("hoàn thành")) {
      activeStep = 2; // "Đã hoàn thành"
    }
    if (lowerStatus.includes("da giao") || lowerStatus.includes("đã giao")) {
      activeStep = 3; // "Đã giao khách"
    }

    return (
      <div className="py-6 px-4 bg-muted/10 rounded-2xl border border-border/40 my-4 shadow-inner">
        <div className="relative flex justify-between items-center max-w-3xl mx-auto">
          {/* Background connector line */}
          <div className="absolute top-[18px] left-[5%] right-[5%] h-1 bg-border/65 -z-0 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-gold via-primary to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isActive = idx === activeStep;
            const isUpcoming = idx > activeStep;

            return (
              <div key={step.label} className="relative z-10 flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md",
                    isCompleted && "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20",
                    isActive && "bg-background border-gold text-gold ring-4 ring-gold/20 animate-pulse scale-110",
                    isUpcoming && "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 text-xs font-semibold text-center whitespace-nowrap",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    isActive && "text-gold font-bold",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-[9px] text-muted-foreground/60 hidden sm:block">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        eyebrow="BM9"
        title={t("serviceLookup.title")}
        description={t("serviceLookup.description")}
      />

      {/* Advanced Filter Panel Redesign */}
      <div className="grid gap-4 md:grid-cols-12 items-end bg-card p-5 rounded-2xl border border-border/80 shadow-md">
        {/* Keyword Search Field */}
        <div className="md:col-span-5 space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-gold" />
            Từ khóa tìm kiếm
          </Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/75">
              <Search className="h-4 w-4" />
            </span>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadData(0);
              }}
              placeholder="Tìm kiếm theo số phiếu hoặc tên khách hàng..."
              className="pl-9 pr-8 h-10 w-full rounded-xl border border-input/90 bg-card text-sm shadow-xs focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-150"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold cursor-pointer transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-3 space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Trạng thái dịch vụ
          </Label>
          <Select
            value={status || "all"}
            onValueChange={(value) => setStatus(value === "all" ? "" : value)}
            options={[
              { value: "all", label: t("serviceLookup.allStatus") },
              { value: "Hoan thanh", label: t("serviceLookup.completed") },
              { value: "Chua hoan thanh", label: t("serviceLookup.incomplete") },
            ]}
            className="h-10 rounded-xl border border-border bg-card text-sm w-full focus:ring-2 focus:ring-gold/20"
          />
        </div>

        {/* From Date */}
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t("serviceLookup.from")}
          </Label>
          <DatePickerInput
            value={fromDate}
            onValueChange={setFromDate}
          />
        </div>

        {/* To Date */}
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t("serviceLookup.to")}
          </Label>
          <DatePickerInput
            value={toDate}
            onValueChange={setToDate}
          />
        </div>

        {/* Search Buttons Action Row */}
        <div className="md:col-span-12 flex justify-end gap-2 pt-3 border-t border-border/40 mt-1">
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-xl h-10 px-5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 hover:bg-muted/40 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            Đặt lại bộ lọc
          </Button>
          <Button
            onClick={() => loadData(0)}
            className="rounded-xl h-10 px-6 text-xs font-bold text-white bg-gradient-to-r from-gold via-amber-500 to-amber-600 hover:from-amber-500 hover:to-gold transition-all duration-300 shadow-md shadow-gold/15 flex items-center gap-2 hover-elevate cursor-pointer border-0"
          >
            <Search className="h-4 w-4" />
            Tra cứu phiếu
          </Button>
        </div>
      </div>

      {/* Results Table Card */}
      <Card className="overflow-hidden border border-border/70 shadow-md rounded-2xl">
        <TableToolbar
          title="Danh sách phiếu dịch vụ tra cứu"
          actions={
            <div className="flex gap-2 items-center">
              <span className="text-xs font-semibold text-muted-foreground mr-1">
                {t("common.page")} {page + 1}/{totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 0}
                onClick={() => loadData(page - 1)}
                className="rounded-lg h-8 cursor-pointer text-xs font-semibold"
              >
                {t("common.prev")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => loadData(page + 1)}
                className="rounded-lg h-8 cursor-pointer text-xs font-semibold"
              >
                {t("common.next")}
              </Button>
            </div>
          }
        />

        <CardContent className="p-0">
          {error && <p className="px-4 py-3 text-sm font-semibold text-destructive border-b border-destructive/10 bg-destructive/5">{error}</p>}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <span className="h-8 w-8 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">{t("common.loading")}</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8">
              <EmptyState title={t("common.emptyTitle")} description={t("serviceLookup.emptyDesc")} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="w-12 font-bold">{t("common.stt")}</TableHead>
                    <TableHead className="font-bold">{t("common.voucherNumber")}</TableHead>
                    <TableHead className="font-bold">{t("common.dateCreated")}</TableHead>
                    <TableHead className="font-bold">{t("common.customer")}</TableHead>
                    <TableHead className="font-bold text-right">{t("common.total")}</TableHead>
                    <TableHead className="font-bold text-right">{t("serviceLookup.prepaid")}</TableHead>
                    <TableHead className="font-bold text-right">{t("serviceLookup.remaining")}</TableHead>
                    <TableHead className="font-bold text-center">{t("serviceLookup.serviceStatus")}</TableHead>
                    <TableHead className="text-right font-bold">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const remains = item.tongTienConLai ?? 0;
                    return (
                      <TableRow key={item.soPhieuDichVu} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-bold text-muted-foreground">{page * PAGE_SIZE + index + 1}</TableCell>
                        <TableCell className="font-semibold text-foreground">{item.soPhieuDichVu}</TableCell>
                        <TableCell className="text-muted-foreground">{item.ngayLapPhieuDichVu}</TableCell>
                        <TableCell className="font-medium">{item.tenKhachHang}</TableCell>
                        <TableCell className="text-right font-bold text-foreground">{formatCurrency(item.tongTien)}</TableCell>
                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(item.tongTienTraTruoc)}</TableCell>
                        <TableCell className={cn(
                          "text-right font-bold",
                          remains > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {formatCurrency(remains)}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(item.tinhTrangDichVu)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetail(item.soPhieuDichVu)}
                            className="gap-1 cursor-pointer hover-elevate transition-all duration-150 rounded-lg h-8"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {t("common.viewDetail")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Detail Modal Overhaul */}
      {detail && (
        <DetailModal
          open={Boolean(detail)}
          title={`Phiếu dịch vụ ${detail.soPhieuDichVu}`}
          subtitle="Chi tiết dịch vụ gia công, thanh toán và tiến độ xử lý"
          onClose={() => setDetail(null)}
          onPrint={() => window.print()}
        >
          <div className="space-y-6">
            {/* Visual Stepper Progress Pipeline */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tiến độ thực hiện</p>
              <ServiceStatusStepper status={detail.tinhTrangDichVu} />
            </div>

            {/* General Info Grid */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thông tin chung</p>
              <DetailGrid
                items={[
                  { label: "Ngày lập phiếu", value: detail.ngayLapPhieuDichVu },
                  { label: "Khách hàng", value: detail.khachHang?.tenKhachHang ?? detail.maKhachHang },
                  { label: "Số điện thoại", value: detail.khachHang?.soDienThoai ?? "-" },
                  { label: "Tổng chi phí", value: <span className="font-bold text-foreground">{formatCurrency(detail.tongTien)}</span> },
                  { label: "Đã thanh toán trước", value: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(detail.tongTienTraTruoc)}</span> },
                  { label: "Số dư còn lại", value: <span className={cn("font-bold", detail.tongTienConLai > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>{formatCurrency(detail.tongTienConLai)}</span> },
                ]}
              />
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danh sách dịch vụ chi tiết</p>
              <div className="rounded-xl border border-border/70 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="w-12 font-bold">{t("common.stt")}</TableHead>
                      <TableHead className="font-bold">{t("serviceTypes.title")}</TableHead>
                      <TableHead className="text-center font-bold">{t("common.quantity")}</TableHead>
                      <TableHead className="text-right font-bold">{t("serviceOrders.calculatedPrice")}</TableHead>
                      <TableHead className="text-right font-bold">{t("common.subtotal")}</TableHead>
                      <TableHead className="text-right font-bold">{t("serviceLookup.prepaid")}</TableHead>
                      <TableHead className="text-right font-bold">{t("serviceLookup.remaining")}</TableHead>
                      <TableHead className="text-center font-bold">{t("serviceLookup.serviceStatus")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.items.map((item, index) => {
                      const itemRemains = item.tienConLai ?? 0;
                      return (
                        <TableRow key={`${detail.soPhieuDichVu}-${item.maLoaiDichVu}`} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="font-bold text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-semibold text-foreground">{item.tenLoaiDichVu}</TableCell>
                          <TableCell className="text-center font-medium">{item.soLuongDichVu}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(item.donGiaDuocTinh)}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(item.thanhTien)}</TableCell>
                          <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(item.tienTraTruoc)}</TableCell>
                          <TableCell className={cn(
                            "text-right font-bold",
                            itemRemains > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                          )}>
                            {formatCurrency(itemRemains)}
                          </TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.tinhTrang)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DetailModal>
      )}
    </div>
  );
}
