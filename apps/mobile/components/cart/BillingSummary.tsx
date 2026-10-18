
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    View,
} from "react-native";

import {
    useCheckout,
    useGetCart,
    useNotificationStore,
    useProfile,
    useUpdateProfile,
} from "@chiba/api-client";

import { api } from "@/lib/axios";
import { calculateCartTotals } from "@chiba/api-client/src/lib/cart-pricing";
import { useRouter } from "expo-router";

type OrderType = "DELIVERY" | "PICKUP";

// interface CheckoutPayload {
//   orderType: OrderType;
//   address: string;
//   pointsUsed: number;
//   discountAmount: number;
//   shippingFee: number;
//   finalPrice: number;
// }

interface BillingSummaryProps {
    orderType: OrderType;
    address: string;
    usePoints: boolean;
    pointsToUse: number;
    saveAsDefault: boolean;
    //   onCheckout: (data: CheckoutPayload) => Promise<void>;
}

const formatCurrency = (amount: number) =>
    `${amount.toLocaleString("vi-VN")}₫`;

export const BillingSummary = ({
    orderType,
    address,
    usePoints,
    pointsToUse,
    saveAsDefault,
    //   onCheckout,
}: BillingSummaryProps) => {
    const { data: cart, isLoading: isCartLoading } = useGetCart(api);
    const { data: user } = useProfile(api);
    const { mutate: updateProfile } = useUpdateProfile(api)
    const { mutate: checkout, isPending: isCheckoutLoading } = useCheckout(api);
    const { showSuccess,showError } = useNotificationStore();

    const router = useRouter();

    const items = cart?.items;

    const {
        subtotal,
        totalItems,
        maxPointsAllowed,
        discountAmount,
        shippingFee,
        finalPrice,
        earnedPoints,
    } = useMemo(
        () =>
            calculateCartTotals({
                items,
                orderType,
                pointsToUse: usePoints ? pointsToUse : 0,
            }),
        [items, orderType, usePoints, pointsToUse],
    );

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

    if (isCartLoading) {
        return (
            <View className="rounded-2xl border border-border bg-card p-5">
                <View className="flex-row items-center justify-center gap-2">
                    <ActivityIndicator />
                    <Text className="text-sm text-muted-foreground">
                        Đang tải thông tin giỏ hàng...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="gap-4 rounded-2xl border border-border bg-card p-5">
            {/* SUMMARY */}
            <View className="gap-3 border-b border-border pb-4">
                {/* Total items */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-muted-foreground">
                        Tổng số món:
                    </Text>
                    <Text className="text-xs font-semibold text-foreground">
                        {totalItems} cốc/phần
                    </Text>
                </View>

                {/* Subtotal */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-muted-foreground">
                        Tạm tính:
                    </Text>
                    <Text className="text-xs font-semibold text-foreground">
                        {formatCurrency(subtotal)}
                    </Text>
                </View>

                {/* Shipping */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-medium text-muted-foreground">
                        Phí giao hàng:
                    </Text>

                    {shippingFee === 0 ? (
                        <Text className="text-right text-xs font-bold text-primary">
                            {orderType === "DELIVERY"
                                ? "Miễn phí giao hàng"
                                : "Miễn phí nhận tại quán"}
                        </Text>
                    ) : (
                        <Text className="text-xs font-bold text-foreground">
                            {formatCurrency(shippingFee)}
                        </Text>
                    )}
                </View>

                {/* Points discount */}
                {usePoints && discountAmount > 0 && (
                    <View className="flex-row items-center justify-between rounded-xl border border-orange-100 bg-orange-50 p-3">
                        <Text className="flex-1 text-xs font-semibold text-orange-800">
                            Giảm bằng điểm ({pointsToUse} điểm):
                        </Text>
                        <Text className="text-xs font-bold text-orange-800">
                            -{formatCurrency(discountAmount)}
                        </Text>
                    </View>
                )}
            </View>

            {/* FINAL PRICE */}
            <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-sm font-bold text-foreground">
                    Tổng tiền thanh toán:
                </Text>
                <Text className="text-xl font-black text-primary">
                    {formatCurrency(finalPrice)}
                </Text>
            </View>

            {/* EARNED POINTS */}
            {earnedPoints > 0 && (
                <View className="items-end">
                    <Text className="text-xs text-muted-foreground">
                        Bạn dự kiến nhận được{" "}
                        <Text className="font-bold text-primary">
                            +{earnedPoints} điểm
                        </Text>
                    </Text>
                </View>
            )}

            {/* CHECKOUT */}
            <Pressable
                onPress={handleCheckout}
                disabled={isCartLoading || items.length === 0}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-6 rounded-xl shadow-premium transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
                {isCheckoutLoading
                    ? "Đang xử lý đặt hàng..."
                    : "✓ Đặt Hàng Ngay"}
                {/* ✓ Đặt Hàng Ngay */}
            </Pressable>

            {/* CONTINUE SHOPPING */}
            <Pressable
                onPress={() => router.push("/")}
                className="w-full bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground font-bold py-6 rounded-xl transition flex items-center justify-center gap-2"
            >
                Quay lại mua thêm nước
            </Pressable>

            {/* SAVE ADDRESS INFO */}
            {saveAsDefault && orderType === "DELIVERY" && (
                <Text className="text-center text-xs text-muted-foreground">
                    Địa chỉ sẽ được lưu làm địa chỉ mặc định theo flow cập nhật Profile.
                </Text>
            )}
        </View>
    );
};
