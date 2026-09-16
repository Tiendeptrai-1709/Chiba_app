"use client"

import ProductForm from '@/components/products/ProductForm';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios';
import { useGetProduct, useUpdateProduct } from '@chiba/api-client';
import { useParams, useRouter } from 'next/navigation';
import React from 'react'

const EditPage = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string; }>();

    const { mutate, isPending } = useUpdateProduct(api)
    const { data: product, isLoading, isError } = useGetProduct(api, id)
    // const product = [
    //     {
    //         name: "Cà phê sữa",
    //         price: 30000,
    //         imageUrl: "",
    //         category: "MON_NUOC"
    //     }
    // ]

    const handleUpdate = (data: {
        name: string;
        price: number;
        imageUrl?: File | { uri: string; name: string; type: string }; // Chỉ CÓ khi người dùng vừa chọn ảnh mới -> cần upload
        category: string;
        existingImageUrl?: string; //edit mode giữ nguyên ảnh cũ
    }) => {
        console.log("UPDATE PRODUCT", id, data);

        mutate(
            {
                id,
                payload: {
                    name: data.name,
                    price: data.price,
                    category: data.category,
                    imageUrl: data.imageUrl!,
                },
            },
            {
                onSuccess: () => {
                    router.push("/products");
                }
            }
        );
    };
    if (isLoading) {
        return (
            <div className="flex-1 bg-background items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Đang tải sản phẩm...
                </p>
            </div>
        );
    }
    if (isError || !product) {
        return (
            <div className="flex-1 bg-background items-center justify-center">
                <p className="text-sm text-destructive">
                    Không tìm thấy sản phẩm
                </p>
            </div>
        );
    }

    return (
        <div
            className="flex-1 bg-background px-4 pt-5"
        >
            <div className="flex items-center justify-between mb-5">
                <Button onClick={() => router.push("/products")} className="bg-primary hover:bg-primary-hover py-5 px-12 rounded-xl transition-all duration-200 disabled:opacity-50">
                    <p className="text-white font-semibold">Back</p>
                </Button>
                <div className="text-center">
                    <p className="text-xl font-black text-foreground">
                        Chỉnh sửa sản phẩm
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        Cập nhật thông tin sản phẩm
                    </p>
                </div>
                <div />
            </div>

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
        </div>
    );
};


export default EditPage
