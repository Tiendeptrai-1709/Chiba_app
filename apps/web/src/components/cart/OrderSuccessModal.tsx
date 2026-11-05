'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';
import Portal from '@/components/ui/Portal';
import { bankConfig, vietQrImageUrl } from '@/lib/payment';
import { Order, PAYMENT_LABELS } from '@/types';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
}

export default function OrderSuccessModal({ order, onClose }: OrderSuccessModalProps) {
  const isTransfer = order.paymentMethod === 'BANK_TRANSFER';
  const qrUrl = isTransfer ? vietQrImageUrl(order.total, order.code) : null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-fade-in">
        <div className="bg-card w-full max-w-sm max-h-[92vh] overflow-y-auto p-6 rounded-2xl border border-border shadow-modal text-center space-y-5">
          <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-primary tracking-tight">Đặt hàng thành công!</h2>
            <p className="text-sm font-bold text-foreground">
              Mã đơn: <span className="tracking-wider">{order.code}</span>
            </p>
            <p className="text-xs text-muted-foreground px-2 leading-relaxed">
              Cửa hàng đã nhận đơn. Tổng thanh toán{' '}
              <b className="text-foreground">{order.total.toLocaleString('vi-VN')}₫</b> ·{' '}
              {PAYMENT_LABELS[order.paymentMethod]}
              {order.paymentMethod === 'CASH' && (order.orderType === 'DELIVERY' ? ' khi nhận hàng' : ' tại quầy')}.
            </p>
          </div>

          {isTransfer && (
            <div className="bg-neutral-50 border border-border rounded-xl p-4 space-y-3">
              {qrUrl ? (
                <>
                  <p className="text-xs font-bold text-foreground">Quét mã bằng app ngân hàng để chuyển khoản</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="Mã QR chuyển khoản" className="w-56 h-56 mx-auto rounded-lg bg-white object-contain" />
                  <div className="text-[11px] text-muted-foreground space-y-0.5 text-left">
                    <p>
                      Ngân hàng: <b className="text-foreground">{bankConfig.bankId}</b> · STK:{' '}
                      <b className="text-foreground">{bankConfig.accountNo}</b>
                    </p>
                    {bankConfig.accountName && (
                      <p>
                        Chủ TK: <b className="text-foreground">{bankConfig.accountName}</b>
                      </p>
                    )}
                    <p>
                      Nội dung: <b className="text-foreground">{order.code}</b> (đã điền sẵn trong mã QR)
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Cửa hàng sẽ liên hệ gửi thông tin chuyển khoản. Nội dung chuyển khoản: <b>{order.code}</b>
                </p>
              )}
            </div>
          )}

          {order.pointsEarned > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-200 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-accent shrink-0" />
              <span className="text-xs font-bold text-accent-strong">
                Bạn sẽ được cộng <strong className="text-sm font-black">+{order.pointsEarned}</strong> điểm khi đơn hoàn thành!
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Link href={`/orders/${order.id}`} className="primary-btn shadow-premium">
              Theo dõi đơn hàng
            </Link>
            <button onClick={onClose} className="secondary-btn">
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
