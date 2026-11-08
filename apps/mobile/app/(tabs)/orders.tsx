import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Receipt, RefreshCw } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { formatDateTime, isActiveOrder, Order } from '@/lib/types';
import { usePolling } from '@/lib/usePolling';
import StatusBadge from '@/components/StatusBadge';
import { useNavSpace } from '@/components/PillNav';
import { COLORS, PageHeader, RoundButton, Screen, SHADOW } from '@/components/ui';

// Giống web: app/orders/page.tsx
export default function OrdersScreen() {
  const router = useRouter();
  const navSpace = useNavSpace();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await apiRequest<Order[]>('/orders/me'));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  // Đơn đang làm tự cập nhật trạng thái
  usePolling(load, 15_000);

  const active = orders?.filter((o) => isActiveOrder(o.status)) ?? [];
  const past = orders?.filter((o) => !isActiveOrder(o.status)) ?? [];

  const renderOrder = (order: Order) => (
    <Pressable
      key={order.id}
      onPress={() => router.push({ pathname: '/orders/[id]', params: { id: order.id } })}
      style={SHADOW.premium}
      className="flex-row items-center gap-3 bg-card rounded-2xl p-4 active:opacity-90"
    >
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="font-black text-primary tracking-wider text-sm">{order.code}</Text>
          <StatusBadge status={order.status} small />
        </View>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
        </Text>
        <Text className="text-[11px] text-muted-foreground">
          {formatDateTime(order.createdAt)}
          {order.storeName ? ` · ${order.storeName}` : ''}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-bold text-foreground text-sm">{order.total.toLocaleString('vi-VN')}₫</Text>
        <ChevronRight size={16} color={COLORS.muted} style={{ marginTop: 4 }} />
      </View>
    </Pressable>
  );

  return (
    <Screen>
      <PageHeader
        title="Đơn của tôi"
        onBack={() => router.navigate('/')}
        right={
          <RoundButton onPress={load} label="Tải lại">
            {loading ? <ActivityIndicator color={COLORS.primary} /> : <RefreshCw size={20} color={COLORS.primary} />}
          </RoundButton>
        }
      />
      <ScrollView
        contentContainerClassName="px-5 pt-2 gap-6"
        contentContainerStyle={{ paddingBottom: navSpace }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={COLORS.primary} />}
      >
        {error && (
          <View className="bg-destructive/5 rounded-xl p-3">
            <Text className="text-sm text-destructive font-semibold">{error}</Text>
          </View>
        )}

        {orders === null ? (
          <View className="gap-3">
            {[0, 1, 2].map((i) => (
              <View key={i} className="h-24 bg-card rounded-2xl opacity-60" />
            ))}
          </View>
        ) : orders.length === 0 ? (
          <View className="items-center py-16 bg-card rounded-3xl gap-3">
            <Receipt size={48} color={COLORS.muted} />
            <Text className="font-semibold text-foreground">Bạn chưa có đơn hàng nào</Text>
            <Pressable onPress={() => router.navigate('/order')} className="bg-primary px-5 py-2.5 rounded-full">
              <Text className="text-white text-sm font-bold">Đặt món ngay</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {active.length > 0 && (
              <View className="gap-3">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đang xử lý ({active.length})</Text>
                {active.map(renderOrder)}
              </View>
            )}
            {past.length > 0 && (
              <View className="gap-3">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đơn trước đây</Text>
                {past.map(renderOrder)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
