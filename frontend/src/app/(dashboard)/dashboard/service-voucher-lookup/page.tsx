"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type { SearchServiceTicketResponse, ServiceTicketResponse } from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { useTranslation } from "@/i18n/i18n-context";

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

  useEffect(() => {
    loadData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openDetail(soPhieuDichVu: string) {
    try {
      const data = await backendApi.serviceTickets.getById(soPhieuDichVu);
      setDetail(data);
    } catch (err) {
      setError(getApiErrorMessage(err, t("serviceLookup.detailError")));
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader eyebrow="BM9" title={t("serviceLookup.title")} description={t("serviceLookup.description")} />

      <Card>
        <TableToolbar
          title={t("serviceLookup.filterTitle")}
          description={t("serviceLookup.filterDesc")}
          search={
            <div className="grid gap-2 md:grid-cols-5">
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t("common.searchPlaceholder")} />
              <Select
                value={status || "all"}
                onValueChange={(value) => setStatus(value === "all" ? "" : value)}
                options={[
                  { value: "all", label: t("serviceLookup.allStatus") },
                  { value: "Hoan thanh", label: t("serviceLookup.completed") },
                  { value: "Chua hoàn thành", label: t("serviceLookup.incomplete") },
                ]}
              />
              <div>
                <Label>{t("serviceLookup.from")}</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <Label>{t("serviceLookup.to")}</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button className="w-full" onClick={() => loadData(0)}>
                  {t("serviceLookup.searchButton")}
                </Button>
              </div>
            </div>
          }
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 0} onClick={() => loadData(page - 1)}>
                {t("common.prev")}
              </Button>
              <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => loadData(page + 1)}>
                {t("common.next")}
              </Button>
            </div>
          }
        />

        <CardContent className="px-0">
          <p className="px-4 py-2 text-xs text-muted-foreground">{t("common.page")} {page + 1}/{totalPages}</p>
          {error && <p className="px-4 pb-2 text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState title={t("common.emptyTitle")} description={t("serviceLookup.emptyDesc")} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.voucherNumber")}</TableHead>
                  <TableHead>{t("common.dateCreated")}</TableHead>
                  <TableHead>{t("common.customer")}</TableHead>
                  <TableHead>{t("common.total")}</TableHead>
                  <TableHead>{t("serviceLookup.prepaid")}</TableHead>
                  <TableHead>{t("serviceLookup.remaining")}</TableHead>
                  <TableHead>{t("serviceLookup.serviceStatus")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.soPhieuDichVu}>
                    <TableCell>{item.soPhieuDichVu}</TableCell>
                    <TableCell>{item.ngayLapPhieuDichVu}</TableCell>
                    <TableCell>{item.tenKhachHang}</TableCell>
                    <TableCell>{formatCurrency(item.tongTien)}</TableCell>
                    <TableCell>{formatCurrency(item.tongTienTraTruoc)}</TableCell>
                    <TableCell>{formatCurrency(item.tongTienConLai)}</TableCell>
                    <TableCell>{item.tinhTrangDichVu}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openDetail(item.soPhieuDichVu)}>
                        {t("common.viewDetail")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {detail && (
        <Card>
          <TableToolbar title={`${t("common.detail")} ${detail.soPhieuDichVu}`} description={detail.tinhTrangDichVu} />
          <CardContent className="space-y-3 p-4">
            <p className="text-sm">{t("common.customer")}: {detail.khachHang?.tenKhachHang ?? detail.maKhachHang}</p>
            <p className="text-sm">{t("common.total")}: {formatCurrency(detail.tongTien)}</p>
            <p className="text-sm">{t("serviceLookup.prepaid")}: {formatCurrency(detail.tongTienTraTruoc)}</p>
            <p className="text-sm">{t("serviceLookup.remaining")}: {formatCurrency(detail.tongTienConLai)}</p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("serviceTypes.title")}</TableHead>
                  <TableHead>{t("common.quantity")}</TableHead>
                  <TableHead>{t("common.unitPrice")}</TableHead>
                  <TableHead>{t("common.subtotal")}</TableHead>
                  <TableHead>{t("serviceLookup.prepaid")}</TableHead>
                  <TableHead>{t("serviceLookup.remaining")}</TableHead>
                  <TableHead>{t("serviceLookup.serviceStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.items.map((item) => (
                  <TableRow key={`${detail.soPhieuDichVu}-${item.maLoaiDichVu}`}>
                    <TableCell>{item.tenLoaiDichVu}</TableCell>
                    <TableCell>{item.soLuongDichVu}</TableCell>
                    <TableCell>{formatCurrency(item.donGiaDuocTinh)}</TableCell>
                    <TableCell>{formatCurrency(item.thanhTien)}</TableCell>
                    <TableCell>{formatCurrency(item.tienTraTruoc)}</TableCell>
                    <TableCell>{formatCurrency(item.tienConLai)}</TableCell>
                    <TableCell>{item.tinhTrang}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
