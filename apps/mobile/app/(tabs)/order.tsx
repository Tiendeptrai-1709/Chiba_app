import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
    Order,
    useGetOrders,
    useNotificationStore,
    useProfile,
    useUpdateOrderStatus,
} from "@chiba/api-client";
import { OrderTabs } from "@/components/order/OrderTabs";
import { OrderCard } from "@/components/order/OrderCard";
import { api } from "@/lib/axios";
import { ArrowLeft } from "lucide-react-native";

export type OrderFilter =
    | "ALL"
    | "PENDING"
    | "PREPARING"
    | "READY"
    | "DELIVERING"
    | "COMPLETED"
    | "CANCELLED";

export default function OrdersScreen() {
    const router = useRouter();

    const { data: user, isPending: isLoadingUser } = useProfile(api);
    const { data: orders, isPending: isLoadingOrders } = useGetOrders(api);
    const { mutate: updateStatusOrder } = useUpdateOrderStatus(api);
    const { showError } = useNotificationStore();
    const [activeTab, setActiveTab] = useState<OrderFilter>("ALL");

    const onUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateStatusOrder({ orderId, newStatus });
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái đơn hàng.";
            showError(message);
        }
    };

    const filteredOrders = useMemo(() => {
        const orderList = orders ?? [];

        if (activeTab === "ALL") {
            return orderList;
        }

        return orderList.filter((order: Order) => order.status === activeTab);
    }, [activeTab, orders]);

    if (isLoadingUser || isLoadingOrders) {
        return (
            <View className="flex-1 flex-col items-center justify-center bg-background">
                <ActivityIndicator size="small" className="text-primary" />
                <Text className="text-xs text-muted-foreground mt-3 font-semibold">
                    Đang tải đơn hàng...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background mt-10">
            <ScrollView contentContainerClassName="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                {/* ================= TITLE ================= */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between pb-6">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="flex items-center justify-center p-2 rounded-full border border-border bg-muted active:opacity-50"
                        >
                            <ArrowLeft size={20} className="text-muted-foreground" />
                        </TouchableOpacity>

                        <Text className="text-2xl font-bold tracking-tight text-foreground">
                            Đơn hàng của tôi
                        </Text>

                        {/* Spacer để cân bằng với nút back bên trái */}
                        <View className="w-9" />
                    </View>

                    <Text className="mt-1 text-md text-muted-foreground">
                        Theo dõi và quản lý các đơn hàng của bạn, 
                        <Text className="text-foreground underline"> điểm CHIBA </Text>
                        sẽ được cộng sau khi đơn đã hoàn thành
                    </Text>
                </View>

                {/* ================= TABS ================= */}
                <OrderTabs activeTab={activeTab} onChange={setActiveTab} />

                {/* ================= LIST ================= */}
                <View className="mt-5 space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order: Order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                userRole={user?.role}
                                onViewDetail={(orderId) =>
                                    router.push(`/order/${orderId}` as any)
                                }
                                onUpdateStatus={onUpdateStatus}
                            />
                        ))
                    ) : (
                        <View className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-card">
                            <Text className="text-sm text-muted-foreground">
                                Không có đơn hàng nào
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}