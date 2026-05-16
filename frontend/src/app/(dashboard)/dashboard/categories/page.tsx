"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog, EmptyState, PageHeader, StatusBadge, TableToolbar } from "@/components/dashboard/management";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  UNIT_TYPE_LABELS,
  UNIT_TYPE_OPTIONS,
  type UnitDefinition,
  type UnitType,
} from "@/lib/unit-data";
import { useUnitStore } from "@/stores/unit-store";
import { Pencil, Plus, Ruler, Search, Trash2, X } from "lucide-react";

interface UnitDraft {
  name: string;
  type: UnitType;
  conversionToGram: string;
  note: string;
}

type FormMode = "create" | "edit";

const EMPTY_DRAFT: UnitDraft = {
  name: "",
  type: "WEIGHT",
  conversionToGram: "",
  note: "",
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function parseNonNegativeNumber(raw: string): number {
  const normalized = raw.replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function formatConversion(value: number): string {
  if (value === 0) {
    return "Không quy đổi";
  }
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 4 })} gram`;
}

function getNextUnitId(units: UnitDefinition[]): number {
  return units.length === 0 ? 1 : Math.max(...units.map((unit) => unit.id)) + 1;
}

export default function CategoriesPage() {
  const { units, addUnit, updateUnit, deleteUnit, hydrate, isHydrated } = useUnitStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<UnitDraft>(EMPTY_DRAFT);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingUnit, setDeletingUnit] = useState<UnitDefinition | null>(null);

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  const filteredUnits = useMemo(() => {
    const query = normalizeText(searchQuery);
    if (!query) {
      return units;
    }

    return units.filter((unit) => {
      const content = normalizeText(
        `${unit.name} ${UNIT_TYPE_LABELS[unit.type]} ${unit.conversionToGram} ${unit.note}`,
      );
      return content.includes(query);
    });
  }, [searchQuery, units]);

  const weightUnitCount = useMemo(
    () => units.filter((unit) => unit.type === "WEIGHT").length,
    [units],
  );

  function openCreateModal() {
    setFormMode("create");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(unit: UnitDefinition) {
    setFormMode("edit");
    setEditingId(unit.id);
    setDraft({
      name: unit.name,
      type: unit.type,
      conversionToGram: unit.conversionToGram ? String(unit.conversionToGram) : "",
      note: unit.note,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setErrorMessage("");
  }

  function updateDraft(field: keyof UnitDraft, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  function validateDraft(): { valid: boolean; conversionToGram: number } {
    const name = draft.name.trim();
    if (!name) {
      setErrorMessage("Vui lòng nhập tên đơn vị tính.");
      return { valid: false, conversionToGram: 0 };
    }

    const duplicate = units.some(
      (unit) => normalizeText(unit.name) === normalizeText(name) && unit.id !== editingId,
    );
    if (duplicate) {
      setErrorMessage("QD3: Đơn vị tính không được trùng.");
      return { valid: false, conversionToGram: 0 };
    }

    const conversionToGram = parseNonNegativeNumber(draft.conversionToGram);
    if (draft.type === "WEIGHT" && conversionToGram <= 0) {
      setErrorMessage("Đơn vị trọng lượng cần hệ số quy đổi lớn hơn 0 so với gram.");
      return { valid: false, conversionToGram: 0 };
    }

    return { valid: true, conversionToGram };
  }

  function submitUnit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { valid, conversionToGram } = validateDraft();
    if (!valid) {
      return;
    }

    if (formMode === "create") {
      const nextId = getNextUnitId(units);
      addUnit({
        id: nextId,
        name: draft.name.trim(),
        type: draft.type,
        conversionToGram,
        note: draft.note.trim(),
      });
      closeModal();
      return;
    }

    if (editingId !== null) {
      updateUnit(editingId, {
        name: draft.name.trim(),
        type: draft.type,
        conversionToGram,
        note: draft.note.trim(),
      });
    }
    closeModal();
  }

  function removeUnit(unit: UnitDefinition) {
    deleteUnit(unit.id);
    setDeletingUnit(null);
  }

  return (
    <div className="space-y-3">
      <PageHeader
        eyebrow="Danh mục chuẩn hóa"
        title="Danh sách đơn vị tính"
        description="Quản lý đơn vị tính dùng trong sản phẩm, phiếu nhập, phiếu bán và báo cáo. QD3 yêu cầu tên đơn vị không được trùng."
        badges={
          <>
            <Badge variant="outline" className="border-border/70 bg-background/70">BM3</Badge>
            <StatusBadge tone="info">{weightUnitCount} đơn vị trọng lượng</StatusBadge>
          </>
        }
        actions={
          <Button onClick={openCreateModal} size="sm" className="h-8 cursor-pointer">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Thêm đơn vị
          </Button>
        }
      />

      <Card>
        <TableToolbar
          title="Tra cứu đơn vị tính"
          description="VD: Trọng lượng, số lượng, kích thước... hoặc 1 Chỉ = 3.75 Gram."
          meta={<Badge variant="outline" className="h-5 border-border/80 bg-card px-2 text-[10px]">{filteredUnits.length}/{units.length} bản ghi</Badge>}
          search={
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo đơn vị, loại, hệ số, ghi chú..."
                className="pl-9"
              />
            </div>
          }
        />

        <CardContent className="px-0">
          {filteredUnits.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Ruler}
                title="Không tìm thấy đơn vị tính"
                description="Thử đổi từ khóa hoặc thêm đơn vị mới. Tên đơn vị sẽ được kiểm tra trùng theo QD3."
                action={
                  <Button onClick={openCreateModal} size="sm" className="cursor-pointer">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Thêm đơn vị
                  </Button>
                }
              />
            </div>
          ) : (
            <Table className="table-fixed [&_th]:whitespace-normal [&_th]:leading-4 [&_td]:align-middle">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-14 text-center">STT</TableHead>
                  <TableHead className="w-[24%]">Đơn vị tính</TableHead>
                  <TableHead className="w-[18%]">Loại đơn vị</TableHead>
                  <TableHead className="w-[22%]">Hệ số quy đổi so với gram</TableHead>
                  <TableHead className="w-[26%]">Ghi chú</TableHead>
                  <TableHead className="w-24 text-right">Tác vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.map((unit, index) => (
                  <TableRow key={unit.id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{unit.name}</TableCell>
                    <TableCell>
                      <StatusBadge tone={unit.type === "WEIGHT" ? "success" : "neutral"}>
                        {UNIT_TYPE_LABELS[unit.type]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="font-medium">{formatConversion(unit.conversionToGram)}</TableCell>
                    <TableCell className="truncate text-muted-foreground">{unit.note || "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => openEditModal(unit)}
                          aria-label="Sửa đơn vị tính"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          className="cursor-pointer"
                          onClick={() => setDeletingUnit(unit)}
                          aria-label="Xóa đơn vị tính"
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

      <div className="rounded-xl border border-border/70 bg-muted/25 px-4 py-3 text-sm">
        <p className="font-semibold">QD3: Kiểm tra đơn vị tính không được trùng.</p>
        <p className="mt-1 text-muted-foreground">
          Hệ thống so sánh tên đơn vị sau khi bỏ khoảng trắng đầu/cuối và không phân biệt hoa thường.
        </p>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl rounded-xl border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {formMode === "create" ? "Thêm đơn vị tính" : "Cập nhật đơn vị tính"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nhập tên, loại đơn vị và hệ số quy đổi nếu dùng cho trọng lượng.
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

            <form onSubmit={submitUnit} className="space-y-4 px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit-name">Đơn vị tính</Label>
                  <Input
                    id="unit-name"
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    placeholder="VD: Chỉ, Gram, Lượng, Viên"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-type">Loại đơn vị</Label>
                  <Select
                    id="unit-type"
                    value={draft.type}
                    onValueChange={(value) => updateDraft("type", value)}
                    options={UNIT_TYPE_OPTIONS}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="unit-conversion">Hệ số quy đổi so với gram</Label>
                  <Input
                    id="unit-conversion"
                    value={draft.conversionToGram}
                    onChange={(event) => updateDraft("conversionToGram", event.target.value)}
                    inputMode="decimal"
                    placeholder="VD: 1 Chỉ = 3.75 Gram -> nhập 3.75"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Với đơn vị số lượng/kích thước không quy đổi gram, có thể để trống hoặc nhập 0.
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="unit-note">Ghi chú</Label>
                  <Input
                    id="unit-note"
                    value={draft.note}
                    onChange={(event) => updateDraft("note", event.target.value)}
                    placeholder="VD: 1 Chỉ = 3.75 Gram"
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" className="cursor-pointer" onClick={closeModal}>
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
        open={deletingUnit !== null}
        title="Xóa đơn vị tính?"
        description={
          deletingUnit
            ? `Đơn vị "${deletingUnit.name}" sẽ bị xóa khỏi danh mục demo. Hành động này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa đơn vị"
        destructive
        onCancel={() => setDeletingUnit(null)}
        onConfirm={() => {
          if (deletingUnit) {
            removeUnit(deletingUnit);
          }
        }}
      />
    </div>
  );
}
