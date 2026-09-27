// app/products/create.tsx

import React from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import ProductForm from "@/components/products/ProductForm";
import { useCreateProduct } from "@chiba/api-client";
import { api } from "@/lib/axios";

const CreateProductScreen = () => {
    const router = useRouter();
    const { mutate, isPending } = useCreateProduct(api)

    const handleCreate = (data: {
        name: string;
        price: number;
        imageUrl?: {
            uri: string;
            name: string;
            type: string;
        };
        category: string;
        exsistingImageUrl?: string; //edit mode giữ nguyên ảnh cũ
    }) => {
        // Create bắt buộc phải có ảnh MỚI (không có khái niệm "ảnh cũ" khi tạo mới)
        if (!data.imageUrl) {
            return;
        }

        mutate({
            name: data.name,
            price: data.price,
            category: data.category,
            imageUrl: data.imageUrl,
        });
    };

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerClassName="px-4 py-5"
        >
            <View className="flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="bg-primary hover:bg-primary-hover py-3.5 px-6 rounded-xl hover:shadow-premium transition-all duration-200 disabled:opacity-50">
                    <Text className="text-white font-semibold">Back</Text>
                </Pressable>
                <View className="mb-6">
                    <Text className="text-xl font-black text-foreground">
                        Thêm sản phẩm
                    </Text>

                    <Text className="text-xs text-muted-foreground mt-1">
                        Tạo một sản phẩm mới trong hệ thống
                    </Text>
                </View>
                <View />
            </View>

            <ProductForm
                submitText="Thêm sản phẩm"
                onSubmit={handleCreate}
                submitting={isPending}
            />
        </ScrollView>
    );
};

export default CreateProductScreen;