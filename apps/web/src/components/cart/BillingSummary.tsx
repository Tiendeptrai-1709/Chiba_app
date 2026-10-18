import React from "react";
import {
    useCheckout,
    useGetCart,
    useNotificationStore,
    useProfile,
    useUpdateProfile,
} from "@chiba/api-client";

import { api } from "@/lib/axios";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { calculateCartTotals } from "@chiba/api-client/src/lib/cart-pricing";


interface BillingSummaryProps {
    orderType: "DELIVERY" | "PICKUP";
    address: string;
    usePoints: boolean;
    pointsToUse: number;
    saveAsDefault: boolean;
}

export const BillingSummary = ({
    orderType,
    address,
    usePoints,
    pointsToUse,
    saveAsDefault,
}: BillingSummaryProps) => {
    const { data: cart, isLoading: isCartLoading } = useGetCart(api);
    const { data: user } = useProfile(api);
    const { mutate: updateProfile } = useUpdateProfile(api)
    const { mutate: checkout, isPending: isCheckoutLoading } = useCheckout(api);
    const { showSuccess, showError } = useNotificationStore();

    const router = useRouter();

    const items = cart?.items ?? [];
    const {
        subtotal,
        totalItems,
        maxPointsAllowed,
        discountAmount,
        shippingFee,
        finalPrice,
        earnedPoints,
    } = calculateCartTotals({
        items,
        orderType,
        pointsToUse: usePoints ? pointsToUse : 0,
    });

    const handleCheckout = async () => {
        if (items.length === 0) {
            showError("Giỏ hàng trống");
            return;
        }

        if (!user) {
            showError("Bạn cần đăng nhập để thực hiện đặt hàng");
            return;
        }

        if (orderType === "DELIVERY" && !address.trim()) {
            showError("Vui lòng cung cấp địa chỉ nhận hàng để shop tiến hành giao hàng 📍");
            return;
        }

        const validPointsToUse = usePoints ? pointsToUse : 0;
        if (validPointsToUse < 0 || !Number.isInteger(validPointsToUse)) {
            showError("Số điểm sử dụng không hợp lệ");
            return;
        }
        if (validPointsToUse > (user.zenPoints ?? 0)) {
            showError("Bạn không đủ điểm để sử dụng");
            return;
        }
        if (validPointsToUse > maxPointsAllowed) {
            showError("Số điểm sử dụng vượt quá giới hạn giảm giá");
            return;
        }

        try {
            if (saveAsDefault && orderType === "DELIVERY") {
                await updateProfile({ address: address.trim() });
            }

            const payload = { orderType, ...(orderType === "DELIVERY" ? { deliveryAddress: address.trim() } : {}), pointsUsed: validPointsToUse };

            await checkout(payload);
            showSuccess("Đặt hàng thành công")
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Đặt hàng thất bại. Vui lòng thử lại.";

            showError(message);
        }
    };

    /**
     * Loading cart
     */
    if (isCartLoading) {
        return (
            <div className="bg-card border border-border p-5 rounded-2xl">
                <p className="text-sm text-muted-foreground">
                    Đang tải thông tin giỏ hàng...
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
            {/* SUMMARY */}
            <div className="space-y-2 border-b border-border pb-4">
                {/* Total items */}
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Tổng số món:</span>
                    <span>{totalItems} cốc/phần</span>
                </div>

                {/* Product price */}
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString("vi-VN")}₫</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Phí giao hàng:</span>
                    {shippingFee === 0 ? (
                        <span className="text-primary font-bold">
                            {orderType === "DELIVERY"
                                ? "Miễn phí (Đơn > 100k) 🎁"
                                : "Miễn phí (Nhận tại quán) 🎁"}
                        </span>
                    ) : (
                        <span className="text-foreground font-bold">
                            {shippingFee.toLocaleString("vi-VN")}₫
                        </span>
                    )}
                </div>

                {/* Point discount */}
                {usePoints && discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground font-semibold bg-orange-50 border border-orange-100 p-2.5 rounded-xl">
                        <span>Giảm bằng điểm ({pointsToUse} điểm):</span>
                        <span>-{discountAmount.toLocaleString("vi-VN")}₫</span>
                    </div>
                )}
            </div>

            {/* FINAL PRICE */}
            <div className="flex items-center justify-between text-base font-bold text-foreground pt-1">
                <span>Tổng tiền thanh toán:</span>
                <span className="text-primary text-2xl tracking-tight">
                    {finalPrice.toLocaleString("vi-VN")}₫
                </span>
            </div>

            {/* EARNED POINTS */}
            {earnedPoints > 0 && (
                <div className="text-xs text-muted-foreground text-right">
                    Bạn sẽ nhận được{" "}
                    <span className="font-bold text-primary">
                        +{earnedPoints} điểm
                    </span>
                </div>
            )}

            {/* CHECKOUT */}
            <Button
                onClick={handleCheckout}
                disabled={isCartLoading || items.length === 0}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-6 rounded-xl shadow-premium transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
                {isCheckoutLoading
                    ? "Đang xử lý đặt hàng..."
                    : "✓ Đặt Hàng Ngay"}
                {/* ✓ Đặt Hàng Ngay */}
            </Button>

            {/* CONTINUE SHOPPING */}
            <Button
                onClick={() => router.push("/")}
                className="w-full bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground font-semibold py-6 rounded-xl transition active:scale-98 text-sm"
            >
                Quay lại mua thêm nước
            </Button>

            {/* SAVE ADDRESS INFO */}
            {saveAsDefault && orderType === "DELIVERY" && (
                <p className="text-center text-xs text-muted-foreground">
                    Địa chỉ sẽ được lưu làm địa chỉ mặc định theo flow cập nhật Profile.
                </p>
            )}
        </div>
    );
};