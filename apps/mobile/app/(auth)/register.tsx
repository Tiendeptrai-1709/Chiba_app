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
import {
  User,
  Mail,
  Lock,
  ArrowLeft,
  UserPlus,
} from "lucide-react-native";
import { Link, useRouter } from "expo-router";

import { useRegister } from "@chiba/api-client";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@chiba/api-client/src/stores/useNotificationStore";

export default function RegisterScreen() {
  const { mutate, isPending } = useRegister(api);
  const { showError, clearNotification } = useNotificationStore();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = () => {
    clearNotification();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      showError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      showError("Mật khẩu xác nhận không khớp");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Email không đúng định dạng");
      return;
    }

    mutate(
      { email, password, fullName },
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
        {/* Brand Banner */}
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">☕</Text>
          <Text className="text-3xl font-extrabold text-primary">
            Tạo tài khoản
          </Text>
          <Text className="text-sm text-muted-foreground mt-2">
            Gia nhập ngôi nhà Chiba
          </Text>
        </View>

        {/* Form Card */}
        <View className="bg-card p-6 rounded-2xl border border-border">
          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Họ và Tên
            </Text>
            <View className="relative justify-center">
              <User
                size={18}
                color="#6B5E53"
                style={{ position: "absolute", left: 14, zIndex: 1 }}
              />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Họ và tên của bạn"
                className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-foreground"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Địa chỉ Email
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
                placeholder="nhapemail@domain.com"
                className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-foreground"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Mật khẩu
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
                placeholder="Ít nhất 6 ký tự"
                className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-foreground"
              />
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-4">
            <Text className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Xác nhận Mật khẩu
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
                placeholder="Gõ lại mật khẩu phía trên"
                className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-foreground"
              />
            </View>
          </View>

          {/* Notification Alert Box */}
          {/* {message ? (
            <View
              className={`p-3 rounded-lg mb-4 ${
                type === "error" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <Text
                className={`text-sm text-center font-medium ${
                  type === "error" ? "text-red-700" : "text-green-700"
                }`}
              >
                {message}
              </Text>
            </View>
          ) : null} */}

          {/* Submit Button */}
          <Pressable
            disabled={isPending}
            onPress={handleSubmit}
            className={`h-14 rounded-xl bg-primary flex-row items-center justify-center mt-2 gap-2 ${
              isPending ? "opacity-50" : ""
            }`}
          >
            {isPending ? (
              <>
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold">
                  Đang tạo tài khoản...
                </Text>
              </>
            ) : (
              <>
                <UserPlus size={18} color="white" />
                <Text className="text-white font-bold">
                  Đăng Ký Tài Khoản
                </Text>
              </>
            )}
          </Pressable>
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