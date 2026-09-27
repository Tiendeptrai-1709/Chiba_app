import React, { useState } from "react";
import {
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import Notification from "../reuse-components/Notification";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from "lucide-react-native";
import { Image } from 'expo-image';

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
        imageUrl?: {
            uri: string;
            name: string;
            type: string;
        }
        category: string;
        existingImageUrl?: string; //edit mode giữ nguyên ảnh cũ
    }) => void;
}

const buildImageFileFromAsset = (asset: ImagePicker.ImagePickerAsset): { uri: string; name: string; type: string } => {
    const filename = asset.uri.split("/").pop() ?? "product.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const fileType = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";
    return { uri: asset.uri, name: filename, type: fileType };
};

const ProductForm = ({
    initialValues,
    submitText,
    submitting = false,
    onSubmit,
}: ProductFormProps) => {
    const [name, setName] = useState(initialValues?.name ?? "");
    const [price, setPrice] = useState(initialValues?.price ?? "");
    const [category, setCategory] = useState(initialValues?.category ?? "");

    //ảnh cũ edit mode
    const [existingImageUrl] = useState(initialValues?.imageUrl ?? "");

    //
    const [pickedImage, setPickedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    //Ảnh hiển thị trong form, có thể là ảnh mới hoặc ảnh cũ
    const pickedImageUrl = pickedImage ? pickedImage.uri : existingImageUrl;

    const handlePickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để tiếp tục");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled && result.assets.length > 0) {
            setPickedImage(result.assets[0]);
        }
    }

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
            imageUrl: pickedImage ? buildImageFileFromAsset(pickedImage) : undefined,
            existingImageUrl: pickedImage ? undefined : existingImageUrl, // Nếu có ảnh mới thì không gửi ảnh cũ
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

                <Select
                    value={{ value: category, label: category }}
                    onValueChange={(option) => {
                        setCategory(option?.value ?? "");
                    }}
                    className=""
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>

                    <SelectContent className="w-full bg-card border border-border rounded-xl">
                        <SelectGroup className="">
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
                <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ảnh sản phẩm
                </Text>
                <Pressable
                    onPress={handlePickImage}
                    className="h-40 rounded-xl border border-dashed border-border bg-input items-center justify-center overflow-hidden"
                >
                    {pickedImageUrl ? (
                        <Image
                            source={{ uri: pickedImageUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="items-center gap-2">
                            <ImagePlus size={22} color="#6B5E53" />
                            <Text className="text-xs text-muted-foreground">
                                Nhấn để chọn ảnh
                            </Text>
                        </View>
                    )}
                </Pressable>
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