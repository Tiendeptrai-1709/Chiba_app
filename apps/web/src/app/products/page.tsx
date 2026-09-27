"use client";

import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios';
import { Product, useGetAllProduct, useProfile } from '@chiba/api-client';
// import { useDeleteProduct } from '@chiba/api-client/src/hooks/useProduct';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Notification } from '@/components/reuse-components/Notication';

import ProductEditList from '@/components/products/ProductEditList';
import DeleteProductModal from '@/components/products/DeleteProductModal';
import { useDeleteProduct } from '@chiba/api-client/src/hooks/useProduct';

const ProductPage = () => {
    const router = useRouter();
    const { data: PRODUCTS } = useGetAllProduct(api)
    const { mutate: deleteProduct } = useDeleteProduct(api)
    const { data: user } = useProfile(api)

    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
        router.replace("/")
    }

    const handleDeleteProduct = () => {
        if (selectedProduct) {
            deleteProduct(selectedProduct.id, {
                onSuccess: () => {
                    setSelectedProduct(null);
                },
                onError: (error) => { console.log("Error deleting product", error) },
            });
        }
    };

    return (
        <div className="flex-1 bg-background px-4 pt-5">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">

                <Button onClick={() => router.push("/admin/dashboard")} className="bg-primary hover:bg-primary-hover py-5 px-12 rounded-xl transition-all duration-200 disabled:opacity-50">
                    <p className="text-white font-semibold">Back</p>
                </Button>

                <div className="text-center">
                    <span className="text-xl font-black text-foreground">
                        Quản lý sản phẩm
                    </span>

                    <p className="text-xs text-muted-foreground mt-1">
                        {PRODUCTS.length} sản phẩm
                    </p>
                </div>

                <Button
                    onClick={() => router.push("/products/create")}
                    className="bg-primary hover:bg-primary-hover py-5 px-12 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                    <Plus size={16} color="white" />

                    <p className="text-xs font-bold text-white">
                        Thêm
                    </p>
                </Button>
            </div>

            {/* Product list */}
            <ProductEditList 
                setSelectedProduct={setSelectedProduct}
                setIsOpenDeleteModal={setIsOpenDeleteModal} 
            />

            {isOpenDeleteModal && (
                <DeleteProductModal
                    isOpenDeleteModal={isOpenDeleteModal}
                    setIsOpenDeleteModal={setIsOpenDeleteModal}
                    productName={selectedProduct?.name || ""}
                    productPrice={selectedProduct?.price || 0}
                    onConfirm={handleDeleteProduct}
                />
            )}
        </div>
    );
}
export default ProductPage
