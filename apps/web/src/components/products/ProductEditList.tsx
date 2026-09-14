"use client";

import { api } from '@/lib/axios';
import { Product, ProductCategory, useGetAllProduct } from '@chiba/api-client';
import React, { useMemo, useState } from 'react'
import { Button } from '../ui/button';
import ProductCard from './ProductCard';
import { useRouter } from 'next/navigation';

const CATEGORIES: {id: ProductCategory, label:string}[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'MON_NUOC', label: 'Món Nước' },
  { id: 'TOPPING', label: 'Topping Nước' },
  { id: 'BANH', label: 'Bánh & Đồ Ăn Kèm' },
];

const ProductEditList = () => {
    const { data: PRODUCTS } = useGetAllProduct(api)
    const router = useRouter();

    const [activeCategory, setActiveCategory] = useState<ProductCategory>("ALL");
    const [searchQuery, setSearchQuery] = useState('');
    // const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);


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

    /*
     * Product icon
     */
    // const getProductIcon = (product: Product) => {
    //     if (product.category === 'MON_NUOC') {
    //         return '☕';
    //     }
    //     if (product.category === 'TOPPING') {
    //         return '🥛';
    //     }
    //     return '🍰';
    // };
    return (
        <>
            <div className="space-y-6">
                {/* Categories Horizontal Scroll Bar */}
                <div className="flex border-b border-border gap-2 z-30 py-2">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <Button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setSearchQuery('');
                                }}
                                className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-card text-muted-foreground border border-border hover:bg-muted/20'
                                    }`}
                            >
                                {cat.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Visual Toast Notification on Addition */}

                {/* Dynamic Products Grid/List */}
                {filteredProducts.length > 0 ? (
                    <div className="space-y-3">
                        {filteredProducts.map((product: Product) => (
                            <div
                                key={product.id}
                                className="w-full flex items-center gap-4 bg-card p-4 rounded-xl border border-border interactive-card cursor-pointer select-none"
                            >
                                <ProductCard
                                    products={product}
                                    onEdit={() =>
                                        router.push(`/products/${product.id}/edit`)
                                    }
                                    // setSelectedProduct={setSelectedProduct}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-card border border-border rounded-xl">
                        <div className="text-5xl mb-3">🔍</div>
                        <h3 className="font-semibold text-foreground">Không tìm thấy món</h3>
                        <p className="text-sm text-muted-foreground mt-1 px-4">
                            Hãy thử tìm bằng từ khóa khác hoặc chuyển sang danh mục khác.
                        </p>
                    </div>
                )}

            </div>
        </>
    )
}

export default ProductEditList
