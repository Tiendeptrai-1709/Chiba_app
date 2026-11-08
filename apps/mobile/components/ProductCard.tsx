import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { LOW_STOCK, Product } from '@/lib/types';
import ProductImage from './ProductImage';
import { COLORS, SHADOW } from './ui';

// Giống web (components/products/ProductCard.tsx)
export default function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const soldOut = !product.isAvailable;
  return (
    <Pressable
      onPress={() => !soldOut && onAdd(product)}
      disabled={soldOut}
      accessibilityLabel={soldOut ? `${product.name} — tạm hết` : `Thêm ${product.name}`}
      style={SHADOW.premium}
      className="flex-1 bg-card rounded-[28px] p-2.5 active:opacity-90"
    >
      <View>
        <ProductImage product={product} className="w-full aspect-square rounded-[22px]" emojiSize={56} dim={soldOut} />
        {soldOut ? (
          <View className="absolute inset-0 items-center justify-center">
            <View className="bg-foreground/80 px-3 py-1.5 rounded-full">
              <Text className="text-white text-xs font-bold">Tạm hết</Text>
            </View>
          </View>
        ) : product.stock <= LOW_STOCK ? (
          <View className="absolute left-2 top-2 bg-amber-100 px-2 py-0.5 rounded-full">
            <Text className="text-amber-800 text-[10px] font-bold">Chỉ còn {product.stock}</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-end justify-between gap-2 px-1.5 pt-3 pb-1 flex-1">
        <View className="flex-1">
          <Text className={`text-[13px] font-semibold leading-snug ${soldOut ? 'text-muted-foreground' : 'text-foreground'}`} numberOfLines={2}>
            {product.name}
          </Text>
          <Text className={`text-sm font-black mt-1 ${soldOut ? 'text-muted-foreground line-through' : 'text-primary'}`}>
            {product.price.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        {!soldOut && (
          <View style={SHADOW.sm} className="w-9 h-9 rounded-full bg-caramel items-center justify-center">
            <Plus size={16} color={COLORS.primary} strokeWidth={2.6} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

// Lưới 2 cột (FlatList numColumns cần ô trống cho món lẻ cuối)
export function ProductGrid({ products, onAdd }: { products: Product[]; onAdd: (p: Product) => void }) {
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));
  return (
    <View className="gap-3.5">
      {rows.map((row) => (
        <View key={row[0].id} className="flex-row gap-3.5">
          {row.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
          {row.length === 1 && <View className="flex-1" />}
        </View>
      ))}
    </View>
  );
}

