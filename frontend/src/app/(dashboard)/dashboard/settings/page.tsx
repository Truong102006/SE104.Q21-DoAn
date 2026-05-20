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
      setError(getApiErrorMessage(err, "Khong tai duoc du lieu cai dat"));
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
      setError("Ty le tra truoc phai trong khoang 0-100");
      setSaving(false);
      return;
    }

    try {
      const result = await backendApi.settings.updateServicePrepaymentRate({ value });
      setPrepaymentRate(String(result.value));
      setSavedMessage("Cap nhat ty le tra truoc thanh cong");
    } catch (err) {
      setError(getApiErrorMessage(err, "Cap nhat ty le tra truoc that bai"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="QÐ13"
        title="Thay doi quy dinh"
        description="Quan ly cac danh muc quy dinh va ty le tra truoc dich vu"
        badges={<Badge variant="outline">Admin only</Badge>}
      />

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <TableToolbar title="Ty le tra truoc dich vu" description="Gia tri duoc luu trong THAMSO: SERVICE_PREPAYMENT_RATE" />
        <CardContent className="space-y-3 p-4">
          <div className="max-w-sm space-y-2">
            <Label>Ty le (%)</Label>
            <Input value={prepaymentRate} onChange={(e) => setPrepaymentRate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={savePrepaymentRate} disabled={saving || loading}>
              {saving ? "Dang luu..." : "Luu thay doi"}
            </Button>
            {savedMessage && <p className="text-sm text-emerald-600">{savedMessage}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <TableToolbar title="Danh muc quy dinh" description="Cac danh muc duoc quan ly qua trang CRUD tuong ung" />
        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Dang tai...</p>
          ) : productTypesCount + unitsCount + serviceTypesCount === 0 ? (
            <div className="p-4">
              <EmptyState title="Khong co du lieu" description="Kiem tra API settings" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Danh muc</TableHead>
                  <TableHead>So ban ghi</TableHead>
                  <TableHead className="text-right">Dieu huong</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Loai san pham & ti le loi nhuan</TableCell>
                  <TableCell>{productTypesCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/product-types">Mo trang</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Don vi tinh</TableCell>
                  <TableCell>{unitsCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/units">Mo trang</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Loai dich vu & don gia</TableCell>
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
