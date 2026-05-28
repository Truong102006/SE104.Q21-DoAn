"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { backendApi } from "@/services/backend-api";
import { useToastStore } from "@/stores/toast-store";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatVNCurrencyInput, parseVNCurrencyInput } from "@/lib/format";
import type {
    ProductResponse,
    ProductTypeResponse,
    UnitResponse,
} from "@/types/backend";

interface QuickCreateProductDialogProps {
    open: boolean;
    defaultName: string;
    productTypes: ProductTypeResponse[];
    units: UnitResponse[];
    onCreated: (product: ProductResponse) => void;
    onClose: () => void;
    onProductTypeCreated: (pt: ProductTypeResponse) => void;
    onUnitCreated: (u: UnitResponse) => void;
}

export function QuickCreateProductDialog({
    open,
    defaultName,
    productTypes,
    units,
    onCreated,
    onClose,
    onProductTypeCreated,
    onUnitCreated,
}: QuickCreateProductDialogProps) {
    const [tenSanPham, setTenSanPham] = useState(defaultName);
    const [maLoaiSanPham, setMaLoaiSanPham] = useState("");
    const [maDonViTinh, setMaDonViTinh] = useState("");
    const [donGiaMua, setDonGiaMua] = useState("0");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pendingUnits, setPendingUnits] = useState<UnitResponse[]>([]);
    const [pendingProductTypes, setPendingProductTypes] = useState<ProductTypeResponse[]>([]);

    const allUnits = [...units, ...pendingUnits];
    const allProductTypes = [...productTypes, ...pendingProductTypes];

    // Auto-select unit when product type changes
    function handleProductTypeChange(value: string) {
        setMaLoaiSanPham(value);
        const pt = allProductTypes.find(t => t.maLoaiSanPham === value);
        if (pt?.maDonViTinh) {
            setMaDonViTinh(pt.maDonViTinh);
        }
    }

    // Reset form when dialog opens or name changes
    const [prevOpen, setPrevOpen] = useState(open);
    const [prevName, setPrevName] = useState(defaultName);
    if (open !== prevOpen || defaultName !== prevName) {
        setPrevOpen(open);
        setPrevName(defaultName);
        if (open) {
            setTenSanPham(defaultName);
            setMaLoaiSanPham("");
            setMaDonViTinh("");
            setDonGiaMua("0");
            setError(null);
            setPendingUnits([]);
            setPendingProductTypes([]);
        }
    }

    const productTypeOptions = allProductTypes
        .filter((pt) => pt.isActive !== false)
        .map((pt) => ({ value: pt.maLoaiSanPham, label: pt.tenLoaiSanPham }));

    const unitOptions = allUnits
        .filter((u) => u.isActive !== false)
        .map((u) => ({ value: u.maDonViTinh, label: u.tenDonViTinh }));

    async function handleSubmit() {
        setError(null);

        if (!tenSanPham.trim()) {
            setError("Tên sản phẩm không được để trống");
            return;
        }
        if (!maLoaiSanPham) {
            setError("Vui lòng chọn loại sản phẩm");
            return;
        }
        if (!maDonViTinh) {
            setError("Vui lòng chọn đơn vị tính");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Resolve unit creation if it's pending/temporary
            let resolvedMaDonViTinh = maDonViTinh;
            const tempUnitObj = pendingUnits.find(u => u.maDonViTinh === maDonViTinh);
            if (tempUnitObj) {
                const createdUnit = await backendApi.units.create({ tenDonViTinh: tempUnitObj.tenDonViTinh });
                onUnitCreated(createdUnit);
                resolvedMaDonViTinh = createdUnit.maDonViTinh;
            }

            // 2. Resolve product type creation if it's pending/temporary
            let resolvedMaLoaiSanPham = maLoaiSanPham;
            const tempPTObj = pendingProductTypes.find(pt => pt.maLoaiSanPham === maLoaiSanPham);
            if (tempPTObj) {
                let ptUnitId = tempPTObj.maDonViTinh;
                if (ptUnitId.startsWith("temp_u_")) {
                    if (ptUnitId === maDonViTinh) {
                        ptUnitId = resolvedMaDonViTinh;
                    } else {
                        const otherUnitObj = pendingUnits.find(u => u.maDonViTinh === ptUnitId);
                        if (otherUnitObj) {
                            const createdOtherUnit = await backendApi.units.create({ tenDonViTinh: otherUnitObj.tenDonViTinh });
                            onUnitCreated(createdOtherUnit);
                            ptUnitId = createdOtherUnit.maDonViTinh;
                        }
                    }
                }

                const createdPT = await backendApi.productTypes.create({
                    tenLoaiSanPham: tempPTObj.tenLoaiSanPham,
                    tiLeLoiNhuan: 0.05,
                    maDonViTinh: ptUnitId,
                });
                onProductTypeCreated(createdPT);
                resolvedMaLoaiSanPham = createdPT.maLoaiSanPham;
            }

            // 3. Create the product
            const created = await backendApi.products.create({
                tenSanPham: tenSanPham.trim(),
                maLoaiSanPham: resolvedMaLoaiSanPham,
                donGiaMua: Number(parseVNCurrencyInput(donGiaMua)) || 0,
            });
            useToastStore.getState().success(`Đã tạo sản phẩm "${created.tenSanPham}"`);
            onCreated(created);
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể tạo sản phẩm"));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-5 w-5 text-gold" />
                        Tạo nhanh sản phẩm
                    </DialogTitle>
                    <DialogDescription>
                        Điền thông tin bắt buộc để tạo sản phẩm mới ngay trong phiếu mua.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                    <div className="space-y-4 py-2">
                        {/* Tên sản phẩm */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Tên sản phẩm <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={tenSanPham}
                                onChange={(e) => setTenSanPham(e.target.value)}
                                placeholder="Nhập tên sản phẩm"
                                className="h-9"
                                autoFocus
                            />
                        </div>

                        {/* Đơn vị tính */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Đơn vị tính <span className="text-destructive">*</span>
                            </Label>
                            <Combobox
                                value={maDonViTinh}
                                onValueChange={setMaDonViTinh}
                                options={unitOptions}
                                placeholder="Chọn đơn vị tính..."
                                className="h-9"
                                onCreateNew={async (name) => {
                                    const tempId = `temp_u_${Date.now()}`;
                                    const tempUnit = {
                                        maDonViTinh: tempId,
                                        tenDonViTinh: name,
                                        isActive: true,
                                    };
                                    setPendingUnits((prev) => [...prev, tempUnit]);
                                    return { value: tempId, label: name };
                                }}
                            />
                        </div>

                        {/* Loại sản phẩm */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Loại sản phẩm <span className="text-destructive">*</span>
                            </Label>
                            <Combobox
                                value={maLoaiSanPham}
                                onValueChange={handleProductTypeChange}
                                options={productTypeOptions}
                                placeholder="Chọn loại sản phẩm..."
                                className="h-9"
                                onCreateNew={async (name) => {
                                    if (!maDonViTinh) {
                                        useToastStore.getState().error("Vui lòng chọn đơn vị tính trước khi tạo loại sản phẩm mới");
                                        return null;
                                    }
                                    const tempId = `temp_pt_${Date.now()}`;
                                    const tempPT = {
                                        maLoaiSanPham: tempId,
                                        tenLoaiSanPham: name,
                                        tiLeLoiNhuan: 0.05,
                                        maDonViTinh: maDonViTinh,
                                        isActive: true,
                                    };
                                    setPendingProductTypes((prev) => [...prev, tempPT]);
                                    return { value: tempId, label: name };
                                }}
                            />
                        </div>

                        {/* Đơn giá mua */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">
                                Đơn giá mua (₫)
                            </Label>
                            <div className="relative flex items-center">
                                <Input
                                    type="text"
                                    value={formatVNCurrencyInput(donGiaMua)}
                                    onChange={(e) => setDonGiaMua(parseVNCurrencyInput(e.target.value))}
                                    className="h-9 text-sm pr-9 text-right font-semibold"
                                />
                                <span className="absolute right-2.5 text-xs text-muted-foreground font-semibold pointer-events-none select-none">
                                    ₫
                                </span>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md p-2.5">
                                {error}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="cursor-pointer">
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-gold-gradient text-gold-foreground font-bold hover:brightness-105 cursor-pointer border-none"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                "Lưu sản phẩm"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
