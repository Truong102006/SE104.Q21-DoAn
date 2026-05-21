"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backendApi } from "@/services/backend-api";
import { getApiErrorMessage } from "@/lib/api-error";
import { toPositiveNumber } from "@/lib/format";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productTypesCount, setProductTypesCount] = useState(0);
  const [unitsCount, setUnitsCount] = useState(0);
  const [serviceTypesCount, setServiceTypesCount] = useState(0);

  const [prepaymentRate, setPrepaymentRate] = useState("50");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [productTypes, units, serviceTypes, prepayment] = await Promise.all([
        backendApi.settings.productTypes(),
        backendApi.settings.units(),
        backendApi.settings.serviceTypes(),
        backendApi.settings.getServicePrepaymentRate(),
      ]);

      setProductTypesCount(productTypes.length);
      setUnitsCount(units.length);
      setServiceTypesCount(serviceTypes.length);
      setPrepaymentRate(String(prepayment.value ?? 50));
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được dữ liệu cài đặt"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function savePrepaymentRate() {
    setSaving(true);
    setSavedMessage(null);
    setError(null);

    const value = toPositiveNumber(prepaymentRate);
    if (value < 0 || value > 100) {
      setError("Ty le trả trước phai trong khoang 0-100");
      setSaving(false);
      return;
    }

    try {
      const result = await backendApi.settings.updateServicePrepaymentRate({ value });
      setPrepaymentRate(String(result.value));
      setSavedMessage("Cập nhật tỷ lệ trả trước thành công");
    } catch (err) {
      setError(getApiErrorMessage(err, "Cập nhật tỷ lệ trả trước thất bại"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={"Q\u011013"}
        title="Thay đổi quy định"
        description="Quản lý cac danh mục quy định và tỷ lệ trả trước dịch vụ"
        badges={<Badge variant="outline">Admin only</Badge>}
      />

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <TableToolbar title="Ty le trả trước dịch vụ" description="Giá trị được lưu trong THAMSO: SERVICE_PREPAYMENT_RATE" />
        <CardContent className="space-y-3 p-4">
          <div className="max-w-sm space-y-2">
            <Label>Ty le (%)</Label>
            <Input value={prepaymentRate} onChange={(e) => setPrepaymentRate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={savePrepaymentRate} disabled={saving || loading}>
              {saving ? "Dang luu..." : "Lưu thay doi"}
            </Button>
            {savedMessage && <p className="text-sm text-emerald-600">{savedMessage}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <TableToolbar title="Danh muc quy định" description="Cac danh mục duoc quản lý qua trang CRUD tuong ung" />
        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Đang tải...</p>
          ) : productTypesCount + unitsCount + serviceTypesCount === 0 ? (
            <div className="p-4">
              <EmptyState title="Không có dữ liệu" description="Kiem tra API settings" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Danh muc</TableHead>
                  <TableHead>Số bản ghi</TableHead>
                  <TableHead className="text-right">Dieu huong</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Loại sản phẩm & tỉ lệ lợi nhuận</TableCell>
                  <TableCell>{productTypesCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/product-types">Mo trang</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Đơn vị tính</TableCell>
                  <TableCell>{unitsCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/units">Mo trang</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Loại dịch vụ & đơn giá</TableCell>
                  <TableCell>{serviceTypesCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/service-types">Mo trang</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
