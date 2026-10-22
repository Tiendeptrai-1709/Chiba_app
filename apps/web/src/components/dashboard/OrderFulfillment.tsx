
import React, { useMemo } from "react";
import type { Order, OrderStatus } from "@chiba/api-client";
import { Button } from "../ui/button";

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

// Xác định trạng thái tiếp theo theo quy trình của Chiba.
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
        <section className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex-col items-center">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
                        📦 Hỗ trợ đơn hàng hoạt động
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1">Kiểm soát đơn hàng trong ngày</p>
                </div>

                <span className="bg-accent text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Fulfillment
                </span>
            </div>

            {todayOrders?.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto space-y-3">
                    {todayOrders.map((order) => {
                        const status = statusConfig[order.status];
                        const nextAction = nextStatusConfig[order.status];

                        return (
                            <article
                                key={order.id}
                                className="p-4 bg-neutral-50 rounded-xl border border-border space-y-3 shadow-sm hover:border-primary/20 transition"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-black text-primary break-all">
                                        {order.id}
                                    </span>

                                    <span
                                        className={`shrink-0 text-sm font-bold border-b-2 ${status.className}`}
                                    >
                                        {status.label}
                                    </span>
                                </div>

                                <div className="space-y-1.5 border-y border-border/40 py-2">
                                    <p className="text-xs font-black text-foreground">
                                        Khách: {order.customerName}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        Thời gian tạo:{" "}
                                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                                    </p>

                                    {order.orderType === "DELIVERY" && (
                                        <p className="text-[10.5px] text-muted-foreground font-bold flex items-start gap-1">
                                            <span className="shrink-0 text-xs">📍</span>
                                            <span>
                                                Giao tới: {order.deliveryAddress ?? "Chưa có địa chỉ"}
                                            </span>
                                        </p>
                                    )}

                                    <div className="text-sm text-neutral-600 font-semibold bg-white p-2 rounded-lg border border-border/50 shadow-inner">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="min-w-0 border-b last:border-b-0 px-2 py-2"
                                            >
                                                <p className="font-semibold">
                                                    {item.productName}
                                                    {" × "}
                                                    {item.quantity}
                                                </p>

                                                {item.toppings?.length > 0 && (
                                                    <div className="ml-2 mt-1 text-xs text-muted-foreground">
                                                        <p>Topping:</p>

                                                        {item.toppings.map((topping) => (
                                                            <p key={topping.id}>
                                                                {topping.toppingName}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-1">
                                    <p className="text-xs font-black text-primary">
                                        Tổng tiền:{" "}
                                        {Number(order.totalAmount).toLocaleString("vi-VN")}₫
                                    </p>

                                    {nextAction && (
                                        <Button
                                            type="button"
                                            disabled={isUpdateStatus}
                                            onClick={() =>
                                                onUpdateStatus(order.id, nextAction.status)
                                            }
                                            className="text-xs"
                                        >
                                            {nextAction.label}
                                        </Button>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-border">
                    Chưa có đơn hàng nào cần xử lý.
                </p>
            )}
        </section>
    );
};

export default OrderFulfillment;
