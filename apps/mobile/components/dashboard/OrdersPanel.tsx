import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Bike, Clock, Store } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { confirm } from '@/lib/confirm';
import { toast } from '@/lib/stores/toast';
import {
  formatDateTime,
  ICE_LABELS,
  isActiveOrder,
  nextStaffStep,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  OrderStatus,
  PAYMENT_LABELS,
  StaffOrder,
  sugarLabel,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { Chip, COLORS } from '@/components/ui';

type Filter = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ALL';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ACTIVE', label: 'Đang xử lý' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'ALL', label: 'Tất cả' },
];

interface Props {
  orders: StaffOrder[];
  loading: boolean;
  onRefresh: () => void;
  onUpdated: (order: StaffOrder) => void;
}

// Giống web: components/dashboard/OrderFulfillment.tsx
export default function OrdersPanel({ orders, loading, onRefresh, onUpdated }: Props) {
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = orders.filter((o) => (filter === 'ALL' ? true : filter === 'ACTIVE' ? isActiveOrder(o.status) : o.status === filter));

  const setPaid = async (order: StaffOrder, paid: boolean) => {
    if (!paid && !(await confirm('Bỏ xác nhận?', `Bỏ xác nhận đã nhận tiền cho đơn ${order.code}?`, 'Bỏ xác nhận', true))) return;
    setBusyId(order.id);
    try {
      const updated = await apiRequest<StaffOrder>(`/orders/${order.id}/payment`, { method: 'PATCH', body: { paid } });
      onUpdated({ ...order, ...updated });
      toast.success(paid ? `Đơn ${order.code}: đã nhận tiền` : `Đơn ${order.code}: đã bỏ xác nhận thanh toán`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Không cập nhật được thanh toán');
    } finally {
      setBusyId(null);
    }
  };

  const updateStatus = async (order: StaffOrder, status: OrderStatus) => {
    // Đơn chuyển khoản chưa nhận tiền: hỏi lại trước khi nhận đơn để tránh pha chế trước khi khách trả
    if (
      status === 'PREPARING' &&
      order.paymentMethod === 'BANK_TRANSFER' &&
      !order.paidAt &&
      !(await confirm('Chưa nhận tiền', `Đơn ${order.code} chuyển khoản nhưng CHƯA xác nhận nhận tiền. Vẫn nhận đơn?`, 'Vẫn nhận đơn'))
    ) {
      return;
    }
    if (status === 'CANCELLED' && !(await confirm('Hủy đơn?', `Hủy đơn ${order.code}? Kho và điểm của khách được trả lại.`, 'Hủy đơn', true))) return;
    setBusyId(order.id);
    try {
      const updated = await apiRequest<StaffOrder>(`/orders/${order.id}/status`, { method: 'PATCH', body: { status } });
      onUpdated({ ...order, ...updated });
      toast.success(
        status === 'COMPLETED' && order.pointsEarned > 0
          ? `Đơn ${order.code} hoàn thành · đã cộng ${order.pointsEarned} điểm cho khách`
          : `Đơn ${order.code}: ${ORDER_STATUS_LABELS[status]}`,
      );
    } catch (e: any) {
      toast.error(e?.message ?? 'Không cập nhật được đơn');
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ScrollView
      contentContainerClassName="px-5 pb-10 gap-3"
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-1">
        {FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </ScrollView>

      {visible.length === 0 ? (
        <View className="py-10 bg-neutral-50 rounded-xl border border-dashed border-border">
          <Text className="text-xs text-muted-foreground text-center">{loading ? 'Đang tải đơn hàng...' : 'Không có đơn hàng nào.'}</Text>
        </View>
      ) : (
        visible.map((order) => {
          const [bg, fg] = ORDER_STATUS_COLORS[order.status];
          const next = nextStaffStep(order);
          const busy = busyId === order.id;
          const transfer = order.paymentMethod === 'BANK_TRANSFER';
          return (
            <View key={order.id} className={cn('p-4 bg-card rounded-xl border border-border gap-3', busy && 'opacity-60')}>
              <View className="flex-row items-center justify-between gap-2">
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-sm font-black text-primary tracking-wider">{order.code}</Text>
                  <Text className="text-[10px] text-muted-foreground">{formatDateTime(order.createdAt)}</Text>
                </View>
                <View style={{ backgroundColor: bg }} className="flex-row items-center gap-1 px-2 py-0.5 rounded">
                  {order.status === 'PENDING' && <Clock size={12} color={fg} />}
                  <Text style={{ color: fg }} className="text-[10px] font-bold">
                    {ORDER_STATUS_LABELS[order.status]}
                  </Text>
                </View>
              </View>

              <View className="gap-1.5 border-y border-border/40 py-2.5">
                <Text className="text-xs font-bold text-foreground">
                  {order.customerName}
                  {order.customerPhone ? <Text className="font-medium text-muted-foreground"> · {order.customerPhone}</Text> : null}
                </Text>
                {order.storeName && <Text className="text-xs font-semibold text-primary">🏪 {order.storeName}</Text>}
                <View className="flex-row gap-1.5">
                  {order.orderType === 'DELIVERY' ? <Bike size={14} color={COLORS.muted} /> : <Store size={14} color={COLORS.muted} />}
                  <Text className="text-xs text-muted-foreground font-semibold flex-1">
                    {order.orderType === 'DELIVERY' ? `Giao tới: ${order.address}` : 'Khách đến nhận tại quán'}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between gap-2 flex-wrap">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-semibold text-foreground">💳 {PAYMENT_LABELS[order.paymentMethod]}</Text>
                    {order.paidAt ? (
                      <View className="bg-green-100 px-1.5 py-0.5 rounded">
                        <Text className="text-green-700 text-[10px] font-bold">Đã nhận tiền</Text>
                      </View>
                    ) : order.status !== 'CANCELLED' ? (
                      <View className="bg-amber-100 px-1.5 py-0.5 rounded">
                        <Text className="text-amber-800 text-[10px] font-bold">Chưa nhận tiền</Text>
                      </View>
                    ) : null}
                  </View>
                  {order.status !== 'CANCELLED' && transfer &&
                    (order.paidAt ? (
                      <Pressable onPress={() => setPaid(order, false)} disabled={busy}>
                        <Text className="text-[10px] text-muted-foreground underline">Bỏ xác nhận</Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => setPaid(order, true)} disabled={busy} className="bg-green-600 px-2.5 py-1.5 rounded-lg">
                        <Text className="text-[11px] font-bold text-white">✓ Đã nhận tiền</Text>
                      </Pressable>
                    ))}
                </View>
                {transfer && !order.paidAt && order.status !== 'CANCELLED' && (
                  <Text className="text-[11px] text-accent-strong">
                    Kiểm tra tài khoản ngân hàng có khoản {order.total.toLocaleString('vi-VN')}₫ với nội dung “{order.code}”.
                  </Text>
                )}

                <View className="bg-neutral-50 p-2.5 rounded-lg border border-border/50 gap-1.5 mt-1">
                  {order.items.map((item, idx) => {
                    const opts = [
                      item.sugar !== null ? sugarLabel(item.sugar) : null,
                      item.ice ? ICE_LABELS[item.ice] : null,
                      item.toppings.length ? '+ ' + item.toppings.map((t) => t.name).join(', ') : null,
                    ].filter(Boolean);
                    return (
                      <View key={idx} className="flex-row justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-xs text-foreground">
                            <Text className="font-bold">{item.quantity}x</Text> {item.name}
                          </Text>
                          {opts.length > 0 && <Text className="text-[11px] text-muted-foreground">{opts.join(' · ')}</Text>}
                        </View>
                        <Text className="text-xs font-semibold text-foreground">{item.lineTotal.toLocaleString('vi-VN')}₫</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row items-center justify-between gap-2 flex-wrap">
                <View>
                  <Text className="text-xs font-black text-primary">Tổng: {order.total.toLocaleString('vi-VN')}₫</Text>
                  {(order.discountAmount > 0 || order.shippingFee > 0) && (
                    <Text className="text-[10px] text-muted-foreground">
                      {order.shippingFee > 0 ? `Ship ${order.shippingFee.toLocaleString('vi-VN')}₫ ` : ''}
                      {order.discountAmount > 0 ? `· Giảm điểm -${order.discountAmount.toLocaleString('vi-VN')}₫` : ''}
                    </Text>
                  )}
                </View>
                {next ? (
                  <View className="flex-row gap-2">
                    <Pressable onPress={() => updateStatus(order, 'CANCELLED')} disabled={busy} className="border border-destructive/30 px-3 py-2 rounded-lg">
                      <Text className="text-destructive text-[11px] font-bold">Hủy</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => updateStatus(order, next.status)}
                      disabled={busy}
                      className={cn('px-3 py-2 rounded-lg', next.status === 'COMPLETED' ? 'bg-primary' : 'bg-blue-600')}
                    >
                      <Text className="text-white text-[11px] font-bold">{next.label}</Text>
                    </Pressable>
                  </View>
                ) : order.status === 'CANCELLED' && order.cancelledBy === 'CUSTOMER' ? (
                  <Text className="text-[11px] text-muted-foreground">Khách tự hủy</Text>
                ) : null}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
