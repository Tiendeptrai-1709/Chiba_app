'use client';

import React, { useState } from 'react';
import { Bike, Clock, RefreshCw, Store } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import {
  ICE_LABELS,
  isActiveOrder,
  nextStaffStep,
  Order,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE as STATUS_TONE,
  OrderStatus,
  PAYMENT_LABELS,
  sugarLabel,
} from '@/types';

type Filter = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ALL';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ACTIVE', label: 'Đang xử lý' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'ALL', label: 'Tất cả' },
];

interface OrderFulfillmentProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  onUpdated: (order: Order) => void;
}

function OrderFulfillment({ orders, loading, onRefresh, onUpdated }: OrderFulfillmentProps) {
  const { showError, showSuccess } = useNotificationStore();
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = orders.filter((o) =>
    filter === 'ALL' ? true : filter === 'ACTIVE' ? isActiveOrder(o.status) : o.status === filter,
  );

  const setPaid = async (order: Order, paid: boolean) => {
    if (!paid && !window.confirm(`Bỏ xác nhận đã nhận tiền cho đơn ${order.code}?`)) return;
    setBusyId(order.id);
    try {
      const updated = await apiRequest<Order>(`/orders/${order.id}/payment`, { method: 'PATCH', body: { paid } });
      onUpdated({ ...order, ...updated });
      showSuccess(paid ? `Đơn ${order.code}: đã nhận tiền` : `Đơn ${order.code}: đã bỏ xác nhận thanh toán`);
    } catch (e: any) {
      showError(e?.message ?? 'Không cập nhật được thanh toán');
    } finally {
      setBusyId(null);
    }
  };

  const updateStatus = async (order: Order, status: OrderStatus) => {
    // Đơn chuyển khoản chưa nhận tiền: hỏi lại trước khi nhận đơn để tránh pha chế trước khi khách trả
    if (
      status === 'PREPARING' &&
      order.paymentMethod === 'BANK_TRANSFER' &&
      !order.paidAt &&
      !window.confirm(`Đơn ${order.code} chuyển khoản nhưng CHƯA xác nhận nhận tiền. Vẫn nhận đơn?`)
    ) {
      return;
    }
    if (status === 'CANCELLED' && !window.confirm(`Hủy đơn ${order.code}?`)) return;
    setBusyId(order.id);
    try {
      const updated = await apiRequest<Order>(`/orders/${order.id}/status`, { method: 'PATCH', body: { status } });
      onUpdated({ ...order, ...updated });
      showSuccess(
        status === 'COMPLETED' && order.pointsEarned > 0
          ? `Đơn ${order.code} hoàn thành · đã cộng ${order.pointsEarned} điểm cho khách`
          : `Đơn ${order.code}: ${ORDER_STATUS_LABELS[status]}`,
      );
    } catch (e: any) {
      showError(e?.message ?? 'Không cập nhật được đơn');
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">📦 Đơn hàng</h3>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 text-xs font-bold text-primary px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition ${
              filter === f.key ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="space-y-3">
          {visible.map((order) => (
            <div key={order.id} className="p-4 bg-neutral-50 rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-black text-primary tracking-wider">{order.code}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {new Date(order.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${STATUS_TONE[order.status]}`}>
                  {order.status === 'PENDING' && <Clock className="w-3 h-3" />}
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className="space-y-1.5 border-y border-border/40 py-2.5 text-xs">
                <p className="font-bold text-foreground">
                  {order.customerName}
                  {order.customerPhone && <span className="font-medium text-muted-foreground"> · {order.customerPhone}</span>}
                </p>
                {order.storeName && <p className="font-semibold text-primary">🏪 {order.storeName}</p>}
                <p className="text-muted-foreground font-semibold flex items-start gap-1.5">
                  {order.orderType === 'DELIVERY' ? (
                    <>
                      <Bike className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Giao tới: {order.address}
                    </>
                  ) : (
                    <>
                      <Store className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Khách đến nhận tại quán
                    </>
                  )}
                </p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-semibold">
                    💳 {PAYMENT_LABELS[order.paymentMethod]}{' '}
                    {order.paidAt ? (
                      <span className="text-green-700 bg-green-100 px-1.5 py-0.5 rounded text-[10px] font-bold">Đã nhận tiền</span>
                    ) : (
                      order.status !== 'CANCELLED' && (
                        <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] font-bold">Chưa nhận tiền</span>
                      )
                    )}
                  </p>
                  {order.status !== 'CANCELLED' &&
                    (order.paidAt ? (
                      order.paymentMethod === 'BANK_TRANSFER' && (
                        <button
                          onClick={() => setPaid(order, false)}
                          disabled={busyId === order.id}
                          className="text-[10px] text-muted-foreground underline underline-offset-2"
                        >
                          Bỏ xác nhận
                        </button>
                      )
                    ) : (
                      order.paymentMethod === 'BANK_TRANSFER' && (
                        <button
                          onClick={() => setPaid(order, true)}
                          disabled={busyId === order.id}
                          className="text-[11px] font-bold text-white bg-green-600 hover:bg-green-700 px-2.5 py-1 rounded-lg disabled:opacity-50"
                        >
                          ✓ Đã nhận tiền
                        </button>
                      )
                    ))}
                </div>
                {order.paymentMethod === 'BANK_TRANSFER' && !order.paidAt && order.status !== 'CANCELLED' && (
                  <p className="text-[11px] text-accent-strong">
                    Kiểm tra tài khoản ngân hàng có khoản {order.total.toLocaleString('vi-VN')}₫ với nội dung “{order.code}”.
                  </p>
                )}

                <ul className="bg-white p-2.5 rounded-lg border border-border/50 space-y-1.5 mt-1">
                  {order.items.map((item, idx) => {
                    const opts = [
                      item.sugar !== null ? sugarLabel(item.sugar) : null,
                      item.ice ? ICE_LABELS[item.ice] : null,
                      item.toppings.length ? '+ ' + item.toppings.map((t) => t.name).join(', ') : null,
                    ].filter(Boolean);
                    return (
                      <li key={idx} className="flex justify-between gap-3">
                        <span>
                          <b>{item.quantity}x</b> {item.name}
                          {opts.length > 0 && <span className="block text-[11px] text-muted-foreground">{opts.join(' · ')}</span>}
                        </span>
                        <span className="font-semibold whitespace-nowrap">{item.lineTotal.toLocaleString('vi-VN')}₫</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs">
                  <p className="font-black text-primary">Tổng: {order.total.toLocaleString('vi-VN')}₫</p>
                  {(order.discountAmount > 0 || order.shippingFee > 0) && (
                    <p className="text-[10px] text-muted-foreground">
                      {order.shippingFee > 0 && `Ship ${order.shippingFee.toLocaleString('vi-VN')}₫ `}
                      {order.discountAmount > 0 && `· Giảm điểm -${order.discountAmount.toLocaleString('vi-VN')}₫`}
                    </p>
                  )}
                </div>

                {(() => {
                  const next = nextStaffStep(order);
                  if (!next) {
                    return order.status === 'CANCELLED' && order.cancelledBy === 'CUSTOMER' ? (
                      <span className="text-[11px] text-muted-foreground">Khách tự hủy</span>
                    ) : null;
                  }
                  return (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(order, 'CANCELLED')}
                        disabled={busyId === order.id}
                        className="text-destructive border border-destructive/30 hover:bg-destructive/5 text-[11px] font-bold py-1.5 px-3 rounded-lg transition disabled:opacity-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => updateStatus(order, next.status)}
                        disabled={busyId === order.id}
                        className={`text-white text-[11px] font-bold py-1.5 px-3 rounded-lg transition active:scale-95 disabled:opacity-50 ${
                          next.status === 'COMPLETED' ? 'bg-primary hover:bg-primary-hover' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {next.label}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-border">
          {loading ? 'Đang tải đơn hàng...' : 'Không có đơn hàng nào.'}
        </p>
      )}
    </div>
  );
}

export default OrderFulfillment;
