'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useProductStore } from '@/lib/stores/useProductStore';
import ProductFormModal from './ProductFormModal';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { LOW_STOCK, Product, UNGROUPED_LABEL } from '@/types';
import ProductImage from '@/components/products/ProductImage';
import MenuGroupManager from './MenuGroupManager';
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

// Ô nhập số lượng còn bán được. Bấm "Cập nhật" để lưu số mới (đặt lại, không cộng dồn).
function StockEditor({ product, busy, onSave }: { product: Product; busy: boolean; onSave: (stock: number) => void }) {
  const [draft, setDraft] = useState(String(product.stock));

  // Đồng bộ khi số lượng đổi từ nơi khác (khách đặt, tải lại menu)
  useEffect(() => setDraft(String(product.stock)), [product.stock]);

  const value = parseInt(draft, 10);
  const valid = Number.isInteger(value) && value >= 0 && value <= 100_000;
  const changed = valid && value !== product.stock;
  const tone =
    product.stock === 0
      ? 'bg-destructive/10 text-destructive'
      : product.stock <= LOW_STOCK
        ? 'bg-amber-100 text-amber-800'
        : 'bg-primary/10 text-primary';

  return (
    <form
      className="shrink-0 flex flex-col items-end gap-1.5 w-[7.5rem]"
      onSubmit={(e) => {
        e.preventDefault();
        if (changed) onSave(value);
      }}
    >
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tone}`}>
        {product.stock === 0 ? 'Hết hàng' : product.stock <= LOW_STOCK ? `Sắp hết · ${product.stock}` : `Còn ${product.stock}`}
      </span>
      <div className="flex items-center gap-1">
        <label htmlFor={`stock-${product.id}`} className="sr-only">
          Số lượng {product.name}
        </label>
        <input
          id={`stock-${product.id}`}
          type="number"
          inputMode="numeric"
          min={0}
          max={100000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={busy}
          className="w-16 text-center text-sm font-bold tabular-nums border border-border rounded-lg py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={busy || !changed}
          className="text-[10px] font-bold text-white bg-primary px-2 py-2 rounded-lg disabled:opacity-40"
        >
          Lưu
        </button>
      </div>
      {product.stock > 0 && (
        <button
          type="button"
          onClick={() => onSave(0)}
          disabled={busy}
          className="text-[10px] font-semibold text-destructive underline underline-offset-2"
        >
          Báo hết hàng
        </button>
      )}
    </form>
  );
}

interface MenuManagerProps {
  // Admin: thêm/sửa/xóa món và ảnh. Nhân viên: chỉ bật/tắt còn hàng.
  canEditImages: boolean;
}

function MenuManager({ canEditImages }: MenuManagerProps) {
  const {
    products,
    groups,
    loading,
    fetchProducts,
    setStock,
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

  // Xếp món theo danh mục (đúng thứ tự Admin đặt), món chưa có danh mục để cuối
  const groupIds = new Set(groups.map((g) => g.id));
  const sections = [
    ...groups.map((g) => ({ key: g.id, title: g.name, list: products.filter((p) => p.groupId === g.id) })),
    { key: 'none', title: UNGROUPED_LABEL, list: products.filter((p) => !p.groupId || !groupIds.has(p.groupId)) },
  ];

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
            {canEditImages ? '🍹 Quản lý món & kho' : '🛒 Kho món'}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Nhập số phần còn làm được rồi bấm “Lưu”. Mỗi phần khách đặt tự trừ 1, đơn bị hủy được cộng lại; về 0 thì khách
            thấy “Tạm hết”.
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

      {canEditImages && <MenuGroupManager />}

      {sections.map(({ key, title, list }) => {
        if (list.length === 0) return null;
        return (
          <section key={key} className="space-y-2.5">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
              {title} · {list.length} món · {list.filter((p) => p.stock === 0).length} hết ·{' '}
              {list.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK).length} sắp hết
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
                  <StockEditor
                    product={product}
                    busy={busy}
                    onSave={(stock) =>
                      run(
                        product.id,
                        () => setStock(product.id, stock),
                        stock === 0 ? `"${product.name}" đã chuyển sang Hết hàng` : `"${product.name}": còn ${stock} phần`,
                      )
                    }
                  />
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
