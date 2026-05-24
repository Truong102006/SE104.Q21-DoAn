"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactPanel, DetailGrid, DetailModal, LineError, StickySummaryBar, VoucherSection } from "@/components/dashboard/voucher-ui";
import { Combobox } from "@/components/ui/combobox";
import { CustomerSelect } from "@/components/dashboard/customer-select";
import { useToastStore } from "@/stores/toast-store";
import { backendApi } from "@/services/backend-api";
import type {
  CustomerResponse,
  ServiceTicketRequest,
  ServiceTicketResponse,
  ServiceTypeResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, todayIsoDate, toPositiveInt, toPositiveNumber, formatVNCurrencyInput, parseVNCurrencyInput, formatVietnameseStatus } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { ChevronLeft, ChevronRight, ClipboardList, Eye, Plus, ReceiptText, Truck, Trash2 } from "lucide-react";

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

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Reset page when search query or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [historyQuery, historyStatus]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [serviceTypeData, ticketData, prepayment] = await Promise.all([
        backendApi.serviceTypes.list(),
        backendApi.serviceTickets.list(),
        backendApi.settings.getServicePrepaymentRate(),
      ]);

      setServiceTypes(serviceTypeData);
      setTickets(ticketData);
      setPrepaymentRate(Number(prepayment.value ?? 50));
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
    const itemToDelete = items[index];
    if (!itemToDelete) return;

    const serviceType = serviceTypes.find((t) => t.maLoaiDichVu === itemToDelete.maLoaiDichVu);
    const serviceName = serviceType ? serviceType.tenLoaiDichVu : itemToDelete.maLoaiDichVu || "chưa chọn";

    setItems((prev) => prev.filter((_, i) => i !== index));

    useToastStore.getState().success(`Đã xóa dòng dịch vụ: ${serviceName}`, {
      label: "Hoàn tác",
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
      const created = await backendApi.serviceTickets.create(payload);
      setSoPhieuDichVu("");
      setTongTienTraTruoc("0");
      setItems([createEmptyItem()]);
      await loadData();
      useToastStore.getState().success(`Đã lập phiếu dịch vụ ${created.soPhieuDichVu} thành công!`);
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
      useToastStore.getState().success(`Đã bàn giao sản phẩm dịch vụ thành công cho phiếu ${ticket.soPhieuDichVu}!`);
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceOrders.deliverError")));
    }
  }

  async function deliverAll(ticket: ServiceTicketResponse) {
    try {
      await backendApi.serviceTickets.deliverAll(ticket.soPhieuDichVu);
      await loadData();
      useToastStore.getState().success(`Đã bàn giao toàn bộ sản phẩm dịch vụ cho phiếu ${ticket.soPhieuDichVu}!`);
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
                  placeholder="Nhập Số điện thoại..."
                />
              </div>
              <ContactPanel
                emptyText="Chưa chọn khách hàng"
                rows={selectedCustomer ? [
                  { label: "Tên khách hàng", value: selectedCustomer.tenKhachHang },
                  { label: t("common.address"), value: selectedCustomer.diaChiKhachHang },
                ] : []}
              />
            </div>
          </VoucherSection>

          <VoucherSection title="Chi tiết dịch vụ" description="Nhập từng dòng dịch vụ, số lượng và ngày giao dự kiến" icon={ReceiptText}>
          <div className="rounded-md border border-border/80 overflow-visible [&_[data-slot=table-container]]:overflow-visible">
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
            <>
              <div className="rounded-md border border-border/80 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-14 text-center py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.stt")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.voucherNumber")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.dateCreated")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider">{t("common.customer")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right">{t("common.total")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-center">{t("serviceOrders.serviceStatus")}</TableHead>
                      <TableHead className="py-2 px-3 h-8 text-[11px] font-bold uppercase tracking-wider text-right w-28">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTickets.map((ticket, idx) => (
                      <TableRow key={ticket.soPhieuDichVu} className="hover:bg-accent/15 border-b border-border/60">
                        <TableCell className="py-1.5 px-3 text-center font-bold text-xs text-muted-foreground">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-xs font-semibold">{ticket.soPhieuDichVu}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">{ticket.ngayLapPhieuDichVu}</TableCell>
                        <TableCell className="py-1.5 px-3 text-xs">
                          {ticket.khachHang?.tenKhachHang ?? ticket.maKhachHang}
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right">
                          {formatCurrency(ticket.tongTien)}
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            ticket.tinhTrangDichVu.toLowerCase().includes("da giao") || ticket.tinhTrangDichVu.toLowerCase().includes("hoan thanh") || ticket.tinhTrangDichVu.toLowerCase().includes("hoàn thành")
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800"
                          }`}>
                            {formatVietnameseStatus(ticket.tinhTrangDichVu)}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-xs text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0 cursor-pointer" title="Xem chi tiết" onClick={() => setSelectedTicket(ticket)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {!ticket.tinhTrangDichVu.toLowerCase().includes("da giao") ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0 cursor-pointer"
                                title={t("serviceOrders.deliverAll")}
                                onClick={() => deliverAll(ticket)}
                              >
                                <Truck className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic font-semibold px-2">Đã giao</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center border-t border-border/60 pt-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-lg border border-border/80 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trước
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          totalPages > 5 &&
                          page !== 1 &&
                          page !== totalPages &&
                          Math.abs(page - currentPage) > 1
                        ) {
                          if (page === 2 && currentPage > 3) {
                            return <span key="ellipsis-start" className="text-muted-foreground px-1 text-sm select-none">...</span>;
                          }
                          if (page === totalPages - 1 && currentPage < totalPages - 2) {
                            return <span key="ellipsis-end" className="text-muted-foreground px-1 text-sm select-none">...</span>;
                          }
                          return null;
                        }

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 p-0 rounded-lg select-none cursor-pointer ${
                              currentPage === page
                                ? "bg-gold-gradient text-gold-foreground font-bold border-none"
                                : "border border-border/80 hover:bg-muted/50 font-medium"
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-lg border border-border/80 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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
                    <TableHead className="text-right">Đơn giá được tính</TableHead>
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
                      <TableCell>{formatVietnameseStatus(item.tinhTrang)}</TableCell>
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
