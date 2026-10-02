import React, { useMemo } from "react";
import {
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
    setEarnedPoints: (points: number) => void;
    // onCheckout: (data: {
    //     orderType: "DELIVERY" | "PICKUP";
    //     address: string;
    //     pointsUsed: number;
    //     discountAmount: number;
    //     shippingFee: number;
    //     finalPrice: number;
    // }) => Promise<void>;

}

export const BillingSummary = ({
    orderType,
    address,
    usePoints,
    pointsToUse,
    saveAsDefault,
    setEarnedPoints,
    // onCheckout,
}: BillingSummaryProps) => {
    const { data: cart, isLoading: isCartLoading } = useGetCart(api);
    const { data: user } = useProfile(api);
    const { mutate: updateProfile } = useUpdateProfile(api)
    const { showError } = useNotificationStore();

    const router = useRouter();

    const items = cart?.items ?? [];
    const { subtotal, totalItems, maxPointsAllowed, discountAmount, shippingFee, finalPrice, earnedPoints } = useMemo(
        () =>
            calculateCartTotals({
                items,
                orderType,
                pointsToUse: usePoints ? pointsToUse : 0,
            }),
        [items, orderType, usePoints, pointsToUse],
    );

    const handleCheckout = async () => {
        /**
         * 1. Kiểm tra cart
         */
        if (items.length === 0) {
            showError("Giỏ hàng trống");
            return;
        }

        /**
         * 2. Kiểm tra login
         */
        if (!user) {
            showError("Bạn cần đăng nhập để thực hiện đặt hàng");
            return;
        }

        /**
         * 3. Delivery bắt buộc có address
         */
        if (orderType === "DELIVERY" && !address.trim()) {
            showError(
                "Vui lòng cung cấp địa chỉ nhận hàng để shop tiến hành giao hàng 📍"
            );
            return;
        }

        /**
         * 4. Kiểm tra points
         */
        if (usePoints) {
            if (!Number.isInteger(pointsToUse) || pointsToUse <= 0) {
                showError("Số điểm sử dụng không hợp lệ");
                return;
            }

            if (pointsToUse > (user?.zenPoints ?? 0)) {
                showError("Bạn không đủ điểm để sử dụng");
                return;
            }

            if (pointsToUse > maxPointsAllowed) {
                showError("Số điểm sử dụng vượt quá giới hạn giảm giá");
                return;
            }
        }

        try {
            /**
             * 5. Nếu user chọn lưu địa chỉ mặc định
             */
            if (saveAsDefault && orderType === "DELIVERY") {
                await updateProfile({ address: address.trim() });
            }

            /**
             * 6. Gọi Order API
             *
             * BillingSummary không tự tạo order.
             *
             * Component cha sẽ quyết định:
             * POST /orders
             *
             * và backend sẽ lấy cart hiện tại để tạo order.
             */
            // await onCheckout({
            //     orderType,
            //     address:
            //         orderType === "DELIVERY"
            //             ? address.trim()
            //             : "Đến nhận tại cửa hàng 🏠",
            //     pointsUsed: usePoints ? validPointsToUse : 0,
            //     discountAmount,
            //     shippingFee,
            //     finalPrice,
            // });

            /**
             * 7. Trừ điểm
             *
             * Chỉ thực hiện sau khi Order API thành công.
             */

            /**
             * 8. Cộng điểm
             */
            setEarnedPoints(earnedPoints);

            // if (earnedPoints > 0) {
            //     await updateUserPoints(
            //         user.id,
            //         earnedPoints,
            //         "EARNED_ORDER",
            //         `Tích điểm từ đơn hàng (+${earnedPoints} điểm)`
            //     );
            // }

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
                {/* {loading
                    ? "Đang xử lý đặt hàng..."
                    : "✓ Đặt Hàng Ngay"} */}
                ✓ Đặt Hàng Ngay
            </Button>

            {/* CONTINUE SHOPPING */}
            <Button
                onClick={() => router.push("/")}
                className="w-full bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground font-semibold py-6 rounded-xl transition active:scale-98 text-sm"
            >
                Quay lại mua thêm nước
            </Button>
        </div>
    );
};