"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput, parseMoneyInput } from "@/components/ui/money-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/mock-data";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

interface ServiceItem {
  id: number;
  serviceType: string;
  unitPrice: number;
  note: string;
}

interface ServiceDraft {
  serviceType: string;
  unitPrice: string;
  note: string;
}

type FormMode = "create" | "edit";

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 1,
    serviceType: "Đánh bóng trang sức",
    unitPrice: 120_000,
    note: "Bao gồm vệ sinh và đánh bóng",
  },
  {
    id: 2,
    serviceType: "Thu mua vàng cũ",
    unitPrice: 80_000,
    note: "Phí kiểm định mỗi giao dịch",
  },
  {
    id: 3,
    serviceType: "Khắc tên trên nhẫn",
    unitPrice: 150_000,
    note: "Có thể lấy trong ngày",
  },
];

const EMPTY_DRAFT: ServiceDraft = {
  serviceType: "",
  unitPrice: "",
  note: "",
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<ServiceDraft>(EMPTY_DRAFT);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const filteredServices = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) {
      return services;
    }

    return services.filter((service) => {
      const content = normalizeText(
        `${service.serviceType} ${service.unitPrice} ${service.note}`,
      );
      return content.includes(query);
    });
  }, [searchQuery, services]);

  const shownServices = filteredServices.length;

  const averagePrice = useMemo(() => {
    if (services.length === 0) {
      return 0;
    }
    return Math.round(
      services.reduce((sum, service) => sum + service.unitPrice, 0) /
        services.length,
    );
  }, [services]);

  function handleOpenCreateModal() {
    setFormMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function handleOpenEditModal(service: ServiceItem) {
    setFormMode("edit");
    setEditingId(service.id);
    setDraft({
      serviceType: service.serviceType,
      unitPrice: service.unitPrice.toString(),
      note: service.note,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setErrorMessage("");
  }

  function handleChangeDraft(field: keyof ServiceDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function parseUnitPrice(value: string): number {
    return parseMoneyInput(value);
  }

  function validateDraft(): { valid: boolean; price: number } {
    if (!draft.serviceType.trim()) {
      setErrorMessage("Vui lòng nhập loại dịch vụ.");
      return { valid: false, price: 0 };
    }

    const price = parseUnitPrice(draft.unitPrice);
    if (price <= 0) {
      setErrorMessage("Vui lòng nhập đơn giá hợp lệ (> 0).");
      return { valid: false, price: 0 };
    }

    return { valid: true, price };
  }

  function handleSubmitService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { valid, price } = validateDraft();
    if (!valid) {
      return;
    }

    if (formMode === "create") {
      const nextId =
        services.length === 0
          ? 1
          : Math.max(...services.map((service) => service.id)) + 1;

      setServices((previous) => [
        ...previous,
        {
          id: nextId,
          serviceType: draft.serviceType.trim(),
          unitPrice: price,
          note: draft.note.trim(),
        },
      ]);
      handleCloseModal();
      return;
    }

    setServices((previous) =>
      previous.map((service) =>
        service.id === editingId
          ? {
              ...service,
              serviceType: draft.serviceType.trim(),
              unitPrice: price,
              note: draft.note.trim(),
            }
          : service,
      ),
    );
    handleCloseModal();
  }

  function handleDeleteService(service: ServiceItem) {
    const confirmed = window.confirm(
      `Xóa loại dịch vụ "${service.serviceType}"? Hành động này không thể hoàn tác.`,
    );
    if (!confirmed) {
      return;
    }

    setServices((previous) => previous.filter((item) => item.id !== service.id));
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="border-b px-3 py-3">
          <div className="grid gap-2 xl:grid-cols-[auto_minmax(280px,1fr)_auto] xl:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Loại dịch vụ</CardTitle>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                BM4
              </Badge>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                {shownServices}/{services.length} bản ghi
              </Badge>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                TB {formatVND(averagePrice)}
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo loại dịch vụ, đơn giá, ghi chú..."
                className="pl-9"
              />
            </div>

            <Button onClick={handleOpenCreateModal} size="sm" className="h-8 cursor-pointer">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Thêm dịch vụ
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead className="w-[30%]">Loại dịch vụ</TableHead>
                <TableHead className="w-[20%] text-right">Đơn giá</TableHead>
                <TableHead className="w-[40%]">Ghi chú</TableHead>
                <TableHead className="w-24 text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy dịch vụ phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service, index) => (
                  <TableRow key={service.id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="truncate font-medium">{service.serviceType}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        {formatVND(service.unitPrice)}
                      </Badge>
                    </TableCell>
                    <TableCell className="truncate text-muted-foreground">
                      {service.note || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleOpenEditModal(service)}
                          aria-label="Sửa dịch vụ"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleDeleteService(service)}
                          aria-label="Xóa dịch vụ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-xl rounded-xl border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {formMode === "create" ? "Thêm dịch vụ" : "Cập nhật dịch vụ"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Điền thông tin loại dịch vụ, đơn giá và ghi chú.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={handleCloseModal}
                aria-label="Đóng cửa sổ"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmitService} className="space-y-4 px-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-type">Loại dịch vụ</Label>
                <Input
                  id="service-type"
                  value={draft.serviceType}
                  onChange={(event) =>
                    handleChangeDraft("serviceType", event.target.value)
                  }
                  placeholder="VD: Đánh bóng trang sức"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-price">Đơn giá (VND)</Label>
                <MoneyInput
                  id="service-price"
                  value={draft.unitPrice}
                  onValueChange={(value) => handleChangeDraft("unitPrice", value)}
                  placeholder="VD: 150.000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-note">Ghi chú</Label>
                <Input
                  id="service-note"
                  value={draft.note}
                  onChange={(event) => handleChangeDraft("note", event.target.value)}
                  placeholder="Thông tin bổ sung (nếu có)"
                />
              </div>

              {errorMessage && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handleCloseModal}
                >
                  Hủy
                </Button>
                <Button type="submit" className="cursor-pointer">
                  {formMode === "create" ? "Thêm mới" : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



