import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useProfile } from "@chiba/api-client";
import { api } from "@/lib/axios";
import Header from "@/components/layouts/Header";
import ProductMenuList from "@/components/products/customer/ProductMenuList";

export default function HomeScreen() {
  const { data: user, isLoading } = useProfile(api);
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace("/login");
    }
  }, [user, isLoading,router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color="#1E4620" />
        <Text className="mt-3 text-xs font-semibold text-muted-foreground">
          Đang tải hương vị...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background pb-20">
      {/* Header */}
      <Header user={user} />

      {/* Content */}
      <View className="px-5 py-6 flex-1">
        {/* Welcome Card */}
        <View className="bg-primary/5 rounded-2xl border border-primary/10 p-5 mb-6 relative overflow-hidden">
          <Text className="text-2xl font-black text-foreground">
            Xin chào, {user?.fullName || "bạn"}!
          </Text>
          <Text className="text-xs text-muted-foreground mt-2 font-medium">
            Chọn đồ uống & món ăn yêu thích của bạn cho ngày hôm nay
          </Text>
          <Text className="absolute right-4 top-3 text-6xl opacity-20">
            🍵
          </Text>
        </View>

        <ProductMenuList />
      </View>
    </View>
  );
}