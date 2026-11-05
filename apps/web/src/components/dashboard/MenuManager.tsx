'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Pencil, Plus, RefreshCw, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useProductStore } from '@/lib/stores/useProductStore';
import ProductFormModal from './ProductFormModal';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { Product, ProductCategory } from '@/types';
import ProductImage from '@/components/products/ProductImage';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  MON_NUOC: 'Đồ uống',
  BANH: 'Bánh & đồ ăn',
  TOPPING: 'Topping',
};
const CATEGORY_ORDER: ProductCategory[] = ['MON_NUOC', 'BANH', 'TOPPING'];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

interface MenuManagerProps {
  // Admin: thêm/sửa/xóa món và ảnh. Nhân viên: chỉ bật/tắt còn hàng.
  canEditImages: boolean;
}

function MenuManager({ canEditImages }: MenuManagerProps) {
  const {
    products,
    loading,
    fetchProducts,
    setAvailability,
    uploadImage,
    removeImage,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();
  const { showError, showSuccess } = useNotificationStore();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<Product | null>(null);

  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  const run = async (id: string, action: () => Promise<void>, successMsg: string) => {
    setBusyId(id);
    try {
      await action();
      showSuccess(successMsg);
    } catch (e: any) {
      showError(e?.message ?? 'Thao tác thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const pickImage = (product: Product) => {
    uploadTarget.current = product;
    fileInput.current?.click();
  };

  const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng file
    const product = uploadTarget.current;
    if (!file || !product) return;
    if (!ACCEPTED.includes(file.type)) return showError('Chỉ nhận ảnh JPG, PNG hoặc WEBP');
    if (file.size > MAX_IMAGE_BYTES) return showError('Ảnh tối đa 3MB — hãy nén ảnh trước khi tải lên');
    run(product.id, () => uploadImage(product.id, file), `Đã cập nhật ảnh cho "${product.name}"`);
  };

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-5">
      <div className="border-b border-border pb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
            {canEditImages ? '🍹 Quản lý món & ảnh' : '🛒 Tình trạng món'}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Tắt “Còn hàng” khi hết nguyên liệu — khách sẽ thấy “Tạm hết” và không đặt được.
            {canEditImages && ' Ảnh nên vuông (khoảng 600×600), tối đa 3MB.'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {canEditImages && (
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1 text-xs font-bold text-white bg-primary px-3 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Thêm món
            </button>
          )}
          <button onClick={() => fetchProducts(true)} aria-label="Tải lại" className="p-2 rounded-lg border border-border hover:bg-muted">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {creating && (
        <ProductFormModal
          onClose={() => setCreating(false)}
          onSubmit={async (data) => {
            const created = await createProduct(data);
            showSuccess(`Đã thêm "${created.name}" — bấm "Thêm ảnh" để gắn ảnh cho món`);
          }}
        />
      )}
      {editing && (
        <ProductFormModal
          product={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (data) => {
            await updateProduct(editing.id, data);
            showSuccess(`Đã lưu "${data.name}"`);
          }}
        />
      )}

      <input ref={fileInput} type="file" accept={ACCEPTED.join(',')} className="hidden" onChange={onFileChosen} />

      {CATEGORY_ORDER.map((category) => {
        const list = products.filter((p) => p.category === category);
        if (list.length === 0) return null;
        return (
          <section key={category} className="space-y-2.5">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
              {CATEGORY_LABELS[category]} ({list.filter((p) => !p.isAvailable).length} tạm hết)
            </h4>
            {list.map((product) => {
              const busy = busyId === product.id;
              return (
                <div
                  key={product.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                    product.isAvailable ? 'bg-neutral-50 border-border/70' : 'bg-destructive/5 border-destructive/20'
                  } ${busy ? 'opacity-60' : ''}`}
                >
                  <ProductImage
                    product={product}
                    className={`w-14 h-14 shrink-0 rounded-xl ${product.isAvailable ? '' : 'grayscale'}`}
                    emojiClassName="text-3xl"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground leading-snug">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{product.price.toLocaleString('vi-VN')}₫</p>
                    {canEditImages && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <button
                          onClick={() => setEditing(product)}
                          disabled={busy}
                          className="flex items-center gap-1 whitespace-nowrap text-[10px] font-bold text-foreground bg-muted px-2 py-1 rounded-md"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Sửa
                        </button>
                        <button
                          onClick={() => pickImage(product)}
                          disabled={busy}
                          className="flex items-center gap-1 whitespace-nowrap text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md"
                        >
                          <ImagePlus className="w-3.5 h-3.5" /> {product.imageUrl ? 'Đổi ảnh' : 'Thêm ảnh'}
                        </button>
                        {product.imageUrl && (
                          <button
                            onClick={() =>
                              window.confirm(`Xóa ảnh của "${product.name}"?`) &&
                              run(product.id, () => removeImage(product.id), 'Đã xóa ảnh')
                            }
                            disabled={busy}
                            className="flex items-center gap-1 whitespace-nowrap text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa ảnh
                          </button>
                        )}
                        <button
                          onClick={() =>
                            window.confirm(`Xóa hẳn món "${product.name}" khỏi menu? Đơn cũ vẫn giữ tên và giá món.`) &&
                            run(product.id, () => deleteProduct(product.id), `Đã xóa món "${product.name}"`)
                          }
                          disabled={busy}
                          className="flex items-center gap-1 whitespace-nowrap text-[10px] font-bold text-destructive border border-destructive/30 px-2 py-1 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa món
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      run(
                        product.id,
                        () => setAvailability(product.id, !product.isAvailable),
                        product.isAvailable ? `"${product.name}" đã chuyển sang Tạm hết` : `"${product.name}" đã có hàng trở lại`,
                      )
                    }
                    disabled={busy}
                    aria-pressed={product.isAvailable}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${
                      product.isAvailable
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }`}
                  >
                    {product.isAvailable ? (
                      <>
                        <ToggleRight className="w-5 h-5" /> Còn hàng
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" /> Tạm hết
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

export default MenuManager;
