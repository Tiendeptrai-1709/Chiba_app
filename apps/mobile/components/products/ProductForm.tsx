import React, { useState } from "react";
import {
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import Notification from "../ui/Notification";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../reusables/select";

interface ProductFormProps {
    initialValues?: {
        name: string;
        price: string;
        imageUrl: string;
        category: string;
    };
    submitText: string;
    submitting?: boolean;
    onSubmit: (data: {
        name: string;
        price: number;
        imageUrl: string;
        category: string;
    }) => void;
}

const ProductForm = ({
    initialValues,
    submitText,
    submitting = false,
    onSubmit,
}: ProductFormProps) => {
    const [name, setName] = useState(initialValues?.name ?? "");
    const [price, setPrice] = useState(initialValues?.price ?? "");
    const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
    const [category, setCategory] = useState(initialValues?.category ?? "");

    const handleSubmit = () => {
        if (!name.trim()) {
            return;
        }

        if (!price.trim()) {
            return;
        }

        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice)) {
            return;
        }
        
        onSubmit({
            name: name.trim(),
            price: numericPrice,
            category,
            imageUrl: imageUrl.trim(),
        });
    };

    return (
        <View className="gap-4">

            {/* Name */}
            <View className="gap-2">
                <Text className="text-xs font-bold text-foreground">
                    Tên sản phẩm
                </Text>

                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Nhập tên sản phẩm"
                    placeholderTextColor="#999"
                    className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground"
                />
            </View>

            {/* Price */}
            <View className="gap-2">
                <Text className="text-xs font-bold text-foreground">
                    Giá
                </Text>

                <TextInput
                    value={price}
                    onChangeText={setPrice}
                    placeholder="Nhập giá"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground"
                />
            </View>

            {/* Category */}
            <View className="gap-2">
                <Text className="text-xs font-bold text-foreground">Danh mục</Text>

                <Select value={{ value: category, label: category }} onValueChange={(option) => {
                    setCategory(option?.value ?? "");
                }}>
                    <SelectTrigger className="w-full bg-card border-border rounded-xl px-4 py-3">
                        <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>

                    <SelectContent className="bg-card border-border rounded-xl">
                        <SelectGroup>
                            <SelectItem label="Món Nước" value="MON_NUOC">
                                Món Nước
                            </SelectItem>
                            <SelectItem label="Bánh" value="BANH">
                                Bánh
                            </SelectItem>
                            <SelectItem label="Topping" value="TOPPING">
                                Topping
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </View>

            {/* imageUrl */}
            <View className="gap-2">
                <Text className="text-xs font-bold text-foreground">
                    Image
                </Text>

                <TextInput
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    placeholder="Image sản phẩm..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground min-h-[120px]"
                />
            </View>

            {/* Submit */}
            <Pressable
                disabled={submitting}
                onPress={handleSubmit}
                className={`bg-primary rounded-xl py-4 items-center mt-2 ${submitting ? "opacity-50" : ""
                    }`}
            >
                <Text className="text-sm font-bold text-white">
                    {submitting
                        ? "Đang xử lý..."
                        : submitText}
                </Text>
            </Pressable>

            <Notification />
        </View>
    );
};

export default ProductForm;