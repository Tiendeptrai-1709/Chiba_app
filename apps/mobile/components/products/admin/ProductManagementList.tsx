import React, { useMemo, useState } from "react";
import {
    FlatList,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    Plus,
    Search,
} from "lucide-react-native";
import { useRouter } from "expo-router";

import ProductCard from "@/components/products/admin/ProductCard";
import { useGetAllProduct, useProfile } from "@chiba/api-client";
import { api } from "@/lib/axios";
import { ProductCategory } from "@/types";

const ProductManagementList = () => {
    const router = useRouter();
    const { data: PRODUCTS } = useGetAllProduct(api)
    const { data: user, isLoading } = useProfile(api);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("ALL");

    // Thay bằng useGetAllProduct(api)

    const CATEGORIES: { id: ProductCategory; label: string }[] = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'MON_NUOC', label: 'Món Nước' },
        { id: 'TOPPING', label: 'Topping Nước' },
        { id: 'BANH', label: 'Bánh & Đồ Ăn Kèm' },
    ];
    const filteredProducts = useMemo(() => {
        const query = searchQuery
            .toLowerCase()
            .trim();

        return PRODUCTS.filter((product: any) => {
            const matchSearch =
                !query ||
                product.name
                    .toLowerCase()
                    .includes(query);

            const matchCategory =
                activeCategory === "ALL" ||
                product.category === activeCategory;

            return matchSearch && matchCategory;
        });
    }, [
        PRODUCTS,
        searchQuery,
        activeCategory,
    ]);

    return (
        <View className="flex-1 bg-background px-4 pt-5">

            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
                <View className="flex-1">
                    <Text className="text-xl font-black text-foreground">
                        Quản lý sản phẩm
                    </Text>

                    <Text className="text-xs text-muted-foreground mt-1">
                        Quản lý danh sách sản phẩm
                    </Text>
                </View>

                <Pressable
                    onPress={() =>
                        router.push("/products/create")
                    }
                    className="flex-row items-center gap-1.5 bg-primary px-4 py-3 rounded-xl active:opacity-80"
                >
                    <Plus
                        size={16}
                        color="#FFFFFF"
                    />

                    <Text className="text-xs font-bold text-white">
                        Thêm
                    </Text>
                </Pressable>
            </View>

            {/* Search */}
            <View className="flex-row items-center bg-card border border-border rounded-xl px-3 mb-4">
                <Search
                    size={17}
                    color="#6B5E53"
                />

                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Tìm kiếm sản phẩm..."
                    placeholderTextColor="#6B5E53"
                    autoCapitalize="none"
                    className="flex-1 px-3 py-3 text-sm text-foreground"
                />
            </View>

            {/* Categories */}
            <View className="mb-5">
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        gap: 8,
                    }}
                    renderItem={({ item }) => {
                        const active =
                            activeCategory === item.id;

                        return (
                            <Pressable
                                onPress={() =>
                                    setActiveCategory(item.id)
                                }
                                className={`px-4 py-2.5 rounded-xl border ${active
                                    ? "bg-primary border-primary"
                                    : "bg-card border-border"
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-bold ${active
                                        ? "text-white"
                                        : "text-muted-foreground"
                                        }`}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        );
                    }}
                />
            </View>

            {/* Products */}
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
                            router.push(
                                `/products/${item.id}/edit`,
                            )
                        }
                        onDelete={() => {
                            // delete logic
                        }}
                    />
                )}
            />

        </View>
    );
};

export default ProductManagementList;