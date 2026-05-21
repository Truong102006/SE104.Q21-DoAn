"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type {
  CustomerResponse,
  ServiceTicketRequest,
  ServiceTicketResponse,
  ServiceTypeResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, todayIsoDate, toPositiveInt, toPositiveNumber } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";
import { Plus, Truck, Trash2 } from "lucide-react";

type ServiceItemDraft = {
  maLoaiDichVu: string;
  soLuongDichVu: string;
  chiPhiRieng: string;
  tienTraTruoc: string;
  ngayGiao: string;
};

const EMPTY_ITEM: ServiceItemDraft = {
  maLoaiDichVu: "",
  soLuongDichVu: "1",
  chiPhiRieng: "0",
  tienTraTruoc: "0",
  ngayGiao: "",
};

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
  const [items, setItems] = useState<ServiceItemDraft[]>([{ ...EMPTY_ITEM }]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedCustomer = useMemo(
    () => customers.find((item) => item.maKhachHang === maKhachHang) ?? null,
    [customers, maKhachHang],
  );

  const totals = useMemo(() => {
    const summary = items.reduce(
      (acc, item) => {
        const serviceType = serviceTypes.find((type) => type.maLoaiDichVu === item.maLoaiDichVu);
        const soLuong = toPositiveInt(item.soLuongDichVu);
        const chiPhiRieng = toPositiveNumber(item.chiPhiRieng);
        const donGiaDichVu = Number(serviceType?.donGiaDichVu ?? 0);
        const donGiaDuocTinh = donGiaDichVu + chiPhiRieng;
        const thanhTien = soLuong * donGiaDuocTinh;
        const tienTraTruoc = toPositiveNumber(item.tienTraTruoc);
        const tienConLai = Math.max(0, thanhTien - tienTraTruoc);

        return {
          tongTien: acc.tongTien + thanhTien,
          tongTraTruoc: acc.tongTraTruoc + tienTraTruoc,
          tongConLai: acc.tongConLai + tienConLai,
        };
      },
      { tongTien: 0, tongTraTruoc: 0, tongConLai: 0 },
    );

    return summary;
  }, [items, serviceTypes]);

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
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, patch: Partial<ServiceItemDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setFormError(null);
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

      const serviceType = serviceTypes.find((type) => type.maLoaiDichVu === item.maLoaiDichVu);
      const soLuong = toPositiveInt(item.soLuongDichVu);
      if (soLuong <= 0) {
        setFormError(t("serviceOrders.quantityInvalid"));
        return;
      }

      const donGiaDichVu = Number(serviceType?.donGiaDichVu ?? 0);
      const chiPhiRieng = toPositiveNumber(item.chiPhiRieng);
      const donGiaDuocTinh = donGiaDichVu + chiPhiRieng;
      const thanhTien = soLuong * donGiaDuocTinh;
      const tienTraTruoc = toPositiveNumber(item.tienTraTruoc);
      const minPrepayment = (prepaymentRate / 100) * thanhTien;

      if (tienTraTruoc < minPrepayment) {
        setFormError(
          t("serviceOrders.prepaymentInsufficient")
            .replace("{name}", serviceType?.tenLoaiDichVu ?? item.maLoaiDichVu)
            .replace("{amount}", formatCurrency(minPrepayment)),
        );
        return;
      }
    }

    const payload: ServiceTicketRequest = {
      soPhieuDichVu: soPhieuDichVu.trim() || undefined,
      ngayLapPhieuDichVu,
      maKhachHang,
      items: items.map((item) => ({
        maLoaiDichVu: item.maLoaiDichVu,
        soLuongDichVu: toPositiveInt(item.soLuongDichVu),
        chiPhiRieng: toPositiveNumber(item.chiPhiRieng),
        tienTraTruoc: toPositiveNumber(item.tienTraTruoc),
        ngayGiao: item.ngayGiao || undefined,
      })),
    };

    setSubmitting(true);
    try {
      await backendApi.serviceTickets.create(payload);
      setSoPhieuDichVu("");
      setItems([{ ...EMPTY_ITEM }]);
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

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM7"
        title={t("serviceOrders.title")}
        description={t("serviceOrders.description")}
        badges={<Badge variant="outline">{t("serviceOrders.minPrepaymentRate")}: {prepaymentRate}%</Badge>}
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("common.voucherNumber")}</Label>
              <Input value={soPhieuDichVu} onChange={(e) => setSoPhieuDichVu(e.target.value)} placeholder={t("common.autoGenerate")} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.dateCreated")}</Label>
              <Input type="date" value={ngayLapPhieuDichVu} onChange={(e) => setNgayLapPhieuDichVu(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.customer")}</Label>
              <Select
                value={maKhachHang || ""}
                onValueChange={setMaKhachHang}
                options={customers.map((item) => ({ value: item.maKhachHang, label: `${item.maKhachHang} - ${item.tenKhachHang}` }))}
              />
            </div>
          </div>

          {selectedCustomer && (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p>{t("common.phone")}: {selectedCustomer.soDienThoaiKhachHang || "-"}</p>
              <p>{t("common.address")}: {selectedCustomer.diaChiKhachHang || "-"}</p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("serviceTypes.title")}</TableHead>
                <TableHead>{t("serviceOrders.serviceTypePrice")}</TableHead>
                <TableHead>{t("serviceOrders.additionalCost")}</TableHead>
                <TableHead>{t("serviceOrders.calculatedPrice")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("common.subtotal")}</TableHead>
                <TableHead>{t("serviceOrders.prepaid")}</TableHead>
                <TableHead>{t("serviceOrders.remaining")}</TableHead>
                <TableHead>{t("serviceOrders.deliveryDate")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const serviceType = serviceTypes.find((type) => type.maLoaiDichVu === item.maLoaiDichVu);
                const soLuong = toPositiveInt(item.soLuongDichVu);
                const donGiaDichVu = Number(serviceType?.donGiaDichVu ?? 0);
                const chiPhiRieng = toPositiveNumber(item.chiPhiRieng);
                const donGiaDuocTinh = donGiaDichVu + chiPhiRieng;
                const thanhTien = soLuong * donGiaDuocTinh;
                const tienTraTruoc = toPositiveNumber(item.tienTraTruoc);
                const tienConLai = Math.max(0, thanhTien - tienTraTruoc);

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={item.maLoaiDichVu || ""}
                        onValueChange={(value) => updateItem(index, { maLoaiDichVu: value })}
                        options={serviceTypes.map((option) => ({
                          value: option.maLoaiDichVu,
                          label: `${option.maLoaiDichVu} - ${option.tenLoaiDichVu}`,
                        }))}
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(donGiaDichVu)}</TableCell>
                    <TableCell>
                      <Input value={item.chiPhiRieng} onChange={(e) => updateItem(index, { chiPhiRieng: e.target.value })} />
                    </TableCell>
                    <TableCell>{formatCurrency(donGiaDuocTinh)}</TableCell>
                    <TableCell>
                      <Input value={item.soLuongDichVu} onChange={(e) => updateItem(index, { soLuongDichVu: e.target.value })} />
                    </TableCell>
                    <TableCell>{formatCurrency(thanhTien)}</TableCell>
                    <TableCell>
                      <Input value={item.tienTraTruoc} onChange={(e) => updateItem(index, { tienTraTruoc: e.target.value })} />
                    </TableCell>
                    <TableCell>{formatCurrency(tienConLai)}</TableCell>
                    <TableCell>
                      <Input type="date" value={item.ngayGiao} onChange={(e) => updateItem(index, { ngayGiao: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button variant="destructive" size="icon-sm" onClick={() => removeRow(index)} disabled={items.length <= 1}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={addRow}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t("common.addRow")}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{t("common.total")}: {formatCurrency(totals.tongTien)}</Badge>
              <Badge variant="outline">{t("serviceOrders.prepaid")}: {formatCurrency(totals.tongTraTruoc)}</Badge>
              <Badge variant="outline">{t("serviceOrders.remaining")}: {formatCurrency(totals.tongConLai)}</Badge>
            </div>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting || loading}>
              {submitting ? t("common.creating") : t("serviceOrders.createButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <TableToolbar title={t("serviceOrders.historyTitle")} description={t("serviceOrders.historyDesc")} />
        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : tickets.length === 0 ? (
            <div className="p-4">
              <EmptyState title={t("serviceOrders.emptyTitle")} description={t("serviceOrders.emptyDesc")} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.voucherNumber")}</TableHead>
                  <TableHead>{t("common.dateCreated")}</TableHead>
                  <TableHead>{t("common.customer")}</TableHead>
                  <TableHead>{t("common.total")}</TableHead>
                  <TableHead>{t("serviceOrders.prepaid")}</TableHead>
                  <TableHead>{t("serviceOrders.remaining")}</TableHead>
                  <TableHead>{t("serviceOrders.serviceStatus")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.soPhieuDichVu}>
                    <TableCell>{ticket.soPhieuDichVu}</TableCell>
                    <TableCell>{ticket.ngayLapPhieuDichVu}</TableCell>
                    <TableCell>{ticket.khachHang?.tenKhachHang ?? ticket.maKhachHang}</TableCell>
                    <TableCell>{formatCurrency(ticket.tongTien)}</TableCell>
                    <TableCell>{formatCurrency(ticket.tongTienTraTruoc)}</TableCell>
                    <TableCell>{formatCurrency(ticket.tongTienConLai)}</TableCell>
                    <TableCell>{ticket.tinhTrangDichVu}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => deliverAll(ticket)}>
                          <Truck className="mr-1 h-3.5 w-3.5" />
                          {t("serviceOrders.deliverAll")}
                        </Button>
                        {ticket.items
                          .filter((item) => !item.tinhTrang.toLowerCase().includes("da giao"))
                          .slice(0, 1)
                          .map((item) => (
                            <Button
                              key={item.maLoaiDichVu}
                              variant="outline"
                              size="sm"
                              onClick={() => deliverItem(ticket, item.maLoaiDichVu)}
                            >
                              {t("serviceOrders.deliverOne")}
                            </Button>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
