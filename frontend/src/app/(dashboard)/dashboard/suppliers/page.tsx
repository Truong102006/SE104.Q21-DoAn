"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
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
    name: "Công ty Vàng Bạc A",
    phone: "0909000111",
    address: "Q1, TP.HCM",
    note: "Hợp tác từ 2024",
  },
  {
    id: 2,
    name: "Nhà phân phối Kim Hoàn B",
    phone: "0909000222",
    address: "Hà Nội",
    note: "Giao hàng thứ 2, thứ 5",
  },
  {
    id: 3,
    name: "Đối tác nguyên liệu C",
    phone: "0909000333",
    address: "Đà Nẵng",
    note: "Ưu tiên vận chuyển nhanh",
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
      setErrorMessage("Vui lòng nhập tên nhà cung cấp.");
      return false;
    }

    if (!draft.phone.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại.");
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
      `Xóa nhà cung cấp "${supplier.name}"? Hành động này không thể hoàn tác.`,
    );
    if (!confirmed) {
      return;
    }

    setSuppliers((previous) => previous.filter((item) => item.id !== supplier.id));
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="border-b px-3 py-3">
          <div className="grid gap-2 xl:grid-cols-[auto_minmax(280px,1fr)_auto] xl:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Nhà cung cấp</CardTitle>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                BM1
              </Badge>
              <Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">
                {shownSuppliers}/{suppliers.length} bản ghi
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo tên, số điện thoại, địa chỉ..."
                className="pl-9"
              />
            </div>

            <Button onClick={handleOpenCreateModal} size="sm" className="h-8 cursor-pointer">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Thêm nhà cung cấp
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-14 text-center">STT</TableHead>
                <TableHead>Tên nhà cung cấp</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="w-24 text-right">Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Không tìm thấy nhà cung cấp phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.id} className="group">
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
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
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleOpenEditModal(supplier)}
                          aria-label="Sửa nhà cung cấp"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleDeleteSupplier(supplier)}
                          aria-label="Xóa nhà cung cấp"
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
                    ? "Thêm nhà cung cấp"
                    : "Cập nhật nhà cung cấp"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Điền đầy đủ thông tin và lưu thay đổi.
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

            <form onSubmit={handleSubmitSupplier} className="space-y-4 px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="supplier-name">Tên nhà cung cấp</Label>
                  <Input
                    id="supplier-name"
                    value={draft.name}
                    onChange={(event) =>
                      handleChangeDraft("name", event.target.value)
                    }
                    placeholder="VD: Công ty Vàng Bạc ABC"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier-phone">Số điện thoại</Label>
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
                  <Label htmlFor="supplier-address">Địa chỉ</Label>
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
                  <Label htmlFor="supplier-note">Ghi chú</Label>
                  <Input
                    id="supplier-note"
                    value={draft.note}
                    onChange={(event) =>
                      handleChangeDraft("note", event.target.value)
                    }
                    placeholder="Thông tin bổ sung (nếu có)"
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



