'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useProductStore } from '@/lib/stores/useProductStore';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import CartItemsList from '@/components/cart/CartItemsList';
import OrderTypeSection from '@/components/cart/OrderTypeSection';
import DeliveryAddress from '@/components/cart/DeliveryAddress';
import LoyaltyPoints from '@/components/cart/LoyaltyPoints';
import PaymentMethodSection from '@/components/cart/PaymentMethodSection';
import BillingSummary, { VND_PER_REDEEMED_POINT } from '@/components/cart/BillingSummary';
import OrderSuccessModal from '@/components/cart/OrderSuccessModal';
import Validation from '@/components/Validation';
import PageLoader from '@/components/ui/PageLoader';
import { Order, OrderType, PaymentMethod } from '@/types';

export default function CartPage() {
  const { items, totalPrice, totalItems } = useCart();
  const { user, ready } = useRequireAuth();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const router = useRouter();

  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState(user?.address || '');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  // Tải menu mới nhất để phát hiện món vừa bị báo hết, và điểm mới nhất của khách.
  useEffect(() => {
    fetchProducts(true);
    refreshUser();
  }, [fetchProducts, refreshUser]);

  const userPoints = user?.zenPoints || 0;
  const maxPointsAllowed = Math.floor((totalPrice * 0.2) / VND_PER_REDEEMED_POINT); // giảm tối đa 20%
  const maxPointsPossible = Math.min(userPoints, maxPointsAllowed);

  useEffect(() => {
    if (usePoints && pointsToUse > maxPointsPossible) setPointsToUse(maxPointsPossible);
  }, [usePoints, pointsToUse, maxPointsPossible]);

  useEffect(() => {
    if (user?.address && !address) setAddress(user.address);
  }, [user, address]);

  if (!ready) return <PageLoader />;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/order"
            aria-label="Quay lại đặt món"
            className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Giỏ hàng của bạn</h1>
          <span className="ml-auto bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">{totalItems} Món</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Validation />

        {items.length > 0 ? (
          <div className="space-y-4">
            <CartItemsList />

            <OrderTypeSection orderType={orderType} setOrderType={setOrderType} />

            <DeliveryAddress
              orderType={orderType}
              address={address}
              setAddress={setAddress}
              saveAsDefault={saveAsDefault}
              setSaveAsDefault={setSaveAsDefault}
            />

            <PaymentMethodSection orderType={orderType} value={paymentMethod} onChange={setPaymentMethod} />

            <LoyaltyPoints
              userPoints={userPoints}
              usePoints={usePoints}
              setUsePoints={setUsePoints}
              pointsToUse={pointsToUse}
              setPointsToUse={setPointsToUse}
              maxPointsPossible={maxPointsPossible}
              maxPointsAllowed={maxPointsAllowed}
            />

            <BillingSummary
              orderType={orderType}
              address={address}
              paymentMethod={paymentMethod}
              usePoints={usePoints}
              pointsToUse={pointsToUse}
              saveAsDefault={saveAsDefault}
              onSuccess={(order) => {
                setUsePoints(false);
                setPointsToUse(0);
                setPlacedOrder(order);
              }}
            />
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
            <div className="text-7xl mb-4">🛒</div>
            <p className="text-muted-foreground font-bold">Giỏ hàng của bạn đang trống</p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-[250px] mx-auto px-4">
              Hãy chọn những món trà, cà phê hay bánh thơm ngon của chúng tôi nhé!
            </p>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl mt-6 shadow-sm transition active:scale-95 text-sm"
            >
              Chọn món ngay
            </Link>
          </div>
        )}
      </div>

      {placedOrder && (
        <OrderSuccessModal
          order={placedOrder}
          onClose={() => {
            setPlacedOrder(null);
            router.push('/home');
          }}
        />
      )}
    </div>
  );
}
