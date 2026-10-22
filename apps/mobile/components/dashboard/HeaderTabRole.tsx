import React from "react";
import { View, Text, Pressable } from "react-native";

interface Props {
  isAdmin: boolean;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export default function HeaderTabRole({
  isAdmin,
  activeTab,
  setActiveTab,
}: Props) {
  const tabs = isAdmin
    ? [
        { id: "SYSTEM", label: "📊 Hệ thống" },
        { id: "CUSTOMERS", label: "👥 Khách hàng" },
        { id: "HISTORY", label: "📜 Lịch sử" },
      ]
    : [
        { id: "ORDERS", label: "📦 Đơn hàng" },
        { id: "STOCKS", label: "🛒 Kho món" },
        { id: "CUSTOMERS", label: "👤 Khách" },
      ];

  return (
    <View className="flex-row bg-neutral-100 p-1 rounded-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              setActiveTab(tab.id);
              if (tab.id === "CUSTOMERS") {
                // refreshCustomers();
              }
            }}
            className={`flex-1 py-2 rounded-lg items-center justify-center active:opacity-70 ${
              isActive ? "bg-white shadow-sm" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}