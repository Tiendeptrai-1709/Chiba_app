import React, { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { api } from "@/lib/axios";
import { Order, useGetUserOrder } from "@chiba/api-client";
import { History, Search } from "lucide-react-native";

const TransactionHistory = () => {
    const { data: orders, isPending: isOrderLoading } = useGetUserOrder(api);
    const [historySearchQuery, setHistorySearchQuery] = useState("");

    const monthOrders = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        return orders?.filter((order:Order) => {
            if (!order.completedAt) return false;

            const completedAt = new Date(order.completedAt);

            return completedAt >= thirtyDaysAgo && completedAt <= now;
        });
    }, [orders]);
    
    const filteredHistory = monthOrders?.filter((order:Order) => {
        if (order.status !== "COMPLETED") {
            return false;
        }

        const query = historySearchQuery.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            order.id.toLowerCase().includes(query) ||
            (order.user?.fullName ?? "").toLowerCase().includes(query) ||
            (order.user?.email ?? "").toLowerCase().includes(query) ||
            (order.user?.customerCode ?? "").toLowerCase().includes(query)
        );
    });

    return (
        <View className="space-y-4">
            {/* Header */}
            <View className="border-b border-border/60 pb-2">
                <View className="flex-row items-center gap-1">
                    <History size={16} color="#0000ff" />
                    <Text className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Nhật ký giao dịch điểm toàn hệ thống
                    </Text>
                </View>
                <Text className="text-[10px] text-muted-foreground mt-1">
                    Lịch sử ghi nhận tất cả thay đổi tích điểm tự động hoặc điều chỉnh từ Admin/đổi quà tại quầy.
                </Text>
            </View>

            {/* Search Box */}
            <View className="relative justify-center">
                <Search size={16} color="#6b7280" className="absolute left-3.5 z-10" />
                <TextInput
                    placeholder="Lọc lịch sử theo tên khách hàng, email hoặc nội dung..."
                    placeholderTextColor="#9ca3af"
                    value={historySearchQuery}
                    onChangeText={setHistorySearchQuery}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl text-xs font-semibold text-foreground shadow-sm"
                />
            </View>

            {/* Point History Log */}
            <ScrollView
                className="max-h-[500px] bg-card border border-border rounded-2xl shadow-sm"
                contentContainerStyle={{ padding: 4 }}
            >
                {!isOrderLoading ? (
                    filteredHistory?.map((tx:Order) => (
                        <View
                            key={tx.id}
                            className="p-4 flex-row items-start justify-between gap-4"
                        >
                            <View className="space-y-1 flex-1">
                                <View className="flex-row items-center gap-2 flex-wrap">
                                    <Text className="text-xs font-bold text-foreground">
                                        {tx.user?.fullName ?? "Khách hàng"}
                                    </Text>

                                    <Text className="text-[9.5px] text-muted-foreground font-medium">
                                        ({tx.user?.email ?? "Chưa có email"})
                                    </Text>

                                    <View className="px-1.5 py-0.5 rounded bg-green-50 border border-green-200">
                                        <Text className="text-[8.5px] font-black text-green-700">
                                            Đơn hoàn thành
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-xs text-neutral-600 font-semibold">
                                    Mã đơn: {tx.id}
                                </Text>

                                <View className="flex-row gap-2.5 text-[9.5px] text-muted-foreground/70 font-semibold mt-0.5 flex-wrap items-center">
                                    <Text className="text-muted-foreground">
                                        Điểm tích lũy: {tx.earnedPoints ?? 0}
                                    </Text>
                                    <Text className="text-muted-foreground">•</Text>
                                    <Text className="text-muted-foreground">
                                        Điểm đã dùng: {tx.pointsUsed ?? 0}
                                    </Text>
                                    <Text className="text-muted-foreground">•</Text>
                                    <Text className="text-muted-foreground">
                                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                                    </Text>
                                </View>
                            </View>

                            <View className="px-2 py-1 rounded bg-green-50">
                                <Text className="text-xs font-black text-green-600">
                                    {Number(tx.totalAmount).toLocaleString("vi-VN")} ₫
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="p-4 items-center justify-center">
                        <Text className="text-xs text-muted-foreground">
                            Đang tải thông tin người dùng...
                        </Text>
                    </View>
                )}

                {filteredHistory?.length === 0 && (
                    <View className="text-center py-12 items-center justify-center">
                        <Text className="text-xs text-muted-foreground font-bold">
                            Không tìm thấy đơn hàng nào
                        </Text>
                        <Text className="text-[10px] text-muted-foreground/60 mt-0.5">
                            Hệ thống chưa ghi nhận đơn hàng hoàn thành tương ứng
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default TransactionHistory;