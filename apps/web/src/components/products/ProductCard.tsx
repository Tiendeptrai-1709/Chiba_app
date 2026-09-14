import React from "react";

import { Product, useGetProduct } from "@chiba/api-client";
import { api } from "@/lib/axios";
import { Button } from "../ui/button";
import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

interface ProductCardProps {
    products: Product;
    onEdit: () => void;
    // setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

const ProductCard = ({
    products,
    onEdit,
    // setSelectedProduct,
}: ProductCardProps) => {
    const { data: productData } = useGetProduct(api, products.id);

    return (
        <div className="w-full bg-card rounded-2xl p-4">
            {/* Main information */}
            <div className="flex items-start">
                {/* Product icon */}
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mr-3 ">
                    {productData?.imageUrl ? (
                        <Image src={productData.imageUrl} alt={productData.name} width={50} height={50} className="rounded-md object-cover" />
                    ) : <span className="text-3xl">
                        {productData?.category === "MON_NUOC" ? (
                            "☕"
                        ) : productData?.category === "TOPPING" ? (
                            "🥛"
                        ) : (
                            "🍰"
                        )}
                    </span>
                    }
                </div>

                {/* Product info */}
                <div className="flex-1">
                    <span
                        className="text-sm font-bold text-foreground"
                    >
                        {productData?.name}
                    </span>

                    <div className="flex items-center mt-1">
                        <div className="bg-primary/10 px-2 py-1 rounded-md">
                            <span className="text-[10px] font-semibold text-primary">
                                {productData?.category}
                            </span>
                        </div>
                    </div>

                    <span className="text-base font-black text-primary mt-2">
                        {productData?.price.toLocaleString("vi-VN")}đ
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex-row justify-end items-center gap-2 mt-4 pt-3 border-t border-border">
                <Button
                    onClick={onEdit}
                    className="secondary-btn mt-2"
                >
                    <Pencil/>

                    <span className="text-xs font-bold text-primary">
                        Sửa
                    </span>
                </Button>

                <Button
                    // onClick={() => {
                    //     setSelectedProduct(products);
                    // }}
                    className="secondary-btn mt-2"
                >
                    <Trash2 className="w-4 h-4 text-destructive" />

                    <span className="text-xs font-bold text-destructive">
                        Xóa
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default ProductCard;