import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Mail, Lock, ArrowRight } from "lucide-react-native";
import { Link, useRouter } from "expo-router";

import { useLogin } from "@chiba/api-client";
import { api } from "@/lib/axios";
import { useNotificationStore } from "@chiba/api-client/src/stores/useNotificationStore";
import Notification from "@/components/reuse-components/Notification";


export default function LoginScreen() {
  const { mutate, isPending } = useLogin(api);

  const { showError } = useNotificationStore();

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = async () => {
    showError('');

    if (!email || !password) {
      showError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    mutate({ email, password }, {
      onSuccess() {
        router.replace("/")
      }
    })
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <View className="flex-1 justify-center px-6 bg-background">
        {/* Logo */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full overflow-hidden border border-primary/10">
            <Image
              source={require("@/assets/images/logo.png")}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
              }}
            />

          </View>
          <Text className="text-4xl font-extrabold text-primary mt-4">
            Chiba
          </Text>
          <Text className="text-muted-foreground text-sm mt-2 font-medium">
            Tea • Coffee • Foods
          </Text>
        </View>

        {/* Card */}
        <View className="bg-card p-6 rounded-2xl border border-border space-y-5">
          {/* Email */}
          <View>
            <Text className="text-xs font-bold text-muted-foreground mb-2 uppercase">
              Tài khoản Email
            </Text>
            <View className="relative justify-center">
              <Mail
                size={18}
                color="#999"
                className="absolute left-4"
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="name@example.com"
                className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-sm"
              />
            </View>
          </View>

          {/* Password */}
          <View>
            <Text className="text-xs font-bold text-muted-foreground mb-2 uppercase">
              Mật khẩu
            </Text>
            <View className="relative justify-center">
              <Lock
                size={18}
                color="#999"
                className="absolute left-4"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Nhập mật khẩu"
                className="h-12 pl-11 pr-4 bg-neutral-50 border border-border rounded-xl text-sm"
              />
            </View>
          </View>

          {/* Notification */}
          <Notification/>

          {/* Component Notification của web cần viết lại bằng React Native*/}

          {/* Button */}
          <Pressable
            disabled={isPending}
            onPress={handleSubmit}
            className={`h-12 rounded-xl bg-primary flex-row items-center justify-center gap-2 mt-4 ${isPending ? "opacity-50" : ""}`}
          >
            <Text className="text-white font-bold">
              {
                isPending
                  ? "Đang xác thực..."
                  : "Đăng nhập"
              }
            </Text>
            {!isPending && (<ArrowRight size={18} color="white" />)}
          </Pressable>

          {/* Forgot password */}
          <View className="items-end">
            <Link
              href="/forgot-password"
            >
              <Text className="text-primary underline text-sm font-bold">
                Quên tài khoản
              </Text>
            </Link>
          </View>
        </View>

        {/* Register */}
        <View className="items-center mt-8">
          <Text className="text-sm text-muted-foreground">
            Chưa có tài khoản?
            <Link
              href="/register"
            >
              <Text className="text-primary font-bold underline ml-1" >
              Đăng ký ngay
              </Text>
            </Link>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}