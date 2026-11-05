'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import Portal from '@/components/ui/Portal';
import { Product, ProductCategory } from '@/types';
import type { ProductInput } from '@/lib/stores/useProductStore';

const CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: 'MON_NUOC', label: 'Đồ uống' },
  { key: 'BANH', label: 'Bánh & đồ ăn' },
  { key: 'TOPPING', label: 'Topping' },
];

interface ProductFormModalProps {
  product?: Product; // có = sửa, không = thêm mới
  onClose: () => void;
  onSubmit: (data: ProductInput) => Promise<void>;
}

// Form thêm / sửa món (Admin). Ảnh được thêm ở danh sách sau khi tạo món.
export default function ProductFormModal({ product, onClose, onSubmit }: ProductFormModalProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product ? String(product.price) : '');
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? 'MON_NUOC');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const priceValue = parseInt(price.replace(/\D/g, ''), 10);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Vui lòng nhập tên món');
    if (!Number.isFinite(priceValue)) return setError('Vui lòng nhập giá');
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), price: priceValue, category });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Không lưu được món');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
        <form onSubmit={submit} className="bg-card border border-border rounded-2xl w-full max-w-md shadow-modal p-6 relative space-y-4">
          <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            {product ? '✏️ Sửa món' : '➕ Thêm món mới'}
          </h3>

          <div className="space-y-1">
            <label htmlFor="product-name" className="text-[11px] font-bold text-muted-foreground uppercase">Tên món</label>
            <input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Ví dụ: Trà Đào Cam Sả"
              className="w-full border border-border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="product-price" className="text-[11px] font-bold text-muted-foreground uppercase">Giá (đồng)</label>
            <input
              id="product-price"
              inputMode="numeric"
              value={Number.isFinite(priceValue) ? priceValue.toLocaleString('vi-VN') : ''}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ví dụ: 45.000"
              className="w-full border border-border p-3 rounded-xl text-sm font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Danh mục</span>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  aria-pressed={category === c.key}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    category === c.key ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {category === 'MON_NUOC' && (
              <p className="text-[11px] text-muted-foreground">Đồ uống sẽ có lựa chọn độ ngọt, đá và topping khi đặt.</p>
            )}
          </div>

          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="text-xs font-bold px-4 py-2.5 rounded-xl border border-border hover:bg-muted">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="text-xs font-bold text-white bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-xl disabled:opacity-50">
              {saving ? 'Đang lưu...' : product ? 'Lưu thay đổi' : 'Thêm món'}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
}
