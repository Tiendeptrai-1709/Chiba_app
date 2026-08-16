import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Linking,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, AlertTriangle } from "lucide-react-native";
import { Link, useRouter } from "expo-router";
import { useDeleteProfile } from "@chiba/api-client";
import { api } from "@/lib/axios";

export default function DeleteAccountScreen() {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState<"HARD" | "SOFT">("SOFT");
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate, isPending } = useDeleteProfile(api);

  const handleDelete = () => {
    mutate(selectedOption, {
      onSuccess: () => {
        setShowConfirm(false);
        router.replace("/login");
      },
      onError: (error) => {
        console.error("Lỗi khi xóa tài khoản:", error);
      },
    });
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="flex-1 bg-background pb-8">
      {/* Header */}
      <View className="bg-[#262626] px-5 py-4 flex-row items-center gap-4">
        <Link href="/profile" asChild>
          <Pressable className="w-10 h-10 rounded-full items-center justify-center bg-white/10 active:opacity-70">
            <ArrowLeft size={20} color="white" />
          </Pressable>
        </Link>
        <Text className="text-white text-xl font-bold">Xóa tài khoản</Text>
      </View>

      {/* Content */}
      <View className="px-5 py-6 flex-1 space-y-5">
        <Text className="text-center text-sm font-semibold text-[#595959]">
          Bạn muốn thao tác gì đối với tài khoản của mình?
        </Text>

        {/* SOFT DELETE */}
        <OptionCard
          selected={selectedOption === "SOFT"}
          danger={false}
          onPress={() => setSelectedOption("SOFT")}
          title="Tạm ngưng hoạt động tài khoản"
        >
          <Text className="text-xs text-[#C82333] font-medium leading-5">
            • Việc tạm ngưng hoạt động vẫn duy trì tài khoản của bạn trên hệ thống.
          </Text>
          <Text className="text-xs text-[#C82333] font-medium leading-5">
            • Bạn có thể khôi phục lại tài khoản bằng cách liên hệ tổng đài.
          </Text>
        </OptionCard>

        {/* HARD DELETE */}
        <OptionCard
          selected={selectedOption === "HARD"}
          danger
          onPress={() => setSelectedOption("HARD")}
          title="Xóa tài khoản"
        >
          <Text className="text-xs text-[#C82333] font-medium leading-5">
            • Xóa tài khoản sẽ vĩnh viễn xóa dữ liệu.
          </Text>
          <Text className="text-xs text-[#C82333] font-medium leading-5">
            • Tài khoản không thể khôi phục.
          </Text>
          <Text className="text-xs text-[#C82333] font-medium leading-5">
            • Mất toàn bộ điểm và hạng thẻ hiện tại.
          </Text>
          <Text className="text-xs text-[#C82333] font-medium leading-5">
            • Các yêu cầu đổi quà đang có sẽ bị hủy.
          </Text>
        </OptionCard>

        {/* Hotline */}
        <View className="bg-neutral-50 border border-border rounded-xl p-4 items-center space-y-3">
          <Text className="text-xs font-bold uppercase text-muted-foreground">
            Tổng đài hỗ trợ:
          </Text>
          {["0988446746", "0911510451", "0944303730"].map((phone) => (
            <Pressable key={phone} onPress={() => callPhone(phone)}>
              <Text className="text-sm font-bold text-[#D87D4A]">
                {phone}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Continue button */}
        <Pressable
          onPress={() => setShowConfirm(true)}
          className="mt-auto bg-[#262626] rounded-xl py-4 items-center active:opacity-80"
        >
          <Text className="text-white font-bold text-sm">TIẾP TỤC</Text>
        </Pressable>
      </View>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => !isPending && setShowConfirm(false)}
      >
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-card rounded-2xl p-6">
            <View className="w-12 h-12 rounded-full bg-destructive/10 items-center justify-center self-center mb-5">
              <AlertTriangle size={24} color="#C82333" />
            </View>

            <Text className="text-lg font-bold text-center">
              Bạn có chắc chắn?
            </Text>

            <Text className="text-xs text-muted-foreground text-center mt-3">
              {selectedOption === "SOFT"
                ? "Hành động này sẽ tạm dừng hoạt động tài khoản. Bạn có thể kích hoạt lại sau."
                : "Cảnh báo! Tài khoản và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn."}
            </Text>

            <View className="flex-row gap-3 mt-6">
              <Pressable
                disabled={isPending}
                onPress={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-neutral-100 items-center disabled:opacity-50"
              >
                <Text className="text-xs font-semibold">Hủy bỏ</Text>
              </Pressable>

              <Pressable
                disabled={isPending}
                onPress={handleDelete}
                className="flex-1 py-3 rounded-xl bg-[#C82333] items-center flex-row justify-center gap-2 disabled:opacity-50"
              >
                {isPending && <ActivityIndicator size="small" color="#FFF" />}
                <Text className="text-xs font-bold text-white">
                  {isPending ? "Đang xử lý..." : "Xác nhận"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Reusable option card
interface OptionCardProps {
  selected: boolean;
  danger: boolean;
  title: string;
  onPress: () => void;
  children: React.ReactNode;
}

function OptionCard({
  selected,
  danger,
  title,
  onPress,
  children,
}: OptionCardProps) {
  const getBorderColor = () => {
    if (!selected) return "border-border bg-card/50";
    return danger ? "border-[#C82333] bg-card" : "border-accent bg-card";
  };

  const getRadioBg = () => {
    if (!selected) return "border-neutral-300";
    return danger
      ? "border-[#C82333] bg-[#C82333]"
      : "border-accent bg-accent";
  };

  return (
    <Pressable
      onPress={onPress}
      className={`p-5 rounded-2xl border flex-row gap-4 ${getBorderColor()}`}
    >
      {/* Radio Circle */}
      <View className="mt-1">
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${getRadioBg()}`}
        >
          {selected && <View className="w-2 h-2 rounded-full bg-white" />}
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 space-y-3">
        <Text className="text-base font-bold">{title}</Text>
        {children}
      </View>
    </Pressable>
  );
}