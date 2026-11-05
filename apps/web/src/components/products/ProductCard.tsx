'use client';

import { LOW_STOCK, Product } from '@/types';
import { Plus } from 'lucide-react';
import ProductImage from './ProductImage';

export { productEmoji } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const soldOut = !product.isAvailable;

  return (
    <button
      type="button"
      onClick={() => !soldOut && onAdd(product)}
      disabled={soldOut}
      aria-label={soldOut ? `${product.name} — tạm hết` : `Thêm ${product.name}`}
      className="group text-left bg-card rounded-[1.75rem] p-2.5 shadow-premium active:scale-[0.98] transition-transform duration-200 flex flex-col disabled:active:scale-100 disabled:cursor-not-allowed"
    >
      <div className="relative">
        <ProductImage
          product={product}
          className={`aspect-square rounded-[1.4rem] ${soldOut ? 'grayscale opacity-60' : ''}`}
          emojiClassName="text-6xl transition-transform duration-300 group-hover:scale-110"
        />
        {soldOut ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-foreground/80 text-white text-xs font-bold px-3 py-1.5 rounded-full">Tạm hết</span>
          </span>
        ) : (
          product.stock <= LOW_STOCK && (
            <span className="absolute left-2 top-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Chỉ còn {product.stock}
            </span>
          )
        )}
      </div>

      <div className="flex items-end justify-between gap-2 px-1.5 pt-3 pb-1 flex-1">
        <div className="min-w-0">
          <h3 className={`text-[13px] font-semibold leading-snug line-clamp-2 ${soldOut ? 'text-muted-foreground' : 'text-foreground'}`}>
            {product.name}
          </h3>
          <p className={`text-sm font-black mt-1 ${soldOut ? 'text-muted-foreground line-through' : 'text-primary'}`}>
            {product.price.toLocaleString('vi-VN')}đ
          </p>
        </div>
        {!soldOut && (
          <span className="shrink-0 w-9 h-9 rounded-full bg-caramel text-caramel-foreground flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2.6} />
          </span>
        )}
      </div>
    </button>
  );
}
