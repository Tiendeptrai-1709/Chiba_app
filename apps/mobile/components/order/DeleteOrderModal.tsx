import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react-native";

interface DeleteOrderModalProps {
    isOpenDeleteModal: boolean;
    setIsOpenDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    handleCancelOrder: () => void;
    isCancelling: boolean;
}

const DeleteOrderModal = ({
    isOpenDeleteModal,
    setIsOpenDeleteModal,
    handleCancelOrder,
    isCancelling,
}: DeleteOrderModalProps) => {
    return (
        <Dialog open={isOpenDeleteModal} onOpenChange={setIsOpenDeleteModal}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden rounded-2xl p-0 bg-card border border-border">
                {/* ================= HEADER ================= */}
                <DialogHeader className="border-b border-border bg-[#FAF7F5] p-5 pr-14">
                    <View className="flex-row items-center justify-between">
                        <DialogTitle className="truncate text-base font-black text-foreground">
                            Hủy đơn hàng
                        </DialogTitle>

                        <TouchableOpacity
                            onPress={() => setIsOpenDeleteModal(false)}
                            accessibilityLabel="Đóng"
                            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-card"
                        >
                            <X size={16} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                </DialogHeader>

                {/* ================= BODY ================= */}
                <View className="space-y-4 border-t border-border bg-[#FAF7F5] p-5">
                    <Text className="text-foreground">
                        Bạn có chắc muốn hủy đơn hàng này?
                    </Text>

                    <View className="flex-row items-center justify-between w-full pt-2">
                        <TouchableOpacity
                            onPress={() => setIsOpenDeleteModal(false)}
                            className="h-[38px] w-[48%] items-center justify-center rounded-xl border border-border bg-card"
                        >
                            <Text className="text-sm font-medium text-foreground">
                                Không
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={isCancelling}
                            onPress={handleCancelOrder}
                            className="h-[38px] w-[48%] items-center justify-center rounded-xl bg-destructive"
                        >
                            <Text className="text-sm font-medium text-white">
                                {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteOrderModal;