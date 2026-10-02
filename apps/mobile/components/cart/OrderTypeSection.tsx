import React from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";

interface OrderTypeSectionProps {
  orderType: "DELIVERY" | "PICKUP";
  setOrderType: React.Dispatch<
    React.SetStateAction<"DELIVERY" | "PICKUP">
  >;
}

export const OrderTypeSection = ({
  orderType,
  setOrderType,
}: OrderTypeSectionProps) => {
  return (
    <View className="bg-card border border-border p-4 rounded-2xl">

      {/* Header */}
      <Text className="text-xs font-black text-primary uppercase tracking-widest border-b border-border/40 pb-3 mb-4">
        📋 Hình Thức Nhận Hàng
      </Text>

      {/* Options */}
      <View className="flex-row gap-3">

        {/* DELIVERY */}
        <Pressable
          onPress={() => setOrderType("DELIVERY")}
          className={`flex-1 py-4 px-3 rounded-xl border items-center justify-center ${
            orderType === "DELIVERY"
              ? "border-primary bg-primary/5"
              : "border-border bg-neutral-50"
          }`}
        >
          <Text className="text-xl mb-1">
            🛵
          </Text>

          <Text
            className={`text-xs font-bold text-center ${
              orderType === "DELIVERY"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Giao tận nơi
          </Text>

          <Text
            className={`text-[9px] mt-1 ${
              orderType === "DELIVERY"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Ship đi
          </Text>
        </Pressable>

        {/* PICKUP */}
        <Pressable
          onPress={() => setOrderType("PICKUP")}
          className={`flex-1 py-4 px-3 rounded-xl border items-center justify-center ${
            orderType === "PICKUP"
              ? "border-primary bg-primary/5"
              : "border-border bg-neutral-50"
          }`}
        >
          <Text className="text-xl mb-1">
            🏠
          </Text>

          <Text
            className={`text-xs font-bold text-center ${
              orderType === "PICKUP"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Đến nhận tại quán
          </Text>

          <Text
            className={`text-[9px] mt-1 ${
              orderType === "PICKUP"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Tự nhận
          </Text>
        </Pressable>

      </View>
    </View>
  );
};