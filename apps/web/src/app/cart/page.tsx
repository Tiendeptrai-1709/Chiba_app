'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useGetCart, useProfile } from '@chiba/api-client';
import { CartItemsList } from '@/components/cart/CartItemsList';
import { OrderTypeSection } from '@/components/cart/OrderTypeSection';
import { DeliveryAddress } from '@/components/cart/DeliveryAddress';
import { LoyaltyPoints } from '@/components/cart/LoyaltyPoints';
import { BillingSummary } from '@/components/cart/BillingSummary';
import { api } from '@/lib/axios';
import { calculateCartTotals } from '@chiba/api-client/src/lib/cart-pricing';


const CartPage = () => {
  const { data: cart, isLoading: isCartLoading } = useGetCart(api);
  const { data: user, isLoading: isUserLoading } = useProfile(api);

  const router = useRouter();

  // Address and Delivery state
  const [address, setAddress] = useState(user?.address || '');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');

  // Points discount states
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  const items = cart?.items ?? [];
  const userPoints = user?.zenPoints ?? 0;

  const {
    maxPointsAllowed,
  } = calculateCartTotals({
    items,
    orderType,
    pointsToUse: 0,
  });

  const maxPointsPossible = Math.min(
    userPoints,
    maxPointsAllowed,
  );

  useEffect(() => {
    if (!usePoints) return;

    setPointsToUse((current) =>
      Math.min(current, maxPointsPossible),
    );
  }, [usePoints, maxPointsPossible]);

  useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user?.address]);

  if (isUserLoading || isCartLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang tải giỏ hàng
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Header sticky */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Giỏ hàng của bạn</h1>
          <span className="ml-auto bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
            {cart.items.length} Món
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {cart.items.length > 0 ? (
          <div className="space-y-4">
            {/* Order Type Section */}
            <OrderTypeSection orderType={orderType} setOrderType={setOrderType} />

            {/* Delivery Address Input Section (Conditional) */}
            <DeliveryAddress
              orderType={orderType}
              address={address}
              setAddress={setAddress}
              saveAsDefault={saveAsDefault}
              setSaveAsDefault={setSaveAsDefault} />

            {/* Cart Items List */}
            <CartItemsList />

            {/* Loyalty Points Section */}
            <LoyaltyPoints
              userPoints={userPoints}
              usePoints={usePoints}
              setUsePoints={setUsePoints}
              pointsToUse={pointsToUse}
              setPointsToUse={setPointsToUse}
              maxPointsPossible={maxPointsPossible}
              maxPointsAllowed={maxPointsAllowed}
            />

            {/* Billing Summary Box */}
            <BillingSummary
              orderType={orderType}
              address={address}
              usePoints={usePoints}
              pointsToUse={pointsToUse}
              saveAsDefault={saveAsDefault}
            />
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
            <div className="text-7xl mb-4 animate-pulse">🛒</div>
            <p className="text-muted-foreground font-bold">Giỏ hàng của bạn đang trống</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[250px] mx-auto px-4">
              Hãy chọn những món trà, cà phê hay sữa tươi thơm ngon nhất của chúng tôi nhé!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl mt-6 shadow-sm hover:shadow-premium transition active:scale-95 text-sm"
            >
              Chọn Món Ngon Ngay
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}

export default CartPage;
