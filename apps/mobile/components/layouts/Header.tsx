import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import { MapPin, ShoppingCart } from "lucide-react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

interface HeaderProps {
  user: {
    fullName?: string;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const totalItems = 0;
  const [selectedStore, setSelectedStore] = useState("Chọn cửa hàng");

  useEffect(() => {
    const loadStore = async () => {
      try {
        // const store = await AsyncStorage.getItem("zen_selected_store");
        const store = null; // Replace this with actual logic to get the selected store
        if (store) {
          setSelectedStore(store);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadStore();
  }, []);

  return (
    <View className="bg-primary rounded-b-[24px] overflow-hidden shadow-md">
      <View className="px-5 py-4">
        {/* Top Row */}
        <View className="flex-row items-center justify-between">
          {/* Logo */}
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-white p-1">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-full h-full rounded-full"
                resizeMode="cover"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 48,
                }}
              />
            </View>
            <View>
              <Text className="text-xl font-bold text-white">Chiba</Text>
              <Text className="text-[10px] text-white/70 tracking-widest uppercase">
                Tea, Coffee & Foods
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row items-center gap-3">
            {/* Cart */}
            <Link href="/cart" asChild>
              <Pressable className="relative w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                <ShoppingCart size={20} color="white" />
                {totalItems > 0 && (
                  <View className="absolute right-0 top-0 w-5 h-5 rounded-full bg-accent items-center justify-center border-2 border-primary">
                    <Text className="text-[10px] font-bold text-white">
                      {totalItems}
                    </Text>
                  </View>
                )}
              </Pressable>
            </Link>

            {/* Profile */}
            <Link href="/profile" asChild>
              <Pressable className="flex-row items-center gap-2 px-2 py-1.5 rounded-full bg-white/10">
                <View className="w-7 h-7 rounded-full bg-accent items-center justify-center border border-white/20">
                  <Text className="text-xs font-semibold text-white">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "👤"}
                  </Text>
                </View>
                <Text className="text-xs font-medium text-white">Hồ Sơ</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Store Selector */}
        <View className="mt-4 pt-3 border-t border-white/10 flex-row items-center justify-between">
          <Link href="/stores" asChild>
            <Pressable className="flex-row items-center gap-2 flex-1">
              <MapPin size={17} color="#D87D4A" />
              <View>
                <Text className="text-[9px] text-white/60">
                  Cửa hàng đang chọn
                </Text>
                <Text
                  className="text-sm font-semibold text-white max-w-[220px]"
                  numberOfLines={1}
                >
                  {selectedStore}
                </Text>
              </View>
            </Pressable>
          </Link>

          <Link href="/stores" asChild>
            <Pressable className="bg-accent px-3 py-1.5 rounded-full">
              <Text className="text-[11px] font-medium text-white">Đổi</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}