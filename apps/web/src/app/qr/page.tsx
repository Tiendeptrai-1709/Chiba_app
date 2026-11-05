'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Check, Copy, Coins, Store } from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import CustomerNav from '@/components/layout/CustomerNav';
import PageLoader from '@/components/ui/PageLoader';

export default function QrPointsPage() {
  const { user, ready } = useRequireAuth();
  const [copied, setCopied] = useState(false);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  // Khi nhân viên vừa quét mã tích điểm, khách quay lại trang (hoặc mở lại app)
  // sẽ thấy số điểm mới: tải lại khi mở trang và khi trang được hiển thị lại.
  useEffect(() => {
    refreshUser();
    const onVisible = () => document.visibilityState === 'visible' && refreshUser();
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(refreshUser, 15_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [refreshUser]);

  if (!ready || !user) return <PageLoader />;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(user.customerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="px-5 pt-5 pb-2 flex items-center justify-between">
        <Link
          href="/home"
          aria-label="Về trang chủ"
          className="w-11 h-11 rounded-full bg-card shadow-premium flex items-center justify-center text-primary active:scale-95 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">QR tích điểm</h1>
        <span className="w-11" aria-hidden />
      </header>

      <main className="px-5 pt-3 space-y-5 animate-fade-in">
        {/* Thẻ thành viên */}
        <section className="bg-card rounded-[2rem] shadow-floating overflow-hidden">
          <div className="bg-gradient-to-br from-primary via-[#2A5C2D] to-[#163418] text-white px-6 pt-5 pb-14">
            <p className="text-xs text-white/80 uppercase tracking-widest">Thẻ thành viên Chiba</p>
            <p className="text-xl font-bold mt-1 truncate">{user.fullName}</p>
          </div>

          <div className="-mt-10 px-6 pb-6 flex flex-col items-center">
            <div className="bg-white p-4 rounded-3xl shadow-premium">
              <QRCodeSVG
                value={user.customerCode}
                size={208}
                level="M"
                marginSize={1}
                fgColor="#1F1914"
                bgColor="#FFFFFF"
                title={`Mã khách hàng ${user.customerCode}`}
              />
            </div>

            <button
              onClick={copyCode}
              className="mt-4 flex items-center gap-2 text-lg font-black tracking-[0.2em] text-foreground active:scale-95 transition"
              aria-label="Sao chép mã khách hàng"
            >
              {user.customerCode}
              {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>

            <div className="mt-5 w-full flex items-center justify-between bg-background rounded-2xl px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Coins className="w-4 h-4 text-accent" /> Điểm hiện có
              </span>
              <span className="text-lg font-black text-primary">{user.zenPoints} điểm</span>
            </div>
          </div>
        </section>

        {/* Hướng dẫn */}
        <section className="bg-card rounded-[1.75rem] p-5 shadow-premium flex gap-4">
          <span className="w-11 h-11 shrink-0 rounded-2xl bg-caramel text-caramel-foreground flex items-center justify-center">
            <Store className="w-5 h-5" />
          </span>
          <div className="space-y-1">
            <h2 className="font-bold text-foreground">Order tại cửa hàng</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Đưa mã QR này cho nhân viên khi thanh toán để được tích điểm. Có thể đọc mã số bên dưới QR nếu máy quét
              không đọc được.
            </p>
          </div>
        </section>
      </main>

      <CustomerNav />
    </div>
  );
}
