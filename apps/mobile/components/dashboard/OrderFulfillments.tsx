import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import type { Order, OrderStatus } from "@chiba/api-client";

interface OrderFulfillmentProps {
    allOrders: Order[];
    onUpdateStatus: (
        orderId: string,
        nextStatus: OrderStatus
    ) => void;
    isUpdateStatus: boolean;
}

const statusConfig: Record<
    OrderStatus,
    { label: string; className: string }
> = {
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

const nextStatusConfig: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
    PENDING: {
        status: "PREPARING",
        label: "Xác nhận đơn",
    },
    PREPARING: {
        status: "READY",
        label: "Đánh dấu sẵn sàng",
    },
    READY: {
        status: "DELIVERING",
        label: "Bắt đầu giao",
    },
    DELIVERING: {
        status: "COMPLETED",
        label: "Hoàn thành đơn",
    },
};

const OrderFulfillment = ({
    allOrders,
    onUpdateStatus,
    isUpdateStatus,
}: OrderFulfillmentProps) => {
    const todayOrders = useMemo(() => {
        const now = new Date();

        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const startOfTomorrow = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        );

        return allOrders?.filter((order) => {
            const createdAt = new Date(order.createdAt);

            return (
                createdAt >= startOfToday &&
                createdAt < startOfTomorrow
            );
        });
    }, [allOrders]);

    return (
        <View className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
            <View className="flex-row items-center justify-between border-b border-border pb-3">
                <View className="flex-col">
                    <Text className="font-bold text-sm uppercase tracking-wider text-foreground">
                        📦 Hỗ trợ đơn hàng hoạt động
                    </Text>
                    <Text className="text-[10px] text-muted-foreground mt-1">
                        Kiểm soát đơn hàng trong ngày
                    </Text>
                </View>

                <View className="bg-accent px-2.5 py-0.5 rounded-full items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">
                        Fulfillment
                    </Text>
                </View>
            </View>

            {todayOrders?.length > 0 ? (
                <ScrollView className="max-h-[600px]" contentContainerStyle={{ gap: 12 }}>
                    {todayOrders.map((order) => {
                        const status = statusConfig[order.status];
                        const nextAction = nextStatusConfig[order.status];

                        return (
                            <View
                                key={order.id}
                                className="p-4 bg-neutral-50 rounded-xl border border-border space-y-3 shadow-sm"
                            >
                                <View className="flex-row items-center justify-between gap-3">
                                    <Text className="text-xs font-black text-primary flex-1" numberOfLines={1}>
                                        {order.id}
                                    </Text>

                                    <Text className={`shrink-0 text-sm font-bold ${status.className}`}>
                                        {status.label}
                                    </Text>
                                </View>

                                <View className="space-y-1.5 border-y border-border/40 py-2">
                                    <Text className="text-xs font-black text-foreground">
                                        Khách: {order.customerName}
                                    </Text>

                                    <Text className="text-xs text-muted-foreground">
                                        Thời gian tạo:{" "}
                                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                                    </Text>

                                    {order.orderType === "DELIVERY" && (
                                        <View className="flex-row items-start gap-1">
                                            <Text className="text-xs">📍</Text>
                                            <Text className="text-[10.5px] text-muted-foreground font-bold flex-1">
                                                Giao tới: {order.deliveryAddress ?? "Chưa có địa chỉ"}
                                            </Text>
                                        </View>
                                    )}

                                    <View className="text-sm text-neutral-600 font-semibold bg-white p-2 rounded-lg border border-border/50 space-y-2">
                                        {order.items.map((item, index, arr) => (
                                            <View
                                                key={item.id}
                                                className={`min-w-0 ${
                                                    index !== arr.length - 1 ? "border-b border-border/40 pb-2" : ""
                                                }`}
                                            >
                                                <Text className="font-semibold text-foreground text-xs">
                                                    {item.productName} × {item.quantity}
                                                </Text>

                                                {item.toppings?.length > 0 && (
                                                    <View className="ml-2 mt-1 text-xs text-muted-foreground space-y-0.5">
                                                        <Text className="text-[11px] text-muted-foreground">Topping:</Text>
                                                        {item.toppings.map((topping) => (
                                                            <Text key={topping.id} className="text-[11px] text-muted-foreground">
                                                                - {topping.toppingName}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between gap-3 pt-1">
                                    <Text className="text-xs font-black text-primary">
                                        Tổng tiền:{" "}
                                        {Number(order.totalAmount).toLocaleString("vi-VN")}₫
                                    </Text>

                                    {nextAction && (
                                        <TouchableOpacity
                                            disabled={isUpdateStatus}
                                            activeOpacity={0.7}
                                            onPress={() =>
                                                onUpdateStatus(order.id, nextAction.status)
                                            }
                                            className="px-3 py-2 bg-primary rounded-xl items-center justify-center"
                                        >
                                            <Text className="text-xs font-bold text-white">
                                                {nextAction.label}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            ) : (
                <View className="text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-border items-center justify-center">
                    <Text className="text-xs text-muted-foreground text-center">
                        Chưa có đơn hàng nào cần xử lý.
                    </Text>
                </View>
            )}
        </View>
    );
};

export default OrderFulfillment;