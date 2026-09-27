import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { History, Search } from "lucide-react-native";

const TransactionHistory = () => {
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  return (
    <View className="gap-4">
      {/* Header */}
      <View className="border-b border-border pb-3">
        <View className="flex-row items-center gap-2">
          <History size={18} color="#f97316" />
          <Text className="text-sm font-bold text-foreground">
            Nhật ký giao dịch điểm
          </Text>
        </View>

        <Text className="text-xs text-muted-foreground mt-1">
          Lịch sử thay đổi điểm của khách hàng
        </Text>
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-neutral-50 border border-border rounded-xl px-3">
        <Search size={16} color="#999" />
        <TextInput
          value={historySearchQuery}
          onChangeText={setHistorySearchQuery}
          placeholder="Lọc lịch sử theo tên khách hàng..."
          className="flex-1 px-3 py-3 text-xs font-semibold text-foreground"
        />
      </View>

      {/* Empty State */}
      <View className="bg-neutral-50 rounded-xl border border-dashed border-border py-10 items-center justify-center">
        <Text className="text-xs font-bold text-muted-foreground">
          Chưa có giao dịch nào
        </Text>
        <Text className="text-[10px] text-muted-foreground mt-1">
          Hệ thống chưa ghi nhận lịch sử điểm
        </Text>
      </View>
    </View>
  );
};

export default TransactionHistory;