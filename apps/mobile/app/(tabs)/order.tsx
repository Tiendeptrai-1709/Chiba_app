import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronRight, MapPin, RefreshCw, Search } from 'lucide-react-native';
import { cartTotals, useCart } from '@/lib/stores/cart';
import { useProducts } from '@/lib/stores/products';
import { useProductPicker } from '@/components/ProductPicker';
import { ProductGrid } from '@/components/ProductCard';
import { NAV_HEIGHT, useNavSpace } from '@/components/PillNav';
import { CartButton, Chip, COLORS, PageHeader, Screen, SHADOW } from '@/components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALL = 'ALL';
const NONE = 'NONE';

// Giống web: app/order/page.tsx + components/products/ProductList.tsx
export default function OrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navSpace = useNavSpace();
  const { products, groups, loaded, loading, error, fetch } = useProducts();
  const items = useCart((s) => s.items);
  const store = useCart((s) => s.store);
  const { totalItems, totalPrice } = cartTotals(items);
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState('');
  const { pick, overlay } = useProductPicker();

  // Luôn tải lại khi mở trang để thấy ngay món nhân viên vừa báo hết
  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch]),
  );

  // Chip danh mục: chỉ danh mục đang có món, theo thứ tự Admin đặt
  const chips = useMemo(() => {
    const ids = new Set(groups.map((g) => g.id));
    const list = [{ key: ALL, label: 'Tất cả' }];
    for (const g of groups) if (products.some((p) => p.groupId === g.id)) list.push({ key: g.id, label: g.name });
    if (list.length > 1 && products.some((p) => !p.groupId || !ids.has(p.groupId))) list.push({ key: NONE, label: 'Khác' });
    return list;
  }, [groups, products]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ids = new Set(groups.map((g) => g.id));
    return products.filter((p) => {
      const inCat = category === ALL || (category === NONE ? !p.groupId || !ids.has(p.groupId) : p.groupId === category);
      return inCat && p.name.toLowerCase().includes(q);
    });
  }, [products, groups, category, query]);

  return (
    <Screen>
      <PageHeader title="Đặt món" onBack={() => router.navigate('/')} right={<CartButton />} />

      {/* Cửa hàng đang chọn */}
      <Pressable
        onPress={() => router.push('/stores')}
        style={SHADOW.sm}
        className="mx-5 mb-2 flex-row items-center gap-2 bg-card rounded-2xl px-4 py-2.5 active:opacity-80"
      >
        <MapPin size={16} color={COLORS.accent} />
        <View className="flex-1">
          <Text className="text-[10px] text-muted-foreground">Cửa hàng</Text>
          <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {store?.name ?? 'Chọn cửa hàng gần bạn'}
          </Text>
        </View>
        <Text className="text-xs font-bold text-accent">Đổi</Text>
        <ChevronRight size={16} color={COLORS.accent} />
      </Pressable>

      <ScrollView
        contentContainerClassName="px-5 pt-2 gap-5"
        contentContainerStyle={{ paddingBottom: navSpace + (totalItems > 0 ? 72 : 0) }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading && loaded} onRefresh={fetch} tintColor={COLORS.primary} />}
      >
        {/* Ô tìm kiếm */}
        <View style={SHADOW.premium} className="flex-row items-center bg-card rounded-full px-5">
          <Search size={20} color={COLORS.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm trà, cà phê, bánh..."
            placeholderTextColor="rgba(107, 94, 83, 0.7)"
            className="flex-1 h-14 ml-3 text-sm text-foreground"
            returnKeyType="search"
          />
        </View>

        {/* Chip danh mục */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5" contentContainerClassName="px-5 gap-2.5 pb-1">
          {chips.map((c) => (
            <Chip key={c.key} tone="caramel" label={c.label} active={category === c.key} onPress={() => setCategory(c.key)} />
          ))}
        </ScrollView>

        {/* Lưới sản phẩm 2 cột */}
        {!loaded && loading ? (
          <Text className="text-center text-muted-foreground py-12">Đang tải menu...</Text>
        ) : error && products.length === 0 ? (
          <View className="items-center py-12 bg-card rounded-3xl gap-3">
            <Text className="font-semibold text-foreground">Không tải được menu</Text>
            <Text className="text-sm text-muted-foreground text-center px-6">{error}</Text>
            <Pressable onPress={fetch} className="flex-row items-center gap-2 bg-primary px-5 py-2.5 rounded-full">
              <RefreshCw size={16} color="#fff" />
              <Text className="text-white text-sm font-bold">Thử lại</Text>
            </Pressable>
          </View>
        ) : shown.length > 0 ? (
          <ProductGrid products={shown} onAdd={pick} />
        ) : (
          <View className="items-center py-16 bg-card rounded-3xl">
            <Text className="text-5xl mb-3">🔍</Text>
            <Text className="font-semibold text-foreground">Không tìm thấy món</Text>
            <Text className="text-sm text-muted-foreground mt-1 px-4 text-center">Thử từ khóa khác hoặc chọn danh mục khác nhé.</Text>
          </View>
        )}
      </ScrollView>

      {/* Thanh xem giỏ hàng — nằm trên thanh điều hướng */}
      {totalItems > 0 && (
        <View pointerEvents="box-none" className="absolute left-4 right-4" style={{ bottom: Math.max(insets.bottom, 12) + NAV_HEIGHT + 16 }}>
          <Pressable
            onPress={() => router.push('/cart')}
            style={SHADOW.floating}
            className="flex-row items-center justify-between bg-primary rounded-full pl-5 pr-2 py-2 active:opacity-90"
          >
            <Text className="text-sm text-white">
              <Text className="font-bold">{totalItems} món</Text> · {totalPrice.toLocaleString('vi-VN')}đ
            </Text>
            <View className="bg-caramel flex-row items-center gap-1 px-4 py-2.5 rounded-full">
              <Text className="font-bold text-sm text-caramel-foreground">Xem giỏ hàng</Text>
              <ChevronRight size={16} color={COLORS.primary} />
            </View>
          </Pressable>
        </View>
      )}
      {overlay}
    </Screen>
  );
}
