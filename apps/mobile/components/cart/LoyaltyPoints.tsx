import React from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Coins, Sparkles } from "lucide-react-native";

interface LoyaltyPointsProps {
  userPoints: number;
  usePoints: boolean;
  setUsePoints: (checked: boolean) => void;
  pointsToUse: number;
  setPointsToUse: (points: number) => void;
  maxPointsPossible: number;
  maxPointsAllowed: number;
}

export const LoyaltyPoints = ({
  userPoints,
  usePoints,
  setUsePoints,
  pointsToUse,
  setPointsToUse,
  maxPointsPossible,
  maxPointsAllowed,
}: LoyaltyPointsProps) => {
  const handleTogglePoints = (checked: boolean) => {
    setUsePoints(checked);

    if (checked) {
      setPointsToUse(maxPointsPossible);
    } else {
      setPointsToUse(0);
    }
  };

  const handleInputPoints = (text: string) => {
    // Cho phép input rỗng
    if (text === "") {
      setPointsToUse(0);
      return;
    }

    const val = parseInt(text, 10);

    if (Number.isNaN(val)) {
      setPointsToUse(0);
      return;
    }

    const safeValue = Math.max(
      0,
      Math.min(val, maxPointsPossible)
    );

    setPointsToUse(safeValue);
  };

  const decreaseByFive = () => {
    setPointsToUse(
      Math.max(0, pointsToUse - 5)
    );
  };

  const decreaseByOne = () => {
    setPointsToUse(
      Math.max(0, pointsToUse - 1)
    );
  };

  const increaseByOne = () => {
    setPointsToUse(
      Math.min(maxPointsPossible, pointsToUse + 1)
    );
  };

  const increaseByFive = () => {
    setPointsToUse(
      Math.min(maxPointsPossible, pointsToUse + 5)
    );
  };

  const setMaximumPoints = () => {
    setPointsToUse(maxPointsPossible);
  };

  return (
    <View className="bg-card border border-border p-4 rounded-2xl space-y-4">

      {/* Header */}
      <View className="flex-row items-center gap-2 border-b border-border/40 pb-3">
        <Coins
          size={20}
          color="#F59E0B"
        />

        <Text className="text-xs font-black text-primary uppercase tracking-widest">
          Chiba Points (Điểm tích lũy)
        </Text>
      </View>

      {/* Main information */}
      <View className="gap-3">

        {/* User points + Toggle */}
        <View className="flex-row items-center justify-between">

          <View className="flex-1 gap-1">
            <Text className="text-xs font-bold text-foreground">
              Bạn đang có:{" "}
              <Text className="text-accent font-black text-sm">
                {userPoints}
              </Text>{" "}
              điểm
            </Text>

            <Text className="text-[10px] text-muted-foreground font-medium">
              Trị giá quy đổi:{" "}
              {(userPoints * 500).toLocaleString("vi-VN")}₫
              {" "}(
              1 điểm = 500đ)
            </Text>
          </View>

          {/* Toggle */}
          {userPoints > 0 ? (
            <Pressable
              onPress={() =>
                handleTogglePoints(!usePoints)
              }
              className={`w-11 h-6 rounded-full justify-center px-0.5 ${
                usePoints
                  ? "bg-accent"
                  : "bg-neutral-200"
              }`}
            >
              <View
                className={`w-5 h-5 rounded-full bg-white border border-neutral-300 ${
                  usePoints
                    ? "self-end"
                    : "self-start"
                }`}
              />
            </Pressable>
          ) : (
            <View className="bg-neutral-100 border border-border/60 px-2 py-1 rounded">
              <Text className="text-[10px] font-bold text-muted-foreground">
                Chưa có điểm
              </Text>
            </View>
          )}
        </View>

        {/* Point controls */}
        {usePoints && userPoints > 0 && (
          <View className="pt-3 border-t border-dashed border-border/60 gap-3">

            <Text className="text-[10.5px] font-bold text-foreground leading-relaxed">
              Chọn số điểm muốn dùng để giảm giá (giảm tối đa 20%):
            </Text>

            {/* Controls */}
            <View className="flex-row items-center gap-2">

              {/* -5 */}
              <Pressable
                disabled={pointsToUse <= 0}
                onPress={decreaseByFive}
                className={`w-9 h-9 rounded-lg bg-neutral-100 border border-border items-center justify-center ${
                  pointsToUse <= 0
                    ? "opacity-50"
                    : "active:opacity-70"
                }`}
              >
                <Text className="font-bold text-muted-foreground text-xs">
                  -5
                </Text>
              </Pressable>

              {/* -1 */}
              <Pressable
                disabled={pointsToUse <= 0}
                onPress={decreaseByOne}
                className={`w-9 h-9 rounded-lg bg-neutral-100 border border-border items-center justify-center ${
                  pointsToUse <= 0
                    ? "opacity-50"
                    : "active:opacity-70"
                }`}
              >
                <Text className="font-bold text-muted-foreground text-xs">
                  -1
                </Text>
              </Pressable>

              {/* Input */}
              <TextInput
                value={String(pointsToUse)}
                onChangeText={handleInputPoints}
                keyboardType="number-pad"
                maxLength={7}
                className="w-20 h-9 text-center font-black text-sm bg-neutral-50 border border-border rounded-lg"
              />

              {/* +1 */}
              <Pressable
                disabled={
                  pointsToUse >= maxPointsPossible
                }
                onPress={increaseByOne}
                className={`w-9 h-9 rounded-lg bg-neutral-100 border border-border items-center justify-center ${
                  pointsToUse >= maxPointsPossible
                    ? "opacity-50"
                    : "active:opacity-70"
                }`}
              >
                <Text className="font-bold text-muted-foreground text-xs">
                  +1
                </Text>
              </Pressable>

              {/* +5 */}
              <Pressable
                disabled={
                  pointsToUse >= maxPointsPossible
                }
                onPress={increaseByFive}
                className={`w-9 h-9 rounded-lg bg-neutral-100 border border-border items-center justify-center ${
                  pointsToUse >= maxPointsPossible
                    ? "opacity-50"
                    : "active:opacity-70"
                }`}
              >
                <Text className="font-bold text-muted-foreground text-xs">
                  +5
                </Text>
              </Pressable>

            </View>

            {/* Max button */}
            <Pressable
              onPress={setMaximumPoints}
              className="self-start text-[10px] font-black text-accent bg-accent/10 border border-accent/20 px-3 py-2 rounded-lg active:opacity-70"
            >
              <Text className="text-[10px] font-black text-accent">
                Tối đa
              </Text>
            </Pressable>

            {/* Discount information */}
            <View className="flex-row items-center gap-2 p-2 bg-[#FAF7F2] rounded-lg border border-border/80">
              <Sparkles
                size={14}
                color="#F59E0B"
              />

              <Text className="flex-1 text-[10px] text-muted-foreground font-semibold">
                Giảm giá áp dụng:{" "}
                <Text className="font-bold text-foreground">
                  {(pointsToUse * 500).toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </Text>{" "}
                (Khấu trừ {pointsToUse} điểm)
              </Text>
            </View>

            {/* 20% limitation */}
            {maxPointsAllowed < userPoints && (
              <Text className="text-[9.5px] text-muted-foreground font-semibold">
                🛡️ Đã áp dụng quy tắc bảo vệ lợi nhuận:
                Giảm tối đa 20% giá trị đơn hàng
                (giới hạn {maxPointsAllowed} điểm).
              </Text>
            )}
          </View>
        )}

        {/* Earning rule */}
        <View className="p-3 bg-neutral-50 rounded-xl border border-dashed border-border/80">
          <Text className="text-[10px] text-muted-foreground leading-normal">
            💡{" "}
            <Text className="font-bold">
              Quy tắc tích điểm:
            </Text>{" "}
            Mỗi đơn hàng mua 10.000đ tích lũy 1 điểm.
            Điểm tích lũy mới được tính dựa trên số tiền
            thực tế thanh toán sau khi trừ điểm giảm giá.
          </Text>
        </View>

      </View>
    </View>
  );
};