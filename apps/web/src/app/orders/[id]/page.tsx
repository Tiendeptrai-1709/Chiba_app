'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Bike, Check, MapPin, Store, X } from 'lucide-react';
import { useRequireAuth } from '@/lib/hooks/useRequireAuth';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { apiRequest } from '@/lib/api/client';
import { ORDER_FALLBACK_POLL_MS, useOrderEvents } from '@/lib/api/events';
import { vietQrImageUrl } from '@/lib/payment';
import CustomerNav from '@/components/layout/CustomerNav';
import PageLoader from '@/components/ui/PageLoader';
import OrderItems from '@/components/orders/OrderItems';
import { isActiveOrder, Order, ORDER_STATUS_LABELS, ORDER_STATUS_TONE, orderSteps, PAYMENT_LABELS } from '@/types';

const POLL_MS = ORDER_FALLBACK_POLL_MS; // dự phòng — trạng thái đến tức thì qua useOrderEvents

export default function OrderDetailPage() {
  const { ready } = useRequireAuth();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrder(await apiRequest<Order>(`/orders/${encodeURIComponent(id)}`));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được đơn hàng');
    }
  }, [id]);

  const active = order ? isActiveOrder(order.status) : true;

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, load]);

  // Tự cập nhật trạng thái khi đơn còn đang xử lý
  useEffect(() => {
    if (!ready || !active) return;
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [ready, active, load]);

  // Cửa hàng đổi trạng thái / xác nhận thanh toán → cập nhật ngay
  useOrderEvents('/orders/me/stream', ready && active, (e) => {
    if (e.orderId === id) load();
  });

  const cancel = async () => {
    setCancelling(true);
    try {
      setOrder(await apiRequest<Order>(`/orders/${encodeURIComponent(id)}/cancel`, { method: 'POST' }));
      setConfirmCancel(false);
      refreshUser(); // điểm đã dùng được hoàn lại
    } catch (e: any) {
      setError(e?.message ?? 'Không hủy được đơn');
      load();
    } finally {
      setCancelling(false);
    }
  };

  if (!ready) return <PageLoader />;

  const steps = order ? orderSteps(order.orderType) : [];
  const currentIdx = order ? steps.indexOf(order.status) : -1;
  const qrUrl =
    order && order.paymentMethod === 'BANK_TRANSFER' && active && !order.paidAt
      ? vietQrImageUrl(order.total, order.code)
      : null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 bg-background px-5 pt-5 pb-3 flex items-center justify-between">
        <Link href="/orders" aria-label="Về danh sách đơn" className="w-11 h-11 rounded-full bg-card shadow-premium flex items-center justify-center text-primary active:scale-95 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">{order ? `Đơn ${order.code}` : 'Chi tiết đơn'}</h1>
        <span className="w-11" aria-hidden />
      </header>

      <main className="px-5 pt-2 space-y-4">
        {error && <p className="text-sm text-destructive font-semibold bg-destructive/5 rounded-xl p-3">{error}</p>}

        {!order ? (
          !error && <div className="h-64 bg-card rounded-3xl animate-pulse" aria-label="Đang tải" />
        ) : (
          <>
            {/* Trạng thái */}
            <section className="bg-card rounded-3xl p-5 shadow-premium space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${ORDER_STATUS_TONE[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                </span>
              </div>

              {order.status === 'CANCELLED' ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {order.cancelledBy === 'CUSTOMER' ? 'Bạn đã hủy đơn này.' : 'Cửa hàng đã hủy đơn này.'}
                  {order.pointsUsed > 0 && ` Đã hoàn lại ${order.pointsUsed} điểm.`}
                </p>
              ) : (
                <ol className="flex items-start" aria-label="Tiến trình đơn hàng">
                  {steps.map((step, i) => {
                    const done = i <= currentIdx;
                    return (
                      <li key={step} className="flex-1 flex flex-col items-center text-center gap-1.5 relative">
                        {i > 0 && (
                          <span className={`absolute top-3.5 right-1/2 w-full h-0.5 -z-0 ${i <= currentIdx ? 'bg-primary' : 'bg-border'}`} aria-hidden />
                        )}
                        <span
                          className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            done ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                          } ${i === currentIdx && active ? 'ring-4 ring-primary/20' : ''}`}
                        >
                          {done ? <Check className="w-4 h-4" /> : i + 1}
                        </span>
                        <span className={`text-[10.5px] leading-tight ${done ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                          {ORDER_STATUS_LABELS[step].split(' — ')[0]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              {order.status === 'READY' && (
                <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 rounded-xl p-3">
                  Món đã sẵn sàng! Đọc mã <b>{order.code}</b> cho nhân viên tại quầy để nhận nhé.
                </p>
              )}
              {order.status === 'COMPLETED' && order.pointsEarned > 0 && (
                <p className="text-sm font-semibold text-accent-strong bg-orange-50 rounded-xl p-3">
                  Bạn đã được cộng +{order.pointsEarned} điểm từ đơn này.
                </p>
              )}
            </section>

            {/* Nhận hàng & thanh toán */}
            <section className="bg-card rounded-3xl p-5 shadow-premium space-y-2.5 text-sm">
              {order.storeName && (
                <p className="flex items-start gap-2">
                  <Store className="w-4 h-4 mt-0.5 text-primary shrink-0" /> {order.storeName}
                </p>
              )}
              <p className="flex items-start gap-2">
                {order.orderType === 'DELIVERY' ? (
                  <>
                    <Bike className="w-4 h-4 mt-0.5 text-primary shrink-0" /> Giao tới: {order.address}
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" /> Nhận tại quán
                  </>
                )}
              </p>
              <p>
                💳 {PAYMENT_LABELS[order.paymentMethod]}{' '}
                {order.paidAt ? (
                  <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[11px] font-bold">Đã thanh toán</span>
                ) : (
                  order.paymentMethod === 'BANK_TRANSFER' &&
                  active && (
                    <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[11px] font-bold">
                      Chờ cửa hàng xác nhận
                    </span>
                  )
                )}
              </p>
              {qrUrl && (
                <div className="pt-2 text-center space-y-2">
                  <p className="text-xs text-muted-foreground">Chưa chuyển khoản? Quét mã dưới đây (nội dung: {order.code})</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="Mã QR chuyển khoản" className="w-48 h-48 mx-auto rounded-lg bg-white object-contain" />
                </div>
              )}
            </section>

            {/* Món */}
            <section className="bg-card rounded-3xl p-5 shadow-premium space-y-4">
              <OrderItems items={order.items} />
              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                <p className="flex justify-between text-muted-foreground">
                  <span>Tiền món</span>
                  <span className="tabular-nums">{order.subtotal.toLocaleString('vi-VN')}₫</span>
                </p>
                {order.shippingFee > 0 && (
                  <p className="flex justify-between text-muted-foreground">
                    <span>Phí giao hàng</span>
                    <span className="tabular-nums">{order.shippingFee.toLocaleString('vi-VN')}₫</span>
                  </p>
                )}
                {order.discountAmount > 0 && (
                  <p className="flex justify-between text-accent-strong">
                    <span>Giảm bằng điểm ({order.pointsUsed} điểm)</span>
                    <span className="tabular-nums">-{order.discountAmount.toLocaleString('vi-VN')}₫</span>
                  </p>
                )}
                <p className="flex justify-between font-bold text-base text-foreground pt-1">
                  <span>Tổng</span>
                  <span className="text-primary tabular-nums">{order.total.toLocaleString('vi-VN')}₫</span>
                </p>
              </div>
            </section>

            {/* Khách tự hủy khi cửa hàng chưa nhận đơn */}
            {order.status === 'PENDING' &&
              (confirmCancel ? (
                <div className="bg-card rounded-3xl p-5 shadow-premium space-y-3">
                  <p className="text-sm font-semibold text-foreground">Bạn chắc chắn muốn hủy đơn {order.code}?</p>
                  {order.pointsUsed > 0 && (
                    <p className="text-xs text-muted-foreground">{order.pointsUsed} điểm đã dùng sẽ được hoàn lại.</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmCancel(false)} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold">
                      Không hủy
                    </button>
                    <button
                      onClick={cancel}
                      disabled={cancelling}
                      className="flex-1 py-3 rounded-xl bg-destructive text-white text-sm font-bold disabled:opacity-50"
                    >
                      {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="w-full py-3.5 rounded-2xl border border-destructive/40 text-destructive text-sm font-bold bg-card"
                >
                  Hủy đơn
                </button>
              ))}
          </>
        )}
      </main>

      <CustomerNav />
    </div>
  );
}
