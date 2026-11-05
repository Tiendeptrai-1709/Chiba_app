'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Bike, QrCode, ShoppingBag, Sparkles, UserRound, LucideIcon } from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useCart } from '@/lib/context/CartContext';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useProductStore } from '@/lib/stores/useProductStore';
import CustomerNav from '@/components/layout/CustomerNav';
import PageLoader from '@/components/ui/PageLoader';
import ProductCard from '@/components/products/ProductCard';
import { useProductPicker } from '@/components/products/useProductPicker';

interface Tile {
  href?: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: string;
}

// Món gợi ý ở trang chủ (ưu tiên món còn hàng)
const FEATURED_IDS = ['p7', 'p4', 'p1', 'b4', 'p8', 'p6'];

export default function HomePage() {
  const { user, ready } = useRequireAuth();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { totalItems } = useCart();
  const { products, fetchProducts } = useProductStore();
  const { pick, overlay } = useProductPicker();

  useEffect(() => {
    fetchProducts(true);
    refreshUser(); // cập nhật điểm mới nhất (vd. vừa được tích tại quầy)
  }, [fetchProducts, refreshUser]);

  const featured = useMemo(
    () =>
      FEATURED_IDS.map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p && p.isAvailable)
        .slice(0, 4),
    [products],
  );

  if (!ready || !user) return <PageLoader />;

  const tiles: Tile[] = [
    { href: '/order', title: 'Đặt hàng', subtitle: 'Giao tận nơi', icon: Bike, tone: 'bg-caramel text-caramel-foreground' },
    { href: '/qr', title: 'QR tích điểm', subtitle: 'Khi order tại quán', icon: QrCode, tone: 'bg-primary text-white' },
    { href: '/profile', title: 'Hồ sơ', subtitle: 'Thông tin & điểm', icon: UserRound, tone: 'bg-card text-primary' },
    { title: 'Sắp ra mắt', subtitle: 'Tính năng mới', icon: Sparkles, tone: 'bg-muted text-muted-foreground' },
  ];

  const initial = user.fullName?.trim()?.[0]?.toUpperCase() ?? '☕';

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-5 pt-6 space-y-6 animate-fade-in">
        {/* Lời chào */}
        <header className="flex items-center justify-between gap-3">
          <Link href="/profile" className="flex items-center gap-3 min-w-0">
            <span className="w-14 h-14 shrink-0 rounded-full bg-card shadow-premium flex items-center justify-center text-xl font-black text-primary">
              {initial}
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-muted-foreground">Xin chào,</span>
              <span className="block text-xl font-bold text-foreground truncate">{user.fullName}</span>
            </span>
          </Link>
          <Link
            href="/cart"
            aria-label={`Giỏ hàng (${totalItems} món)`}
            className="relative w-12 h-12 shrink-0 rounded-full bg-card shadow-premium flex items-center justify-center text-primary active:scale-95 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                {totalItems}
              </span>
            )}
          </Link>
        </header>

        {/* Banner */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#2A5C2D] to-[#163418] text-white p-6 shadow-floating">
          <div className="relative z-10 max-w-[62%] space-y-1.5">
            <p className="text-sm font-medium text-white/85">Hôm nay uống gì?</p>
            <h2 className="text-[1.65rem] leading-tight font-black">Chiba giao tận nơi</h2>
            <p className="text-sm text-white/80">Trà, cà phê & bánh ngon mỗi ngày</p>
            <Link
              href="/order"
              className="inline-flex items-center gap-2 mt-3 bg-caramel text-caramel-foreground font-bold text-sm px-5 py-3 rounded-full shadow-sm active:scale-95 transition"
            >
              Đặt ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-white/15 flex items-center justify-center" aria-hidden>
            <div className="w-32 h-32 rounded-full bg-background shadow-modal flex items-center justify-center text-6xl">☕</div>
          </div>
        </section>

        {/* 4 mục chính */}
        <section className="grid grid-cols-2 gap-3.5">
          {tiles.map(({ href, title, subtitle, icon: Icon, tone }) => {
            const content = (
              <>
                <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tone}`}>
                  <Icon className="w-6 h-6" />
                </span>
                <span className="block mt-4 text-base font-bold text-foreground">{title}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  {title === 'QR tích điểm' ? `${user.zenPoints} điểm · ${subtitle}` : subtitle}
                </span>
              </>
            );
            return href ? (
              <Link
                key={title}
                href={href}
                className="bg-card rounded-[1.75rem] p-5 shadow-premium active:scale-[0.98] transition-transform"
              >
                {content}
              </Link>
            ) : (
              <div
                key={title}
                aria-disabled="true"
                className="rounded-[1.75rem] p-5 border-2 border-dashed border-border opacity-70"
              >
                {content}
              </div>
            );
          })}
        </section>

        {/* Gợi ý món */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Gợi ý cho bạn</h2>
            <Link href="/order" className="text-sm font-semibold text-accent flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={pick} />
            ))}
          </div>
        </section>
      </div>

      {overlay}
      <CustomerNav />
    </div>
  );
}
