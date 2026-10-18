"use client";

import React from "react";
import { ChevronRight, MapPin, Store } from "lucide-react";
import type { Order, OrderStatus } from "@chiba/api-client";
import { Button } from "../ui/button";
import Image from "next/image";

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
export const OrderCard: React.FC<OrderCardProps> = ({ order, userRole, onViewDetail, onUpdateStatus }) => {
    const status = statusConfig[order.status];
    const isDelivery = order.orderType === "DELIVERY"
    const nextStatus = getNextOrderStatus(order);
    const nextStatusLabel: Partial<Record<OrderStatus, string>> = {
        PREPARING: "Xác nhận đơn hàng",
        READY: "Sẵn sàng nhận hàng",
        DELIVERING: "Bắt đầu giao hàng",
        COMPLETED: "Hoàn thành đơn",
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-premium">
            {/* ================= HEADER ================= */}
            <div className="flex-col items-center justify-between space-y-4 border-b border-border px-5 py-4">
                <div className={`w-full text-center text-lg font-bold border-b-2 ${status?.className || ""}`}>
                    <span>
                        {status?.label}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm font-semibold text-card-foreground">
                        {order.orderCode}
                    </span>
                    {userRole === "ADMIN" && nextStatus && (
                        <Button
                            type="button"
                            onClick={() => onUpdateStatus(order.id, nextStatus)}
                            className="p-5"
                        >
                            {nextStatusLabel[nextStatus]}
                        </Button>
                    )}
                </div>
            </div>

            {/* ================= BODY ================= */}
            <div className="divide-y divide-border">
                {order?.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 px-5 py-4">
                        {/* IMAGE */}
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                            {item.productImage ? (
                                <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                    No image
                                </div>
                            )}
                        </div>

                        {/* INFO */}
                        <div className="min-w-0 flex-1">
                            <div className="flex justify-between gap-4">
                                <h3 className="line-clamp-2 text-sm font-medium text-card-foreground">
                                    {item.productName}
                                </h3>
                                <span className="shrink-0 text-sm font-semibold text-accent">
                                    {item.lineTotal.toLocaleString("vi-VN")} ₫
                                </span>
                            </div>

                            {/* TOPPINGS */}
                            {item.toppings && item.toppings.length > 0 && (
                                <div className="mt-1 space-y-0.5">
                                    {item.toppings.map((topping) => (
                                        <p key={topping.id} className="text-xs text-muted-foreground">
                                            + {topping.toppingName}
                                        </p>
                                    ))}
                                </div>
                            )}

                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    x{item.quantity}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {item.unitPrice.toLocaleString("vi-VN")} ₫ / món
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= FOOTER ================= */}
            <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* ORDER TYPE */}
                <div className="flex items-center gap-2">
                    {isDelivery ? (
                        <MapPin size={16} className="text-muted-foreground" />
                    ) : (
                        <Store size={16} className="text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">
                        {isDelivery ? "Giao hàng" : "Nhận tại quán"}
                    </span>
                </div>

                {/* TOTAL + DETAIL */}
                <div className="flex items-center justify-between gap-6">
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Tổng thanh toán</p>
                        <p className="text-lg font-bold text-accent">
                            {order.totalAmount.toLocaleString("vi-VN")} ₫
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => onViewDetail(order.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:shadow-sm"
                    >
                        Chi tiết
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};