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
import { Lock, ArrowLeft, CheckCircle } from "lucide-react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";

import { useResetPassword } from "@chiba/api-client/src/hooks/useAuth";
import { useNotificationStore } from "@chiba/api-client/src/stores/useNotificationStore";
import { api } from "@/lib/axios";
import Notification from "@/components/ui/Notification";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();

  const { mutate, isPending, isSuccess } = useResetPassword(api);
  const { showSuccess, showError, clearNotification } = useNotificationStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    clearNotification();

    if (!password || !confirmPassword) {
      showError("Vui lòng điền đầy đủ các thông tin");
      return;
    }

    if (password !== confirmPassword) {
      showError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      showError("Mật khẩu tối thiểu 6 ký tự");
      return;
    }

    mutate(
      {
        token: token as string,
        newPassword: password,
      },
      {
        onSuccess() {
          router.replace("/login");
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-6 justify-center">
        {/* Navigation */}
        <Link href="/login" className="flex-row items-center mb-8">
          <View className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center shadow-sm">
            <ArrowLeft size={18} color="#1F1914" />
          </View>
          <Text className="ml-3 text-sm font-semibold text-muted-foreground">
            Đăng nhập
          </Text>
        </Link>

        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">☕</Text>
          <Text className="text-3xl font-extrabold text-primary">
            Đặt lại mật khẩu
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Tạo mật khẩu mới cho tài khoản
          </Text>
        </View>

        {/* Card */}
        <View className="bg-card rounded-2xl border border-border p-6">
          {isSuccess ? (
            <View className="items-center">
              <CheckCircle size={50} color="#16A34A" />
              <Text className="font-semibold text-foreground mt-4 mb-6">
                Đổi mật khẩu thành công
              </Text>
              <Pressable
                onPress={() => router.push("/login")}
                className="w-full h-14 bg-primary rounded-xl items-center justify-center"
              >
                <Text className="text-white font-bold">Đăng nhập</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              {/* New Password */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Mật khẩu mới
                </Text>
                <View className="relative justify-center">
                  <Lock
                    size={18}
                    color="#6B5E53"
                    style={{ position: "absolute", left: 14, zIndex: 1 }}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Nhập mật khẩu mới"
                    className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-foreground"
                  />
                </View>
              </View>

              {/* Confirm Password */}
              <View className="mb-4">
                <Text className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Xác nhận mật khẩu
                </Text>
                <View className="relative justify-center">
                  <Lock
                    size={18}
                    color="#6B5E53"
                    style={{ position: "absolute", left: 14, zIndex: 1 }}
                  />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Nhập lại mật khẩu"
                    className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-foreground"
                  />
                </View>
              </View>

              {/* Notification Alert Box */}
              <Notification/>

              {/* Submit */}
              <Pressable
                disabled={isPending}
                onPress={handleSubmit}
                className={`h-14 rounded-xl bg-primary flex-row items-center justify-center gap-2 ${
                  isPending ? "opacity-50" : ""
                }`}
              >
                {isPending ? (
                  <>
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-bold">
                      Đang cập nhật...
                    </Text>
                  </>
                ) : (
                  <Text className="text-white font-bold">Đổi mật khẩu</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}