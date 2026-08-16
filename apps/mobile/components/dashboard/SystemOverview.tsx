import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Mail, UserPlus } from "lucide-react-native";
import { useNotificationStore } from "@chiba/api-client/src/stores/useNotificationStore";
import { useRouter } from "expo-router";
import { User } from "@/types";

interface Props {
  mockOrders: any[];
  allCustomers: any[];
  user: User;
}

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  colorBg: string;
  colorText: string;
}

const StatCard = ({ icon, title, value, colorBg, colorText }: StatCardProps) => {
  return (
    <View className={`w-[48%] ${colorBg} rounded-xl p-4 border border-border/50`}>
      <Text className="text-2xl">{icon}</Text>
      <Text className={`text-xs font-bold ${colorText}-500`}>{title}</Text>
      <Text className={`text-xl font-black ${colorText}-900 mt-0.5`}>{value}</Text>
    </View>
  );
};

const SystemOverview = ({ mockOrders, allCustomers, user }: Props) => {
  const { showSuccess, showError } = useNotificationStore();
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter()

  const handleInviteSubmit = () => {
    const email = emailInput.trim();
    if (!email) return;

    setSubmitting(true);
    try {
      showSuccess(`Đã gửi lời mời Staff tới ${email}`);
      setEmailInput("");
    } catch (err) {
      showError("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const totalRevenue = (
    mockOrders.reduce((sum, o) => sum + (o.total || 0), 0) / 1000
  ).toFixed(1);

  return (
    <View className="gap-6">
      {/* Title */}
      <Text className="text-xs font-bold uppercase text-foreground">
        📈 Giám sát hệ thống
      </Text>

      {/* Grid Stats */}
      <View className="flex-row flex-wrap gap-3">
        <StatCard icon="📋" title="Đơn hàng" value={mockOrders.length} colorBg="bg-gradient-to-br from-blue-50 to-blue-100/70 border border-blue-200" colorText="text-blue" />
        <StatCard icon="💰" title="Doanh thu" value={`${totalRevenue}k`} colorBg="bg-gradient-to-br from-green-50 to-green-100/70 border border-green-200" colorText="text-green" />

        <View className="w-[48%] bg-gradient-to-br from-purple-50 to-purple-100/70 border border-purple-200 rounded-xl p-4 flex-row items-center justify-between mt-1">
          <View>
            <Text className="text-2xl">📦</Text>
            <Text className="text-xs text-purple-500 mt-1">Sản phẩm</Text>
            <Text className="text-xl font-black text-purple-900 mt-0.5">19</Text>
          </View>

          <View>
            {user.role && (
              <Pressable
                onPress={() => router.push("/products")}
                className="bg-primary py-3 px-5 rounded-xl hover:bg-primary-hover"
              >
                <Text className="text-white font-semibold ">
                  + Thêm sản phẩm
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <StatCard icon="👥" title="Khách hàng" value={allCustomers.length} colorBg="bg-gradient-to-br from-orange-50 to-orange-100/70 border border-orange-200" colorText="text-orange" />
      </View>

      {/* Invite Staff Section */}
      <View className="bg-card rounded-2xl p-5 border border-border gap-3">
        <View className="flex-row gap-2 items-center">
          <UserPlus size={18} />
          <Text className="font-bold text-sm text-foreground">
            Mời nhân viên Staff
          </Text>
        </View>

        <Text className="text-xs text-muted-foreground">
          Nhập email nhân viên để gửi thư mời gia nhập hệ thống
        </Text>

        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center bg-neutral-50 border border-border rounded-xl px-3">
            <Mail size={16} color="#999" />
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="staff@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="flex-1 px-3 py-3 text-xs text-foreground font-medium"
            />
          </View>

          <Pressable
            onPress={handleInviteSubmit}
            disabled={submitting || !emailInput.trim()}
            className={`bg-primary px-4 py-3 rounded-xl active:opacity-80 ${submitting || !emailInput.trim() ? "opacity-50" : ""
              }`}
          >
            <Text className="text-white text-xs font-bold">
              {submitting ? "Gửi..." : "Mời"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default SystemOverview;