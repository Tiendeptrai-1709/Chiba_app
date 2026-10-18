"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import { Button } from '../ui/button';


const CATEGORY_OPTIONS = [
    { value: 'MON_NUOC', label: 'Món Nước' },
    { value: 'BANH', label: 'Bánh' },
    { value: 'TOPPING', label: 'Topping' },
];

interface ProductFormProps {
    initialValues?: {
        name: string;
        price: string;
        imageUrl: string; // URL ảnh ĐÃ upload từ trước (dùng khi edit)
        category: string;
    };
    submitText: string;
    submitting?: boolean;
    onSubmit: (data: {
        name: string;
        price: number;
        // Chỉ CÓ khi người dùng vừa chọn ảnh mới -> cần upload
        imageUrl?: File | { uri: string; name: string; type: string };
        category: string;
        // Chỉ CÓ khi KHÔNG đổi ảnh (edit mode, giữ nguyên ảnh cũ) -> không cần upload lại
        existingImageUrl?: string;
    }) => void;
}

const ProductForm = ({
    initialValues,
    submitText,
    submitting = false,
    onSubmit,
}: ProductFormProps) => {
    const [name, setName] = useState(initialValues?.name ?? '');
    const [price, setPrice] = useState(initialValues?.price ?? '');
    const [category, setCategory] = useState(initialValues?.category ?? CATEGORY_OPTIONS[0].value);

    // Ảnh cũ đã có sẵn (edit mode) — chỉ để hiển thị preview ban đầu
    const [existingImageUrl] = useState(initialValues?.imageUrl ?? '');
    // File MỚI vừa chọn (nếu có) — giữ nguyên object File thật, không convert sang string
    const [pickedFile, setPickedFile] = useState<File | null>(null);
    // Blob URL chỉ dùng để PREVIEW ảnh vừa chọn, không dùng để gửi lên server
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Ảnh hiển thị: ưu tiên ảnh vừa chọn, không có thì dùng ảnh cũ
    const displayImage = previewUrl || existingImageUrl;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPickedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;
        if (!price.trim()) return;

        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice)) return;

        // Bắt buộc phải có ảnh: hoặc vừa chọn mới, hoặc đã có sẵn từ trước (edit)
        if (!pickedFile && !existingImageUrl) return;

        onSubmit({
            name: name.trim(),
            price: numericPrice,
            category,
            imageUrl: pickedFile ?? undefined,
            existingImageUrl: pickedFile ? undefined : existingImageUrl,
        });
        console.log('Submitting product with data:', {
            name: name.trim(),
            price: numericPrice,
            category,
            imageUrl: pickedFile ?? undefined,
            existingImageUrl: pickedFile ? undefined : existingImageUrl,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên sản phẩm */}
            <div>
                <span className="block text-xs font-bold text-foreground mb-2">
                    Tên sản phẩm
                </span>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                    className="custom-input"
                />
            </div>

            {/* Giá */}
            <div>
                <span className="block text-xs font-bold text-foreground mb-2">
                    Giá
                </span>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Nhập giá"
                    className="custom-input"
                />
            </div>

            {/* Danh mục */}
            <div>
                <span className="block text-xs font-bold text-foreground mb-2">
                    Danh mục
                </span>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="custom-input"
                >
                    {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Ảnh sản phẩm */}
            <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Ảnh sản phẩm
                </span>
                <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-border bg-neutral-50/50 cursor-pointer overflow-hidden hover:border-primary transition-colors"
                >
                    {displayImage ? (
                        <Image
                            src={displayImage}
                            alt="Xem trước ảnh sản phẩm"
                            width={200}
                            height={160}
                            unoptimized={!!previewUrl} // blob URL local không cần Next.js optimize
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-xs">Nhấn để chọn ảnh</span>
                        </div>
                    )}
                </label>
                <input
                    id="image-upload"
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                />
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={submitting}
                className="primary-btn mt-2"
            >
                {submitting ? 'Đang xử lý...' : submitText}
            </Button>
        </form>
    );
};

export default ProductForm;