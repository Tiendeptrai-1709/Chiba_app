'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, RefreshCw, Receipt } from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { apiRequest } from '@/lib/api/client';
import CustomerNav from '@/components/layout/CustomerNav';
import PageLoader from '@/components/ui/PageLoader';
import { isActiveOrder, Order, ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from '@/types';

const POLL_MS = 15_000;

export default function MyOrdersPage() {
  const { ready } = useRequireAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await apiRequest<Order[]>('/orders/me'));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    load();
    const timer = setInterval(load, POLL_MS); // cập nhật trạng thái đơn đang xử lý
    return () => clearInterval(timer);
  }, [ready, load]);

  if (!ready) return <PageLoader />;

  const active = orders?.filter((o) => isActiveOrder(o.status)) ?? [];
  const past = orders?.filter((o) => !isActiveOrder(o.status)) ?? [];

  const renderOrder = (order: Order) => (
    <Link
      key={order.id}
      href={`/orders/${order.id}`}
      className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-premium active:scale-[0.99] transition"
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-primary tracking-wider text-sm">{order.code}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ORDER_STATUS_TONE[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {new Date(order.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
          {order.storeName ? ` · ${order.storeName}` : ''}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-foreground text-sm tabular-nums">{order.total.toLocaleString('vi-VN')}₫</p>
        <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 bg-background px-5 pt-5 pb-3 flex items-center justify-between">
        <Link href="/home" aria-label="Về trang chủ" className="w-11 h-11 rounded-full bg-card shadow-premium flex items-center justify-center text-primary active:scale-95 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Đơn của tôi</h1>
        <button onClick={load} aria-label="Tải lại" className="w-11 h-11 rounded-full bg-card shadow-premium flex items-center justify-center text-primary active:scale-95 transition">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="px-5 pt-2 space-y-6">
        {error && <p className="text-sm text-destructive font-semibold bg-destructive/5 rounded-xl p-3">{error}</p>}

        {orders === null ? (
          <div className="space-y-3" aria-label="Đang tải">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl space-y-3">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="font-semibold text-foreground">Bạn chưa có đơn hàng nào</p>
            <Link href="/order" className="inline-block bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full">
              Đặt món ngay
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đang xử lý ({active.length})</h2>
                {active.map(renderOrder)}
              </section>
            )}
            {past.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đơn trước đây</h2>
                {past.map(renderOrder)}
              </section>
            )}
          </>
        )}
      </main>

      <CustomerNav />
    </div>
  );
}
