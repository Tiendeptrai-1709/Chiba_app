"use client";

import ProductForm from '@/components/products/ProductForm'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/axios'
import { useCreateProduct } from '@chiba/api-client'
import { useRouter } from 'next/navigation'
import React from 'react'

const CreateProduct = () => {
  const router = useRouter()
  const { mutate, isPending } = useCreateProduct(api)

  const handleCreate = (data: {
    name: string;
    price: number;
    imageUrl?: File | { uri: string; name: string; type: string }; // Chỉ CÓ khi người dùng vừa chọn ảnh mới -> cần upload
    category: string;
    existingImageUrl?: string; //edit mode giữ nguyên ảnh cũ
  }) => {
    // Create bắt buộc phải có ảnh MỚI (không có khái niệm "ảnh cũ" khi tạo mới)
    if (!data.imageUrl) {
      return;
    }

    console.log('Creating product with data:', data);
    mutate({
      name: data.name,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl,
    });
  };

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
            Thêm sản phẩm
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            Tạo một sản phẩm mới trong hệ thống
          </p>
        </div>

        <div/>
      </div>

      <ProductForm
        submitText="Thêm sản phẩm"
        onSubmit={handleCreate}
        submitting={isPending}
      />
    </div>
  )
}

export default CreateProduct
