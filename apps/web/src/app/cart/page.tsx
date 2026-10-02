'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useGetCart, useNotificationStore, useProfile } from '@chiba/api-client';
import { CartItemsList } from '@/components/cart/CartItemsList';
import { OrderTypeSection } from '@/components/cart/OrderTypeSection';
import { DeliveryAddress } from '@/components/cart/DeliveryAddress';
import { LoyaltyPoints } from '@/components/cart/LoyaltyPoints';
import { BillingSummary } from '@/components/cart/BillingSummary';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { calculateCartTotals } from '@chiba/api-client/src/lib/cart-pricing';


const CartPage = () => {
  const { data: cart, isLoading: isCartLoading } = useGetCart(api);
  const { data: user, isLoading: isUserLoading } = useProfile(api);
  const { success } = useNotificationStore()

  const router = useRouter();

  const [earnedPoints, setEarnedPoints] = useState(0);

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
        Đang tải...
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
              setEarnedPoints={setEarnedPoints}

            // showSuccess={showSuccess} 
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

      {/* GORGEOUS TRANSACTION SUCCESS MODAL OVERLAY */}
      {success && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-card w-full max-w-sm p-6 rounded-2xl border border-border shadow-modal text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mx-auto">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-primary tracking-tight">Đặt Hàng Thành Công!</h2>
              <p className="text-xs text-muted-foreground px-4 leading-relaxed">
                Đơn hàng của bạn đã được tiếp nhận và đang tiến hành pha chế tại chi nhánh gần nhất.
              </p>
            </div>

            {/* Loyalty points loyalty box */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-200 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-spin duration-3000" />
              <span className="text-xs font-bold text-accent-foreground">
                Bạn đã được tích lũy thêm <strong className="text-sm font-black">+{earnedPoints}</strong> điểm Chiba!
              </span>
            </div>

            <Button
              onClick={() => {
                // setShowSuccessModal(false);
                router.push('/');
              }}
              className="primary-btn mt-4 shadow-premium"
            >
              Đồng ý & Tiếp tục
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
