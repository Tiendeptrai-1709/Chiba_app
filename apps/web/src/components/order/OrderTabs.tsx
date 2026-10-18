"use client";

import { OrderFilter } from "@/app/order/page";
import React from "react";

interface OrderTabsProps {
    activeTab: OrderFilter;
    onChange: (tab: OrderFilter) => void;
}

const tabs: { id: OrderFilter; label: string }[] = [
    {
        id: "ALL",
        label: "Tất cả",
    },
    {
        id: "PENDING",
        label: "Chờ xác nhận",
    },
    {
        id: "PREPARING",
        label: "Đang chuẩn bị"
    },
    { 
        id: "READY", 
        label: "Sẵn sàng nhận hàng" 
    },
    { 
        id: "DELIVERING", 
        label: "Đơn đang giao" 
    },
    {
        id: "COMPLETED",
        label: "Đã hoàn thành",
    },
    {
        id: "CANCELLED",
        label: "Đã hủy",
    },
];

export const OrderTabs = ({
    activeTab,
    onChange,
}: OrderTabsProps) => {
    return (
        <div className="border-b border-border">
            <div className="flex items-center gap-8 overflow-x-auto">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={`relative whitespace-nowrap p-3 text-sm  font-medium transition-colors rounded-lg ${isActive
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-card text-muted-foreground hover:bg-muted'
                                }`}
                        >
                            {tab.label}

                            {isActive && (
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-[2px]rounded-full bg-primary"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};