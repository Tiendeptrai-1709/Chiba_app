import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { OrderFilter } from "@/app/(tabs)/order"; // Điều chỉnh lại đường dẫn import OrderFilter sao cho đúng cấu trúc thư mục của bạn

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
        label: "Đang chuẩn bị",
    },
    { 
        id: "READY", 
        label: "Sẵn sàng nhận hàng",
    },
    { 
        id: "DELIVERING", 
        label: "Đơn đang giao",
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
        <View className="border-b border-border pb-2">
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="flex-row items-center gap-3 px-1"
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            activeOpacity={0.7}
                            onPress={() => onChange(tab.id)}
                            className={`relative px-4 py-2.5 rounded-lg border border-transparent transition-colors ${
                                isActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-card border-border text-muted-foreground"
                            }`}
                        >
                            <Text
                                className={`text-sm font-medium ${
                                    isActive ? "text-white font-semibold" : "text-muted-foreground"
                                }`}
                            >
                                {tab.label}
                            </Text>

                            {isActive && (
                                <View className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-primary" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};