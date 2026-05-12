"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/mock-data";
import {
  CircleDollarSign,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

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
    serviceType: "Danh bong trang suc",
    unitPrice: 120_000,
    note: "Bao gom ve sinh va danh bong",
  },
  {
    id: 2,
    serviceType: "Thu mua vang cu",
    unitPrice: 80_000,
    note: "Phi kiem dinh moi giao dich",
  },
  {
    id: 3,
    serviceType: "Khac ten tren nhan",
    unitPrice: 150_000,
    note: "Co the lay trong ngay",
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

  const totalServices = services.length;
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
    const digitsOnly = value.replace(/[^\d]/g, "");
    if (!digitsOnly) {
      return 0;
    }
    return Number.parseInt(digitsOnly, 10);
  }

  function validateDraft(): { valid: boolean; price: number } {
    if (!draft.serviceType.trim()) {
      setErrorMessage("Vui long nhap loai dich vu.");
      return { valid: false, price: 0 };
    }

    const price = parseUnitPrice(draft.unitPrice);
    if (price <= 0) {
      setErrorMessage("Vui long nhap don gia hop le (> 0).");
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
      `Xoa loai dich vu "${service.serviceType}"? Hanh dong nay khong the hoan tac.`,
    );
    if (!confirmed) {
      return;
    }

    setServices((previous) => previous.filter((item) => item.id !== service.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dich vu</h1>
          <p className="mt-1 text-muted-foreground">
            Danh sach loai dich vu theo BM4, toi uu cho them, sua, xoa nhanh.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="cursor-pointer bg-gradient-to-r from-gold to-amber-400 text-gold-foreground ring-1 ring-gold/50 shadow-lg shadow-gold/35 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-gold hover:shadow-xl hover:shadow-gold/45"
        >
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
            <Plus className="h-3.5 w-3.5" />
          </span>
          Them dich vu
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-gold/10 p-2 text-gold">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tong loai dich vu</p>
              <p className="text-xl font-semibold">{totalServices}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Don gia trung binh</p>
              <p className="text-xl font-semibold">{formatVND(averagePrice)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                Danh sach loai dich vu
              </CardTitle>
              <CardDescription>
                Cac cot theo bieu mau: Loai dich vu, Don gia (VND), Ghi chu.
              </CardDescription>
            </div>
            <Badge variant="outline">{shownServices} ban ghi</Badge>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tim theo loai dich vu, don gia, ghi chu..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 pl-6 text-center">STT</TableHead>
                <TableHead>Loai dich vu</TableHead>
                <TableHead>Don gia (VND)</TableHead>
                <TableHead>Ghi chu</TableHead>
                <TableHead className="w-32 pr-6 text-right">Tac vu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Khong tim thay dich vu phu hop.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service, index) => (
                  <TableRow key={service.id}>
                    <TableCell className="pl-6 text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{service.serviceType}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        {formatVND(service.unitPrice)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[360px] truncate text-muted-foreground">
                      {service.note || "-"}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleOpenEditModal(service)}
                          aria-label="Sua dich vu"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleDeleteService(service)}
                          aria-label="Xoa dich vu"
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
                  {formMode === "create" ? "Them dich vu" : "Cap nhat dich vu"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dien thong tin loai dich vu, don gia va ghi chu.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={handleCloseModal}
                aria-label="Dong cua so"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmitService} className="space-y-4 px-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-type">Loai dich vu</Label>
                <Input
                  id="service-type"
                  value={draft.serviceType}
                  onChange={(event) =>
                    handleChangeDraft("serviceType", event.target.value)
                  }
                  placeholder="VD: Danh bong trang suc"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-price">Don gia (VND)</Label>
                <Input
                  id="service-price"
                  value={draft.unitPrice}
                  onChange={(event) =>
                    handleChangeDraft("unitPrice", event.target.value)
                  }
                  placeholder="VD: 150000"
                  inputMode="numeric"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-note">Ghi chu</Label>
                <Input
                  id="service-note"
                  value={draft.note}
                  onChange={(event) => handleChangeDraft("note", event.target.value)}
                  placeholder="Thong tin bo sung (neu co)"
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
                  Huy
                </Button>
                <Button type="submit" className="cursor-pointer">
                  {formMode === "create" ? "Them moi" : "Luu thay doi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
