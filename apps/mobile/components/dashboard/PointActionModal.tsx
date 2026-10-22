import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { User, useUpdateUserPoint } from '@chiba/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/axios';

interface PointActionModalProps {
    openPointModal: boolean;
    setOpenPointModal: React.Dispatch<React.SetStateAction<boolean>>;
    selectedUser: User | null;
}

export const PointActionModal = ({
    openPointModal,
    setOpenPointModal,
    selectedUser,
}: PointActionModalProps) => {
    const { mutate: updateProfile } = useUpdateUserPoint(api);
    const [point, setPoint] = useState("");

    const handleSavePoint = () => {
        if (!selectedUser || point.trim() === "") {
            return;
        }

        const zenPoints = Number(point);

        if (!Number.isInteger(zenPoints) || zenPoints < 0) {
            return;
        }

        updateProfile({
            id: selectedUser.id,
            zenPoints,
        });
        
        // Đóng modal sau khi lưu thành công (tùy chọn)
        setOpenPointModal(false);
    };

    return (
        <Dialog open={openPointModal} onOpenChange={setOpenPointModal}>
            <DialogContent className="w-[92%] max-w-md rounded-2xl p-0 overflow-hidden border border-border bg-background shadow-xl">
                {/* ================= HEADER ================= */}
                <DialogHeader className="p-4 border-b border-border bg-[#FAF7F5]">
                    <DialogTitle className="text-base font-black text-foreground">
                        ✏️ Điều chỉnh điểm người dùng
                    </DialogTitle>
                </DialogHeader>

                <View className="flex flex-col space-y-5 m-5">
                    {selectedUser ? (
                        <>
                            <View className="flex-row items-center flex-wrap">
                                <Text className="text-sm text-foreground">
                                    Số điểm hiện tại của
                                    <Text className="font-bold">{selectedUser.fullName}</Text> là
                                </Text>
                                <Text className="text-sm font-bold text-foreground">
                                    {selectedUser.zenPoints}
                                </Text>
                            </View>

                            <TextInput
                                keyboardType="numeric"
                                value={point}
                                onChangeText={setPoint}
                                placeholder="Thay đổi thành"
                                placeholderTextColor="#9ca3af"
                                className="w-full px-4 py-3 bg-neutral-50/50 border border-border rounded-xl text-xs font-semibold text-foreground shadow-sm"
                            />

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handleSavePoint}
                                className="w-full py-3 bg-primary rounded-xl items-center justify-center shadow-sm"
                            >
                                <Text className="text-sm font-bold text-white">
                                    Lưu thay đổi
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text className="p-5 text-xs text-muted-foreground">
                            Đang tải thông tin người dùng...
                        </Text>
                    )}
                </View>
            </DialogContent>
        </Dialog>
    );
};