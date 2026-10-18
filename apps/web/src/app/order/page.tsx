"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Order, useGetOrders, useNotificationStore, useProfile, useUpdateOrderStatus } from "@chiba/api-client";
import { OrderTabs } from "@/components/order/OrderTabs";
import { OrderCard } from "@/components/order/OrderCard";
import { api } from "@/lib/axios";
import { ArrowLeft } from "lucide-react";

export type OrderFilter =
    | "ALL"
    | "PENDING"
    | "PREPARING"
    | "READY"
    | "DELIVERING"
    | "COMPLETED"
    | "CANCELLED"

export default function OrdersPage() {
    const router = useRouter();

    const { data: user } = useProfile(api)
    const { data: orders, isPending:isLoadingOrders } = useGetOrders(api);
    const { mutate: updateStatusOrder } = useUpdateOrderStatus(api);
    const { showError } = useNotificationStore()
    const [activeTab, setActiveTab] = useState<OrderFilter>("ALL");

    const onUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await updateStatusOrder({ orderId, newStatus });
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Không thể cập nhật trạng thái đơn hàng.";
            showError(message)
        }
    }
    const filteredOrders = useMemo(() => {
        const orderList = orders ?? [];

        if (activeTab === "ALL") {
            return orderList;
        }

        return orderList.filter(
            (order: Order) => order.status === activeTab
        );
    }, [activeTab, orders]);

    if (isLoadingOrders) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-xs text-muted-foreground mt-3 font-semibold">Đang tải đơn hàng...</p>
            </div>
        );
    }
    return (
        <main className="min-h-screen bg-background">
            <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
            >
                {/* ================= TITLE ================= */}
                <div className="mb-6">
                    <div className="flex items-center justify-between pb-6">
                        <div onClick={() => router.push("/")} className="flex items-center cursor-pointer hover:bg-muted border p-2 rounded-full transition-all duration-200 disabled:opacity-50">
                            <ArrowLeft className="text-muted-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Đơn hàng của tôi
                        </h1>
                        <div />
                    </div>
                   <p className="mt-1 text-md text-muted-foreground">
                        Theo dõi và quản lý các đơn hàng của bạn, 
                        <span className="text-foreground underline">điểm CHIBA </span>
                        sẽ được cộng sau khi đơn đã hoàn thành
                    </p>
                </div>

                {/* ================= TABS ================= */}
                <OrderTabs activeTab={activeTab} onChange={setActiveTab} />

                {/* ================= LIST ================= */}
                <div className="mt-5 space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order: Order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                userRole={user.role}
                                onViewDetail={(orderId) =>
                                    router.push(
                                        `/order/${orderId}`,
                                    )
                                }
                                onUpdateStatus={onUpdateStatus}
                            />
                        ))
                    ) : (
                        <div className=" flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-card">
                            <p className="text-sm text-muted-foreground">
                                Không có đơn hàng nào
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
