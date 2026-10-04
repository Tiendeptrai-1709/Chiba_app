import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react-native";
import React from 'react'
import { Pressable, Text, View } from "react-native";

interface DeleteProductModalProps {
    isOpenDeleteModal: boolean;
    setIsOpenDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    productName: string;
    productPrice: number;
    onConfirm: () => void;
}
const DeleteProductModal = ({ isOpenDeleteModal, setIsOpenDeleteModal, productName, productPrice, onConfirm }: DeleteProductModalProps) => {
    console.log("123123", productName, productPrice)
    return (
        <Dialog open={isOpenDeleteModal} onOpenChange={setIsOpenDeleteModal}>
            <DialogContent className="w-[92%] max-w-md rounded-2xl p-0 overflow-hidden border border-border bg-background shadow-xl">
                {/* ================= HEADER ================= */}
                <DialogHeader className="p-4 border-b border-border bg-[#FAF7F5]">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center gap-3 pr-3">
                            {/* Product icon */}
                            <View className="w-10 h-10 items-center justify-center rounded-xl bg-primary/10">
                                <Text className="text-2xl">☕</Text>
                            </View>

                            <View className="flex-1">
                                <DialogTitle className="text-base font-black">
                                    {productName}
                                </DialogTitle>

                                <Text className="text-xs text-primary font-extrabold mt-0.5">
                                    Đơn giá: {productPrice.toLocaleString("vi-VN")} đ
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={() => setIsOpenDeleteModal(false)}
                            className="w-8 h-8 items-center justify-center rounded-full border border-border/80 active:bg-muted"
                        >
                            <X size={16} className="text-muted-foreground" />
                        </Pressable>
                    </View>
                </DialogHeader>
                <View className="m-5">
                    <View className="p-5">
                        <Text className="text-sm font-bold text-foreground">
                            Bạn có chắc chắn muốn xóa sản phẩm này không?
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-2">
                            Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </Text>
                    </View>
                    <Pressable onPress={onConfirm} className="primary-btn">
                        <Text className="text-sm font-bold text-white">
                            Xóa sản phẩm
                        </Text>

                    </Pressable>
                </View>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteProductModal
