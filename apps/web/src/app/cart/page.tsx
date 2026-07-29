'use client';

// import React, { useState, useEffect } from 'react';
// // import { useCart } from '@/lib/context/CartContext';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { ArrowLeft, Sparkles, CheckCircle2} from 'lucide-react';
// import CartItemsList from '@/components/cart/CartItemsList';
// import OrderTypeSection from '@/components/cart/OrderTypeSection';
// import DeliveryAddress from '@/components/cart/DeliveryAddress';
// import LoyaltyPoints from '@/components/cart/LoyaltyPoints';
// import BillingSummary from '@/components/cart/BillingSummary';
// import Validation from '@/components/Validation';
// import { useAuthStore } from '@/lib/stores/useAuthStore';

const CartPage = () => {
  // const { items, totalPrice, totalItems } = useCart();
  // const { user, isAuthenticated } = useAuthStore();
  // const router = useRouter();

  // const [showSuccessModal, setShowSuccessModal] = useState(false);
  // const [earnedPoints, setEarnedPoints] = useState(0);

  // // Address and Delivery state
  // const [address, setAddress] = useState(user?.address || '');
  // const [saveAsDefault, setSaveAsDefault] = useState(false);
  // const [orderType, setOrderType] = useState<'DELIVERY' | 'STORE'>('DELIVERY');

  // // Points discount states
  // const [usePoints, setUsePoints] = useState(false);
  // const [pointsToUse, setPointsToUse] = useState(0);

  // const userPoints = user?.zenPoints || 0;
  // const maxDiscountValue = totalPrice * 0.20; // 20% limit
  // const maxPointsAllowed = Math.floor(maxDiscountValue / 500);
  // const maxPointsPossible = Math.min(userPoints, maxPointsAllowed);

  // useEffect(() => {
  //   if (usePoints && pointsToUse > maxPointsPossible) {
  //     setPointsToUse(maxPointsPossible);
  //   }
  // }, [totalPrice, userPoints, usePoints, maxPointsPossible, pointsToUse]);

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/');
  //   }
  // }, [isAuthenticated, router]);

  // // Sync address from profile when user loaded
  // useEffect(() => {
  //   if (user?.address && !address) {
  //     setAddress(user.address);
  //   }
  // }, [user, address]);

  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    // <div className="min-h-screen bg-background pb-24">
    //   {/* Top Header sticky */}
    //   <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
    //     <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
    //       <Link href="/" className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all">
    //         <ArrowLeft className="w-4 h-4" />
    //       </Link>
    //       <h1 className="text-xl font-bold text-foreground">Giỏ hàng của bạn</h1>
    //       <span className="ml-auto bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
    //         {totalItems} Món
    //       </span>
    //     </div>
    //   </div>

    //   <div className="max-w-2xl mx-auto px-4 py-6">
    //     <Validation />

    //     {items.length > 0 ? (
    //       <div className="space-y-4">
    //         {/* Cart Items List */}
    //         <CartItemsList />

    //         {/* Order Type Section */}
    //         <OrderTypeSection orderType={orderType} setOrderType={setOrderType} />

    //         {/* Delivery Address Input Section (Conditional) */}
    //         <DeliveryAddress
    //           orderType={orderType}
    //           address={address}
    //           setAddress={setAddress}
    //           saveAsDefault={saveAsDefault}
    //           setSaveAsDefault={setSaveAsDefault} />

    //         {/* Loyalty Points Section */}
    //         <LoyaltyPoints
    //           userPoints={userPoints}
    //           usePoints={usePoints}
    //           setUsePoints={setUsePoints}
    //           pointsToUse={pointsToUse}
    //           setPointsToUse={setPointsToUse}
    //           maxPointsPossible={maxPointsPossible}
    //           maxPointsAllowed={maxPointsAllowed}
    //         />

    //         {/* Billing Summary Box */}
    //         <BillingSummary
    //           orderType={orderType}
    //           address={address}
    //           usePoints={usePoints}
    //           pointsToUse={pointsToUse}
    //           saveAsDefault={saveAsDefault}
    //           setEarnedPoints={setEarnedPoints}
    //           setShowSuccessModal={setShowSuccessModal} />
    //       </div>
    //     ) : (
    //       <div className="text-center py-20 bg-card border border-border rounded-2xl shadow-sm">
    //         <div className="text-7xl mb-4 animate-pulse">🛒</div>
    //         <p className="text-muted-foreground font-bold">Giỏ hàng của bạn đang trống</p>
    //         <p className="text-xs text-muted-foreground/60 mt-1 max-w-[250px] mx-auto px-4">
    //           Hãy chọn những món trà, cà phê hay sữa tươi thơm ngon nhất của chúng tôi nhé!
    //         </p>
    //         <Link
    //           href="/"
    //           className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-xl mt-6 shadow-sm hover:shadow-premium transition active:scale-95 text-sm"
    //         >
    //           Chọn Món Ngon Ngay
    //         </Link>
    //       </div>
    //     )}
    //   </div>

    //   {/* GORGEOUS TRANSACTION SUCCESS MODAL OVERLAY */}
    //   {showSuccessModal && (
    //     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
    //       <div className="bg-card w-full max-w-sm p-6 rounded-2xl border border-border shadow-modal text-center space-y-6 animate-fade-in">
    //         <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mx-auto">
    //           <CheckCircle2 className="w-10 h-10 text-primary" />
    //         </div>

    //         <div className="space-y-2">
    //           <h2 className="text-2xl font-black text-primary tracking-tight">Đặt Hàng Thành Công!</h2>
    //           <p className="text-xs text-muted-foreground px-4 leading-relaxed">
    //             Đơn hàng của bạn đã được tiếp nhận và đang tiến hành pha chế tại chi nhánh gần nhất.
    //           </p>
    //         </div>

    //         {/* Loyalty points loyalty box */}
    //         <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-200 flex items-center justify-center gap-2">
    //           <Sparkles className="w-5 h-5 text-accent animate-spin duration-3000" />
    //           <span className="text-xs font-bold text-accent-foreground">
    //             Bạn đã được tích lũy thêm <strong className="text-sm font-black">+{earnedPoints}</strong> điểm Chiba!
    //           </span>
    //         </div>

    //         <button
    //           onClick={() => {
    //             setShowSuccessModal(false);
    //             router.push('/');
    //           }}
    //           className="primary-btn mt-4 shadow-premium"
    //         >
    //           Đồng ý & Tiếp tục
    //         </button>
    //       </div>
    //     </div>
    //   )}
    // </div>
    <></>
  );
}

export default CartPage;
