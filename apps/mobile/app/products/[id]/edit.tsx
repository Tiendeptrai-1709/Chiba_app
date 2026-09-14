
import React from "react";
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import ProductForm from "@/components/products/ProductForm";
import { useGetProduct, useUpdateProduct } from "@chiba/api-client/src/hooks/useProduct";
import { api } from "@/lib/axios";

const EditProductScreen = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string; }>();

    const { mutate: updateProduct, isPending } = useUpdateProduct(api)
    const { data: product, isLoading, isError } = useGetProduct(api, id)
    console.log("data: ", product)
    // const product = [
    //     {
    //         name: "Cà phê sữa",
    //         price: 30000,
    //         imageUrl: "",
    //         category: "MON_NUOC"
    //     }
    // ]

    const handleUpdate = (payload: {
        name: string;
        price: number;
        imageUrl?: { uri: string; name: string; type: string };
        category: string;
        existingImageUrl?: string;
    }) => {
        console.log("UPDATE PRODUCT", id, payload);

        updateProduct({ id, payload },
            {
                onSuccess: () => {
                    router.push("/products");
                }
            }
        );
    };
    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Text className="text-sm text-muted-foreground">
                    Đang tải sản phẩm...
                </Text>
            </View>
        );
    }
    if (isError || !product) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <Text className="text-sm text-destructive">
                    Không tìm thấy sản phẩm
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-background"
            contentContainerClassName="px-4 py-5"
        >
            <View className="flex-row items-center justify-between">
                <Pressable onPress={() => router.push("/products")} className="bg-primary hover:bg-primary-hover py-3.5 px-6 rounded-xl hover:shadow-premium transition-all duration-200 disabled:opacity-50">
                    <Text className="text-white font-semibold">Back</Text>
                </Pressable>
                <View className="mb-6">
                    <Text className="text-xl font-black text-foreground">
                        Chỉnh sửa sản phẩm
                    </Text>

                    <Text className="text-xs text-muted-foreground mt-1">
                        Cập nhật thông tin sản phẩm
                    </Text>
                </View>
                <View />
            </View>

            <ProductForm
                initialValues={{
                    name: product.name,
                    price: String(product.price),
                    category: product.category,
                    imageUrl: product.imageUrl ?? "",
                }}
                submitText="Lưu thay đổi"
                onSubmit={handleUpdate}
                submitting={isPending}
            />
        </ScrollView>
    );
};

export default EditProductScreen;