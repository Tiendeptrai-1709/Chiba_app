import React from "react";
import { View, Text, Pressable } from "react-native";
import { Clock, CheckCircle2, XCircle } from "lucide-react-native";
import { MockOrder } from "@/app/admin/dashboard";


interface Props {
  mockOrders: MockOrder[];
  setMockOrders: React.Dispatch<React.SetStateAction<MockOrder[]>>;
}

export default function OrderFulfillment({
  mockOrders,
  setMockOrders,
}: Props) {
  const updateStatus = (id: string, status: MockOrder["status"]) => {
    setMockOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status } : order))
    );
  };

  const getStatusBadge = (status: MockOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
            <Clock size={12} color="#D97706" />
            <Text className="text-[10px] font-semibold text-amber-700">
              PENDING
            </Text>
          </View>
        );
      case "CONFIRMED":
        return (
          <View className="flex-row items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
            <Clock size={12} color="#2563EB" />
            <Text className="text-[10px] font-semibold text-blue-700">
              CONFIRMED
            </Text>
          </View>
        );
      case "COMPLETED":
        return (
          <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
            <CheckCircle2 size={12} color="#059669" />
            <Text className="text-[10px] font-semibold text-emerald-700">
              COMPLETED
            </Text>
          </View>
        );
      case "CANCELLED":
        return (
          <View className="flex-row items-center gap-1 bg-rose-50 px-2 py-1 rounded-md">
            <XCircle size={12} color="#E11D48" />
            <Text className="text-[10px] font-semibold text-rose-700">
              CANCELLED
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="bg-card border border-border rounded-2xl p-5 gap-4">
      <Text className="font-bold text-sm uppercase text-foreground">
        📦 Hỗ trợ đơn hàng
      </Text>

      {mockOrders.length === 0 ? (
        <View className="py-6 items-center justify-center">
          <Text className="text-xs text-muted-foreground">
            Chưa có đơn hàng nào.
          </Text>
        </View>
      ) : (
        mockOrders.map((order) => (
          <View
            key={order.id}
            className="bg-neutral-50 border border-border/60 rounded-xl p-4 gap-2.5"
          >
            {/* Header đơn hàng */}
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-sm text-primary">
                #{order.id}
              </Text>
              {getStatusBadge(order.status)}
            </View>

            {/* Thông tin đơn hàng */}
            <View className="gap-1">
              <Text className="text-xs font-semibold text-foreground">
                Khách: {order.customerName}
              </Text>
              <Text className="text-xs text-muted-foreground">
                📍 {order.address}
              </Text>
              <Text className="text-xs text-muted-foreground">
                🛒 {order.items}
              </Text>
            </View>

            {/* Tổng tiền */}
            <View className="flex-row justify-between items-center pt-2 border-t border-border/40">
              <Text className="text-xs text-muted-foreground font-medium">
                Tổng thanh toán:
              </Text>
              <Text className="font-bold text-sm text-primary">
                {order.total.toLocaleString("vi-VN")}₫
              </Text>
            </View>

            {/* Nút thao tác */}
            {order.status === "PENDING" && (
              <Pressable
                onPress={() => updateStatus(order.id, "CONFIRMED")}
                className="bg-blue-600 p-2.5 rounded-xl active:opacity-80 mt-1"
              >
                <Text className="text-white text-center text-xs font-bold">
                  Xác nhận đơn
                </Text>
              </Pressable>
            )}

            {order.status === "CONFIRMED" && (
              <Pressable
                onPress={() => updateStatus(order.id, "COMPLETED")}
                className="bg-primary p-2.5 rounded-xl active:opacity-80 mt-1"
              >
                <Text className="text-white text-center text-xs font-bold">
                  Hoàn thành
                </Text>
              </Pressable>
            )}
          </View>
        ))
      )}
    </View>
  );
}