"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog, EmptyState, PageHeader, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SYSTEM_CODE_INPUT_CLASS, SYSTEM_CODE_NOTE_CLASS } from "@/lib/form-styles";
import { MOCK_CUSTOMERS } from "@/lib/mock-data";
import { type Customer } from "@/types";
import { Contact, Pencil, Plus, Search, Trash2, X, User } from "lucide-react";

interface CustomerDraft {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

type FormMode = "create" | "edit";

const EMPTY_DRAFT: CustomerDraft = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
};

function getCustomerCode(id: number): string {
  return `KH-${String(id).padStart(4, "0")}`;
}

function getNextCustomerId(customers: Customer[]): number {
  return customers.length === 0
    ? 1
    : Math.max(...customers.map((c) => c.id)) + 1;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<CustomerDraft>(EMPTY_DRAFT);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) {
      return customers;
    }
    return customers.filter((customer) => {
      const content = normalizeText(
        `${getCustomerCode(customer.id)} ${customer.fullName} ${customer.phone} ${customer.email ?? ""} ${customer.address ?? ""}`,
      );
      return content.includes(query);
    });
  }, [customers, searchQuery]);

  function openCreateModal() {
    setFormMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setFormMode("edit");
    setEditingId(customer.id);
    setDraft({
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email ?? "",
      address: customer.address ?? "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setErrorMessage("");
  }

  function updateDraft(field: keyof CustomerDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function validateDraft(): boolean {
    if (!draft.fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ tên khách hàng.");
      return false;
    }
    if (!draft.phone.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại.");
      return false;
    }
    // Simple phone validation
    if (!/^[0-9+]{10,12}$/.test(draft.phone.trim())) {
      setErrorMessage("Số điện thoại không hợp lệ.");
      return false;
    }
    return true;
  }

  function submitCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateDraft()) {
      return;
    }

    if (formMode === "create") {
      const nextId = getNextCustomerId(customers);
      setCustomers((previous) => [
        ...previous,
        {
          id: nextId,
          fullName: draft.fullName.trim(),
          phone: draft.phone.trim(),
          email: draft.email.trim() || undefined,
          address: draft.address.trim() || undefined,
          createdAt: new Date().toISOString(),
        },
      ]);
      closeModal();
      return;
    }

    setCustomers((previous) =>
      previous.map((customer) =>
        customer.id === editingId
          ? {
              ...customer,
              fullName: draft.fullName.trim(),
              phone: draft.phone.trim(),
              email: draft.email.trim() || undefined,
              address: draft.address.trim() || undefined,
            }
          : customer,
      ),
    );
    closeModal();
  }

  function removeCustomer(customer: Customer) {
    setCustomers((previous) => previous.filter((item) => item.id !== customer.id));
    setDeletingCustomer(null);
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Khách hàng"
        title="Quản lý thông tin khách hàng"
        description="Lưu trữ và cập nhật thông tin khách hàng, số điện thoại và địa chỉ liên lạc."
        badges={
          <>
            <Badge variant="outline" className="border-border/70 bg-background/70">BM2</Badge>
            <Badge variant="outline" className="border-border/70 bg-background/70">Tổng số {customers.length}</Badge>
          </>
        }
        actions={
          <Button onClick={openCreateModal} size="sm" className="h-8 cursor-pointer">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Thêm khách hàng
          </Button>
        }
      />

      <Card>
        <TableToolbar
          title="Danh sách khách hàng"
          description="Tra cứu khách hàng theo mã, tên hoặc số điện thoại."
          meta={<Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">{filteredCustomers.length}/{customers.length} khách hàng</Badge>}
          search={
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo mã, tên, SĐT..."
                className="pl-9"
              />
            </div>
          }
        />

        <CardContent className="px-0">
          {filteredCustomers.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Contact}
                title="Không tìm thấy khách hàng"
                description="Thử đổi từ khóa tìm kiếm hoặc thêm khách hàng mới."
                action={
                  <Button onClick={openCreateModal} size="sm" className="cursor-pointer">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Thêm khách hàng
                  </Button>
                }
              />
            </div>
          ) : (
            <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead className="w-[12%]">Mã KH</TableHead>
                  <TableHead className="w-[20%]">Họ tên</TableHead>
                  <TableHead className="w-[15%]">Số điện thoại</TableHead>
                  <TableHead className="w-[20%]">Email</TableHead>
                  <TableHead className="w-[23%]">Địa chỉ</TableHead>
                  <TableHead className="w-24 text-right">Tác vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {getCustomerCode(customer.id)}
                    </TableCell>
                    <TableCell className="truncate font-medium">{customer.fullName}</TableCell>
                    <TableCell className="truncate font-mono text-sm">{customer.phone}</TableCell>
                    <TableCell className="truncate text-muted-foreground">{customer.email ?? "-"}</TableCell>
                    <TableCell className="truncate text-muted-foreground text-xs">{customer.address ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => openEditModal(customer)}
                          aria-label="Sửa thông tin"
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
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-xl border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  {formMode === "create" ? "Thêm khách hàng" : "Cập nhật thông tin"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formMode === "create" ? "Nhập thông tin cho khách hàng mới." : "Chỉnh sửa thông tin khách hàng hiện tại."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={closeModal}
                aria-label="Đóng cửa sổ"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={submitCustomer} className="space-y-4 px-5 py-4">
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Mã khách hàng</Label>
                    <Input
                      value={formMode === "create" ? getCustomerCode(getNextCustomerId(customers)) : getCustomerCode(editingId!)}
                      readOnly
                      className={SYSTEM_CODE_INPUT_CLASS}
                    />
                    <p className={SYSTEM_CODE_NOTE_CLASS}>Mã tự động.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cust-phone">Số điện thoại <span className="text-destructive">*</span></Label>
                    <Input
                      id="cust-phone"
                      value={draft.phone}
                      onChange={(e) => updateDraft("phone", e.target.value)}
                      placeholder="VD: 0901234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cust-name">Họ và tên <span className="text-destructive">*</span></Label>
                  <Input
                    id="cust-name"
                    value={draft.fullName}
                    onChange={(e) => updateDraft("fullName", e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cust-email">Email</Label>
                  <Input
                    id="cust-email"
                    type="email"
                    value={draft.email}
                    onChange={(e) => updateDraft("email", e.target.value)}
                    placeholder="VD: customer@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cust-address">Địa chỉ</Label>
                  <Input
                    id="cust-address"
                    value={draft.address}
                    onChange={(e) => updateDraft("address", e.target.value)}
                    placeholder="VD: 123 Đường ABC, Quận X, TP. Y"
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
                  onClick={closeModal}
                >
                  Hủy
                </Button>
                <Button type="submit" className="cursor-pointer bg-gold hover:bg-gold/90 text-gold-foreground">
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
            ? `Thông tin của khách hàng "${deletingCustomer.fullName}" sẽ bị xóa. Hành động này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa khách hàng"
        destructive
        onCancel={() => setDeletingCustomer(null)}
        onConfirm={() => {
          if (deletingCustomer) {
            removeCustomer(deletingCustomer);
          }
        }}
      />
    </div>
  );
}
