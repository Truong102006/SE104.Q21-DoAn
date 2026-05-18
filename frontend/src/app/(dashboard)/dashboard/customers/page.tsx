"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  TableToolbar,
} from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

interface CustomerItem {
  id: number;
  name: string;
  phone: string;
  address: string;
  note: string;
}

interface CustomerDraft {
  name: string;
  phone: string;
  address: string;
  note: string;
}

type FormMode = "create" | "edit";

const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: 1,
    name: "Nguyễn Văn Minh",
    phone: "0908000111",
    address: "Quận 1, TP.HCM",
    note: "Khách hàng thân thiết",
  },
  {
    id: 2,
    name: "Trần Thị Lan",
    phone: "0908000222",
    address: "Quận 3, TP.HCM",
    note: "Ưu tiên liên hệ buổi sáng",
  },
];

const EMPTY_DRAFT: CustomerDraft = {
  name: "",
  phone: "",
  address: "",
  note: "",
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<CustomerDraft>(EMPTY_DRAFT);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerItem | null>(
    null,
  );

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

  const filteredCustomers = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      const content = normalizeText(
        `${customer.name} ${customer.phone} ${customer.address} ${customer.note}`,
      );
      return content.includes(query);
    });
  }, [customers, searchQuery]);

  const shownCustomers = filteredCustomers.length;

  function handleOpenCreateModal() {
    setFormMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function handleOpenEditModal(customer: CustomerItem) {
    setFormMode("edit");
    setEditingId(customer.id);
    setDraft({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      note: customer.note,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setErrorMessage("");
  }

  function handleChangeDraft(field: keyof CustomerDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function validateDraft(): boolean {
    const name = draft.name.trim();
    const phone = draft.phone.trim();

    if (!name) {
      setErrorMessage("Vui lòng nhập tên khách hàng.");
      return false;
    }

    if (!phone) {
      setErrorMessage("Vui lòng nhập số điện thoại.");
      return false;
    }

    const existingPhoneCustomer = customers.find(
      (customer) =>
        customer.id !== editingId &&
        normalizePhone(customer.phone) === normalizePhone(phone),
    );

    if (!existingPhoneCustomer) {
      return true;
    }

    if (normalizeText(existingPhoneCustomer.name) === normalizeText(name)) {
      setErrorMessage(
        "Khách hàng đã tồn tại trong hệ thống với số điện thoại này.",
      );
      return false;
    }

    setErrorMessage(
      `Số điện thoại này đã được gắn với khách hàng "${existingPhoneCustomer.name}".`,
    );
    return false;
  }

  function handleSubmitCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateDraft()) {
      return;
    }

    if (formMode === "create") {
      const nextId =
        customers.length === 0
          ? 1
          : Math.max(...customers.map((customer) => customer.id)) + 1;

      setCustomers((previous) => [
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

    setCustomers((previous) =>
      previous.map((customer) =>
        customer.id === editingId
          ? {
              ...customer,
              name: draft.name.trim(),
              phone: draft.phone.trim(),
              address: draft.address.trim(),
              note: draft.note.trim(),
            }
          : customer,
      ),
    );
    handleCloseModal();
  }

  function handleDeleteCustomer(customer: CustomerItem) {
    setCustomers((previous) => previous.filter((item) => item.id !== customer.id));
    setDeletingCustomer(null);
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="BM2"
        title="Danh sách khách hàng"
        description="Quản lý tên khách hàng, số điện thoại, địa chỉ và ghi chú. Số điện thoại là định danh duy nhất cho mỗi khách hàng."
        badges={
          <Badge variant="outline" className="border-border/70 bg-background/70">
            BM2
          </Badge>
        }
        actions={
          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            className="h-8 cursor-pointer"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Thêm khách hàng
          </Button>
        }
      />

      <Card>
        <TableToolbar
          title="Danh sách khách hàng"
          description="Tìm theo tên, số điện thoại, địa chỉ hoặc ghi chú."
          meta={
            <Badge
              variant="outline"
              className="h-5 border-border/80 bg-card px-2 text-[10px]"
            >
              {shownCustomers}/{customers.length} bản ghi
            </Badge>
          }
          search={
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo tên, số điện thoại, địa chỉ..."
                className="pl-9"
              />
            </div>
          }
        />

        <CardContent className="px-0">
          {filteredCustomers.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={UserRound}
                title="Không tìm thấy khách hàng"
                description="Thử đổi từ khóa hoặc thêm khách hàng mới vào danh sách BM2."
                action={
                  <Button
                    onClick={handleOpenCreateModal}
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Thêm khách hàng
                  </Button>
                }
              />
            </div>
          ) : (
            <Table className="table-fixed [&_td]:align-middle [&_th]:whitespace-normal [&_th]:leading-4">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead className="w-[24%]">Tên khách hàng</TableHead>
                  <TableHead className="w-[16%]">Số điện thoại</TableHead>
                  <TableHead className="w-[24%]">Địa chỉ</TableHead>
                  <TableHead className="w-[24%]">Ghi chú</TableHead>
                  <TableHead className="w-24 text-right">Tác vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.id} className="group">
                    <TableCell className="text-center font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="truncate font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="truncate">
                      <div className="inline-flex items-center gap-1.5 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell className="truncate">
                      <div className="inline-flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.address || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="truncate text-muted-foreground">
                      {customer.note || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => handleOpenEditModal(customer)}
                          aria-label="Sửa khách hàng"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => setDeletingCustomer(customer)}
                          aria-label="Xóa khách hàng"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
                    ? "Thêm khách hàng"
                    : "Cập nhật khách hàng"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Điền đầy đủ thông tin khách hàng và lưu thay đổi.
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

            <form onSubmit={handleSubmitCustomer} className="space-y-4 px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="customer-name">Tên khách hàng</Label>
                  <Input
                    id="customer-name"
                    value={draft.name}
                    onChange={(event) =>
                      handleChangeDraft("name", event.target.value)
                    }
                    placeholder="VD: Nguyễn Văn Minh"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Số điện thoại</Label>
                  <Input
                    id="customer-phone"
                    value={draft.phone}
                    onChange={(event) =>
                      handleChangeDraft("phone", event.target.value)
                    }
                    placeholder="VD: 0908000111"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-address">Địa chỉ</Label>
                  <Input
                    id="customer-address"
                    value={draft.address}
                    onChange={(event) =>
                      handleChangeDraft("address", event.target.value)
                    }
                    placeholder="VD: Quận 1, TP.HCM"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="customer-note">Ghi chú</Label>
                  <Input
                    id="customer-note"
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

      <ConfirmDialog
        open={deletingCustomer !== null}
        title="Xóa khách hàng?"
        description={
          deletingCustomer
            ? `Khách hàng "${deletingCustomer.name}" sẽ bị xóa khỏi danh sách demo. Hành động này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa khách hàng"
        destructive
        onCancel={() => setDeletingCustomer(null)}
        onConfirm={() => {
          if (deletingCustomer) {
            handleDeleteCustomer(deletingCustomer);
          }
        }}
      />
    </div>
  );
}
