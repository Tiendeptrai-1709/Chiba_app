import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  User,
  Phone,
  BadgeCheck,
  Star,
  ShieldCheck,
  Pen,
  Trash2,
} from "lucide-react-native";
import { Link, useRouter } from "expo-router";

import {
  useProfile,
  useUpdateProfile,
  //   useLogout,
} from "@chiba/api-client";
import { api } from "@/lib/axios";
import { useLogout } from "@chiba/api-client/src/hooks/useAuth";

export default function ProfileScreen() {
  const router = useRouter();

  const { data: user, isLoading } = useProfile(api);
  const { mutate: logout, isPending: isLogoutLoading } = useLogout(api);
  const { mutate: updateProfile, isPending: isUpdateLoading } = useUpdateProfile(api);

  const [inputName, setInputName] = useState("");
  const [inputPhone, setInputPhone] = useState("");

  const [editName, setEditName] = useState(false);
  const [editPhone, setEditPhone] = useState(false);

  const [history] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      setInputName(user.fullName ?? "");
      setInputPhone(user.phone ?? "");
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color="#1E4620" />
        <Text className="mt-3 text-xs font-semibold text-muted-foreground">
          Đang tải...
        </Text>
      </View>
    );
  }

  const handleLogout = () => {
    logout(undefined, {
      onSuccess() {
        router.replace("/login");
      },
    });
  };

  const handleUpdate = () => {
    updateProfile(
      {
        fullName: inputName,
        phone: inputPhone,
      },
      {
        onSuccess() {
          setEditName(false);
          setEditPhone(false);
        },
      }
    );
  };

  const isFormChanged = editName || editPhone;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="h-16 px-5 flex-row items-center border-b border-border bg-card">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center border border-border"
        >
          <ArrowLeft size={18} color="#1F1914" />
        </Pressable>
        <Text className="ml-4 text-xl font-bold text-foreground">
          Thông tin cá nhân
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Avatar Card */}
        <View className="bg-card border border-border rounded-2xl p-6 items-center">
          <View className="w-24 h-24 rounded-full bg-neutral-200 items-center justify-center mb-4">
            <Text className="text-5xl">👤</Text>
          </View>
          <Text className="text-2xl font-black text-foreground">
            {user.fullName}
          </Text>
          <Text className="text-xs text-muted-foreground mt-1">
            {user.email}
          </Text>

          {user.role === "ADMIN" && (
            <View className="mt-3 bg-primary px-3 py-1 rounded-full flex-row items-center">
              <ShieldCheck size={14} color="white" />
              <Text className="text-white text-xs font-bold ml-1">
                Quản trị viên
              </Text>
            </View>
          )}
        </View>

        {/* Information Form */}
        <View className="mt-5 bg-card border border-border rounded-2xl overflow-hidden">
          {/* Full Name */}
          <View className="p-5 flex-row justify-between items-center border-b border-border">
            <View className="flex-1 mr-3">
              <Text className="text-xs text-muted-foreground font-bold">
                HỌ VÀ TÊN
              </Text>
              {editName ? (
                <TextInput
                  value={inputName}
                  onChangeText={setInputName}
                  className="mt-2 bg-neutral-100 border border-border rounded-lg px-3 py-2 text-foreground"
                />
              ) : (
                <Text className="font-bold mt-1 text-foreground">
                  {user.fullName}
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => setEditName(!editName)}>
                <Pen size={18} color="#6B5E53" />
              </Pressable>
              <User size={20} color="#999" />
            </View>
          </View>

          {/* Phone Number */}
          <View className="p-5 flex-row justify-between items-center border-b border-border">
            <View className="flex-1 mr-3">
              <Text className="text-xs text-muted-foreground font-bold">
                SỐ ĐIỆN THOẠI
              </Text>
              {editPhone ? (
                <TextInput
                  value={inputPhone}
                  onChangeText={setInputPhone}
                  keyboardType="phone-pad"
                  className="mt-2 bg-neutral-100 border border-border rounded-lg px-3 py-2 text-foreground"
                />
              ) : (
                <Text className="font-bold mt-1 text-foreground">
                  {user.phone || "Chưa cập nhật"}
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable onPress={() => setEditPhone(!editPhone)}>
                <Pen size={18} color="#6B5E53" />
              </Pressable>
              <Phone size={20} color="#999" />
            </View>
          </View>

          {/* Customer Code */}
          <View className="p-5 flex-row justify-between items-center">
            <View>
              <Text className="text-xs text-muted-foreground font-bold">
                MÃ KHÁCH HÀNG
              </Text>
              <Text className="text-primary font-bold mt-1">
                {user.customerCode}
              </Text>
            </View>
            <BadgeCheck size={22} color="#1E4620" />
          </View>

          {/* Points */}
          <View className="p-5 flex-row justify-between items-center border-t border-border">
            <View>
              <Text className="text-xs text-muted-foreground font-bold">
                ĐIỂM CHIBA
              </Text>
              <Text className="text-accent font-bold mt-1">
                {user.zenPoints} điểm
              </Text>
            </View>
            <Star size={22} color="#D87D4A" />
          </View>
        </View>

        {/* Lịch sử điểm tích lũy */}
        <View className="mt-5 bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-5 space-y-4">
          {/* Points History Toggle */}
          <Pressable
            onPress={() => setShowHistory(!showHistory)}
            className="w-full flex-row items-center justify-between font-bold text-sm text-foreground focus:outline-none"
          >
            <View className="flex-row items-center">
              <Star size={20} color="#D87D4A" />
              <Text className="ml-2 font-bold text-foreground">
                Lịch sử điểm Chiba
              </Text>
            </View>
            <Text className="text-primary font-bold">
              {showHistory ? "Thu gọn" : "Xem chi tiết"}
            </Text>
          </Pressable>

          {showHistory && (
            <View className="pt-3 border-t border-dashed border-border/60 space-y-3 max-h-60 overflow-y-auto pr-1 animate-fade-in">
              {history.length > 0 ? (
                history.map((tx) => {
                  const isPositive = tx.points >= 0;
                  return (
                    <View key={tx.id} className="flex justify-between items-start py-2.5 border-b border-border/40 last:border-b-0 gap-3">
                      <View className="space-y-0.5 min-w-0">
                        <Text className="text-xs font-bold text-foreground truncate">{tx.description}</Text>
                        <Text className="text-[9px] text-muted-foreground">
                          Số dư: {tx.pointsBefore || 0} ➔ {tx.pointsAfter || 0} | {new Date(tx.createdAt).toLocaleString('vi-VN')}
                        </Text>
                      </View>
                      <Text className={`text-xs font-black shrink-0 px-2 py-0.5 rounded ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-destructive'
                        }`}>
                        {isPositive ? '+' : ''}{tx.points}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text className="text-xs text-muted-foreground text-center py-4">Bạn chưa thực hiện giao dịch tích điểm nào.</Text>
              )}
            </View>
          )}
        </View>

        {/* Admin Section if Admin role */}
        {(user?.role === "ADMIN" || user?.role === "STAFF") && (
          <View className="mt-5 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <Text className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">
              ⚙️ Tính năng Quản trị
            </Text>
            <View className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user?.role === "ADMIN" ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="p-3 bg-neutral-50 hover:bg-primary hover:text-white border border-border rounded-xl text-center font-bold text-xs transition-all active:scale-98"
                  >
                    📊 Bảng điều khiển Admin
                  </Link>
                  <Link
                    href="/stores"
                    className="p-3 bg-neutral-50 hover:bg-primary hover:text-white border border-border rounded-xl text-center font-bold text-xs transition-all active:scale-98"
                  >
                    📍 Danh sách Cửa Hàng
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="p-3 bg-neutral-50 hover:bg-primary hover:text-white border border-border rounded-xl text-center font-bold text-xs transition-all active:scale-98"
                  >
                    📊 Bảng điều khiển Staff
                  </Link>
                </>
              )}
            </View>
          </View>
        )}

        <View className="space-y-4 pt-4">
          {/* Delete Account */}
          <View className="flex items-center">
            <Link
              href="/profile/delete-account"
              className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive-hover font-bold hover:underline transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-center" /> Xóa tài khoản
            </Link>
          </View>

          {/* Update Button */}
          <Pressable
            disabled={!isFormChanged || isUpdateLoading}
            onPress={handleUpdate}
            className={`mt-5 rounded-xl py-4 items-center flex-row justify-center gap-2 ${isFormChanged ? "bg-primary" : "bg-neutral-300"
              }`}
          >
            {isUpdateLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Cập nhật thông tin</Text>
            )}
          </Pressable>

          {/* Logout Button */}
          <Pressable
            disabled={isLogoutLoading}
            onPress={handleLogout}
            className="mt-4 bg-neutral-100 border border-border rounded-xl py-3 items-center flex-row justify-center gap-2"
          >
            {isLogoutLoading ? (
              <ActivityIndicator color="#6B5E53" />
            ) : (
              <Text className="font-semibold text-foreground">
                🚪 Đăng xuất tài khoản
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}