// ==================== TẠI FILE PointActionModal.tsx ====================
'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { X } from 'lucide-react';

interface PointActionModalProps {
  action: {
    customer: User;
    type: 'REDEEM' | 'ADJUST';
  };
  onClose: () => void;
  onSetNotification: (type: 'success' | 'error', msg: string) => void;
  onSuccess?: () => void;
}

export default function PointActionModal({
  action,
  onClose,
  onSetNotification,
  onSuccess,
}: PointActionModalProps) {
  const { customer, type } = action;

  // TOÀN BỘ STATE PHỤC VỤ NHẬP LIỆU ĐƯỢC CO-LOCATE (ĐÓNG GÓI) TẠI ĐÂY!
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [pointsAmount, setPointsAmount] = useState<number>(0);
  const [reasonInput, setReasonInput] = useState('');
  const [giftInput, setGiftInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý gửi Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSetNotification('success', ''); // Clear alert cũ ở cha nếu có

    try {
      if (type === 'REDEEM') {
        // Logic gọi API đổi quà
        console.log('Đổi quà cho', customer.fullName, { selectedProductId, giftInput });
        onSetNotification('success', `Đổi quà thành công cho khách hàng ${customer.fullName}!`);
      } else {
        // Logic gọi API điều chỉnh điểm
        console.log('Điều chỉnh điểm cho', customer.fullName, { pointsAmount, reasonInput });
        onSetNotification('success', `Đã điều chỉnh điểm cho ${customer.fullName} thành công!`);
      }
      
      if (onSuccess) onSuccess();
      onClose(); // Đóng modal sau khi thành công
    } catch (err: any) {
      onSetNotification('error', err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-150">
        
        {/* Nút đóng */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-neutral-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tiêu đề Modal */}
        <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-4">
          {type === 'REDEEM' ? '🎁 Đổi quà tại quầy' : '✏️ Điều chỉnh điểm'}
        </h3>
        
        <p className="text-xs font-semibold text-muted-foreground mb-4">
          Khách hàng: <span className="text-foreground font-bold">{customer.fullName}</span> ({customer.customerCode})
        </p>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'REDEEM' ? (
            <>
              {/* Form đổi quà */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Chọn quà tặng</label>
                <input
                  type="text"
                  value={giftInput}
                  onChange={(e) => setGiftInput(e.target.value)}
                  placeholder="Nhập tên quà hoặc sản phẩm..."
                  className="w-full border border-border p-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Form điều chỉnh điểm */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Số điểm thay đổi</label>
                <input
                  type="number"
                  value={pointsAmount || ''}
                  onChange={(e) => setPointsAmount(Number(e.target.value))}
                  placeholder="Ví dụ: 100 hoặc -50"
                  className="w-full border border-border p-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Lý do điều chỉnh</label>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Nhập lý do điều chỉnh..."
                  className="w-full border border-border p-3 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                  required
                />
              </div>
            </>
          )}

          {/* Nút hành động */}
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
              disabled={isSubmitting}
              className="text-xs font-bold text-white bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-xl active:scale-95 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}