import React, { useState } from 'react';
import { Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { assetUrl } from '@/lib/api';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { COLORS } from './ui';

// Ảnh minh họa tạm bằng emoji khi món chưa có ảnh (giống web)
export function productEmoji(product: Pick<Product, 'name' | 'category'>): string {
  const name = product.name.toLowerCase();
  if (product.category === 'TOPPING') return '🍮';
  if (product.category === 'BANH') return name.includes('bánh mì') ? '🥖' : '🍰';
  if (name.includes('phin')) return '☕';
  if (name.includes('trà sữa')) return '🧋';
  if (name.includes('freeze')) return '🥤';
  return '🍵';
}

interface Props {
  product: Pick<Product, 'name' | 'category' | 'imageUrl'>;
  className?: string;
  emojiSize?: number;
  dim?: boolean; // món tạm hết
}

// Nền chuyển màu kem → be giống web (from-cream to-muted)
export default function ProductImage({ product, className, emojiSize = 48, dim }: Props) {
  const [failed, setFailed] = useState(false);
  const uri = assetUrl(product.imageUrl);
  return (
    <LinearGradient
      colors={[COLORS.cream, '#F3EAE1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={cn('items-center justify-center overflow-hidden', className)}
      style={dim ? { opacity: 0.55 } : undefined}
    >
      {uri && !failed ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} onError={() => setFailed(true)} />
      ) : (
        <Text style={{ fontSize: emojiSize }}>{productEmoji(product)}</Text>
      )}
    </LinearGradient>
  );
}
