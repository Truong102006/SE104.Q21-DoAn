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

    // Reset form when dialog opens with new name
    const [prevName, setPrevName] = useState(defaultName);
    if (defaultName !== prevName) {
        setPrevName(defaultName);
        setTenSanPham(defaultName);
        setMaLoaiSanPham("");
        setMaDonViTinh("");
        setDonGiaMua("0");
        setError(null);
    }

    const productTypeOptions = productTypes
        .filter((pt) => pt.isActive !== false)
        .map((pt) => ({ value: pt.maLoaiSanPham, label: pt.tenLoaiSanPham }));

    const unitOptions = units
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
            const created = await backendApi.products.create({
                tenSanPham: tenSanPham.trim(),
                maLoaiSanPham,
                maDonViTinh,
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

                    {/* Loại sản phẩm */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                            Loại sản phẩm <span className="text-destructive">*</span>
                        </Label>
                        <Combobox
                            value={maLoaiSanPham}
                            onValueChange={setMaLoaiSanPham}
                            options={productTypeOptions}
                            placeholder="Chọn loại sản phẩm..."
                            className="h-9"
                            onCreateNew={async (name) => {
                                try {
                                    const created = await backendApi.productTypes.create({
                                        tenLoaiSanPham: name,
                                        tiLeLoiNhuan: 0.05,
                                    });
                                    onProductTypeCreated(created);
                                    useToastStore.getState().success(`Đã tạo loại SP "${created.tenLoaiSanPham}"`);
                                    return { value: created.maLoaiSanPham, label: created.tenLoaiSanPham };
                                } catch (err) {
                                    useToastStore.getState().error(getApiErrorMessage(err, "Không thể tạo loại SP"));
                                    return null;
                                }
                            }}
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
                                try {
                                    const created = await backendApi.units.create({ tenDonViTinh: name });
                                    onUnitCreated(created);
                                    useToastStore.getState().success(`Đã tạo đơn vị "${created.tenDonViTinh}"`);
                                    return { value: created.maDonViTinh, label: created.tenDonViTinh };
                                } catch (err) {
                                    useToastStore.getState().error(getApiErrorMessage(err, "Không thể tạo đơn vị"));
                                    return null;
                                }
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
                    <Button variant="outline" onClick={onClose} disabled={submitting} className="cursor-pointer">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-gold-gradient text-gold-foreground font-bold hover:brightness-105 cursor-pointer"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            "💾 Lưu sản phẩm"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
