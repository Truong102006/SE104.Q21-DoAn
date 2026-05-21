"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactPanel, DetailGrid, DetailModal, LineError, StickySummaryBar, VoucherSection } from "@/components/dashboard/voucher-ui";
import { backendApi } from "@/services/backend-api";
import type {
  CustomerResponse,
  ServiceTicketRequest,
  ServiceTicketResponse,
  ServiceTypeResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, todayIsoDate, toPositiveInt, toPositiveNumber, formatVNCurrencyInput, parseVNCurrencyInput } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { ClipboardList, Eye, Plus, ReceiptText, Truck, Trash2 } from "lucide-react";

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
  ngayGiao: "",
});

export default function ServiceOrdersPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeResponse[]>([]);
  const [tickets, setTickets] = useState<ServiceTicketResponse[]>([]);
  const [prepaymentRate, setPrepaymentRate] = useState(50);

  const [soPhieuDichVu, setSoPhieuDichVu] = useState("");
  const [ngayLapPhieuDichVu, setNgayLapPhieuDichVu] = useState(todayIsoDate());
  const [maKhachHang, setMaKhachHang] = useState("");
  const [tongTienTraTruoc, setTongTienTraTruoc] = useState("0");
  const [items, setItems] = useState<ServiceItemDraft[]>([createEmptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyStatus, setHistoryStatus] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicketResponse | null>(null);

  const selectedCustomer = useMemo(
    () => customers.find((item) => item.maKhachHang === maKhachHang) ?? null,
    [customers, maKhachHang],
  );

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

  const filteredTickets = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const status = ticket.tinhTrangDichVu.toLowerCase();
      const matchesQuery = !query
        || ticket.soPhieuDichVu.toLowerCase().includes(query)
        || (ticket.khachHang?.tenKhachHang ?? ticket.maKhachHang).toLowerCase().includes(query);
      const matchesStatus = historyStatus === "all"
        || (historyStatus === "completed" && status.includes("hoan thanh"))
        || (historyStatus === "incomplete" && !status.includes("hoan thanh"));
      return matchesQuery && matchesStatus;
    });
  }, [historyQuery, historyStatus, tickets]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [customerData, serviceTypeData, ticketData, prepayment] = await Promise.all([
        backendApi.customers.list(),
        backendApi.serviceTypes.list(),
        backendApi.serviceTickets.list(),
        backendApi.settings.getServicePrepaymentRate(),
      ]);

      setCustomers(customerData);
      setServiceTypes(serviceTypeData);
      setTickets(ticketData);
      setPrepaymentRate(Number(prepayment.value ?? 50));

      if (!maKhachHang && customerData.length > 0) {
        setMaKhachHang(customerData[0].maKhachHang);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceOrders.loadError")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRow() {
    setItems((prev) => [...prev, createEmptyItem()]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
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
      await backendApi.serviceTickets.create(payload);
      setSoPhieuDichVu("");
      setTongTienTraTruoc("0");
      setItems([createEmptyItem()]);
      await loadData();
    } catch (err) {
      setFormError(getApiErrorMessage(err, t("serviceOrders.createError")));
    } finally {
      setSubmitting(false);
    }
  }

  async function deliverItem(ticket: ServiceTicketResponse, maLoaiDichVu: string) {
    try {
      await backendApi.serviceTickets.deliverItem(ticket.soPhieuDichVu, maLoaiDichVu);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceOrders.deliverError")));
    }
  }

  async function deliverAll(ticket: ServiceTicketResponse) {
    try {
      await backendApi.serviceTickets.deliverAll(ticket.soPhieuDichVu);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceOrders.deliverAllError")));
    }
  }

  function printTicket() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="BM7"
        title={t("serviceOrders.title")}
        description={t("serviceOrders.description")}
        badges={<Badge variant="outline" className="text-xs py-0.5 h-6">{t("serviceOrders.minPrepaymentRate")}: {prepaymentRate}%</Badge>}
      />

      {/* KHỐI FORM LẬP PHIẾU DỊCH VỤ - Ở TRÊN */}
      <Card className="shadow-sm border-border/80">
        <CardContent className="space-y-6 p-6">
          <VoucherSection title="Thông tin chung" description="Chọn khách hàng và ngày lập phiếu" icon={ClipboardList}>
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(260px,1fr)_minmax(320px,1.2fr)] lg:items-end">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.dateCreated")}</Label>
                <Input type="date" className="h-9 text-sm" value={ngayLapPhieuDichVu} onChange={(e) => setNgayLapPhieuDichVu(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-muted-foreground">{t("common.customer")}</Label>
                <Select
                  value={maKhachHang || ""}
                  onValueChange={setMaKhachHang}
                  options={customers.map((item) => ({ value: item.maKhachHang, label: `${item.maKhachHang} - ${item.tenKhachHang}` }))}
                  className="h-9 text-sm"
                />
              </div>
              <ContactPanel
                emptyText="Chưa chọn khách hàng"
                rows={selectedCustomer ? [
                  { label: t("common.phone"), value: selectedCustomer.soDienThoaiKhachHang },
                  { label: t("common.address"), value: selectedCustomer.diaChiKhachHang },
                ] : []}
              />
            </div>
          </VoucherSection>

          <VoucherSection title="Chi tiết dịch vụ" description="Nhập từng dòng dịch vụ, số lượng và ngày giao dự kiến" icon={ReceiptText}>
          <div className="rounded-md border border-border/80 overflow-hidden">
            <Table>
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
                        <Select
                          value={item.maLoaiDichVu || ""}
                          onValueChange={(value) => onServiceTypeChange(index, value)}
                          options={serviceTypes.map((option) => ({
                            value: option.maLoaiDichVu,
                            label: `${option.maLoaiDichVu} - ${option.tenLoaiDichVu}`,
                          }))}
                          className="h-9 text-sm"
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
                        <Input type="date" className="h-9 text-sm" value={item.ngayGiao} onChange={(e) => updateItem(index, { ngayGiao: e.target.value })} />
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
                    {t("serviceOrders.prepaid")} ({prepaymentRate}%):
                  </span>
                  <div className="relative flex items-center w-36">
                    <Input
                      type="text"
                      value={formatVNCurrencyInput(tongTienTraTruoc)}
                      onChange={(e) => setTongTienTraTruoc(parseVNCurrencyInput(e.target.value))}
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

                <Button size="default" className="h-10 text-sm font-semibold px-6 cursor-pointer" onClick={submit} disabled={submitting || loading}>
                  {submitting ? t("common.creating") : t("serviceOrders.createButton")}
                </Button>
              </div>
            )}
          >
            <Button variant="outline" size="sm" className="h-9 text-sm px-4" onClick={addRow}>
              <Plus className="mr-1.5 h-4 w-4" />
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

      {/* KHỐI LỊCH SỬ PHIẾU DỊCH VỤ - Ở DƯỚI */}
      <Card className="shadow-sm border-border/80">
        <TableToolbar
          title={t("serviceOrders.historyTitle")}
          description={t("serviceOrders.historyDesc")}
          search={(
            <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_180px]">
              <Input value={historyQuery} onChange={(e) => setHistoryQuery(e.target.value)} placeholder="Tìm mã phiếu hoặc khách hàng" className="h-9" />
              <Select
                value={historyStatus}
                onValueChange={setHistoryStatus}
                className="h-9"
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "completed", label: "Hoàn thành" },
                  { value: "incomplete", label: "Chưa hoàn thành" },
                ]}
              />
            </div>
          )}
        />
        <CardContent className="p-6">
          {loading ? (
            <p className="py-4 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : filteredTickets.length === 0 ? (
            <EmptyState title={t("serviceOrders.emptyTitle")} description={t("serviceOrders.emptyDesc")} />
          ) : (
            <div className="rounded-md border border-border/80 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 text-center py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.voucherNumber")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.dateCreated")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider">{t("common.customer")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-right">{t("common.total")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-center">{t("serviceOrders.serviceStatus")}</TableHead>
                    <TableHead className="py-3 px-4 h-10 text-xs font-bold uppercase tracking-wider text-right w-28">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket, idx) => (
                    <TableRow key={ticket.soPhieuDichVu} className="hover:bg-accent/15 border-b border-border/60">
                      <TableCell className="py-3.5 px-4 text-center font-bold text-sm text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-semibold">{ticket.soPhieuDichVu}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm text-muted-foreground">{ticket.ngayLapPhieuDichVu}</TableCell>
                      <TableCell className="py-3.5 px-4 text-sm">
                        {ticket.khachHang?.tenKhachHang ?? ticket.maKhachHang}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right">
                        {formatCurrency(ticket.tongTien)}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                          ticket.tinhTrangDichVu.toLowerCase().includes("da giao")
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
                        }`}>
                          {ticket.tinhTrangDichVu.toLowerCase().includes("da giao") ? "Đã giao" : "Chưa giao"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-sm text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 cursor-pointer" title="Xem chi tiết" onClick={() => setSelectedTicket(ticket)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!ticket.tinhTrangDichVu.toLowerCase().includes("da giao") ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              title={t("serviceOrders.deliverAll")}
                              onClick={() => deliverAll(ticket)}
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic font-semibold px-2">Đã giao</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <DetailModal
        open={Boolean(selectedTicket)}
        title={`Phiếu dịch vụ ${selectedTicket?.soPhieuDichVu ?? ""}`}
        subtitle="Chi tiết dịch vụ, thanh toán và trạng thái giao"
        onClose={() => setSelectedTicket(null)}
        onPrint={printTicket}
      >
        {selectedTicket && (
          <div className="space-y-4">
            <DetailGrid
              items={[
                { label: "Ngày lập", value: selectedTicket.ngayLapPhieuDichVu },
                { label: "Khách hàng", value: selectedTicket.khachHang?.tenKhachHang ?? selectedTicket.maKhachHang },
                { label: "SĐT", value: selectedTicket.khachHang?.soDienThoai },
                { label: "Tổng tiền", value: formatCurrency(selectedTicket.tongTien) },
                { label: "Trả trước", value: formatCurrency(selectedTicket.tongTienTraTruoc) },
                { label: "Còn lại", value: formatCurrency(selectedTicket.tongTienConLai) },
              ]}
            />
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead className="text-right">SL</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                    <TableHead>Ngày giao</TableHead>
                    <TableHead>Tình trạng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTicket.items.map((item) => (
                    <TableRow key={item.maLoaiDichVu}>
                      <TableCell>{item.tenLoaiDichVu}</TableCell>
                      <TableCell className="text-right">{item.soLuongDichVu}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.donGiaDuocTinh)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(item.thanhTien)}</TableCell>
                      <TableCell>{item.ngayGiao || "-"}</TableCell>
                      <TableCell>{item.tinhTrang}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
