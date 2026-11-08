import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Bike, Check, MapPin, Store, X } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { vietQrImageUrl } from '@/lib/config';
import { useAuth } from '@/lib/stores/auth';
import { toast } from '@/lib/stores/toast';
import { formatDateTime, ICE_LABELS, isActiveOrder, Order, ORDER_STATUS_LABELS, orderSteps, sugarLabel } from '@/lib/types';
import { usePolling } from '@/lib/usePolling';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import { COLORS, PageHeader, Screen, SHADOW } from '@/components/ui';

const PAYMENT_LABELS = { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản' } as const;

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View style={SHADOW.premium} className={cn('bg-card rounded-3xl p-5', className)}>
      {children}
    </View>
  );
}

// Tiến trình đơn dạng ngang (giống web)
function Steps({ order }: { order: Order }) {
  const steps = orderSteps(order.orderType);
  const current = steps.indexOf(order.status);
  const active = isActiveOrder(order.status);
  return (
    <View className="flex-row items-start">
      {steps.map((s, i) => {
        const done = i <= current;
        return (
          <View key={s} className="flex-1 items-center gap-1.5">
            {i > 0 && <View className={cn('absolute top-3.5 right-1/2 w-full h-0.5', done ? 'bg-primary' : 'bg-border')} />}
            <View
              className={cn(
                'w-7 h-7 rounded-full items-center justify-center',
                done ? 'bg-primary' : 'bg-muted',
                i === current && active && 'border-4 border-primary/20',
              )}
            >
              {done ? <Check size={14} color="#fff" /> : <Text className="text-xs font-bold text-muted-foreground">{i + 1}</Text>}
            </View>
            <Text className={cn('text-[10.5px] leading-tight text-center', done ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
              {ORDER_STATUS_LABELS[s].split(' — ')[0]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// Giống web: app/orders/[id]/page.tsx
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const refreshUser = useAuth((s) => s.refreshUser);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrder(await apiRequest<Order>(`/orders/${id}`));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được đơn hàng');
    }
  }, [id]);

  usePolling(load, 10_000);

  const cancel = async () => {
    setCancelling(true);
    try {
      setOrder(await apiRequest<Order>(`/orders/${id}/cancel`, { method: 'POST' }));
      setConfirmCancel(false);
      refreshUser(); // điểm đã dùng được hoàn lại
      toast.success('Đã hủy đơn');
    } catch (e: any) {
      setError(e?.message ?? 'Không hủy được đơn');
      load();
    } finally {
      setCancelling(false);
    }
  };

  const active = order ? isActiveOrder(order.status) : false;
  const qr = order && order.paymentMethod === 'BANK_TRANSFER' && active && !order.paidAt ? vietQrImageUrl(order.total, order.code) : null;

  return (
    <Screen>
      <PageHeader
        title={order ? `Đơn ${order.code}` : 'Chi tiết đơn'}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/orders'))}
      />
      <ScrollView contentContainerClassName="px-5 pt-2 pb-12 gap-4">
        {error && (
          <View className="bg-destructive/5 rounded-xl p-3">
            <Text className="text-sm text-destructive font-semibold">{error}</Text>
          </View>
        )}

        {!order ? (
          !error && <View className="h-64 bg-card rounded-3xl opacity-60" />
        ) : (
          <>
            {/* Trạng thái */}
            <Section className="gap-4">
              <View className="flex-row items-center justify-between gap-2">
                <StatusBadge status={order.status} />
                <Text className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</Text>
              </View>
              {order.status === 'CANCELLED' ? (
                <View className="flex-row items-center gap-2">
                  <X size={16} color={COLORS.muted} />
                  <Text className="text-sm text-muted-foreground flex-1">
                    {order.cancelledBy === 'CUSTOMER' ? 'Bạn đã hủy đơn này.' : 'Cửa hàng đã hủy đơn này.'}
                    {order.pointsUsed > 0 ? ` Đã hoàn lại ${order.pointsUsed} điểm.` : ''}
                  </Text>
                </View>
              ) : (
                <Steps order={order} />
              )}
              {order.status === 'READY' && (
                <View className="bg-emerald-50 rounded-xl p-3">
                  <Text className="text-sm font-semibold text-emerald-800">
                    Món đã sẵn sàng! Đọc mã <Text className="font-black">{order.code}</Text> cho nhân viên tại quầy để nhận nhé.
                  </Text>
                </View>
              )}
              {order.status === 'COMPLETED' && order.pointsEarned > 0 && (
                <View className="bg-orange-50 rounded-xl p-3">
                  <Text className="text-sm font-semibold text-accent-strong">Bạn đã được cộng +{order.pointsEarned} điểm từ đơn này.</Text>
                </View>
              )}
            </Section>

            {/* Nhận hàng & thanh toán */}
            <Section className="gap-2.5">
              {order.storeName && (
                <View className="flex-row gap-2">
                  <Store size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <Text className="text-sm text-foreground flex-1">{order.storeName}</Text>
                </View>
              )}
              <View className="flex-row gap-2">
                {order.orderType === 'DELIVERY' ? (
                  <Bike size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
                ) : (
                  <MapPin size={16} color={COLORS.primary} style={{ marginTop: 2 }} />
                )}
                <Text className="text-sm text-foreground flex-1">{order.orderType === 'DELIVERY' ? `Giao tới: ${order.address}` : 'Nhận tại quán'}</Text>
              </View>
              <View className="flex-row items-center gap-2 flex-wrap">
                <Text className="text-sm text-foreground">💳 {PAYMENT_LABELS[order.paymentMethod]}</Text>
                {order.paidAt ? (
                  <View className="bg-green-100 px-2 py-0.5 rounded-full">
                    <Text className="text-green-700 text-[11px] font-bold">Đã thanh toán</Text>
                  </View>
                ) : order.paymentMethod === 'BANK_TRANSFER' && active ? (
                  <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                    <Text className="text-amber-800 text-[11px] font-bold">Chờ cửa hàng xác nhận</Text>
                  </View>
                ) : null}
              </View>
              {qr && (
                <View className="pt-2 items-center gap-2">
                  <Text className="text-xs text-muted-foreground text-center">Chưa chuyển khoản? Quét mã dưới đây (nội dung: {order.code})</Text>
                  <Image source={{ uri: qr }} style={{ width: 192, height: 192, borderRadius: 8, backgroundColor: '#fff' }} contentFit="contain" />
                </View>
              )}
            </Section>

            {/* Món */}
            <Section className="gap-4">
              <View className="gap-2.5">
                {order.items.map((item, idx) => {
                  const opts = [
                    item.sugar !== null ? sugarLabel(item.sugar) : null,
                    item.ice ? ICE_LABELS[item.ice] : null,
                    item.toppings.length ? '+ ' + item.toppings.map((t) => t.name).join(', ') : null,
                  ].filter(Boolean);
                  return (
                    <View key={idx} className="flex-row justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-sm text-foreground">
                          <Text className="font-bold">{item.quantity}×</Text> {item.name}
                        </Text>
                        {opts.length > 0 && <Text className="text-xs text-muted-foreground mt-0.5">{opts.join(' · ')}</Text>}
                      </View>
                      <Text className="text-sm font-semibold text-foreground">{item.lineTotal.toLocaleString('vi-VN')}₫</Text>
                    </View>
                  );
                })}
              </View>
              <View className="border-t border-border pt-3 gap-1.5">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Tiền món</Text>
                  <Text className="text-sm text-muted-foreground">{order.subtotal.toLocaleString('vi-VN')}₫</Text>
                </View>
                {order.shippingFee > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted-foreground">Phí giao hàng</Text>
                    <Text className="text-sm text-muted-foreground">{order.shippingFee.toLocaleString('vi-VN')}₫</Text>
                  </View>
                )}
                {order.discountAmount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-accent-strong">Giảm bằng điểm ({order.pointsUsed} điểm)</Text>
                    <Text className="text-sm text-accent-strong">-{order.discountAmount.toLocaleString('vi-VN')}₫</Text>
                  </View>
                )}
                <View className="flex-row justify-between pt-1">
                  <Text className="font-bold text-base text-foreground">Tổng</Text>
                  <Text className="font-bold text-base text-primary">{order.total.toLocaleString('vi-VN')}₫</Text>
                </View>
              </View>
            </Section>

            {/* Khách tự hủy khi cửa hàng chưa nhận đơn */}
            {order.status === 'PENDING' &&
              (confirmCancel ? (
                <Section className="gap-3">
                  <Text className="text-sm font-semibold text-foreground">Bạn chắc chắn muốn hủy đơn {order.code}?</Text>
                  {order.pointsUsed > 0 && <Text className="text-xs text-muted-foreground">{order.pointsUsed} điểm đã dùng sẽ được hoàn lại.</Text>}
                  <View className="flex-row gap-2">
                    <Pressable onPress={() => setConfirmCancel(false)} className="flex-1 py-3 rounded-xl border border-border items-center">
                      <Text className="text-sm font-semibold text-foreground">Không hủy</Text>
                    </Pressable>
                    <Pressable onPress={cancel} disabled={cancelling} className={cn('flex-1 py-3 rounded-xl bg-destructive items-center', cancelling && 'opacity-50')}>
                      <Text className="text-white text-sm font-bold">{cancelling ? 'Đang hủy...' : 'Hủy đơn'}</Text>
                    </Pressable>
                  </View>
                </Section>
              ) : (
                <Pressable onPress={() => setConfirmCancel(true)} className="w-full py-3.5 rounded-2xl border border-destructive/40 bg-card items-center">
                  <Text className="text-destructive text-sm font-bold">Hủy đơn</Text>
                </Pressable>
              ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
