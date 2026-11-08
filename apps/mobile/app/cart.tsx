import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ArrowLeft, Banknote, CheckCircle2, Landmark, MapPin, Sparkles, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest, ApiError } from '@/lib/api';
import { bankConfig, vietQrImageUrl } from '@/lib/config';
import { useAuth } from '@/lib/stores/auth';
import { cartStockProblems, cartTotals, useCart } from '@/lib/stores/cart';
import { useProducts } from '@/lib/stores/products';
import { toast } from '@/lib/stores/toast';
import {
  CartItem,
  FREE_SHIP_THRESHOLD,
  ICE_LABELS,
  MAX_DISCOUNT_RATIO,
  money,
  Order,
  OrderType,
  PaymentMethod,
  SHIPPING_FEE,
  sugarLabel,
  VND_PER_REDEEMED_POINT,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import ProductImage from '@/components/ProductImage';
import { Button, Card, COLORS, Notice, Row, SectionTitle, SHADOW } from '@/components/ui';

// "50% đường · Ít đá · + Trân Châu Hoàng Kim"
function describeOptions(item: Pick<CartItem, 'sugar' | 'ice' | 'selectedToppings'>) {
  const parts: string[] = [];
  if (item.sugar !== undefined && item.sugar !== null) parts.push(sugarLabel(item.sugar));
  if (item.ice) parts.push(ICE_LABELS[item.ice]);
  if (item.selectedToppings?.length) parts.push('+ ' + item.selectedToppings.map((t) => t.name).join(', '));
  return parts.join(' · ');
}

// Hai ô chọn lớn (hình thức nhận / thanh toán) giống web
function OptionBox({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityState={{ selected: active }}
      style={active ? SHADOW.sm : undefined}
      className={cn('flex-1 p-3.5 rounded-xl border gap-1.5', active ? 'border-primary bg-primary/5' : 'border-border bg-neutral-50')}
    >
      {children}
    </Pressable>
  );
}

function StepButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn('w-9 h-9 rounded-lg bg-neutral-100 border border-border items-center justify-center', disabled && 'opacity-50')}
    >
      <Text className="font-bold text-sm text-foreground">{label}</Text>
    </Pressable>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { user, refreshUser, updateProfile } = useAuth();
  const { items, store, setQuantity, removeItem, clear } = useCart();
  const { getById, loaded, fetch } = useProducts();
  const { totalItems, totalPrice } = cartTotals(items);

  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [address, setAddress] = useState(user?.address ?? '');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>('CASH');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  // Menu & điểm mới nhất (phát hiện món vừa bị báo hết)
  useEffect(() => {
    fetch();
    refreshUser();
  }, [fetch, refreshUser]);

  const problems = useMemo(() => (loaded ? cartStockProblems(items, getById) : []), [loaded, items, getById]);
  const problemById = new Map(problems.map((p) => [p.productId, p]));

  const userPoints = user?.zenPoints ?? 0;
  const maxPointsAllowed = Math.floor((totalPrice * MAX_DISCOUNT_RATIO) / VND_PER_REDEEMED_POINT);
  const maxPoints = Math.min(userPoints, maxPointsAllowed);
  const points = usePoints ? Math.min(pointsToUse, maxPoints) : 0;
  const discount = points * VND_PER_REDEEMED_POINT;
  const shipping = orderType === 'DELIVERY' && totalPrice < FREE_SHIP_THRESHOLD ? SHIPPING_FEE : 0;
  const finalPrice = totalPrice - discount + shipping;

  const checkout = async () => {
    if (!store) return toast.error('Vui lòng chọn cửa hàng trước khi đặt');
    if (problems.length > 0) return toast.error('Giỏ hàng có món đã hết hoặc vượt số lượng còn lại, vui lòng sửa trước khi đặt');
    if (orderType === 'DELIVERY' && !address.trim()) return toast.error('Vui lòng cung cấp địa chỉ nhận hàng 📍');
    setPlacing(true);
    try {
      // Server tự tính lại giá, phí ship, giảm giá và kiểm tra món còn hàng
      const order = await apiRequest<Order>('/orders', {
        method: 'POST',
        body: {
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            toppingIds: i.selectedToppings?.map((t) => t.id) ?? [],
            sugar: i.sugar,
            ice: i.ice,
          })),
          orderType,
          address: orderType === 'DELIVERY' ? address.trim() : undefined,
          paymentMethod: payment,
          pointsToUse: points,
          storeId: store.id,
        },
      });
      if (saveAsDefault && orderType === 'DELIVERY') await updateProfile({ address: address.trim() }).catch(() => {});
      clear();
      refreshUser();
      fetch();
      setUsePoints(false);
      setPointsToUse(0);
      setPlaced(order);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 409) fetch();
      toast.error(e?.message ?? 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {/* Thanh tiêu đề */}
      <View style={SHADOW.sm} className="bg-card border-b border-border px-4 py-4 flex-row items-center gap-4">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/order'))}
          accessibilityLabel="Quay lại đặt món"
          className="p-2 bg-neutral-50 border border-border rounded-full"
        >
          <ArrowLeft size={16} color={COLORS.foreground} />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Giỏ hàng của bạn</Text>
        <View className="ml-auto bg-primary px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">{totalItems} Món</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View className="p-4">
          <Card className="items-center py-16">
            <Text style={{ fontSize: 64 }}>🛒</Text>
            <Text className="text-muted-foreground font-bold mt-4">Giỏ hàng của bạn đang trống</Text>
            <Text className="text-xs text-muted-foreground/70 mt-1 text-center px-6">
              Hãy chọn những món trà, cà phê hay bánh thơm ngon của chúng tôi nhé!
            </Text>
            <Button title="Chọn món ngay" onPress={() => router.navigate('/order')} className="mt-6" />
          </Card>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView contentContainerClassName="p-4 gap-4 pb-10" keyboardShouldPersistTaps="handled">
            {/* Món trong giỏ */}
            <View className="gap-3">
              {items.map((item) => {
                const product = getById(item.productId);
                const lineIds = [item.productId, ...(item.selectedToppings ?? []).map((t) => t.id)];
                const problem = lineIds.map((id) => problemById.get(id)).find(Boolean);
                const options = describeOptions(item);
                return (
                  <View
                    key={item.id}
                    className={cn('flex-row items-center gap-3 bg-card p-3 rounded-2xl border', problem ? 'border-destructive/40 bg-destructive/5' : 'border-border')}
                  >
                    <ProductImage
                      product={product ?? { name: item.name, category: item.sugar !== undefined ? 'MON_NUOC' : 'BANH', imageUrl: null }}
                      className="w-14 h-14 rounded-xl"
                      emojiSize={28}
                      dim={problem?.stock === 0}
                    />
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground text-sm leading-snug">{item.name}</Text>
                      {options ? <Text className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{options}</Text> : null}
                      {problem ? (
                        <Text className="text-[11px] font-bold text-destructive mt-1">
                          {problem.stock === 0
                            ? `"${problem.name}" đã hết — vui lòng xóa khỏi giỏ`
                            : `"${problem.name}" chỉ còn ${problem.stock} phần (giỏ đang có ${problem.needed}) — vui lòng giảm số lượng`}
                        </Text>
                      ) : (
                        <Text className="text-primary font-bold text-sm mt-1">{item.price.toLocaleString('vi-VN')}₫</Text>
                      )}
                    </View>
                    <View className="flex-row items-center gap-1 bg-neutral-50 border border-border p-1 rounded-lg">
                      <Pressable onPress={() => setQuantity(item.id, item.quantity - 1)} accessibilityLabel="Giảm số lượng" className="w-7 h-7 items-center justify-center">
                        <Text className="font-bold text-foreground">−</Text>
                      </Pressable>
                      <Text className="w-6 text-center font-bold text-sm">{item.quantity}</Text>
                      <Pressable
                        onPress={() => setQuantity(item.id, item.quantity + 1)}
                        disabled={!!problem || (product ? item.quantity >= product.stock : true)}
                        accessibilityLabel="Tăng số lượng"
                        className={cn('w-7 h-7 items-center justify-center', (!!problem || (product ? item.quantity >= product.stock : true)) && 'opacity-30')}
                      >
                        <Text className="font-bold text-foreground">+</Text>
                      </Pressable>
                    </View>
                    <Pressable onPress={() => removeItem(item.id)} accessibilityLabel={`Xóa ${item.name}`} className="p-2">
                      <Trash2 size={20} color={COLORS.destructive} />
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {/* Hình thức nhận hàng */}
            <Card>
              <SectionTitle>📋 Hình thức nhận hàng</SectionTitle>
              <View className="flex-row gap-3">
                {(
                  [
                    { key: 'DELIVERY', icon: '🛵', label: 'Giao tận nơi (Ship đi)' },
                    { key: 'STORE', icon: '🏠', label: 'Đến nhận tại quán' },
                  ] as const
                ).map((o) => (
                  <OptionBox key={o.key} active={orderType === o.key} onPress={() => setOrderType(o.key)}>
                    <Text className="text-lg text-center">{o.icon}</Text>
                    <Text className={cn('text-xs font-bold text-center', orderType === o.key ? 'text-primary' : 'text-muted-foreground')}>{o.label}</Text>
                  </OptionBox>
                ))}
              </View>
            </Card>

            {/* Địa chỉ / nhận tại quán */}
            {orderType === 'DELIVERY' ? (
              <Card>
                <SectionTitle>📍 Địa chỉ nhận hàng (giao tận nơi)</SectionTitle>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                  placeholderTextColor="rgba(107, 94, 83, 0.5)"
                  multiline
                  className="min-h-[64px] px-4 py-3 bg-neutral-50 border border-border rounded-xl text-xs font-semibold text-foreground leading-5"
                />
                <Pressable onPress={() => setSaveAsDefault((v) => !v)} className="flex-row items-center gap-2.5 mt-3" accessibilityState={{ checked: saveAsDefault }}>
                  <View className={cn('w-4 h-4 rounded border items-center justify-center', saveAsDefault ? 'bg-primary border-primary' : 'border-border bg-card')}>
                    {saveAsDefault && <Text className="text-white text-[10px]">✓</Text>}
                  </View>
                  <Text className="text-[11px] font-bold text-muted-foreground">Lưu làm địa chỉ giao hàng mặc định cho lần sau</Text>
                </Pressable>
              </Card>
            ) : (
              <View className="bg-[#FAF7F2] border border-border p-5 rounded-2xl flex-row gap-3">
                <Text className="text-xl">🏪</Text>
                <View className="flex-1 gap-1">
                  <Text className="text-xs font-black text-primary uppercase tracking-wider">Đến nhận trực tiếp tại cửa hàng</Text>
                  <Text className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                    Bạn sẽ nhận nước trực tiếp tại chi nhánh của Chiba. Đơn hàng này không có phí vận chuyển (0đ). Bạn chỉ cần đưa mã đơn hàng cho nhân viên tại quầy khi
                    đến nhận.
                  </Text>
                </View>
              </View>
            )}

            {/* Thanh toán */}
            <Card>
              <SectionTitle>💳 Phương thức thanh toán</SectionTitle>
              <View className="flex-row gap-3">
                {(
                  [
                    { key: 'CASH', Icon: Banknote, title: 'Tiền mặt', desc: orderType === 'DELIVERY' ? 'Trả khi nhận hàng' : 'Trả tại quầy' },
                    { key: 'BANK_TRANSFER', Icon: Landmark, title: 'Chuyển khoản', desc: 'Quét mã VietQR bằng app ngân hàng' },
                  ] as const
                ).map(({ key, Icon, title, desc }) => {
                  const active = payment === key;
                  return (
                    <OptionBox key={key} active={active} onPress={() => setPayment(key)}>
                      <Icon size={20} color={active ? COLORS.primary : COLORS.muted} />
                      <Text className={cn('text-sm font-bold', active ? 'text-primary' : 'text-foreground')}>{title}</Text>
                      <Text className="text-[11px] text-muted-foreground leading-snug">{desc}</Text>
                    </OptionBox>
                  );
                })}
              </View>
              {payment === 'BANK_TRANSFER' && (
                <View className="mt-4">
                  <Notice>
                    {bankConfig.bankId && bankConfig.accountNo
                      ? 'Sau khi đặt hàng, mã QR chuyển khoản (đã điền sẵn số tiền và nội dung là mã đơn) sẽ hiện ra. Nhân viên xác nhận đơn sau khi nhận được tiền.'
                      : '⚠️ Cửa hàng chưa cấu hình tài khoản nhận chuyển khoản. Bạn vẫn đặt được, nhân viên sẽ liên hệ gửi thông tin chuyển khoản.'}
                  </Notice>
                </View>
              )}
            </Card>

            {/* Điểm Chiba */}
            <Card>
              <SectionTitle>🪙 Chiba Points (Điểm tích lũy)</SectionTitle>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 gap-0.5">
                  <Text className="text-xs font-bold text-foreground">
                    Bạn đang có: <Text className="text-accent font-black text-sm">{userPoints}</Text> điểm
                  </Text>
                  <Text className="text-[10px] text-muted-foreground font-medium">
                    Trị giá quy đổi: {(userPoints * VND_PER_REDEEMED_POINT).toLocaleString('vi-VN')}₫ (1 điểm = 500đ)
                  </Text>
                </View>
                {userPoints > 0 ? (
                  <Switch
                    value={usePoints}
                    onValueChange={(v) => {
                      setUsePoints(v);
                      setPointsToUse(v ? maxPoints : 0);
                    }}
                    trackColor={{ true: COLORS.accent, false: '#E5E5E5' }}
                    thumbColor="#fff"
                  />
                ) : (
                  <View className="bg-neutral-100 border border-border/60 px-2 py-1 rounded">
                    <Text className="text-[10px] font-bold text-muted-foreground">Chưa có điểm</Text>
                  </View>
                )}
              </View>

              {usePoints && userPoints > 0 && (
                <View className="pt-3 mt-3 border-t border-dashed border-border/60 gap-3">
                  <Text className="text-[11px] font-bold text-foreground">Chọn số điểm muốn dùng để giảm giá (giảm tối đa 20%):</Text>
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <StepButton label="-5" onPress={() => setPointsToUse(Math.max(0, points - 5))} disabled={points <= 0} />
                    <StepButton label="-1" onPress={() => setPointsToUse(Math.max(0, points - 1))} disabled={points <= 0} />
                    <TextInput
                      value={String(points)}
                      onChangeText={(t) => setPointsToUse(Math.max(0, Math.min(parseInt(t, 10) || 0, maxPoints)))}
                      keyboardType="number-pad"
                      className="w-16 text-center font-black text-sm bg-neutral-50 border border-border py-1.5 rounded-lg text-foreground"
                    />
                    <StepButton label="+1" onPress={() => setPointsToUse(Math.min(maxPoints, points + 1))} disabled={points >= maxPoints} />
                    <StepButton label="+5" onPress={() => setPointsToUse(Math.min(maxPoints, points + 5))} disabled={points >= maxPoints} />
                    <Pressable onPress={() => setPointsToUse(maxPoints)} className="bg-accent/10 border border-accent/20 px-2.5 py-2 rounded-lg">
                      <Text className="text-[10px] font-black text-accent">Tối đa</Text>
                    </Pressable>
                  </View>
                  <View className="flex-row items-center gap-1.5 p-2 bg-[#FAF7F2] rounded-lg border border-border/80">
                    <Sparkles size={14} color={COLORS.accent} />
                    <Text className="text-[10px] text-accent-strong font-semibold flex-1">
                      Giảm giá áp dụng: <Text className="font-black">{discount.toLocaleString('vi-VN')}₫</Text> (Khấu trừ {points} điểm)
                    </Text>
                  </View>
                  {maxPointsAllowed < userPoints && (
                    <Text className="text-[10px] text-muted-foreground font-semibold">
                      🛡️ Giảm tối đa 20% giá trị đơn hàng (giới hạn {maxPointsAllowed} điểm).
                    </Text>
                  )}
                </View>
              )}
              <View className="mt-3">
                <Notice>💡 Quy tắc tích điểm: Mỗi 10.000đ thanh toán tích lũy 1 điểm, tính trên số tiền thực trả sau khi trừ điểm.</Notice>
              </View>
            </Card>

            {/* Tổng tiền */}
            <Card className="gap-4">
              <View className="gap-1 border-b border-border pb-4">
                <View className="flex-row justify-between gap-3 py-1">
                  <View className="flex-row items-center gap-1">
                    <MapPin size={14} color={COLORS.muted} />
                    <Text className="text-xs text-muted-foreground font-medium">Chi nhánh:</Text>
                  </View>
                  {store ? (
                    <Text className="text-xs text-foreground font-bold text-right flex-1">{store.name}</Text>
                  ) : (
                    <Pressable onPress={() => router.push('/stores')}>
                      <Text className="text-xs text-accent-strong font-bold underline">Chọn cửa hàng</Text>
                    </Pressable>
                  )}
                </View>
                <Row label="Tổng số món:" value={`${totalItems} cốc/phần`} />
                <Row label="Tiền món:" value={`${totalPrice.toLocaleString('vi-VN')}₫`} />
                <Row
                  label="Phí giao hàng:"
                  value={shipping ? `${shipping.toLocaleString('vi-VN')}₫` : orderType === 'DELIVERY' ? 'Miễn phí (Đơn ≥ 100k) 🎁' : 'Miễn phí (Nhận tại quán) 🎁'}
                  tone={shipping ? undefined : 'primary'}
                />
                {discount > 0 && <Row label={`🪙 Giảm giá bằng điểm (${points} điểm):`} value={`-${discount.toLocaleString('vi-VN')}₫`} tone="accent" />}
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-foreground">Tổng thanh toán:</Text>
                <Text className="text-primary text-2xl font-bold">{finalPrice.toLocaleString('vi-VN')}₫</Text>
              </View>
              <Button
                title={placing ? 'Đang gửi đơn...' : problems.length > 0 ? 'Giỏ có món vượt số lượng còn lại' : '✓ Đặt Hàng Ngay'}
                onPress={checkout}
                loading={placing}
                disabled={problems.length > 0}
                className="py-4"
              />
              <Button title="Quay lại mua thêm" variant="outline" onPress={() => router.navigate('/order')} />
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {placed && (
        <OrderSuccessModal
          order={placed}
          onTrack={() => {
            const id = placed.id;
            setPlaced(null);
            router.replace({ pathname: '/orders/[id]', params: { id } });
          }}
          onClose={() => {
            setPlaced(null);
            router.navigate('/');
          }}
        />
      )}
    </SafeAreaView>
  );
}

function OrderSuccessModal({ order, onTrack, onClose }: { order: Order; onTrack: () => void; onClose: () => void }) {
  const qr = order.paymentMethod === 'BANK_TRANSFER' ? vietQrImageUrl(order.total, order.code) : null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 bg-black/60 items-center justify-center p-5">
        <ScrollView style={[SHADOW.modal, { maxHeight: '92%', width: '100%', maxWidth: 384 }]} className="bg-card rounded-2xl border border-border" contentContainerClassName="p-6 gap-5 items-center">
          <View className="w-16 h-16 bg-primary/10 items-center justify-center rounded-full">
            <CheckCircle2 size={40} color={COLORS.primary} />
          </View>
          <View className="gap-1.5 items-center">
            <Text className="text-2xl font-black text-primary">Đặt hàng thành công!</Text>
            <Text className="text-sm font-bold text-foreground">
              Mã đơn: <Text className="tracking-wider">{order.code}</Text>
            </Text>
            <Text className="text-xs text-muted-foreground text-center px-2 leading-relaxed">
              Cửa hàng đã nhận đơn. Tổng thanh toán <Text className="font-bold text-foreground">{money(order.total)}</Text> ·{' '}
              {order.paymentMethod === 'CASH' ? (order.orderType === 'DELIVERY' ? 'Tiền mặt khi nhận hàng' : 'Tiền mặt tại quầy') : 'Chuyển khoản'}.
            </Text>
          </View>

          {order.paymentMethod === 'BANK_TRANSFER' && (
            <View className="w-full bg-neutral-50 border border-border rounded-xl p-4 gap-3 items-center">
              {qr ? (
                <>
                  <Text className="text-xs font-bold text-foreground">Quét mã bằng app ngân hàng để chuyển khoản</Text>
                  <Image source={{ uri: qr }} style={{ width: 224, height: 224, borderRadius: 8, backgroundColor: '#fff' }} contentFit="contain" />
                  <Text className="text-[11px] text-muted-foreground self-start">
                    Ngân hàng: <Text className="font-bold text-foreground">{bankConfig.bankId}</Text> · STK:{' '}
                    <Text className="font-bold text-foreground">{bankConfig.accountNo}</Text>
                    {'\n'}Nội dung: <Text className="font-bold text-foreground">{order.code}</Text> (đã điền sẵn trong mã QR)
                  </Text>
                </>
              ) : (
                <Text className="text-xs text-muted-foreground text-center">
                  Cửa hàng sẽ liên hệ gửi thông tin chuyển khoản. Nội dung chuyển khoản: <Text className="font-bold">{order.code}</Text>
                </Text>
              )}
            </View>
          )}

          {order.pointsEarned > 0 && (
            <View className="w-full bg-orange-50 p-4 rounded-xl border border-orange-200 flex-row items-center justify-center gap-2">
              <Sparkles size={20} color={COLORS.accent} />
              <Text className="text-xs font-bold text-accent-strong flex-shrink">
                Bạn sẽ được cộng <Text className="text-sm font-black">+{order.pointsEarned}</Text> điểm khi đơn hoàn thành!
              </Text>
            </View>
          )}

          <View className="w-full gap-2">
            <Button title="Theo dõi đơn hàng" onPress={onTrack} />
            <Button title="Về trang chủ" variant="outline" onPress={onClose} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

