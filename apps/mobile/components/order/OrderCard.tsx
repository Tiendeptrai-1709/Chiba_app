import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { ChevronRight, MapPin, Store } from "lucide-react-native";
import type { Order, OrderStatus } from "@chiba/api-client";

interface OrderCardProps {
    order: Order;
    userRole: "ADMIN" | "CUSTOMER" | "STAFF";
    onViewDetail: (orderId: string) => void;
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
    PENDING: {
        label: "Chờ xác nhận",
        className: "text-amber-600",
    },
    PREPARING: {
        label: "Đang chuẩn bị",
        className: "text-accent",
    },
    READY: {
        label: "Sẵn sàng",
        className: "text-primary",
    },
    DELIVERING: {
        label: "Đang giao",
        className: "text-blue-600",
    },
    COMPLETED: {
        label: "Đã hoàn thành",
        className: "text-green-600",
    },
    CANCELLED: {
        label: "Đã hủy",
        className: "text-destructive",
    },
};

function getNextOrderStatus(order: Order) {
    switch (order.status) {
        case "PENDING":
            return "PREPARING";
        case "PREPARING":
            return order.orderType === "PICKUP" ? "READY" : "DELIVERING";
        case "READY":
        case "DELIVERING":
            return "COMPLETED";
        default:
            return null;
    }
}

export const OrderCard: React.FC<OrderCardProps> = ({
    order,
    userRole,
    onViewDetail,
    onUpdateStatus,
}) => {
    const status = statusConfig[order.status];
    const isDelivery = order.orderType === "DELIVERY";
    const nextStatus = getNextOrderStatus(order);
    
    const nextStatusLabel: Partial<Record<OrderStatus, string>> = {
        PREPARING: "Xác nhận đơn hàng",
        READY: "Sẵn sàng nhận hàng",
        DELIVERING: "Bắt đầu giao hàng",
        COMPLETED: "Hoàn thành đơn",
    };

    return (
        <View className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm mb-5">
            {/* ================= HEADER ================= */}
            <View className="flex-col items-center justify-between space-y-4 border-b border-border px-5 py-4">
                <View className={`w-full text-center items-center border-b-2 pb-2 ${status?.className || ""}`}>
                    <Text className={`text-lg font-bold ${status?.className || ""}`}>
                        {status?.label}
                    </Text>
                </View>

                <View className="w-full flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-card-foreground">
                        {order.orderCode}
                    </Text>

                    {userRole === "ADMIN" && nextStatus && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => onUpdateStatus(order.id, nextStatus)}
                            className="px-4 py-2.5 rounded-xl bg-primary items-center justify-center"
                        >
                            <Text className="text-sm font-medium text-white">
                                {nextStatusLabel[nextStatus]}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ================= BODY ================= */}
            <View className="divide-y divide-border">
                {order?.items?.map((item) => (
                    <View key={item.id} className="flex-row gap-4 px-5 py-4">
                        {/* IMAGE */}
                        <View className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted items-center justify-center">
                            {item.productImage ? (
                                <Image
                                    source={{ uri: item.productImage }}
                                    className="h-full w-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text className="text-xs text-muted-foreground">
                                    No image
                                </Text>
                            )}
                        </View>

                        {/* INFO */}
                        <View className="min-w-0 flex-1">
                            <View className="flex-row justify-between gap-4">
                                <Text
                                    numberOfLines={2}
                                    className="flex-1 text-sm font-medium text-card-foreground"
                                >
                                    {item.productName}
                                </Text>

                                <Text className="shrink-0 text-sm font-semibold text-accent">
                                    {item.lineTotal.toLocaleString("vi-VN")} ₫
                                </Text>
                            </View>

                            {/* TOPPINGS */}
                            {item.toppings && item.toppings.length > 0 && (
                                <View className="mt-1 space-y-0.5">
                                    {item.toppings.map((topping) => (
                                        <Text key={topping.id} className="text-xs text-muted-foreground">
                                            + {topping.toppingName}
                                        </Text>
                                    ))}
                                </View>
                            )}

                            <View className="mt-2 flex-row items-center justify-between">
                                <Text className="text-xs text-muted-foreground">
                                    x{item.quantity}
                                </Text>

                                <Text className="text-xs text-muted-foreground">
                                    {item.unitPrice.toLocaleString("vi-VN")} ₫ / món
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* ================= FOOTER ================= */}
            <View className="flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* ORDER TYPE */}
                <View className="flex-row items-center gap-2">
                    {isDelivery ? (
                        <MapPin size={16} color="#6b7280" />
                    ) : (
                        <Store size={16} color="#6b7280" />
                    )}
                    <Text className="text-xs text-muted-foreground">
                        {isDelivery ? "Giao hàng" : "Nhận tại quán"}
                    </Text>
                </View>

                {/* TOTAL + DETAIL */}
                <View className="flex-row items-center justify-between gap-6">
                    <View className="items-end">
                        <Text className="text-xs text-muted-foreground">Tổng thanh toán</Text>
                        <Text className="text-lg font-bold text-accent">
                            {order.totalAmount.toLocaleString("vi-VN")} ₫
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onViewDetail(order.id)}
                        className="flex-row items-center gap-1 rounded-xl border border-border px-4 py-2.5 bg-card active:bg-muted"
                    >
                        <Text className="text-sm font-medium text-foreground">Chi tiết</Text>
                        <ChevronRight size={16} color="#111827" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};