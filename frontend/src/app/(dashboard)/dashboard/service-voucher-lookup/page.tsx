"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/mock-data";
import { STATUS_DOT_CLASS, STATUS_TONE_CLASS } from "@/lib/status-styles";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface ServiceVoucherLookupRow {
  id: number;
  voucherCode: string;
  createdDate: string;
  customerName: string;
  totalAmount: number;
  prepaid: number;
  remaining: number;
  status: "DONE" | "PENDING";
}

const VOUCHERS: ServiceVoucherLookupRow[] = [
  {
    id: 1,
    voucherCode: "PDV-20260515-001",
    createdDate: "2026-05-15",
    customerName: "Nguyễn Văn Minh",
    totalAmount: 1_120_000,
    prepaid: 400_000,
    remaining: 720_000,
    status: "PENDING",
  },
  {
    id: 2,
    voucherCode: "PDV-20260515-002",
    createdDate: "2026-05-15",
    customerName: "Trần Thị Lan",
    totalAmount: 850_000,
    prepaid: 850_000,
    remaining: 0,
    status: "DONE",
  },
];

const STATUS_LABEL: Record<ServiceVoucherLookupRow["status"], string> = {
  DONE: "Hoàn thành",
  PENDING: "Chưa hoàn thành",
};

export default function ServiceVoucherLookupPage() {
  const [keyword, setKeyword] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return VOUCHERS;
    }
    return VOUCHERS.filter((row) => {
      return (
        row.voucherCode.toLowerCase().includes(normalizedKeyword) ||
        row.customerName.toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [keyword]);

  const completedCount = VOUCHERS.filter((row) => row.status === "DONE").length;
  const pendingCount = VOUCHERS.length - completedCount;

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b px-3 py-3">
          <div className="grid gap-2 xl:grid-cols-[auto_minmax(280px,1fr)] xl:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Tra cứu phiếu dịch vụ</CardTitle>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                BM9
              </Badge>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                {filteredRows.length}/{VOUCHERS.length} bản ghi
              </Badge>
              <Badge variant="outline" className={cn("h-5 gap-1 px-2 text-[10px]", STATUS_TONE_CLASS.success)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS.success)} />
                Hoàn thành {completedCount}
              </Badge>
              <Badge variant="outline" className={cn("h-5 gap-1 px-2 text-[10px]", STATUS_TONE_CLASS.warning)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS.warning)} />
                Chưa hoàn thành {pendingCount}
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lookup-keyword"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Nhập số phiếu hoặc tên khách hàng"
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead className="w-[19%]">Số phiếu</TableHead>
                  <TableHead className="w-[13%]">Ngày lập</TableHead>
                  <TableHead className="w-[22%]">Khách hàng</TableHead>
                  <TableHead className="w-[14%] text-right">Tổng tiền</TableHead>
                  <TableHead className="w-[14%] text-right">Trả trước</TableHead>
                  <TableHead className="w-[14%] text-right">Còn lại</TableHead>
                  <TableHead className="w-[14%]">Tình trạng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-6 text-center text-sm text-muted-foreground">
                      Không tìm thấy phiếu dịch vụ phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, index) => {
                    const tone = row.status === "DONE" ? "success" : "warning";

                    return (
                      <TableRow key={row.id}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{row.voucherCode}</TableCell>
                        <TableCell>{row.createdDate}</TableCell>
                        <TableCell className="truncate">{row.customerName}</TableCell>
                        <TableCell className="text-right font-medium">{formatVND(row.totalAmount)}</TableCell>
                        <TableCell className="text-right">{formatVND(row.prepaid)}</TableCell>
                        <TableCell className="text-right text-amber-700">{formatVND(row.remaining)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("h-5 gap-1 px-2 text-[10px]", STATUS_TONE_CLASS[tone])}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[tone])} />
                            {STATUS_LABEL[row.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}



