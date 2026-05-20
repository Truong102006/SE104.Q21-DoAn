"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import type {
  InventoryReportResponse,
  ProductRevenueReportResponse,
  ServiceRevenueReportResponse,
} from "@/types/backend";
import { getApiErrorMessage } from "@/lib/api-error";
import { currentMonthYear, formatCurrency, formatNumber } from "@/lib/format";

function safeRatio(value: number): string {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

export default function ReportsPage() {
  const now = currentMonthYear();
  const [month, setMonth] = useState(String(now.month));
  const [year, setYear] = useState(String(now.year));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inventory, setInventory] = useState<InventoryReportResponse | null>(null);
  const [productRevenue, setProductRevenue] = useState<ProductRevenueReportResponse | null>(null);
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenueReportResponse | null>(null);

  function parseMonthYear() {
    return {
      m: Math.max(1, Math.min(12, Number.parseInt(month, 10) || now.month)),
      y: Math.max(1, Number.parseInt(year, 10) || now.year),
    };
  }

  async function runReport(action: "inventory" | "product-revenue" | "service-revenue", mode: "generate" | "get") {
    setLoading(true);
    setError(null);
    const { m, y } = parseMonthYear();

    try {
      if (action === "inventory") {
        const data = mode === "generate" ? await backendApi.reports.inventoryGenerate(m, y) : await backendApi.reports.inventoryGet(m, y);
        setInventory(data);
      }

      if (action === "product-revenue") {
        const data =
          mode === "generate"
            ? await backendApi.reports.revenueProductsGenerate(m, y)
            : await backendApi.reports.revenueProductsGet(m, y);
        setProductRevenue(data);
      }

      if (action === "service-revenue") {
        const data =
          mode === "generate"
            ? await backendApi.reports.revenueServicesGenerate(m, y)
            : await backendApi.reports.revenueServicesGet(m, y);
        setServiceRevenue(data);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Xu ly bao cao that bai"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="BM10-BM12"
        title="Bao cao"
        description="Bao cao ton kho, doanh thu san pham, doanh thu dich vu"
        badges={<Badge variant="outline">Admin</Badge>}
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Thang</Label>
            <Input value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nam</Label>
            <Input value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-end text-sm text-muted-foreground">
            Chon thang/nam roi bam Generate hoac Lay du lieu cho tung bao cao ben duoi.
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <TableToolbar
          title="BM10 - Bao cao ton kho"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={loading} onClick={() => runReport("inventory", "get")}>
                Lay du lieu
              </Button>
              <Button size="sm" disabled={loading} onClick={() => runReport("inventory", "generate")}>
                Generate
              </Button>
            </div>
          }
        />
        <CardContent className="px-0">
          {!inventory ? (
            <div className="p-4">
              <EmptyState title="Chua co du lieu BM10" description="Bam Generate hoac Lay du lieu" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>San pham</TableHead>
                  <TableHead>Ton dau</TableHead>
                  <TableHead>Mua vao</TableHead>
                  <TableHead>Ban ra</TableHead>
                  <TableHead>Ton cuoi</TableHead>
                  <TableHead>Don vi tinh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.chiTiet.map((item) => (
                  <TableRow key={`${inventory.maBaoCaoTonKho}-${item.stt}`}>
                    <TableCell>{item.stt}</TableCell>
                    <TableCell>{item.tenSanPham}</TableCell>
                    <TableCell>{formatNumber(item.tonDau)}</TableCell>
                    <TableCell>{formatNumber(item.soLuongMuaVao)}</TableCell>
                    <TableCell>{formatNumber(item.soLuongBanRa)}</TableCell>
                    <TableCell>{formatNumber(item.tonCuoi)}</TableCell>
                    <TableCell>{item.tenDonViTinh}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <TableToolbar
          title="BM11 - Doanh thu san pham"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={loading} onClick={() => runReport("product-revenue", "get")}>
                Lay du lieu
              </Button>
              <Button size="sm" disabled={loading} onClick={() => runReport("product-revenue", "generate")}>
                Generate
              </Button>
            </div>
          }
        />
        <CardContent className="px-0">
          {!productRevenue ? (
            <div className="p-4">
              <EmptyState title="Chua co du lieu BM11" description="Bam Generate hoac Lay du lieu" />
            </div>
          ) : (
            <>
              <p className="px-4 py-2 text-sm font-medium">Tong doanh thu: {formatCurrency(productRevenue.tongDoanhThuSanPham)}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>San pham</TableHead>
                    <TableHead>So luong ban</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Ti le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productRevenue.chiTiet.map((item) => (
                    <TableRow key={`${productRevenue.maBaoCaoDoanhThuSp}-${item.stt}`}>
                      <TableCell>{item.stt}</TableCell>
                      <TableCell>{item.tenSanPham}</TableCell>
                      <TableCell>{formatNumber(item.soLuongBan)}</TableCell>
                      <TableCell>{formatCurrency(item.doanhThu)}</TableCell>
                      <TableCell>{safeRatio(item.tiLe)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <TableToolbar
          title="BM12 - Doanh thu dich vu"
          actions={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={loading} onClick={() => runReport("service-revenue", "get")}>
                Lay du lieu
              </Button>
              <Button size="sm" disabled={loading} onClick={() => runReport("service-revenue", "generate")}>
                Generate
              </Button>
            </div>
          }
        />
        <CardContent className="px-0">
          {!serviceRevenue ? (
            <div className="p-4">
              <EmptyState title="Chua co du lieu BM12" description="Bam Generate hoac Lay du lieu" />
            </div>
          ) : (
            <>
              <p className="px-4 py-2 text-sm font-medium">Tong doanh thu: {formatCurrency(serviceRevenue.tongDoanhThuDichVu)}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Dich vu</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Ti le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceRevenue.chiTiet.map((item) => (
                    <TableRow key={`${serviceRevenue.maBaoCaoDoanhThuDv}-${item.stt}`}>
                      <TableCell>{item.stt}</TableCell>
                      <TableCell>{item.tenLoaiDichVu}</TableCell>
                      <TableCell>{formatCurrency(item.doanhThu)}</TableCell>
                      <TableCell>{safeRatio(item.tiLe)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
