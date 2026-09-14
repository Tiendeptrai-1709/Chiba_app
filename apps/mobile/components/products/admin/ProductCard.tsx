import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import {
    Pencil,
    Trash2,
} from "lucide-react-native";
import { Product, useGetProduct } from "@chiba/api-client";
import { api } from "@/lib/axios";


interface ProductCardProps {
    product: Product;
    onEdit: () => void;
    setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

const ProductCard = ({
    product,
    onEdit,
    setSelectedProduct,
}: ProductCardProps) => {
    const { data: productData } = useGetProduct(api, product.id);
    return (
        <View className="bg-card border border-border rounded-2xl p-4">
            {/* Main information */}
            <View className="flex-row items-start">
                {/* Product icon */}
                <View className="w-14 h-14 rounded-xl bg-muted items-center justify-center mr-3">
                    <Text className="text-3xl">
                        {productData?.imageUrl ? (
                            <Image source={{ uri: productData.imageUrl }} style={{
                                width: 50,
                                height: 50,
                                borderRadius: 10,
                            }} />
                        ) : productData?.category === "MON_NUOC" ? (
                            "☕"
                        ) : productData?.category === "TOPPING" ? (
                            "🥛"
                        ) : (
                            "🍰"
                        )}
                    </Text>
                </View>

                {/* Product info */}
                <View className="flex-1">
                    <Text
                        className="text-sm font-bold text-foreground"
                        numberOfLines={1}
                    >
                        {productData?.name}
                    </Text>

                    <View className="flex-row items-center mt-1">
                        <View className="bg-primary/10 px-2 py-1 rounded-md">
                            <Text className="text-[10px] font-semibold text-primary">
                                {productData?.category}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-base font-black text-primary mt-2">
                        {productData?.price.toLocaleString("vi-VN")}đ
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View className="flex-row justify-end items-center gap-2 mt-4 pt-3 border-t border-border">
                <Pressable
                    onPress={onEdit}
                    className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg active:bg-muted"
                >
                    <Pencil
                        size={14}
                        color="#1E4620"
                    />

                    <Text className="text-xs font-bold text-primary">
                        Sửa
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => {
                        setSelectedProduct(product);
                    }}
                    className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg active:bg-red-50"
                >
                    <Trash2
                        size={14}
                        color="#C82333"
                    />

                    <Text className="text-xs font-bold text-destructive">
                        Xóa
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

export default ProductCard;