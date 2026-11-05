'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, MapPin, ShoppingBag } from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useCart } from '@/lib/context/CartContext';
import CustomerNav from '@/components/layout/CustomerNav';
import PageLoader from '@/components/ui/PageLoader';
import ProductList from '@/components/products/ProductList';
import { getSelectedStore } from '@/lib/selectedStore';

export default function OrderPage() {
  const { ready } = useRequireAuth();
  const { totalItems, totalPrice } = useCart();
  const [storeName, setStoreName] = useState<string | null>(null);

  useEffect(() => {
    setStoreName(getSelectedStore()?.name ?? null);
  }, []);

  if (!ready) return <PageLoader />;

  return (
    <div className="min-h-screen bg-background pb-48">
      {/* Thanh tiêu đề */}
      <header className="sticky top-0 z-30 bg-background px-5 pt-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/home"
            aria-label="Về trang chủ"
            className="w-11 h-11 rounded-full bg-card shadow-premium flex items-center justify-center text-primary active:scale-95 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-foreground">Đặt món</h1>
          <Link
            href="/cart"
            aria-label={`Giỏ hàng (${totalItems} món)`}
            className="relative w-11 h-11 rounded-full bg-card shadow-premium flex items-center justify-center text-primary active:scale-95 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Cửa hàng đang chọn */}
        <Link
          href="/stores"
          className="mt-3 flex items-center gap-2 bg-card rounded-2xl px-4 py-2.5 shadow-sm active:scale-[0.99] transition"
        >
          <MapPin className="w-4 h-4 text-accent shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] text-muted-foreground leading-none">Cửa hàng</span>
            <span className="block text-sm font-semibold text-foreground truncate">{storeName ?? 'Chọn cửa hàng gần bạn'}</span>
          </span>
          <span className="text-xs font-bold text-accent flex items-center">
            Đổi <ChevronRight className="w-4 h-4" />
          </span>
        </Link>
      </header>

      <main className="px-5 pt-2">
        <ProductList />
      </main>

      {/* Thanh xem giỏ hàng — nằm trên thanh điều hướng */}
      {totalItems > 0 && (
        <div className="fixed bottom-[5.75rem] inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
          <Link
            href="/cart"
            className="pointer-events-auto w-full max-w-[calc(42rem-2rem)] flex items-center justify-between bg-primary text-white rounded-full pl-5 pr-2 py-2 shadow-floating active:scale-[0.99] transition animate-fade-in"
          >
            <span className="text-sm">
              <b>{totalItems} món</b> · {totalPrice.toLocaleString('vi-VN')}đ
            </span>
            <span className="bg-caramel text-caramel-foreground font-bold text-sm px-4 py-2.5 rounded-full flex items-center gap-1">
              Xem giỏ hàng <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      )}

      <CustomerNav />
    </div>
  );
}
