"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { useAuthStore } from "@chiba/api-client";
import { Text, View } from "react-native";

const PUBLIC_PATHS = ["/login", "/register","/forgot-password","/reset-password"];
// const VALID_PATHS = [""]

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, isChecking } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (isChecking) return; // chưa xong thì không quyết định gì cả

    if (!accessToken && !isPublicPath) {
      router.replace("/login");
    }
  }, [isChecking, accessToken, isPublicPath, router]);

  // Trong lúc đang kiểm tra, không render gì cả (tránh flash sai trang)
  if (isChecking) {
    return (
      <View className="min-h-screen flex items-center justify-center">
        <Text className="text-sm text-muted-foreground">Đang tải...</Text>
      </View>
    );
  }

  // Chưa đăng nhập, không phải trang public → không render children (đang chờ redirect)
  if (!accessToken && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}