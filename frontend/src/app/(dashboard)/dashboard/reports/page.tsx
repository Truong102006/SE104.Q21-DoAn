"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatVND, MOCK_PRODUCTS } from "@/lib/mock-data";

interface InventoryHistoryRecord {
  month: string;
  productId: number;
  openingStock: number;
  purchasedQty: number;
  soldQty: number;
}

interface ServiceRevenueRecord {
  month: string;
  serviceName: string;
  revenue: number;
}

const INVENTORY_HISTORY: InventoryHistoryRecord[] = [
  { month: "2026-04", productId: 1, openingStock: 9, purchasedQty: 5, soldQty: 2 },
  { month: "2026-04", productId: 2, openingStock: 7, purchasedQty: 3, soldQty: 2 },
  { month: "2026-04", productId: 4, openingStock: 2, purchasedQty: 2, soldQty: 1 },
  { month: "2026-05", productId: 1, openingStock: 12, purchasedQty: 3, soldQty: 4 },
  { month: "2026-05", productId: 2, openingStock: 8, purchasedQty: 4, soldQty: 3 },
  { month: "2026-05", productId: 4, openingStock: 3, purchasedQty: 1, soldQty: 1 },
  { month: "2026-05", productId: 8, openingStock: 16, purchasedQty: 8, soldQty: 4 },
];

const SERVICE_REVENUE_HISTORY: ServiceRevenueRecord[] = [
  { month: "2026-04", serviceName: "Đánh bóng trang sức", revenue: 6_000_000 },
  { month: "2026-04", serviceName: "Khắc tên trên nhẫn", revenue: 4_200_000 },
  { month: "2026-04", serviceName: "Thu mua vàng cũ", revenue: 2_800_000 },
  { month: "2026-05", serviceName: "Đánh bóng trang sức", revenue: 7_300_000 },
  { month: "2026-05", serviceName: "Khắc tên trên nhẫn", revenue: 5_400_000 },
  { month: "2026-05", serviceName: "Thu mua vàng cũ", revenue: 3_200_000 },
];

function getCurrentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}

function formatMonthLabel(value: string): string {
  if (!value.includes("-")) {
    return value;
  }
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);

  const bm10Rows = useMemo(() => {
    return INVENTORY_HISTORY
      .filter((record) => record.month === selectedMonth)
      .map((record) => {
        const product = MOCK_PRODUCTS.find((item) => item.id === record.productId);
        if (!product) {
          return null;
        }
        const closingStock = record.openingStock + record.purchasedQty - record.soldQty;
        return {
          id: product.id,
          productName: product.name,
          unit: product.weightUnit,
          openingStock: record.openingStock,
          purchasedQty: record.purchasedQty,
          soldQty: record.soldQty,
          closingStock,
        };
      })
      .filter((record): record is NonNullable<typeof record> => record !== null);
  }, [selectedMonth]);

  const bm11Rows = useMemo(() => {
    const rows = bm10Rows.map((record) => {
      const product = MOCK_PRODUCTS.find((item) => item.id === record.id) ?? MOCK_PRODUCTS[0];
      const revenue = record.soldQty * product.sellingPrice;
      return {
        id: record.id,
        productName: record.productName,
        soldQty: record.soldQty,
        revenue,
      };
    });

    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    return rows.map((row) => ({
      ...row,
      ratio: totalRevenue <= 0 ? 0 : (row.revenue / totalRevenue) * 100,
    }));
  }, [bm10Rows]);

  const bm11TotalRevenue = useMemo(
    () => bm11Rows.reduce((sum, row) => sum + row.revenue, 0),
    [bm11Rows],
  );

  const bm12Rows = useMemo(() => {
    const rows = SERVICE_REVENUE_HISTORY
      .filter((record) => record.month === selectedMonth)
      .map((record, index) => ({
        id: `${record.month}-${index}-${record.serviceName}`,
        serviceName: record.serviceName,
        revenue: record.revenue,
      }));

    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    return rows.map((row) => ({
      ...row,
      ratio: totalRevenue <= 0 ? 0 : (row.revenue / totalRevenue) * 100,
    }));
  }, [selectedMonth]);

  const bm12TotalRevenue = useMemo(
    () => bm12Rows.reduce((sum, row) => sum + row.revenue, 0),
    [bm12Rows],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2">
        <span className="text-sm font-semibold">Kết xuất báo cáo</span>
        <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
          BM10-BM12
        </Badge>
        <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
          Tháng {formatMonthLabel(selectedMonth)}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="report-month" className="text-xs text-muted-foreground">Tháng</Label>
          <Input
            id="report-month"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="h-8 w-[150px]"
          />
        </div>
      </div>

      <Card id="bm10" className="scroll-mt-24 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded border border-border/70 bg-card px-2 py-0.5 text-[10px] font-semibold">BM10</span>
            <CardTitle className="text-base tracking-tight">Báo cáo tồn kho</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead className="min-w-[260px]">Sản phẩm</TableHead>
                  <TableHead className="min-w-[110px] text-right">Tồn đầu</TableHead>
                  <TableHead className="min-w-[150px] text-right">Mua vào</TableHead>
                  <TableHead className="min-w-[130px] text-right">Bán ra</TableHead>
                  <TableHead className="min-w-[110px] text-right">Tồn cuối</TableHead>
                  <TableHead className="min-w-[100px]">Đơn vị tính</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bm10Rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                      Không có dữ liệu tồn kho cho tháng đã chọn.
                    </TableCell>
                  </TableRow>
                ) : (
                  bm10Rows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{row.productName}</TableCell>
                      <TableCell className="text-right">{row.openingStock}</TableCell>
                      <TableCell className="text-right">{row.purchasedQty}</TableCell>
                      <TableCell className="text-right">{row.soldQty}</TableCell>
                      <TableCell className="text-right font-semibold">{row.closingStock}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card id="bm11" className="scroll-mt-24 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded border border-border/70 bg-card px-2 py-0.5 text-[10px] font-semibold">BM11</span>
            <CardTitle className="text-base tracking-tight">
              Báo cáo doanh thu tháng theo sản phẩm
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead className="min-w-[260px]">Sản phẩm</TableHead>
                  <TableHead className="min-w-[130px] text-right">Số lượng bán</TableHead>
                  <TableHead className="min-w-[180px] text-right">Doanh thu</TableHead>
                  <TableHead className="min-w-[110px] text-right">Tỉ lệ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bm11Rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                      Không có dữ liệu doanh thu cho tháng đã chọn.
                    </TableCell>
                  </TableRow>
                ) : (
                  bm11Rows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{row.productName}</TableCell>
                      <TableCell className="text-right">{row.soldQty}</TableCell>
                      <TableCell className="text-right">{formatVND(row.revenue)}</TableCell>
                      <TableCell className="text-right font-semibold">{row.ratio.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={3} className="font-semibold">
                    Tổng doanh thu
                  </TableCell>
                  <TableCell className="text-right text-base font-bold">{formatVND(bm11TotalRevenue)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {bm11TotalRevenue > 0 ? "100%" : "0%"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Card id="bm12" className="scroll-mt-24 overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/25 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded border border-border/70 bg-card px-2 py-0.5 text-[10px] font-semibold">BM12</span>
            <CardTitle className="text-base tracking-tight">
              Báo cáo doanh thu tháng theo dịch vụ
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead className="min-w-[260px]">Dịch vụ</TableHead>
                  <TableHead className="min-w-[180px] text-right">Doanh thu</TableHead>
                  <TableHead className="min-w-[110px] text-right">Tỉ lệ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bm12Rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                      Không có dữ liệu doanh thu dịch vụ cho tháng đã chọn.
                    </TableCell>
                  </TableRow>
                ) : (
                  bm12Rows.map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{row.serviceName}</TableCell>
                      <TableCell className="text-right">{formatVND(row.revenue)}</TableCell>
                      <TableCell className="text-right font-semibold">{row.ratio.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableCell colSpan={2} className="font-semibold">
                    Tổng doanh thu
                  </TableCell>
                  <TableCell className="text-right text-base font-bold">
                    {formatVND(bm12TotalRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {bm12TotalRevenue > 0 ? "100%" : "0%"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}



