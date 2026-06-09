"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, TableToolbar, StatusBadge } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactPanel, DetailGrid, DetailModal, LineError, StickySummaryBar, VoucherSection } from "@/components/dashboard/voucher-ui";
import { Combobox } from "@/components/ui/combobox";
import { CustomerSelect } from "@/components/dashboard/customer-select";
import { Pagination } from "@/components/dashboard/pagination";
import { useToastStore } from "@/stores/toast-store";
import { backendApi } from "@/services/backend-api";
import type {
  CustomerResponse,
  SearchServiceTicketResponse,
  ServiceTicketRequest,
  ServiceTicketResponse,
  ServiceTypeResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatNumber, todayIsoDate, toPositiveInt, toPositiveNumber, formatVNCurrencyInput, parseVNCurrencyInput, formatVietnameseStatus } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { ClipboardList, Eye, Filter, Plus, ReceiptText, RotateCcw, Search, Truck, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

function getStatusBadge(statusStr: string, ngayGiao?: string | null) {
  const displayStatus = formatVietnameseStatus(statusStr);

  if (displayStatus === "Hoàn thành") {
    return <StatusBadge tone="success">Hoàn thành</StatusBadge>;
  }
  if (displayStatus === "Chưa hoàn thành") {
    return <StatusBadge tone="warning">Chưa hoàn thành</StatusBadge>;
  }

  const isDone = displayStatus === "Đã giao";
  if (isDone) {
    return <StatusBadge tone="success">Đã giao</StatusBadge>;
  }

  // Logic cho phiếu chưa giao
  if (ngayGiao) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(ngayGiao);
    delivery.setHours(0, 0, 0, 0);

    if (delivery < today) {
      return <StatusBadge tone="danger">Trễ hẹn</StatusBadge>;
    }
    if (delivery.getTime() === today.getTime()) {
      return <StatusBadge tone="warning">Cần giao ngay</StatusBadge>;
    }
    return <StatusBadge tone="neutral">Đang xử lý</StatusBadge>;
  }

  return <StatusBadge tone="warning">Chưa giao</StatusBadge>;
}

function ServiceStatusStepper({ status, ngayGiao }: { status: string, ngayGiao?: string | null }) {
  const lowerStatus = status.toLowerCase().trim();
  const isCompleted = lowerStatus === "hoan thanh" || lowerStatus === "hoàn thành" || lowerStatus === "da giao" || lowerStatus === "đã giao";

  let activeStep = 1; // Mặc định là đang xử lý

  if (isCompleted) {
    activeStep = 3; // Hoàn thành đã giao (bước 3 đã hoàn tất)
  } else if (ngayGiao) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delivery = new Date(ngayGiao);
    delivery.setHours(0, 0, 0, 0);

    if (delivery <= today) {
      activeStep = 2; // Sẵn sàng đợi giao (bước 2 đã hoàn tất)
    }
  }

  const steps = [
    { label: "Tiếp nhận", desc: "Đã lập phiếu" },
    { label: activeStep > 1 ? "Đã hoàn thành" : "Đang xử lý", desc: activeStep > 1 ? "Đã hoàn thành" : "Đang thực hiện" },
    { 
      label: isCompleted ? "Hoàn thành đã giao" : (activeStep === 2 ? "Sẵn sàng đợi giao" : "Chờ bàn giao"), 
      desc: isCompleted ? "Đã giao khách" : (activeStep === 2 ? "Sẵn sàng bàn giao" : "Đến hẹn bàn giao") 
    }
  ];

  // Tiến độ nối tới bước hiện tại
  const progressStep = activeStep;

  return (
    <div className="py-6 px-4 bg-muted/10 rounded-2xl border border-border/40 my-4 shadow-inner">
      <div className="relative flex justify-between items-center max-w-3xl mx-auto">
        <div className="absolute top-[18px] left-[16.66%] right-[16.66%] h-1 bg-border/65 -z-0 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-gold via-primary to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(Math.min(progressStep, steps.length - 1) / (steps.length - 1)) * 100}%` }}
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

type ServiceItemDraft = {
  keyId: string;
  maLoaiDichVu: string;
  soLuongDichVu: string;
  donGiaDuocTinh: string;
  ngayGiao: string;
};

const createEmptyItem = (): ServiceItemDraft => ({
  keyId: Math.random().toString(36).substring(2, 9),
  maLoaiDichVu: "",
  soLuongDichVu: "1",
  donGiaDuocTinh: "0",
  ngayGiao: todayIsoDate(),
});

export default function ServiceOrdersPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeResponse[]>([]);
  const [prepaymentRate, setPrepaymentRate] = useState(50);

  const [soPhieuDichVu, setSoPhieuDichVu] = useState("");
  const [ngayLapPhieuDichVu, setNgayLapPhieuDichVu] = useState(todayIsoDate());
  const [maKhachHang, setMaKhachHang] = useState("");
  const [tongTienTraTruoc, setTongTienTraTruoc] = useState("0");
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [items, setItems] = useState<ServiceItemDraft[]>([createEmptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicketResponse | null>(null);

  // Advanced Lookup States
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyTickets, setHistoryTickets] = useState<SearchServiceTicketResponse[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  const [historyKeyword, setHistoryKeyword] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");
  const [historyFromDate, setHistoryFromDate] = useState("");
  const [historyToDate, setHistoryToDate] = useState("");

  useEffect(() => {
    if (maKhachHang) {
      backendApi.customers.getById(maKhachHang)
        .then(setSelectedCustomer)
        .catch((err) => {
          console.error("Error loading selected customer", err);
          setSelectedCustomer(null);
        });
    } else {
      setSelectedCustomer(null);
    }
  }, [maKhachHang]);

  const totals = useMemo(() => {
    const tongTien = items.reduce((sum, item) => {
      const soLuong = toPositiveInt(item.soLuongDichVu);
      const donGiaDuocTinh = toPositiveNumber(item.donGiaDuocTinh);
      return sum + soLuong * donGiaDuocTinh;
    }, 0);

    const tongTraTruoc = toPositiveNumber(tongTienTraTruoc);
    const tongConLai = Math.max(0, tongTien - tongTraTruoc);

    return {
      tongTien,
      tongTraTruoc,
      tongConLai,
    };
  }, [items, tongTienTraTruoc]);

  useEffect(() => {
    if (!isManuallyEdited) {
      const minPrepay = Math.round(totals.tongTien * (prepaymentRate / 100));
      setTongTienTraTruoc(String(minPrepay));
    }
  }, [totals.tongTien, isManuallyEdited, prepaymentRate]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [serviceTypeData, prepayment] = await Promise.all([
        backendApi.serviceTypes.list(),
        backendApi.settings.getServicePrepaymentRate().catch((err) => {
          console.warn("Failed to load prepayment rate, using default 50%:", err);
          return { key: "SERVICE_PREPAYMENT_RATE", value: 50 };
        }),
      ]);

      setServiceTypes(serviceTypeData);
      setPrepaymentRate(Number(prepayment.value ?? 50));
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceOrders.loadError")));
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(nextPage = historyPage) {
    setHistoryLoading(true);
    setError(null);
    try {
      const data = await backendApi.search.serviceTickets({
        keyword: historyKeyword.trim() || undefined,
        status: historyStatus || undefined,
        fromDate: historyFromDate || undefined,
        toDate: historyToDate || undefined,
        page: nextPage,
        size: 10,
      });

      setHistoryTickets(data.content);
      setHistoryPage(data.number ?? nextPage);
      setHistoryTotalPages(Math.max(1, data.totalPages || 1));
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceLookup.loadError")));
    } finally {
      setHistoryLoading(false);
    }
  }

  // Debounced search when any filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory(0);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyKeyword, historyStatus, historyFromDate, historyToDate]);

  async function openDetail(soPhieuDichVu: string) {
    setError(null);
    try {
      const data = await backendApi.serviceTickets.getById(soPhieuDichVu);
      setSelectedTicket(data);
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceLookup.detailError")));
    }
  }

  useEffect(() => {
    loadData();
    loadHistory(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRow() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function removeRow(index: number) {
    const itemToDelete = items[index];
    if (!itemToDelete) return;

    const serviceType = serviceTypes.find((t) => t.maLoaiDichVu === itemToDelete.maLoaiDichVu);
    const serviceName = serviceType ? serviceType.tenLoaiDichVu : itemToDelete.maLoaiDichVu || "chưa chọn";

    setItems((prev) => prev.filter((_, i) => i !== index));

    useToastStore.getState().success(t("toasts.deletedServiceRow").replace("{name}", serviceName), {
      label: t("toasts.undo"),
      onClick: () => {
        setItems((prev) => {
          const updated = [...prev];
          updated.splice(index, 0, itemToDelete);
          return updated;
        });
      },
    });
  }

  function updateItem(index: number, patch: Partial<ServiceItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setFormError(null);
  }

  function getItemError(item: ServiceItemDraft) {
    if (!item.maLoaiDichVu) {
      return t("serviceOrders.serviceTypeRequired");
    }
    if (toPositiveInt(item.soLuongDichVu) <= 0) {
      return t("serviceOrders.quantityInvalid");
    }
    if (toPositiveNumber(item.donGiaDuocTinh) < 0) {
      return "Đơn giá được tính không hợp lệ";
    }
    if (!item.ngayGiao) {
      return "Vui lòng chọn ngày hẹn giao";
    }
    return null;
  }

  function onServiceTypeChange(index: number, maLoaiDichVu: string) {
    const serviceType = serviceTypes.find((type) => type.maLoaiDichVu === maLoaiDichVu);
    updateItem(index, {
      maLoaiDichVu,
      donGiaDuocTinh: String(serviceType?.donGiaDichVu ?? 0),
    });
  }

  async function submit() {
    setFormError(null);

    if (!maKhachHang) {
      setFormError(t("serviceOrders.customerRequired"));
      return;
    }

    if (items.length === 0) {
      setFormError(t("serviceOrders.minOneItem"));
      return;
    }

    const minPrepayment = (prepaymentRate / 100) * totals.tongTien;
    if (totals.tongTraTruoc < minPrepayment) {
      setFormError(
        t("serviceOrders.prepaymentInsufficient")
          .replace("{name}", t("serviceOrders.title"))
          .replace("{amount}", formatCurrency(minPrepayment)),
      );
      return;
    }

    const seen = new Set<string>();

    for (const item of items) {
      if (!item.maLoaiDichVu) {
        setFormError(t("serviceOrders.serviceTypeRequired"));
        return;
      }

      if (seen.has(item.maLoaiDichVu)) {
        setFormError(t("serviceOrders.duplicateServiceType"));
        return;
      }
      seen.add(item.maLoaiDichVu);

      const soLuong = toPositiveInt(item.soLuongDichVu);
      if (soLuong <= 0) {
        setFormError(t("serviceOrders.quantityInvalid"));
        return;
      }

      const donGiaDuocTinh = toPositiveNumber(item.donGiaDuocTinh);
      if (donGiaDuocTinh < 0) {
        setFormError("Đơn giá được tính không hợp lệ");
        return;
      }

      if (!item.ngayGiao) {
        setFormError("Vui lòng chọn ngày hẹn giao cho tất cả các dịch vụ");
        return;
      }
    }

    const realPrepayment = toPositiveNumber(tongTienTraTruoc);

    let allocatedPrepaymentSum = 0;
    const apiItems = items.map((item, idx) => {
      const serviceType = serviceTypes.find((t) => t.maLoaiDichVu === item.maLoaiDichVu);
      const donGiaDichVu = Number(serviceType?.donGiaDichVu ?? 0);
      const soLuong = toPositiveInt(item.soLuongDichVu);
      const donGiaDuocTinh = toPositiveNumber(item.donGiaDuocTinh);
      const lineTotal = soLuong * donGiaDuocTinh;

      const chiPhiRieng = Math.max(0, donGiaDuocTinh - donGiaDichVu);

      let tienTraTruoc = 0;
      if (totals.tongTien > 0) {
        if (idx === items.length - 1) {
          tienTraTruoc = Math.max(0, realPrepayment - allocatedPrepaymentSum);
        } else {
          tienTraTruoc = Math.round((lineTotal / totals.tongTien) * realPrepayment);
          allocatedPrepaymentSum += tienTraTruoc;
        }
      }

      return {
        maLoaiDichVu: item.maLoaiDichVu,
        soLuongDichVu: soLuong,
        chiPhiRieng,
        tienTraTruoc,
        ngayGiao: item.ngayGiao || undefined,
      };
    });

    const payload: ServiceTicketRequest = {
      soPhieuDichVu: soPhieuDichVu.trim() || undefined,
      ngayLapPhieuDichVu,
      maKhachHang,
      items: apiItems,
    };

    setSubmitting(true);
    try {
      const created = await backendApi.serviceTickets.create(payload);
      setSoPhieuDichVu("");
      setTongTienTraTruoc("0");
      setIsManuallyEdited(false);
      setItems([createEmptyItem()]);
      await loadData();
      await loadHistory(0);
      useToastStore.getState().success(t("toasts.createServiceSuccess").replace("{code}", created.soPhieuDichVu));
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("serviceOrders.createError")));
    } finally {
      setSubmitting(false);
    }
  }

  async function deliverItem(soPhieuDichVu: string, maLoaiDichVu: string) {
    try {
      const updated = await backendApi.serviceTickets.deliverItem(soPhieuDichVu, maLoaiDichVu);
      setSelectedTicket(updated);
      await loadHistory(historyPage);
      useToastStore.getState().success(t("toasts.serviceDelivered").replace("{code}", soPhieuDichVu));
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceOrders.deliverError")));
    }
  }

  async function deliverAll(soPhieuDichVu: string) {
    try {
      const updated = await backendApi.serviceTickets.deliverAll(soPhieuDichVu);
      setSelectedTicket(updated);
      await loadHistory(historyPage);
      useToastStore.getState().success(t("toasts.serviceDeliveredAll").replace("{code}", soPhieuDichVu));
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceOrders.deliverAllError")));
    }
  }

  function printTicket() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            {t("serviceOrders.title")}
          </h1>
          <p className="text-xs text-muted-foreground">{t("serviceOrders.description")}</p>
        </div>
        <Badge variant="outline" className="text-xs py-0.5 h-6 font-semibold">
          {t("serviceOrders.minPrepaymentRate")}: {prepaymentRate}%
        </Badge>
      </div>
      {/* KHỐI FORM LẬP PHIẾU DỊCH VỤ - Ở TRÊN */}
      <Card className="shadow-sm border-border/80">
        <CardContent className="space-y-6 p-6">
          <VoucherSection title={t("common.generalInfo")} description="" icon={ClipboardList}>
            <div className="grid gap-4 lg:grid-cols-[180px_220px_1fr] lg:items-end">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.dateCreated")}</Label>
                <DatePickerInput value={ngayLapPhieuDichVu} onValueChange={setNgayLapPhieuDichVu} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.phone")}</Label>
                <CustomerSelect
                  value={maKhachHang || ""}
                  onValueChange={setMaKhachHang}
                  className="h-9"
                  placeholder={t("common.enterPhoneNumber")}
                />
              </div>
              <ContactPanel
                emptyText={t("common.noCustomerSelected")}
                rows={selectedCustomer ? [
                  { label: t("common.customer"), value: selectedCustomer.tenKhachHang },
                  { label: t("common.address"), value: selectedCustomer.diaChiKhachHang },
                ] : []}
              />
            </div>
          </VoucherSection>

          <VoucherSection title={t("common.serviceDetail")} description="" icon={ReceiptText}>
          <div className="rounded-md border border-border/80">
            <Table className="min-w-[1260px]">
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 text-center py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider min-w-[200px]">{t("serviceTypes.title")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("serviceOrders.serviceTypePrice")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider min-w-[140px]">Đơn giá được tính</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider w-32">{t("common.quantity")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.subtotal")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider min-w-[130px]">{t("serviceOrders.deliveryDate")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("serviceOrders.serviceStatus")}</TableHead>
                  <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-right w-16">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => {
                  const serviceType = serviceTypes.find((type) => type.maLoaiDichVu === item.maLoaiDichVu);
                  const soLuong = toPositiveInt(item.soLuongDichVu);
                  const donGiaDichVu = Number(serviceType?.donGiaDichVu ?? 0);
                  const donGiaDuocTinh = toPositiveNumber(item.donGiaDuocTinh);
                  const thanhTien = soLuong * donGiaDuocTinh;

                  return (
                    <Fragment key={item.keyId}>
                    <TableRow className="hover:bg-accent/15 border-b border-border/60">
                      <TableCell className="py-3.5 px-4 text-center font-bold text-sm text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Combobox
                          value={item.maLoaiDichVu || ""}
                          onValueChange={(value) => onServiceTypeChange(index, value)}
                          options={serviceTypes
                            .filter((st) => (st.isActive !== false || st.maLoaiDichVu === item.maLoaiDichVu) && !items.some((draftItem, idx) => idx !== index && draftItem.maLoaiDichVu === st.maLoaiDichVu))
                            .map((option) => ({
                              value: option.maLoaiDichVu,
                              label: option.tenLoaiDichVu,
                            }))}
                          className="h-9"
                          placeholder="Chọn loại dịch vụ..."
                        />
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-medium text-muted-foreground">{formatCurrency(donGiaDichVu)}</TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="relative flex items-center w-full">
                          <Input
                            type="text"
                            value={formatVNCurrencyInput(item.donGiaDuocTinh)}
                            onChange={(e) => updateItem(index, { donGiaDuocTinh: parseVNCurrencyInput(e.target.value) })}
                            className="h-9 text-sm pr-9 text-right font-semibold"
                          />
                          <span className="absolute right-2.5 text-xs text-muted-foreground font-semibold pointer-events-none select-none">
                            đ
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <div className="flex items-center w-28 h-9 border rounded-lg bg-background overflow-hidden focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
                          <button
                            type="button"
                            className="h-full w-8 border-r border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center font-bold text-sm select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {
                              const val = toPositiveInt(item.soLuongDichVu) || 1;
                              updateItem(index, { soLuongDichVu: String(Math.max(1, val - 1)) });
                            }}
                            disabled={toPositiveInt(item.soLuongDichVu) <= 1}
                          >
                            -
                          </button>
                          <input
                            value={item.soLuongDichVu}
                            type="number"
                            min="1"
                            onChange={(e) => updateItem(index, { soLuongDichVu: e.target.value })}
                            onBlur={(e) => {
                              const val = toPositiveInt(e.target.value);
                              if (val <= 0) {
                                updateItem(index, { soLuongDichVu: "1" });
                              }
                            }}
                            className="h-full w-full min-w-0 border-0 bg-transparent text-center focus:outline-none focus:ring-0 text-sm font-semibold px-1"
                          />
                          <button
                            type="button"
                            className="h-full w-8 border-l border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center font-bold text-sm select-none cursor-pointer"
                            onClick={() => {
                              const val = toPositiveInt(item.soLuongDichVu) || 1;
                              updateItem(index, { soLuongDichVu: String(val + 1) });
                            }}
                          >
                            +
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(thanhTien)}</TableCell>
                      <TableCell className="py-3.5 px-4">
                        <DatePickerInput value={item.ngayGiao} onValueChange={(val) => updateItem(index, { ngayGiao: val })} />
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <Badge variant="secondary" className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 border-slate-200">
                          Chưa giao
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-right">
                        <Button variant="destructive" size="icon-sm" className="h-8 w-8" onClick={() => removeRow(index)} disabled={items.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {getItemError(item) && (
                      <TableRow className="border-b border-border/60 hover:bg-transparent">
                        <TableCell colSpan={9} className="px-4 py-0">
                          <LineError>Dòng {index + 1}: {getItemError(item)}</LineError>
                        </TableCell>
                      </TableRow>
                    )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          </VoucherSection>

          <StickySummaryBar
            action={(
              <div className="flex flex-wrap items-center justify-end gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/20 shadow-xs flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {t("common.total")}:
                  </span>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(totals.tongTien)}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-1.5 dark:border-blue-800 dark:bg-blue-950/20 shadow-xs flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {t("serviceOrders.prepaid")} (&gt;={prepaymentRate}%):
                  </span>
                  <div className="relative flex items-center w-36">
                    <Input
                      type="text"
                      value={formatVNCurrencyInput(tongTienTraTruoc)}
                      onChange={(e) => {
                        setIsManuallyEdited(true);
                        setTongTienTraTruoc(parseVNCurrencyInput(e.target.value));
                      }}
                      className="h-8 w-full bg-white dark:bg-slate-900 border-blue-300 focus-visible:ring-blue-500 font-extrabold text-blue-700 dark:text-blue-300 text-sm pl-2 !pr-10 text-right shadow-none py-0.5 rounded-md"
                    />
                    <span className="absolute right-2.5 text-xs text-blue-600 dark:text-blue-400 font-extrabold pointer-events-none select-none">
                      đ
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-1.5 dark:border-amber-800 dark:bg-amber-950/20 shadow-xs flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {t("serviceOrders.remaining")}:
                  </span>
                  <div className="text-base font-black text-amber-700 dark:text-amber-300">
                    {formatCurrency(totals.tongConLai)}
                  </div>
                </div>

                <Button
                  size="default"
                  className="bg-gold-gradient text-gold-foreground font-bold hover:brightness-105 active:scale-95 shadow-md shadow-gold/25 h-10 text-sm px-6 cursor-pointer rounded-xl transition-all border-none"
                  onClick={submit}
                  disabled={submitting || loading}
                >
                  {submitting ? t("common.creating") : t("serviceOrders.createButton")}
                </Button>
              </div>
            )}
          >
            <Button
              variant="outline"
              className="border-blue-500/40 text-blue-600 hover:bg-blue-500/10 active:scale-95 transition-all shadow-xs h-10 text-sm px-5 font-bold rounded-xl cursor-pointer border"
              onClick={addRow}
            >
              <Plus className="mr-1.5 h-4.5 w-4.5 stroke-[2.5]" />
              {t("common.addRow")}
            </Button>
          </StickySummaryBar>

          {(formError || error) && (
            <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-3">
              {formError && <p>{formError}</p>}
              {error && <p>{error}</p>}
            </div>
          )}

        </CardContent>
      </Card>

      {/* ADVANCED SERVICE VOUCHER LOOKUP PANEL */}
      <Card className="shadow-sm border-border/80 p-5 space-y-4 glass-card">
        <div className="flex items-center space-x-2 border-b border-border/40 pb-2">
          <Filter className="h-5 w-5 text-gold" />
          <h2 className="text-base font-bold text-foreground uppercase tracking-wider">{t("serviceLookup.title")}</h2>
        </div>

        {/* Advanced Filter Panel Redesign */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-12 items-end">
          {/* Keyword Search Field */}
          <div className="lg:col-span-4 md:col-span-12 space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              Từ khóa tìm kiếm
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/75">
                <Search className="h-4 w-4" />
              </span>
              <Input
                value={historyKeyword}
                onChange={(e) => setHistoryKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadHistory(0);
                }}
                placeholder={t("serviceLookup.searchPlaceholder")}
                className="pl-9 pr-8 h-10 w-full rounded-xl border border-input/90 bg-card text-sm shadow-xs focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-150"
              />
              {historyKeyword && (
                <button
                  type="button"
                  onClick={() => setHistoryKeyword("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold cursor-pointer transition-colors duration-150"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="lg:col-span-2 md:col-span-4 space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Trạng thái
            </Label>
            <Select
              value={historyStatus || "all"}
              onValueChange={(value) => setHistoryStatus(value === "all" ? "" : value)}
              options={[
                { value: "all", label: "Tất cả" },
                { value: "Hoan thanh", label: "Hoàn thành" },
                { value: "Chua hoan thanh", label: "Chưa hoàn thành" },
              ]}
              className="h-10 rounded-xl border border-border bg-card text-sm w-full focus:ring-2 focus:ring-gold/20"
            />
          </div>

          {/* From Date */}
          <div className="lg:col-span-2 md:col-span-4 space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Từ ngày
            </Label>
            <DatePickerInput
              value={historyFromDate}
              onValueChange={setHistoryFromDate}
            />
          </div>

          {/* To Date */}
          <div className="lg:col-span-2 md:col-span-4 space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Đến ngày
            </Label>
            <DatePickerInput
              value={historyToDate}
              onValueChange={setHistoryToDate}
            />
          </div>

          {/* Search Buttons Action Row */}
          <div className="lg:col-span-2 md:col-span-12 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setHistoryKeyword("");
                setHistoryStatus("");
                setHistoryFromDate("");
                setHistoryToDate("");
              }}
              className="rounded-xl h-10 px-3 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 hover:bg-muted/40 cursor-pointer flex-1"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              Đặt lại
            </Button>
            <Button
              onClick={() => loadHistory(0)}
              className="rounded-xl h-10 px-3 text-xs font-bold text-white bg-gradient-to-r from-gold via-amber-500 to-amber-600 hover:from-amber-500 hover:to-gold transition-all duration-300 shadow-md shadow-gold/15 flex items-center justify-center gap-1.5 hover-elevate cursor-pointer border-0 flex-1"
            >
              <Search className="h-4 w-4 shrink-0" />
              Tra cứu
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Table Card */}
      <Card className="overflow-hidden border border-border/70 shadow-md rounded-2xl">
        <TableToolbar
          title={t("serviceLookup.title")}
          actions={
            <div className="flex gap-2 items-center">
              <span className="text-xs font-semibold text-muted-foreground mr-1">
                Trang {historyPage + 1}/{historyTotalPages}
              </span>
            </div>
          }
        />

        <CardContent className="p-0">
          {historyTickets.length === 0 && historyLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <span className="h-8 w-8 rounded-full border-4 border-gold/30 border-t-gold animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">{t("common.loading")}</p>
              </div>
            </div>
          ) : historyTickets.length === 0 ? (
            <div className="p-8">
              <EmptyState title={t("common.emptyTitle")} description="Không tìm thấy phiếu dịch vụ nào phù hợp" />
            </div>
          ) : (
            <>
            <div className={cn("overflow-x-auto transition-opacity duration-200", historyLoading && "opacity-50 pointer-events-none")}>
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="w-12 font-bold py-2 px-3 h-8 text-[11px] uppercase tracking-wider">{t("common.stt")}</TableHead>
                    <TableHead className="font-bold py-2 px-3 h-8 text-[11px] uppercase tracking-wider">{t("common.voucherNumber")}</TableHead>
                    <TableHead className="font-bold py-2 px-3 h-8 text-[11px] uppercase tracking-wider">{t("common.dateCreated")}</TableHead>
                    <TableHead className="font-bold py-2 px-3 h-8 text-[11px] uppercase tracking-wider">{t("common.customer")}</TableHead>
                    <TableHead className="font-bold text-right py-2 px-3 h-8 text-[11px] uppercase tracking-wider">{t("common.total")}</TableHead>
                    <TableHead className="font-bold text-right py-2 px-3 h-8 text-[11px] uppercase tracking-wider">{t("serviceOrders.prepaid")}</TableHead>
                    <TableHead className="font-bold text-right py-2 px-3 h-8 text-[11px] uppercase tracking-wider">{t("serviceOrders.remaining")}</TableHead>
                    <TableHead className="font-bold text-center py-2 px-3 h-8 text-[11px] uppercase tracking-wider">{t("serviceOrders.serviceStatus")}</TableHead>
                    <TableHead className="text-right font-bold py-2 px-3 h-8 text-[11px] uppercase tracking-wider w-28">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyTickets.map((item, index) => {
                    const remains = item.tongTienConLai ?? 0;
                    return (
                      <TableRow key={item.soPhieuDichVu} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="py-1.5 px-3 font-bold text-xs text-muted-foreground">{historyPage * 10 + index + 1}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs font-semibold text-foreground">{item.soPhieuDichVu}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{item.ngayLapPhieuDichVu}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs font-medium">{item.tenKhachHang}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-right font-bold text-foreground">{formatCurrency(item.tongTien)}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-right text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(item.tongTienTraTruoc)}</TableCell>
                        <TableCell className={cn(
                          "py-1.5 px-3 text-xs text-right font-bold",
                          remains > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                          {formatCurrency(remains)}
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-center">{getStatusBadge(item.tinhTrangDichVu, item.ngayGiao)}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetail(item.soPhieuDichVu)}
                              className="h-7 w-7 p-0 cursor-pointer hover-elevate transition-all duration-150 rounded-lg"
                              title={t("common.viewDetail")}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {item.tinhTrangDichVu.toLowerCase() !== "hoan thanh" && item.tinhTrangDichVu.toLowerCase() !== "hoàn thành" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0 cursor-pointer"
                                title={t("serviceOrders.deliverAll")}
                                onClick={() => deliverAll(item.soPhieuDichVu)}
                              >
                                <Truck className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic font-semibold px-2">Hoàn tất</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-center border-t border-border/60 py-4">
              <Pagination
                currentPage={historyPage + 1}
                totalPages={historyTotalPages}
                onPageChange={(page) => loadHistory(page - 1)}
              />
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedTicket && (
        <DetailModal
          open={Boolean(selectedTicket)}
          title={`${t("nav.serviceOrders") || "Phiếu dịch vụ"} ${selectedTicket.soPhieuDichVu}`}
          subtitle={t("serviceOrders.detailSubtitle")}
          onClose={() => setSelectedTicket(null)}
          onPrint={printTicket}
        >
          <div className="space-y-6">
            {/* Visual Stepper Progress Pipeline */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("serviceOrders.progress")}</p>
              <ServiceStatusStepper
                status={selectedTicket.tinhTrangDichVu}
                ngayGiao={selectedTicket.items
                  .filter(i => !i.tinhTrang.toLowerCase().includes("da giao"))
                  .map(i => i.ngayGiao)
                  .filter(Boolean)
                  .sort()[0] || null
                }
              />
            </div>

            {/* General Info Grid */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("common.generalInfo")}</p>
              <DetailGrid
                items={[
                  { label: t("common.dateCreated"), value: selectedTicket.ngayLapPhieuDichVu },
                  { label: t("common.customer"), value: selectedTicket.khachHang?.tenKhachHang ?? selectedTicket.maKhachHang },
                  { label: t("common.phone"), value: selectedTicket.khachHang?.soDienThoai ?? "-" },
                  { label: t("common.total"), value: <span className="font-bold text-foreground">{formatCurrency(selectedTicket.tongTien)}</span> },
                  { label: t("serviceOrders.prepaid"), value: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedTicket.tongTienTraTruoc)}</span> },
                  { label: t("serviceOrders.remaining"), value: <span className={cn("font-bold", selectedTicket.tongTienConLai > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>{formatCurrency(selectedTicket.tongTienConLai)}</span> },
                ]}
              />
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("serviceOrders.detailsList")}</p>
                {!selectedTicket.tinhTrangDichVu.toLowerCase().includes("hoan thanh") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold text-gold border-gold/45 hover:bg-gold/10 gap-1.5 cursor-pointer"
                    onClick={() => deliverAll(selectedTicket.soPhieuDichVu)}
                  >
                    <Truck className="h-4 w-4" />
                    {t("serviceOrders.deliverAll")}
                  </Button>
                )}
              </div>
              <div className="rounded-xl border border-border/70 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="w-12 font-bold">{t("common.stt")}</TableHead>
                      <TableHead className="font-bold">{t("serviceTypes.title")}</TableHead>
                      <TableHead className="text-center font-bold">{t("common.quantity")}</TableHead>
                      <TableHead className="text-right font-bold">{t("serviceOrders.calculatedPrice")}</TableHead>
                      <TableHead className="text-right font-bold">{t("common.subtotal")}</TableHead>
                      <TableHead className="text-right font-bold">{t("serviceOrders.prepaid")}</TableHead>
                      <TableHead className="text-right font-bold">{t("serviceOrders.remaining")}</TableHead>
                      <TableHead className="text-center font-bold">{t("common.status")}</TableHead>
                      <TableHead className="text-right font-bold w-24">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTicket.items.map((item, index) => {
                      const itemRemains = item.tienConLai ?? 0;
                      const isDelivered = item.tinhTrang.toLowerCase().includes("da giao") || item.tinhTrang.toLowerCase().includes("đã giao");
                      return (
                        <TableRow key={`${selectedTicket.soPhieuDichVu}-${item.maLoaiDichVu}`} className="hover:bg-muted/20 transition-colors">
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
                          <TableCell className="text-center">{getStatusBadge(item.tinhTrang, item.ngayGiao)}</TableCell>
                          <TableCell className="text-right">
                            {!isDelivered ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] px-2 font-semibold hover:bg-muted/40 cursor-pointer"
                                onClick={() => deliverItem(selectedTicket.soPhieuDichVu, item.maLoaiDichVu)}
                              >
                                {t("serviceOrders.deliver")}
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic font-semibold px-2">{t("serviceLookup.completed")}</span>
                            )}
                          </TableCell>
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
