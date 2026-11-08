import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cartStockNeeded, useCart } from '@/lib/stores/cart';
import { useProducts } from '@/lib/stores/products';
import { toast } from '@/lib/stores/toast';
import { ICE_LABELS, ICE_LEVELS, IceLevel, LOW_STOCK, Product, SUGAR_LEVELS, SugarLevel, sugarLabel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Chip, COLORS, SHADOW } from './ui';
import ProductImage from './ProductImage';

// Thêm món vào giỏ: đồ uống mở bảng chọn độ ngọt / đá / topping; món khác thêm thẳng. (Giống web: useProductPicker)
export function useProductPicker() {
  const [selected, setSelected] = useState<Product | null>(null);
  const addItem = useCart((s) => s.addItem);
  const items = useCart((s) => s.items);

  // Số phần còn đặt thêm được = tồn kho − số đang có trong giỏ
  const remaining = (p: Product) => p.stock - (cartStockNeeded(items).get(p.id) ?? 0);

  const pick = (product: Product) => {
    if (!product.isAvailable) return;
    if (product.category === 'MON_NUOC') return setSelected(product);
    if (remaining(product) <= 0) return toast.error(`"${product.name}" chỉ còn ${product.stock} phần`);
    addItem({ product });
    toast.added(product.name);
  };

  // key theo món: mỗi lần mở là một bảng mới (độ ngọt, đá, topping, số lượng về mặc định)
  const overlay = <PickerSheet key={selected?.id ?? 'none'} product={selected} onClose={() => setSelected(null)} remaining={remaining} />;
  return { pick, overlay };
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View className="gap-2.5 mb-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

function PickerSheet({ product, onClose, remaining }: { product: Product | null; onClose: () => void; remaining: (p: Product) => number }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const products = useProducts((s) => s.products);
  const addItem = useCart((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [sugar, setSugar] = useState<SugarLevel>(100);
  const [ice, setIce] = useState<IceLevel>('NORMAL');
  const [toppingIds, setToppingIds] = useState<string[]>([]);

  const toppings = useMemo(() => products.filter((p) => p.category === 'TOPPING'), [products]);
  if (!product) return null;

  const chosen = toppings.filter((t) => toppingIds.includes(t.id));
  // Không cho chọn quá số còn lại của ly nước và của từng topping đã chọn
  const maxQty = Math.max(0, Math.min(remaining(product), ...chosen.map(remaining), 50));
  const total = (product.price + chosen.reduce((s, t) => s + t.price, 0)) * quantity;

  const toggleTopping = (id: string) => setToppingIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const confirm = () => {
    if (quantity > maxQty) return toast.error(maxQty === 0 ? 'Món này đã đủ số lượng còn lại trong giỏ' : `Chỉ đặt thêm được ${maxQty} ly`);
    addItem({ product, quantity, sugar, ice, toppings: chosen.map((t) => ({ id: t.id, name: t.name, price: t.price })) });
    toast.added(quantity > 1 ? `${quantity}x ${product.name}` : product.name);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} accessibilityLabel="Đóng" />
        <View style={[SHADOW.modal, { maxHeight: height * 0.9 }]} className="bg-background rounded-t-[32px]">
          {/* Thanh kéo + nút đóng */}
          <View className="pt-3 pb-1">
            <View className="self-center w-10 h-1.5 rounded-full bg-border" />
            <Pressable
              onPress={onClose}
              accessibilityLabel="Đóng"
              style={SHADOW.sm}
              className="absolute right-4 top-3 w-9 h-9 rounded-full bg-card items-center justify-center"
            >
              <X size={16} color={COLORS.muted} />
            </Pressable>
          </View>

          {/* Thông tin món */}
          <View className="px-5 pt-2 pb-4 flex-row items-center gap-4">
            <ProductImage product={product} className="w-20 h-20 rounded-3xl" emojiSize={44} />
            <View className="flex-1 pr-8">
              <Text className="text-lg font-black text-foreground leading-tight">{product.name}</Text>
              <Text className="text-sm font-bold text-accent mt-1">{product.price.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>

          <ScrollView style={{ flexShrink: 1 }} contentContainerClassName="px-5 pb-2">
            <Section title="Độ ngọt">
              <View className="flex-row flex-wrap gap-2">
                {SUGAR_LEVELS.map((s) => (
                  <Chip key={s} label={s === 0 ? 'Không đường' : `${s}%`} active={sugar === s} onPress={() => setSugar(s)} />
                ))}
              </View>
            </Section>

            <Section title="Đá">
              <View className="flex-row flex-wrap gap-2">
                {ICE_LEVELS.map((i) => (
                  <Chip key={i} label={ICE_LABELS[i]} active={ice === i} onPress={() => setIce(i)} />
                ))}
              </View>
            </Section>

            {toppings.length > 0 && (
              <Section
                title="Thêm topping"
                right={
                  <View className="bg-caramel px-2.5 py-0.5 rounded-full">
                    <Text className="text-[11px] font-bold text-caramel-foreground">Đã chọn {chosen.length}</Text>
                  </View>
                }
              >
                {toppings.map((t) => {
                  const on = toppingIds.includes(t.id);
                  const soldOut = !t.isAvailable;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => !soldOut && toggleTopping(t.id)}
                      disabled={soldOut}
                      accessibilityState={{ checked: on, disabled: soldOut }}
                      className={cn(
                        'flex-row items-center justify-between p-3.5 rounded-2xl border',
                        on ? 'bg-cream border-accent' : 'bg-card border-border',
                        soldOut && 'opacity-50',
                      )}
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className={cn('w-5 h-5 rounded-md border items-center justify-center', on ? 'bg-primary border-primary' : 'bg-card border-border')}>
                          {on && <Text className="text-white text-xs">✓</Text>}
                        </View>
                        <Text className="text-sm font-semibold text-foreground flex-1">{t.name}</Text>
                      </View>
                      <Text className={cn('text-sm font-bold', soldOut ? 'text-muted-foreground' : 'text-accent')}>
                        {soldOut ? 'Tạm hết' : `+${t.price.toLocaleString('vi-VN')}đ`}
                      </Text>
                    </Pressable>
                  );
                })}
              </Section>
            )}
          </ScrollView>

          {/* Số lượng + nút xác nhận: luôn ở đáy bảng */}
          <View className="px-5 pt-4 border-t border-border bg-card rounded-t-3xl gap-3" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <Text className="text-xs text-muted-foreground">
              {sugarLabel(sugar)} · {ICE_LABELS[ice]}
              {chosen.length > 0 ? ` · ${chosen.map((t) => t.name).join(', ')}` : ''}
            </Text>
            {maxQty <= LOW_STOCK && <Text className="text-xs font-semibold text-amber-800">Chỉ còn {maxQty} phần có thể đặt</Text>}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-foreground">Số lượng</Text>
              <View className="flex-row items-center gap-3 bg-background rounded-full p-1">
                <Pressable
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  accessibilityLabel="Giảm số lượng"
                  style={SHADOW.sm}
                  className={cn('w-9 h-9 rounded-full bg-card items-center justify-center', quantity <= 1 && 'opacity-40')}
                >
                  <Minus size={16} color={COLORS.foreground} />
                </Pressable>
                <Text className="w-6 text-center font-black text-foreground">{quantity}</Text>
                <Pressable
                  onPress={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  accessibilityLabel="Tăng số lượng"
                  style={SHADOW.sm}
                  className={cn('w-9 h-9 rounded-full bg-card items-center justify-center', quantity >= maxQty && 'opacity-40')}
                >
                  <Plus size={16} color={COLORS.foreground} />
                </Pressable>
              </View>
            </View>
            <Pressable
              onPress={confirm}
              disabled={maxQty === 0}
              style={SHADOW.premium}
              className={cn('flex-row items-center justify-center gap-2 bg-primary py-4 rounded-2xl', maxQty === 0 && 'opacity-50')}
            >
              <ShoppingBag size={20} color="#fff" />
              <Text className="text-white font-bold">Thêm vào giỏ · {total.toLocaleString('vi-VN')}đ</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
