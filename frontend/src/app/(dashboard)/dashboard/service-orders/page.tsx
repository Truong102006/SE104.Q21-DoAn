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
      setError(getApiErrorMessage(err, "Khong tai duoc du lieu phieu dich vu"));
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
      setFormError("Khach hang la bat buoc");
      return;
    }

    if (items.length === 0) {
      setFormError("Can it nhat 1 dong chi tiet");
      return;
    }

    const seen = new Set<string>();

    for (const item of items) {
      if (!item.maLoaiDichVu) {
        setFormError("Loai dich vu la bat buoc");
        return;
      }

      if (seen.has(item.maLoaiDichVu)) {
        setFormError("Khong duoc trung loai dich vu trong cung mot phieu");
        return;
      }
      seen.add(item.maLoaiDichVu);

      const serviceType = serviceTypes.find((type) => type.maLoaiDichVu === item.maLoaiDichVu);
      const soLuong = toPositiveInt(item.soLuongDichVu);
      if (soLuong <= 0) {
        setFormError("So luong dich vu phai > 0");
        return;
      }

      const donGiaDichVu = Number(serviceType?.donGiaDichVu ?? 0);
      const chiPhiRieng = toPositiveNumber(item.chiPhiRieng);
      const donGiaDuocTinh = donGiaDichVu + chiPhiRieng;
      const thanhTien = soLuong * donGiaDuocTinh;
      const tienTraTruoc = toPositiveNumber(item.tienTraTruoc);
      const minPrepayment = (prepaymentRate / 100) * thanhTien;

      if (tienTraTruoc < minPrepayment) {
        setFormError(`Tien tra truoc cho ${serviceType?.tenLoaiDichVu ?? item.maLoaiDichVu} phai >= ${formatCurrency(minPrepayment)}`);
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
      setFormError(getApiErrorMessage(err, "Tao phieu dich vu that bai"));
    } finally {
      setSubmitting(false);
    }
  }

  async function deliverItem(ticket: ServiceTicketResponse, maLoaiDichVu: string) {
    try {
      await backendApi.serviceTickets.deliverItem(ticket.soPhieuDichVu, maLoaiDichVu);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Cap nhat giao hang that bai"));
    }
  }

  async function deliverAll(ticket: ServiceTicketResponse) {
    try {
      await backendApi.serviceTickets.deliverAll(ticket.soPhieuDichVu);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Cap nhat giao toan bo that bai"));
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM7"
        title="Lap phieu dich vu"
        description="Quan ly dich vu, tien tra truoc va giao hang"
        badges={<Badge variant="outline">Ty le tra truoc toi thieu: {prepaymentRate}%</Badge>}
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>So phieu</Label>
              <Input value={soPhieuDichVu} onChange={(e) => setSoPhieuDichVu(e.target.value)} placeholder="De trong de tu sinh" />
            </div>
            <div className="space-y-2">
              <Label>Ngay lap</Label>
              <Input type="date" value={ngayLapPhieuDichVu} onChange={(e) => setNgayLapPhieuDichVu(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Khach hang</Label>
              <Select
                value={maKhachHang || ""}
                onValueChange={setMaKhachHang}
                options={customers.map((item) => ({ value: item.maKhachHang, label: `${item.maKhachHang} - ${item.tenKhachHang}` }))}
              />
            </div>
          </div>

          {selectedCustomer && (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p>So dien thoai: {selectedCustomer.soDienThoaiKhachHang || "-"}</p>
              <p>Dia chi: {selectedCustomer.diaChiKhachHang || "-"}</p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loai dich vu</TableHead>
                <TableHead>Don gia dich vu</TableHead>
                <TableHead>Chi phi rieng</TableHead>
                <TableHead>Don gia duoc tinh</TableHead>
                <TableHead>So luong</TableHead>
                <TableHead>Thanh tien</TableHead>
                <TableHead>Tra truoc</TableHead>
                <TableHead>Con lai</TableHead>
                <TableHead>Ngay giao</TableHead>
                <TableHead className="text-right">Tac vu</TableHead>
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
              Them dong
            </Button>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Tong tien: {formatCurrency(totals.tongTien)}</Badge>
              <Badge variant="outline">Tra truoc: {formatCurrency(totals.tongTraTruoc)}</Badge>
              <Badge variant="outline">Con lai: {formatCurrency(totals.tongConLai)}</Badge>
            </div>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end">
            <Button onClick={submit} disabled={submitting || loading}>
              {submitting ? "Dang tao..." : "Tao phieu dich vu"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <TableToolbar title="Lich su phieu dich vu" description="Danh sach phieu dich vu da tao" />
        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Dang tai...</p>
          ) : tickets.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Chua co phieu dich vu" description="Tao phieu dich vu dau tien" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>So phieu</TableHead>
                  <TableHead>Ngay lap</TableHead>
                  <TableHead>Khach hang</TableHead>
                  <TableHead>Tong tien</TableHead>
                  <TableHead>Tra truoc</TableHead>
                  <TableHead>Con lai</TableHead>
                  <TableHead>Tinh trang</TableHead>
                  <TableHead className="text-right">Tac vu</TableHead>
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
                          Deliver all
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
                              Deliver 1
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
