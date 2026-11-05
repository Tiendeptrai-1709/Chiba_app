'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { assetUrl } from '@/lib/api/client';

// Ảnh minh họa tạm bằng emoji khi món chưa có ảnh thật.
export function productEmoji(product: Pick<Product, 'name' | 'category'>): string {
  const name = product.name.toLowerCase();
  if (product.category === 'TOPPING') return '🍮';
  if (product.category === 'BANH') return name.includes('bánh mì') ? '🥖' : '🍰';
  if (name.includes('phin')) return '☕';
  if (name.includes('trà sữa')) return '🧋';
  if (name.includes('freeze')) return '🥤';
  return '🍵';
}

interface ProductImageProps {
  product: Pick<Product, 'name' | 'category' | 'imageUrl'>;
  className?: string;
  emojiClassName?: string;
}

// Hiện ảnh món nếu có (admin upload), nếu không / lỗi tải thì hiện emoji.
export default function ProductImage({ product, className = '', emojiClassName = 'text-6xl' }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const src = assetUrl(product.imageUrl);

  return (
    <div className={`bg-gradient-to-br from-cream to-muted flex items-center justify-center overflow-hidden ${className}`}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`drop-shadow-sm ${emojiClassName}`} aria-hidden>
          {productEmoji(product)}
        </span>
      )}
    </div>
  );
}
