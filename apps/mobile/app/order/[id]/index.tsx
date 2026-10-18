import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    useCancelOrder,
    useGetOrderById,
    useNotificationStore,
} from "@chiba/api-client";
import { api } from "@/lib/axios";
import { ArrowLeft } from "lucide-react-native";
import DeleteOrderModal from "@/components/order/DeleteOrderModal";
import { OrderItem, OrderItemTopping } from "@chiba/api-client/src/types";
// import DeleteOrderModal from "@/components/order/DeleteOrderModal";

const formatVND = (value: number | null | undefined) =>
    `${(value ?? 0).toLocaleString("vi-VN")}đ`;

const formatDate = (value: string) => {
    if (!value) return "";
    return new Date(value).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    });
};

export default function OrderDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const orderId = params.id;

    const { data: order } = useGetOrderById(api, orderId);
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder(api);
    const { showError, showSuccess } = useNotificationStore();

    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

    const handleCancelOrder = async () => {
        try {
            if (!order?.id) return;
            await cancelOrder(order.id);
            showSuccess("Hủy đơn thành công");
            router.push("/order" as any);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái đơn hàng.";
            showError(message);
        }
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView contentContainerClassName="mx-auto w-full max-w-5xl px-4 py-8">
                {/* ================= HEADER ================= */}
                <View className="mb-8 border-b border-border pb-6">
                    <View className="flex-row items-center justify-between pb-6">
                        <TouchableOpacity
                            onPress={() => router.push("/order" as any)}
                            className="flex items-center justify-center p-2 rounded-full border border-border bg-muted active:opacity-50"
                        >
                            <ArrowLeft size={20} className="text-muted-foreground" />
                        </TouchableOpacity>

                        <Text className="text-2xl font-bold text-foreground">
                            Chi tiết đơn hàng
                        </Text>

                        <View className="w-9" />
                    </View>

                    <Text className="mt-2 text-base text-muted-foreground">
                        Mã đơn hàng: {order?.orderCode}
                    </Text>

                    <Text className="mt-1 text-base text-muted-foreground">
                        Đặt lúc: {formatDate(order?.createdAt ?? "")}
                    </Text>
                </View>

                {/* Hình thức nhận hàng */}
                <View className="mb-6 rounded-xl border border-primary bg-primary/5 p-4">
                    <Text className="font-semibold text-foreground">
                        {order?.orderType === "DELIVERY"
                            ? "🛵 Giao hàng tận nơi"
                            : "🏪 Nhận tại cửa hàng"}
                    </Text>

                    {order?.orderType === "DELIVERY" && order?.deliveryAddress && (
                        <Text className="mt-2 text-sm text-foreground">
                            Địa chỉ: {order?.deliveryAddress}
                        </Text>
                    )}
                </View>

                {/* Thông tin khách hàng */}
                <View className="mb-8 rounded-xl border border-border bg-card p-4">
                    <Text className="mb-3 font-semibold text-foreground">
                        Thông tin khách hàng
                    </Text>

                    <Text className="text-foreground">Họ tên: {order?.customerName}</Text>
                    <Text className="mt-1 text-foreground">
                        Số điện thoại: {order?.customerPhone}
                    </Text>

                    {order?.note && (
                        <Text className="mt-2 text-foreground">Ghi chú: {order?.note}</Text>
                    )}
                </View>

                {/* Danh sách sản phẩm */}
                <View className="mb-8">
                    <Text className="mb-4 text-lg font-semibold text-foreground">
                        Sản phẩm ({order?.items?.length || 0})
                    </Text>

                    <View className="divide-y divide-border border-y border-border">
                        {order?.items?.map((item:OrderItem) => (
                            <View
                                key={item.id}
                                className="flex-row items-start justify-between gap-4 py-5"
                            >
                                <View className="flex-1 flex-row min-w-0 gap-4">
                                    {item.productImage ? (
                                        <Image
                                            source={{ uri: item.productImage }}
                                            className="h-20 w-20 rounded-lg"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <Text className="text-xs text-muted-foreground">
                                                No image
                                            </Text>
                                        </View>
                                    )}

                                    <View className="min-w-0 flex-1">
                                        <Text className="font-medium text-foreground">
                                            {item.productName}
                                        </Text>

                                        <Text className="mt-1 text-sm text-muted-foreground">
                                            {formatVND(item.unitPrice)} × {item.quantity}
                                        </Text>

                                        {item.toppings && item.toppings.length > 0 && (
                                            <View className="mt-2 text-sm text-muted-foreground">
                                                <Text className="text-xs text-muted-foreground">
                                                    Topping:
                                                </Text>
                                                {item.toppings.map((topping:OrderItemTopping) => (
                                                    <Text
                                                        key={topping.id}
                                                        className="text-xs text-muted-foreground"
                                                    >
                                                        {topping.toppingName ??
                                                            "Topping"}{" "}
                                                        · {formatVND(topping.unitPrice)}
                                                    </Text>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <Text className="shrink-0 font-semibold text-foreground">
                                    {formatVND(item.lineTotal)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Tổng tiền */}
                <View className="mt-8 space-y-3">
                    <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Tạm tính</Text>
                        <Text className="text-foreground">{formatVND(order?.subtotal)}</Text>
                    </View>

                    <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Điểm đã sử dụng</Text>
                        <Text className="text-foreground">
                            {order?.pointsUsed ?? 0} điểm
                        </Text>
                    </View>

                    <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Giảm giá</Text>
                        <Text className="text-foreground">
                            -{formatVND(order?.discountAmount)}
                        </Text>
                    </View>

                    <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Phí giao hàng</Text>
                        <Text className="text-foreground">
                            {formatVND(order?.shippingFee)}
                        </Text>
                    </View>

                    <View className="flex-row justify-between border-t border-border pt-4 text-lg font-bold">
                        <Text className="text-foreground">Tổng thanh toán</Text>
                        <Text className="text-accent">{formatVND(order?.totalAmount)}</Text>
                    </View>
                </View>

                {/* Nút hủy đơn hàng */}
                <View className="mt-8 items-center justify-center">
                    {order?.status === "PENDING" ? (
                        <TouchableOpacity
                            onPress={() => setIsOpenDeleteModal(true)}
                            className="mt-2 px-6 py-3 rounded-xl border border-destructive bg-destructive/10 items-center justify-center"
                        >
                            <Text className="text-destructive font-medium">
                                Hủy đơn hàng
                            </Text>
                        </TouchableOpacity>
                    ) : order?.status === "CANCELLED" ? (
                        <Text className="text-muted-foreground font-semibold">
                            Đơn đã bị hủy
                        </Text>
                    ) : (
                        <Text className="text-muted-foreground font-semibold">
                            Đơn đã xác nhận thì không thể hủy
                        </Text>
                    )}
                </View>

                <DeleteOrderModal
                    isOpenDeleteModal={isOpenDeleteModal}
                    setIsOpenDeleteModal={setIsOpenDeleteModal}
                    handleCancelOrder={handleCancelOrder}
                    isCancelling={isCancelling}
                />
            </ScrollView>
        </View>
    );
}