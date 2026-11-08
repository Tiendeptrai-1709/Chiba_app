import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Bike, ChevronRight, LayoutDashboard, QrCode, Receipt, UserRound } from 'lucide-react-native';
import { useAuth } from '@/lib/stores/auth';
import { isStaffMember, ROLE_LABELS } from '@/lib/types';
import { useProducts } from '@/lib/stores/products';
import { useProductPicker } from '@/components/ProductPicker';
import { ProductGrid } from '@/components/ProductCard';
import { useNavSpace } from '@/components/PillNav';
import { CartButton, COLORS, GREEN_GRADIENT, Screen, SHADOW } from '@/components/ui';

// Món gợi ý ở trang chủ (ưu tiên món còn hàng) — giống web
const FEATURED_IDS = ['p7', 'p4', 'p1', 'b4', 'p8', 'p6'];

type Href = '/order' | '/qr' | '/profile' | '/orders';

export default function HomeScreen() {
  const router = useRouter();
  const navSpace = useNavSpace();
  const { user, refreshUser } = useAuth();
  const { products, fetch } = useProducts();
  const { pick, overlay } = useProductPicker();

  // Mỗi lần mở trang chủ: tải menu & điểm mới nhất (vd. vừa được tích tại quầy)
  useFocusEffect(
    useCallback(() => {
      fetch();
      refreshUser();
    }, [fetch, refreshUser]),
  );

  const featured = useMemo(
    () =>
      FEATURED_IDS.map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p && p.isAvailable)
        .slice(0, 4),
    [products],
  );

  if (!user) return null;

  const tiles: { href: Href; title: string; subtitle: string; Icon: typeof Bike; box: string; color: string }[] = [
    { href: '/order', title: 'Đặt hàng', subtitle: 'Giao tận nơi', Icon: Bike, box: 'bg-caramel', color: COLORS.primary },
    { href: '/qr', title: 'QR tích điểm', subtitle: `${user.zenPoints} điểm · Khi order tại quán`, Icon: QrCode, box: 'bg-primary', color: '#fff' },
    { href: '/profile', title: 'Hồ sơ', subtitle: 'Thông tin & điểm', Icon: UserRound, box: 'bg-card', color: COLORS.primary },
    { href: '/orders', title: 'Đơn của tôi', subtitle: 'Theo dõi & lịch sử', Icon: Receipt, box: 'bg-accent', color: '#fff' },
  ];

  const initial = user.fullName?.trim()?.[0]?.toUpperCase() ?? '☕';

  return (
    <Screen>
      <ScrollView contentContainerClassName="px-5 pt-4 gap-6" contentContainerStyle={{ paddingBottom: navSpace }}>
        {/* Lời chào */}
        <View className="flex-row items-center justify-between gap-3">
          <Pressable onPress={() => router.navigate('/profile')} className="flex-row items-center gap-3 flex-1">
            <View style={SHADOW.premium} className="w-14 h-14 rounded-full bg-card items-center justify-center">
              <Text className="text-xl font-black text-primary">{initial}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted-foreground">Xin chào,</Text>
              <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
                {user.fullName}
              </Text>
            </View>
          </Pressable>
          <CartButton size={48} />
        </View>

        {/* Lối tắt cho nhân viên / admin */}
        {isStaffMember(user.role) && (
          <Pressable
            onPress={() => router.push('/dashboard')}
            style={SHADOW.premium}
            className="flex-row items-center gap-3 bg-card rounded-2xl p-4 border border-primary/15 active:opacity-90"
          >
            <View className="w-11 h-11 rounded-xl bg-primary items-center justify-center">
              <LayoutDashboard size={22} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-foreground">Bảng điều khiển {ROLE_LABELS[user.role]}</Text>
              <Text className="text-xs text-muted-foreground">Nhận đơn · Quét QR tích điểm · Kho món</Text>
            </View>
            <ChevronRight size={18} color={COLORS.primary} />
          </Pressable>
        )}

        {/* Banner */}
        <LinearGradient colors={GREEN_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[SHADOW.floating, { borderRadius: 32, overflow: 'hidden' }]}>
          <View className="p-6">
            <View className="w-[62%] gap-1.5 z-10">
              <Text className="text-sm font-medium text-white/85">Hôm nay uống gì?</Text>
              <Text className="text-[26px] leading-tight font-black text-white">Chiba giao tận nơi</Text>
              <Text className="text-sm text-white/80">Trà, cà phê & bánh ngon mỗi ngày</Text>
              <Pressable
                onPress={() => router.navigate('/order')}
                style={SHADOW.sm}
                className="self-start flex-row items-center gap-2 mt-3 bg-caramel px-5 py-3 rounded-full active:opacity-80"
              >
                <Text className="font-bold text-sm text-caramel-foreground">Đặt ngay</Text>
                <ArrowRight size={16} color={COLORS.primary} />
              </Pressable>
            </View>
            <View className="absolute -right-6 top-0 bottom-0 justify-center" pointerEvents="none">
              <View className="w-44 h-44 rounded-full bg-white/15 items-center justify-center">
                <View style={SHADOW.modal} className="w-32 h-32 rounded-full bg-background items-center justify-center">
                  <Text style={{ fontSize: 56 }}>☕</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* 4 mục chính */}
        <View className="flex-row flex-wrap justify-between gap-y-3.5">
          {tiles.map(({ href, title, subtitle, Icon, box, color }) => (
            <Pressable
              key={title}
              onPress={() => router.navigate(href)}
              style={[SHADOW.premium, { width: '48.2%' }]}
              className="bg-card rounded-[28px] p-5 active:opacity-90"
            >
              <View className={`w-12 h-12 rounded-2xl items-center justify-center ${box}`}>
                <Icon size={24} color={color} />
              </View>
              <Text className="mt-4 text-base font-bold text-foreground">{title}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {/* Gợi ý món */}
        {featured.length > 0 && (
          <View className="gap-3.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Gợi ý cho bạn</Text>
              <Pressable onPress={() => router.navigate('/order')} className="flex-row items-center gap-1">
                <Text className="text-sm font-semibold text-accent">Xem tất cả</Text>
                <ArrowRight size={16} color={COLORS.accent} />
              </Pressable>
            </View>
            <ProductGrid products={featured} onAdd={pick} />
          </View>
        )}
      </ScrollView>
      {overlay}
    </Screen>
  );
}
