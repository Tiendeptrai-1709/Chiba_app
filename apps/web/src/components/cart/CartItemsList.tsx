'use client';

import { Trash2 } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useProductStore } from '@/lib/stores/useProductStore';
import { cartStockProblems } from '@/lib/stock';
import { CartItem, ICE_LABELS, sugarLabel } from '@/types';
import ProductImage from '@/components/products/ProductImage';

// Mô tả tùy chọn của một dòng: "50% đường · Ít đá · + Trân Châu Hoàng Kim"
export function describeOptions(item: Pick<CartItem, 'sugar' | 'ice' | 'selectedToppings'>): string {
  const parts: string[] = [];
  if (item.sugar !== undefined && item.sugar !== null) parts.push(sugarLabel(item.sugar));
  if (item.ice) parts.push(ICE_LABELS[item.ice]);
  if (item.selectedToppings?.length) parts.push('+ ' + item.selectedToppings.map((t) => t.name).join(', '));
  return parts.join(' · ');
}

function CartItemsList() {
  const { items, updateQuantity, removeItem } = useCart();
  const getById = useProductStore((s) => s.getById);
  const loaded = useProductStore((s) => s.loaded);

  // Món (hoặc topping) đang vượt số lượng còn lại, tính gộp cả giỏ
  const problems = loaded ? cartStockProblems(items, getById) : [];
  const problemById = new Map(problems.map((p) => [p.productId, p]));

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const product = getById(item.productId);
        const lineIds = [item.productId, ...(item.selectedToppings ?? []).map((t) => t.id)];
        const problem = lineIds.map((id) => problemById.get(id)).find(Boolean);
        const options = describeOptions(item);
        const soldOut = problem?.stock === 0;

        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 bg-card p-3 rounded-2xl border transition ${
              problem ? 'border-destructive/40 bg-destructive/5' : 'border-border'
            }`}
          >
            <ProductImage
              product={product ?? { name: item.name, category: item.sugar !== undefined ? 'MON_NUOC' : 'BANH', imageUrl: null }}
              className={`w-14 h-14 shrink-0 rounded-xl ${soldOut ? 'grayscale opacity-60' : ''}`}
              emojiClassName="text-3xl"
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-snug">{item.name}</h3>
              {options && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{options}</p>}
              {problem ? (
                <p className="text-[11px] font-bold text-destructive mt-1">
                  {problem.stock === 0
                    ? `"${problem.name}" đã hết — vui lòng xóa khỏi giỏ`
                    : `"${problem.name}" chỉ còn ${problem.stock} phần (giỏ đang có ${problem.needed}) — vui lòng giảm số lượng`}
                </p>
              ) : (
                <p className="text-primary font-bold text-sm mt-1">{item.price.toLocaleString('vi-VN')}₫</p>
              )}
            </div>

            <div className="flex items-center gap-1 bg-neutral-50 border border-border px-1 py-1 rounded-lg">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                aria-label="Giảm số lượng"
                className="w-7 h-7 flex items-center justify-center hover:bg-neutral-200 rounded font-bold"
              >
                −
              </button>
              <span className="w-6 text-center font-bold text-sm tabular-nums">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                aria-label="Tăng số lượng"
                disabled={!!problem || (product ? item.quantity >= product.stock : true)}
                className="w-7 h-7 flex items-center justify-center hover:bg-neutral-200 rounded font-bold disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              aria-label={`Xóa ${item.name}`}
              className="p-2 text-destructive hover:bg-destructive/5 rounded-lg transition active:scale-90"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default CartItemsList;
