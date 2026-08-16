import React, { useState, useMemo, useCallback } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { Search, Coins } from "lucide-react-native";
import { User } from "@/types";

interface CustomerManagerProps {
  mockOrders: any[];
  allCustomers: User[];
  isAdmin: boolean;
  onTriggerAction: (customer: User, type: "REDEEM" | "ADJUST") => void;
}

export default function CustomerManager({
  mockOrders,
  allCustomers,
  isAdmin,
  onTriggerAction,
}: CustomerManagerProps) {
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const query = customerSearchQuery.toLowerCase().trim();
    if (!query) return allCustomers;

    return allCustomers.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(query) ||
        c.phone?.includes(query) ||
        c.customerCode?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
    );
  }, [allCustomers, customerSearchQuery]);

  const getCompletedOrdersCount = useCallback(
    (cust: User) => {
      return mockOrders.filter(
        (o) =>
          (o.userId === cust.id || o.customerName === cust.fullName) &&
          o.status === "COMPLETED"
      ).length;
    },
    [mockOrders]
  );

  return (
    <View className="gap-4">
      {/* Header Info */}
      <View className="border-b border-border pb-3">
        <Text className="text-sm font-bold uppercase">
          👥 Quản lý điểm & đổi thưởng
        </Text>
        <Text className="text-xs text-muted-foreground mt-1">
          Tìm kiếm khách hàng bằng tên, SĐT hoặc mã khách hàng
        </Text>
      </View>

      {/* Search Input */}
      <View className="relative justify-center">
        <Search
          size={16}
          color="#999"
          className="absolute left-3 z-10"
        />
        <TextInput
          value={customerSearchQuery}
          onChangeText={setCustomerSearchQuery}
          placeholder="Tìm khách hàng..."
          className="h-12 pl-10 pr-4 bg-neutral-50 border border-border rounded-xl text-xs"
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item: cust }) => (
          <View className="bg-card border border-border rounded-2xl p-4 gap-3">
            <View className="flex-row gap-3">
              <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                <Text className="font-bold">{cust.fullName?.[0] || "?"}</Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-sm">{cust.fullName}</Text>
                  <Text className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                    {cust.customerCode}
                  </Text>
                </View>

                <Text className="text-xs text-muted-foreground mt-1">
                  {cust.email}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  SĐT: {cust.phone || "Chưa cập nhật"}
                </Text>

                <View className="flex-row items-center gap-3 mt-2">
                  <View className="flex-row items-center bg-orange-50 px-2 py-1 rounded">
                    <Coins size={14} color="#D87D4A" />
                    <Text className="text-xs ml-1 font-semibold">
                      {cust.zenPoints || 0}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted-foreground">
                    🛍️ {getCompletedOrdersCount(cust)} đơn
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row gap-2 pt-1 border-t border-border/50">
              <Pressable
                onPress={() => onTriggerAction(cust, "REDEEM")}
                className="flex-1 bg-accent/10 p-2.5 rounded-xl active:opacity-70"
              >
                <Text className="text-xs text-center font-bold">
                  🎁 Đổi quà
                </Text>
              </Pressable>

              {isAdmin && (
                <Pressable
                  onPress={() => onTriggerAction(cust, "ADJUST")}
                  className="flex-1 bg-primary/10 p-2.5 rounded-xl active:opacity-70"
                >
                  <Text className="text-xs text-center font-bold">
                    ✏️ Điều chỉnh
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}