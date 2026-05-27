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
import { useTranslation } from "@/i18n/i18n-context";

export default function SettingsPage() {
  const { t } = useTranslation();
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
      setError(getApiErrorMessage(err, t("settings.loadError")));
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
      setError(t("settings.rateInvalid"));
      setSaving(false);
      return;
    }

    try {
      const result = await backendApi.settings.updateServicePrepaymentRate({ value });
      setPrepaymentRate(String(result.value));
      setSavedMessage(t("settings.saveSuccess"));
    } catch (err) {
      setError(getApiErrorMessage(err, t("settings.saveError")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow={"QĐ13"}
        title={t("settings.title")}
        description={t("settings.description")}
        badges={<Badge variant="outline">{t("settings.adminOnly")}</Badge>}
      />

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <TableToolbar title={t("settings.prepaymentTitle")} />
        <CardContent className="space-y-3 p-4">
          <div className="max-w-sm space-y-2">
            <Label>{t("settings.rateLabel")}</Label>
            <Input value={prepaymentRate} onChange={(e) => setPrepaymentRate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={savePrepaymentRate} disabled={saving || loading}>
              {saving ? t("common.saving") : t("settings.saveChanges")}
            </Button>
            {savedMessage && <p className="text-sm text-emerald-600">{savedMessage}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <TableToolbar title={t("settings.categoriesTitle")} />
        <CardContent className="px-0">
          {loading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : productTypesCount + unitsCount + serviceTypesCount === 0 ? (
            <div className="p-4">
              <EmptyState title={t("common.emptyTitle")} description={t("settings.checkApi")} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("settings.category")}</TableHead>
                  <TableHead>{t("settings.recordCount")}</TableHead>
                  <TableHead className="text-right">{t("settings.navigate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{t("settings.productTypesAndProfit")}</TableCell>
                  <TableCell>{productTypesCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/product-types">{t("common.openPage")}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t("units.title")}</TableCell>
                  <TableCell>{unitsCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/units">{t("common.openPage")}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t("settings.serviceTypesAndPrice")}</TableCell>
                  <TableCell>{serviceTypesCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/dashboard/service-types">{t("common.openPage")}</Link>
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
