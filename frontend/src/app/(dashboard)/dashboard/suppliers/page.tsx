"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

interface SupplierItem {
  id: number;
  name: string;
  phone: string;
  address: string;
  note: string;
}

interface SupplierDraft {
  name: string;
  phone: string;
  address: string;
  note: string;
}

type FormMode = "create" | "edit";

const INITIAL_SUPPLIERS: SupplierItem[] = [
  {
    id: 1,
    name: "Cong ty Vang Bac A",
    phone: "0909000111",
    address: "Q1, TP.HCM",
    note: "Hop tac tu 2024",
  },
  {
    id: 2,
    name: "Nha phan phoi Kim Hoan B",
    phone: "0909000222",
    address: "Ha Noi",
    note: "Giao hang thu 2, thu 5",
  },
  {
    id: 3,
    name: "Doi tac nguyen lieu C",
    phone: "0909000333",
    address: "Da Nang",
    note: "Uu tien van chuyen nhanh",
  },
];

const EMPTY_DRAFT: SupplierDraft = {
  name: "",
  phone: "",
  address: "",
  note: "",
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(INITIAL_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<SupplierDraft>(EMPTY_DRAFT);
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

  const filteredSuppliers = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      const content = normalizeText(
        `${supplier.name} ${supplier.phone} ${supplier.address} ${supplier.note}`,
      );
      return content.includes(query);
    });
  }, [searchQuery, suppliers]);

  const totalSuppliers = suppliers.length;
  const shownSuppliers = filteredSuppliers.length;

  function handleOpenCreateModal() {
    setFormMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function handleOpenEditModal(supplier: SupplierItem) {
    setFormMode("edit");
    setEditingId(supplier.id);
    setDraft({
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
      note: supplier.note,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setErrorMessage("");
  }

  function handleChangeDraft(field: keyof SupplierDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function validateDraft(): boolean {
    if (!draft.name.trim()) {
      setErrorMessage("Vui long nhap ten nha cung cap.");
      return false;
    }

    if (!draft.phone.trim()) {
      setErrorMessage("Vui long nhap so dien thoai.");
      return false;
    }

    return true;
  }

  function handleSubmitSupplier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateDraft()) {
      return;
    }

    if (formMode === "create") {
      const nextId =
        suppliers.length === 0
          ? 1
          : Math.max(...suppliers.map((supplier) => supplier.id)) + 1;

      setSuppliers((previous) => [
        ...previous,
        {
          id: nextId,
          name: draft.name.trim(),
          phone: draft.phone.trim(),
          address: draft.address.trim(),
          note: draft.note.trim(),
        },
      ]);
      handleCloseModal();
      return;
    }

    setSuppliers((previous) =>
      previous.map((supplier) =>
        supplier.id === editingId
          ? {
              ...supplier,
              name: draft.name.trim(),
              phone: draft.phone.trim(),
              address: draft.address.trim(),
              note: draft.note.trim(),
            }
          : supplier,
      ),
    );
    handleCloseModal();
  }

  function handleDeleteSupplier(supplier: SupplierItem) {
    const confirmed = window.confirm(
      `Xoa nha cung cap "${supplier.name}"? Hanh dong nay khong the hoan tac.`,
    );
    if (!confirmed) {
      return;
    }

    setSuppliers((previous) => previous.filter((item) => item.id !== supplier.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Nha cung cap</h1>
          <p className="mt-1 text-muted-foreground">
            Danh sach nha cung cap voi giao dien toi uu cho thao tac nhanh.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="cursor-pointer bg-gradient-to-r from-gold to-amber-400 text-gold-foreground ring-1 ring-gold/50 shadow-lg shadow-gold/35 transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-gold hover:shadow-xl hover:shadow-gold/45"
        >
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
            <Plus className="h-3.5 w-3.5" />
          </span>
          Them nha cung cap
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-gold/10 p-2 text-gold">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tong nha cung cap</p>
              <p className="text-xl font-semibold">{totalSuppliers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dang hien thi</p>
              <p className="text-xl font-semibold">{shownSuppliers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Danh sach nha cung cap</CardTitle>
              <CardDescription>
                Cac truong du lieu theo bieu mau: Ten, So dien thoai, Dia chi, Ghi chu.
              </CardDescription>
            </div>
            <Badge variant="outline">{shownSuppliers} ban ghi</Badge>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tim theo ten, so dien thoai, dia chi..."
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 pl-6 text-center">STT</TableHead>
                <TableHead>Ten nha cung cap</TableHead>
                <TableHead>So dien thoai</TableHead>
                <TableHead>Dia chi</TableHead>
                <TableHead>Ghi chu</TableHead>
                <TableHead className="w-32 pr-6 text-right">Tac vu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Khong tim thay nha cung cap phu hop.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.id} className="group">
                    <TableCell className="pl-6 text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {supplier.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {supplier.address || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate text-muted-foreground">
                      {supplier.note || "-"}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleOpenEditModal(supplier)}
                          aria-label="Sua nha cung cap"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleDeleteSupplier(supplier)}
                          aria-label="Xoa nha cung cap"
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
                  {formMode === "create"
                    ? "Them nha cung cap"
                    : "Cap nhat nha cung cap"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dien day du thong tin va luu thay doi.
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

            <form onSubmit={handleSubmitSupplier} className="space-y-4 px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="supplier-name">Ten nha cung cap</Label>
                  <Input
                    id="supplier-name"
                    value={draft.name}
                    onChange={(event) =>
                      handleChangeDraft("name", event.target.value)
                    }
                    placeholder="VD: Cong ty Vang Bac ABC"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier-phone">So dien thoai</Label>
                  <Input
                    id="supplier-phone"
                    value={draft.phone}
                    onChange={(event) =>
                      handleChangeDraft("phone", event.target.value)
                    }
                    placeholder="VD: 0909000111"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier-address">Dia chi</Label>
                  <Input
                    id="supplier-address"
                    value={draft.address}
                    onChange={(event) =>
                      handleChangeDraft("address", event.target.value)
                    }
                    placeholder="VD: Q1, TP.HCM"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="supplier-note">Ghi chu</Label>
                  <Input
                    id="supplier-note"
                    value={draft.note}
                    onChange={(event) =>
                      handleChangeDraft("note", event.target.value)
                    }
                    placeholder="Thong tin bo sung (neu co)"
                  />
                </div>
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
