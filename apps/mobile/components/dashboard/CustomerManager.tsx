import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { User } from "@chiba/api-client";
import { Coins, Search, User2 } from "lucide-react-native";

interface CustomerManagerProps {
    allCustomers: User[];
    isAdmin: boolean;
    handleSelectUser: (id: string) => void;
}

const CustomerManager = ({
    allCustomers,
    isAdmin,
    handleSelectUser,
}: CustomerManagerProps) => {
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");

    const filteredCustomers = allCustomers.filter((c) => {
        const query = customerSearchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            c.fullName.toLowerCase().includes(query) ||
            (c.phone && c.phone.includes(query)) ||
            c.customerCode.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query)
        );
    });

    return (
        <View className="space-y-4">
            {/* Header */}
            <View className="border-b border-border/60 pb-2">
                <Text className="text-sm font-bold text-foreground uppercase tracking-wider">
                    👥 Quản lý điểm & đổi thưởng khách hàng
                </Text>
                <Text className="text-[10px] text-muted-foreground mt-1">
                    Tìm kiếm khách hàng bằng tên, SĐT, hoặc mã khách hàng để thực hiện đổi quà tại quầy hoặc CRUD điểm.
                </Text>
            </View>

            {/* Search Box */}
            <View className="relative justify-center">
                <Search size={16} color="#6b7280" className="absolute left-3.5 z-10" />
                <TextInput
                    placeholder="Tìm khách hàng theo Tên, Số điện thoại hoặc Mã..."
                    placeholderTextColor="#9ca3af"
                    value={customerSearchQuery}
                    onChangeText={setCustomerSearchQuery}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl text-xs font-semibold text-foreground shadow-sm"
                />
            </View>

            {/* Customer List */}
            <ScrollView className="max-h-[500px]" contentContainerStyle={{ gap: 12 }}>
                {filteredCustomers.map((cust) => (
                    <View
                        key={cust.id}
                        className="p-4 bg-card border border-border rounded-2xl flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                        <View className="flex-row items-center gap-3 flex-1">
                            <View className="w-16 h-16 bg-neutral-200 border-2 border-white rounded-full items-center justify-center overflow-hidden">
                                <User2 size={24} color="#6b7280" />
                            </View>

                            <View className="space-y-0.5 flex-1">
                                <View className="flex-row items-center gap-2 flex-wrap">
                                    <Text className="text-xs font-bold text-foreground">
                                        {cust.fullName}
                                    </Text>
                                    <View className="px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10">
                                        <Text className="text-[9.5px] font-black text-primary tracking-widest">
                                            {cust.customerCode}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-[10px] text-muted-foreground font-medium">
                                    {cust.email} | SĐT: {cust.phone || "Chưa cập nhật"}
                                </Text>

                                <View className="flex-row gap-4 pt-1">
                                    <View className="flex-row items-center gap-1 bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded">
                                        <Coins size={14} color="#f97316" />
                                        <Text className="text-[10px] font-bold text-accent">
                                            Điểm: <Text className="font-black">{cust.zenPoints || 0}</Text>
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Actions */}
                        {isAdmin && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                  console.log("first", cust.id)
                                  handleSelectUser(cust.id)}}
                                className="self-end sm:self-center px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center"
                            >
                                <Text className="text-[10px] font-black text-primary">
                                    ✏️ Điều chỉnh điểm
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {filteredCustomers.length === 0 && (
                    <View className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-border/80 items-center justify-center">
                        <Text className="text-xs text-muted-foreground font-bold">
                            Không tìm thấy khách hàng nào
                        </Text>
                        <Text className="text-[10px] text-muted-foreground/60 mt-0.5">
                            Vui lòng kiểm tra lại từ khóa tìm kiếm
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default CustomerManager;