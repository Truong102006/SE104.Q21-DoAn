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
import { backendApi } from "@/services/backend-api";
import { useToastStore } from "@/stores/toast-store";
import { getApiErrorMessage } from "@/lib/api-error";
import { isValidPhone10Digits } from "@/lib/format";
import type { SupplierResponse } from "@/types/backend";

interface QuickCreateSupplierDialogProps {
    open: boolean;
    defaultName: string;
    onCreated: (supplier: SupplierResponse) => void;
    onClose: () => void;
}

export function QuickCreateSupplierDialog({
    open,
    defaultName,
    onCreated,
    onClose,
}: QuickCreateSupplierDialogProps) {
    const [tenNhaCungCap, setTenNhaCungCap] = useState(defaultName);
    const [soDienThoai, setSoDienThoai] = useState("");
    const [diaChi, setDiaChi] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when dialog opens with new name
    const [prevName, setPrevName] = useState(defaultName);
    if (defaultName !== prevName) {
        setPrevName(defaultName);
        setTenNhaCungCap(defaultName);
        setSoDienThoai("");
        setDiaChi("");
        setGhiChu("");
        setError(null);
    }

    async function handleSubmit() {
        setError(null);

        if (!tenNhaCungCap.trim()) {
            setError("Tên nhà cung cấp không được để trống");
            return;
        }
        if (!isValidPhone10Digits(soDienThoai)) {
            setError("Số điện thoại không hợp lệ (yêu cầu 10 chữ số)");
            return;
        }

        setSubmitting(true);
        try {
            const created = await backendApi.suppliers.create({
                tenNhaCungCap: tenNhaCungCap.trim(),
                soDienThoai: soDienThoai.trim(),
                diaChi: diaChi.trim() || undefined,
                ghiChu: ghiChu.trim() || undefined,
                isActive: true,
            });
            useToastStore.getState().success(`Đã thêm nhanh nhà cung cấp "${created.tenNhaCungCap}"`);
            onCreated(created);
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể tạo nhà cung cấp"));
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
                        Tạo nhanh nhà cung cấp
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Điền thông tin để thêm nhà cung cấp mới trực tiếp trong phiếu mua hàng.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                    <div className="space-y-4 py-2">
                        {/* Tên nhà cung cấp */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Tên nhà cung cấp <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={tenNhaCungCap}
                                onChange={(e) => setTenNhaCungCap(e.target.value)}
                                placeholder="Nhập tên nhà cung cấp"
                                className="h-9"
                                autoFocus
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">
                                Số điện thoại <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={soDienThoai}
                                onChange={(e) => setSoDienThoai(e.target.value)}
                                placeholder="Nhập số điện thoại (10 số)"
                                className="h-9"
                            />
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">
                                Địa chỉ
                            </Label>
                            <Input
                                value={diaChi}
                                onChange={(e) => setDiaChi(e.target.value)}
                                placeholder="Nhập địa chỉ nhà cung cấp"
                                className="h-9"
                            />
                        </div>

                        {/* Ghi chú */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">
                                Ghi chú
                            </Label>
                            <Input
                                value={ghiChu}
                                onChange={(e) => setGhiChu(e.target.value)}
                                placeholder="Ghi chú thêm"
                                className="h-9"
                            />
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
                                "Lưu nhà cung cấp"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
