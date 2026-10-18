import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useProfile } from "@chiba/api-client";
import { api } from "@/lib/axios";
import Header from "@/components/layouts/Header";
import ProductMenuList from "@/components/products/ProductMenuList";

export default function HomeScreen() {
  const { data: user, isLoading: isUserLoading } = useProfile(api);

  const router = useRouter();

  useEffect(() => {
    if (!user && !isUserLoading) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  if (isUserLoading) {
    return (
      <View className="flex flex-col items-center justify-center min-h-screen">
        <View className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></View>
        <Text className="text-xs text-muted-foreground mt-3 font-semibold">Đang tải hương vị...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background pt-10 pb-20">
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