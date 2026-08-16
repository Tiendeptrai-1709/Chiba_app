import React, { useState } from "react";
import {
    FlatList,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { Plus, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import ProductCard from "@/components/products/admin/ProductCard";
import { useGetAllProduct, useProfile } from "@chiba/api-client";
import { api } from "@/lib/axios";
import { Product } from "@/types";
import { useDeleteProduct } from "@chiba/api-client/src/hooks/useProduct";


const ProductsScreen = () => {
    const router = useRouter();
    const { data: PRODUCTS } = useGetAllProduct(api)
    const {mutate: deleteProduct} = useDeleteProduct(api)
    const { data: user } = useProfile(api)

    const [searchQuery, setSearchQuery] = useState("");

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
        router.replace("/")
    }
    const filteredProducts = PRODUCTS.filter((product: Product) =>
        product.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
    );

    return (
        <View className="flex-1 bg-background px-4 pt-5">

            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">

                <Pressable onPress={() => router.back()} className="bg-primary hover:bg-primary-hover py-3.5 px-6 rounded-xl hover:shadow-premium transition-all duration-200 disabled:opacity-50">
                    <Text className="text-white font-semibold">Back</Text>
                </Pressable>

                <View>
                    <Text className="text-xl font-black text-foreground">
                        Quản lý sản phẩm
                    </Text>

                    <Text className="text-xs text-muted-foreground mt-1">
                        {PRODUCTS.length} sản phẩm
                    </Text>
                </View>

                <Pressable
                    onPress={() => router.push("/products/create")}
                    className="flex-row items-center gap-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
                >
                    <Plus size={16} color="white" />

                    <Text className="text-xs font-bold text-white">
                        Thêm
                    </Text>
                </Pressable>
            </View>

            {/* Search */}
            <View className="flex-row items-center bg-card border border-border rounded-xl px-3 mb-4">
                <Search size={18} color="#999" />

                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Tìm kiếm sản phẩm..."
                    placeholderTextColor="#999"
                    className="custom-input"
                />
            </View>

            {/* Product list */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    gap: 12,
                    paddingBottom: 30,
                }}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onEdit={() =>
                            router.push(`/products/${item.id}/edit`)
                        }
                        onDelete={() => {
                            deleteProduct(item.id)
                        }}
                    />
                )}
            />
        </View>
    );
};

export default ProductsScreen;