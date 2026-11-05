'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { PointTransaction, User } from '@/types';
import Portal from '@/components/ui/Portal';

interface PointActionModalProps {
  action: {
    customer: User;
    type: 'REDEEM' | 'ADJUST';
  };
  onClose: () => void;
  onSuccess?: () => void;
}

// REDEEM: đổi quà tại quầy (trừ điểm) — nhân viên & admin.
// ADJUST: cộng/trừ tự do kèm lý do — chỉ admin (server kiểm tra quyền).
export default function PointActionModal({ action, onClose, onSuccess }: PointActionModalProps) {
  const { customer, type } = action;
  const { showError, showSuccess } = useNotificationStore();
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const value = parseInt(points, 10) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'REDEEM' && value <= 0) return showError('Nhập số điểm cần trừ');
    if (type === 'ADJUST' && value === 0) return showError('Số điểm phải khác 0');
    if (type === 'REDEEM' && value > customer.zenPoints) return showError('Khách không đủ điểm');

    setSubmitting(true);
    try {
      const tx = await apiRequest<PointTransaction>('/points/adjust', {
        method: 'POST',
        body:
          type === 'REDEEM'
            ? { userId: customer.id, points: -value, type: 'REDEEMED_STORE', description: `Đổi quà: ${reason.trim()}` }
            : { userId: customer.id, points: value, type: 'ADMIN_ADJUST', description: reason.trim() },
      });
      showSuccess(
        `${type === 'REDEEM' ? 'Đổi quà' : 'Điều chỉnh điểm'} cho ${customer.fullName} thành công · còn ${tx.pointsAfter} điểm`,
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      showError(err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
        <div className="bg-white border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-neutral-100 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4">
            {type === 'REDEEM' ? '🎁 Đổi quà tại quầy' : '✏️ Điều chỉnh điểm'}
          </h3>

          <p className="text-xs font-semibold text-muted-foreground mb-4">
            Khách hàng: <span className="text-foreground font-bold">{customer.fullName}</span> ({customer.customerCode}) ·{' '}
            <span className="text-accent-strong font-bold">{customer.zenPoints} điểm</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="pts" className="text-[10px] font-bold text-muted-foreground uppercase">
                {type === 'REDEEM' ? 'Số điểm cần trừ' : 'Số điểm thay đổi (âm để trừ)'}
              </label>
              <input
                id="pts"
                type="number"
                inputMode="numeric"
                min={type === 'REDEEM' ? 1 : undefined}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder={type === 'REDEEM' ? 'Ví dụ: 20' : 'Ví dụ: 10 hoặc -5'}
                className="w-full border border-border p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reason" className="text-[10px] font-bold text-muted-foreground uppercase">
                {type === 'REDEEM' ? 'Tên quà tặng' : 'Lý do điều chỉnh'}
              </label>
              <input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={150}
                placeholder={type === 'REDEEM' ? 'Ví dụ: Ly sứ Chiba' : 'Ví dụ: Bù điểm đơn lỗi'}
                className="w-full border border-border p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold px-4 py-2.5 rounded-xl border border-border hover:bg-neutral-50 active:scale-95 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="text-xs font-bold text-white bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-xl active:scale-95 transition disabled:opacity-50"
              >
                {submitting ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
