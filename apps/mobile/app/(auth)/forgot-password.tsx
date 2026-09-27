import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Mail, Send } from "lucide-react-native";
import { Link } from "expo-router";

import { useForgotPassword } from "@chiba/api-client/src/hooks/useAuth";
import { useNotificationStore } from "@chiba/api-client/src/stores/useNotificationStore";
import { api } from "@/lib/axios";
import Notification from "@/components/reuse-components/Notification";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess } = useForgotPassword(api);
  const { showError, clearNotification } = useNotificationStore();

  const handleSubmit = () => {
    clearNotification();

    if (!email.trim()) {
      showError("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Email không đúng định dạng");
      return;
    }

    mutate(email);
  };

  return (

    <KeyboardAvoidingView //Giúp tránh bị che bởi bàn phím khi nhập liệu
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-6 justify-center">
        {/* Logo / Title */}
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">☕</Text>
          <Text className="text-3xl font-extrabold text-primary">
            Quên mật khẩu
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground text-center">
            Nhập email để nhận link đặt lại mật khẩu
          </Text>
        </View>

        {/* Card */}
        <View className="bg-card rounded-2xl border border-border p-6">
          {isSuccess ? (
            <View className="items-center">
              <Text className="font-semibold text-green-600 mb-4">
                Email đã được gửi
              </Text>
              <Text className="text-sm text-muted-foreground text-center mb-6">
                Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link reset mật khẩu.
              </Text>
              <Link
                href="/login"
                className="h-12 w-full rounded-xl bg-primary flex-row items-center justify-center text-center"
              >
                <Text className="text-white font-bold text-center">
                  Quay lại đăng nhập
                </Text>
              </Link>
            </View>
          ) : (
            <View>
              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Email
                </Text>
                <View className="relative justify-center">
                  <Mail
                    size={18}
                    color="#6B5E53"
                    style={{ position: "absolute", left: 14, zIndex: 1 }}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="name@example.com"
                    className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-foreground"
                  />
                </View>
              </View>

              {/* Notification Box */}
              <Notification/>

              {/* Submit Button */}
              <Pressable
                disabled={isPending}
                onPress={handleSubmit}
                className={`h-14 rounded-xl bg-primary flex-row items-center justify-center gap-2 ${isPending ? "opacity-50" : ""
                  }`}
              >
                {isPending ? (
                  <>
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-bold">
                      Đang gửi...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-bold">
                      Gửi link đặt lại
                    </Text>
                    <Send size={18} color="white" />
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* Login redirect */}
        <View className="items-center mt-8">
          <Text className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login">
              <Text className="text-primary font-bold">Đăng nhập ngay</Text>
            </Link>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}