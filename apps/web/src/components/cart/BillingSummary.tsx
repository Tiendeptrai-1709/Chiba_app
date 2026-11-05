'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Coins, MapPin } from 'lucide-react';
import { getSelectedStore, SelectedStore } from '@/lib/selectedStore';
import { cartStockProblems } from '@/lib/stock';
import { useCart } from '@/lib/context/CartContext';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { useProductStore } from '@/lib/stores/useProductStore';
import { apiRequest, ApiError } from '@/lib/api/client';
import { Order, OrderType, PaymentMethod } from '@/types';

// Phải khớp với quy tắc ở backend (apps/api/src/services/order.service.ts)
export const FREE_SHIP_THRESHOLD = 100_000;
export const SHIPPING_FEE = 20_000;
export const VND_PER_REDEEMED_POINT = 500;

interface BillingSummaryProps {
  orderType: OrderType;
  address: string;
  paymentMethod: PaymentMethod;
  usePoints: boolean;
  pointsToUse: number;
  saveAsDefault: boolean;
  onSuccess: (order: Order) => void;
}

function BillingSummary({
  orderType,
  address,
  paymentMethod,
  usePoints,
  pointsToUse,
  saveAsDefault,
  onSuccess,
}: BillingSummaryProps) {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user, updateProfileAddress, refreshUser } = useAuthStore();
  const { showError } = useNotificationStore();
  const { getById, loaded, fetchProducts } = useProductStore();
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState<SelectedStore | null>(null);

  useEffect(() => setStore(getSelectedStore()), []);

  const discountAmount = usePoints ? pointsToUse * VND_PER_REDEEMED_POINT : 0;
  const shippingFee = orderType === 'DELIVERY' && totalPrice < FREE_SHIP_THRESHOLD ? SHIPPING_FEE : 0;
  const finalPrice = totalPrice - discountAmount + shippingFee;

  // Có món đã hết hoặc giỏ đang đặt nhiều hơn số còn lại
  const hasUnavailable = loaded && cartStockProblems(items, getById).length > 0;

  const handleCheckout = async () => {
    if (!user) return showError('Bạn cần đăng nhập để đặt hàng');
    if (items.length === 0) return showError('Giỏ hàng trống');
    if (hasUnavailable) return showError('Giỏ hàng có món đã hết hoặc vượt số lượng còn lại, vui lòng sửa trước khi đặt');
    if (orderType === 'DELIVERY' && !address.trim()) {
      return showError('Vui lòng cung cấp địa chỉ nhận hàng để shop tiến hành giao hàng 📍');
    }

    setLoading(true);
    showError('');
    try {
      // Server tự tính lại giá, phí ship, giảm giá và kiểm tra món còn hàng.
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
          paymentMethod,
          pointsToUse: usePoints ? pointsToUse : 0,
          storeId: store?.id,
        },
      });

      if (saveAsDefault && orderType === 'DELIVERY') {
        await updateProfileAddress(address.trim()).catch(() => {});
      }
      clearCart();
      await refreshUser(); // cập nhật số điểm sau khi dùng điểm
      onSuccess(order);
    } catch (err) {
      // Món vừa bị báo hết → tải lại menu để giỏ hàng đánh dấu món đó.
      if (err instanceof ApiError && err.status === 409) fetchProducts(true);
      showError(err instanceof Error ? err.message : 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
      <div className="space-y-2 border-b border-border pb-4">
        <div className="flex justify-between gap-3 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1 shrink-0">
            <MapPin className="w-3.5 h-3.5" /> Chi nhánh:
          </span>
          {store ? (
            <span className="text-foreground font-bold text-right">{store.name}</span>
          ) : (
            <Link href="/stores" className="text-accent-strong font-bold underline underline-offset-2">
              Chọn cửa hàng
            </Link>
          )}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Tổng số món:</span>
          <span>{totalItems} cốc/phần</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Tiền món:</span>
          <span className="text-foreground font-bold">{totalPrice.toLocaleString('vi-VN')}₫</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Phí giao hàng:</span>
          {shippingFee === 0 ? (
            <span className="text-primary font-bold">
              {orderType === 'DELIVERY' ? 'Miễn phí (Đơn ≥ 100k) 🎁' : 'Miễn phí (Nhận tại quán) 🎁'}
            </span>
          ) : (
            <span className="text-foreground font-bold">{shippingFee.toLocaleString('vi-VN')}₫</span>
          )}
        </div>
        {usePoints && discountAmount > 0 && (
          <div className="flex justify-between text-xs text-accent-strong font-semibold bg-orange-50 border border-orange-100 p-2.5 rounded-xl">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-accent" /> Giảm giá bằng điểm ({pointsToUse} điểm):
            </span>
            <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-base font-bold text-foreground pt-1">
        <span>Tổng thanh toán:</span>
        <span className="text-primary text-2xl tracking-tight">{finalPrice.toLocaleString('vi-VN')}₫</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || hasUnavailable}
        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-premium transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {loading ? 'Đang gửi đơn...' : hasUnavailable ? 'Giỏ có món vượt số lượng còn lại' : '✓ Đặt Hàng Ngay'}
      </button>

      <Link
        href="/order"
        className="block text-center w-full bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground font-semibold py-3 rounded-xl transition active:scale-[0.98] text-sm"
      >
        Quay lại mua thêm
      </Link>
    </div>
  );
}

export default BillingSummary;
