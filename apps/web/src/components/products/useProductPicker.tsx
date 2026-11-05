'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useProductStore } from '@/lib/stores/useProductStore';
import { ICE_LABELS, ICE_LEVELS, IceLevel, Product, SUGAR_LEVELS, SugarLevel, sugarLabel } from '@/types';
import Portal from '@/components/ui/Portal';
import ProductImage from './ProductImage';

// Nút chọn dạng viên thuốc dùng cho độ ngọt / đá
function OptionChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-all ${
        active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card text-foreground border-border hover:bg-cream'
      }`}
    >
      {children}
    </button>
  );
}

// Hook gom logic "thêm món vào giỏ": đồ uống mở bảng chọn độ ngọt, đá, topping;
// món khác thêm thẳng. Trả về `pick` để gọi và `overlay` để render.
export function useProductPicker() {
  const { addItem } = useCart();
  const products = useProductStore((s) => s.products);
  const [selected, setSelected] = useState<Product | null>(null);
  const [toppings, setToppings] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [sugar, setSugar] = useState<SugarLevel>(100);
  const [ice, setIce] = useState<IceLevel>('NORMAL');
  const [toast, setToast] = useState<string | null>(null);

  const allToppings = useMemo(() => products.filter((p) => p.category === 'TOPPING'), [products]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Khóa cuộn trang phía sau khi bảng chọn đang mở.
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  const pick = (product: Product) => {
    if (!product.isAvailable) return;
    if (product.category === 'MON_NUOC') {
      setSelected(product);
      setToppings([]);
      setQuantity(1);
      setSugar(100);
      setIce('NORMAL');
    } else {
      addItem({ product });
      setToast(product.name);
    }
  };

  const close = () => setSelected(null);

  const toggleTopping = (topping: Product) =>
    setToppings((prev) =>
      prev.some((t) => t.id === topping.id) ? prev.filter((t) => t.id !== topping.id) : [...prev, topping],
    );

  const confirm = () => {
    if (!selected) return;
    addItem({
      product: selected,
      toppings: toppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
      quantity,
      sugar,
      ice,
    });
    setToast(quantity > 1 ? `${quantity}x ${selected.name}` : selected.name);
    close();
  };

  const total = selected ? (selected.price + toppings.reduce((sum, t) => sum + t.price, 0)) * quantity : 0;

  const overlay = (
    <Portal>
      {toast && (
        // Lớp ngoài lo căn giữa, lớp trong lo hiệu ứng (animation ghi đè transform).
        <div className="fixed top-4 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none" role="status">
          <div className="pointer-events-auto max-w-full bg-primary text-white text-xs px-4 py-3 rounded-full shadow-floating flex items-center gap-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-caramel shrink-0" />
            <span className="truncate">
              Đã thêm <b className="text-caramel">{toast}</b>
            </span>
            <Link href="/cart" className="ml-1 font-bold underline underline-offset-2 shrink-0">
              Xem giỏ
            </Link>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center animate-fade-in"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`Tùy chọn ${selected.name}`}
        >
          <div
            className="w-full max-w-2xl bg-background rounded-t-[2rem] shadow-modal flex flex-col max-h-[90vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thanh kéo + nút đóng */}
            <div className="relative pt-3 pb-1">
              <div className="mx-auto w-10 h-1.5 rounded-full bg-border" />
              <button
                onClick={close}
                aria-label="Đóng"
                className="absolute right-4 top-3 w-9 h-9 flex items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm active:scale-90 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thông tin món */}
            <div className="px-5 pt-2 pb-4 flex items-center gap-4">
              <ProductImage product={selected} className="w-20 h-20 shrink-0 rounded-3xl" emojiClassName="text-5xl" />
              <div className="min-w-0">
                <h3 className="text-lg font-black text-foreground leading-tight">{selected.name}</h3>
                <p className="text-sm font-bold text-accent mt-1">{selected.price.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>

            {/* Tùy chọn (cuộn được) */}
            <div className="px-5 pb-4 overflow-y-auto flex-1 space-y-5">
              <section className="space-y-2.5">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Độ ngọt</h4>
                <div className="flex flex-wrap gap-2">
                  {SUGAR_LEVELS.map((level) => (
                    <OptionChip key={level} active={sugar === level} onClick={() => setSugar(level)}>
                      {level === 0 ? 'Không đường' : `${level}%`}
                    </OptionChip>
                  ))}
                </div>
              </section>

              <section className="space-y-2.5">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đá</h4>
                <div className="flex flex-wrap gap-2">
                  {ICE_LEVELS.map((level) => (
                    <OptionChip key={level} active={ice === level} onClick={() => setIce(level)}>
                      {ICE_LABELS[level]}
                    </OptionChip>
                  ))}
                </div>
              </section>

              {allToppings.length > 0 && (
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Thêm topping</h4>
                    <span className="text-[11px] font-bold text-caramel-foreground bg-caramel px-2.5 py-0.5 rounded-full">
                      Đã chọn {toppings.length}
                    </span>
                  </div>
                  {allToppings.map((topping) => {
                    const checked = toppings.some((t) => t.id === topping.id);
                    const soldOut = !topping.isAvailable;
                    return (
                      <button
                        key={topping.id}
                        type="button"
                        onClick={() => !soldOut && toggleTopping(topping)}
                        disabled={soldOut}
                        aria-pressed={checked}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 disabled:opacity-50 ${
                          checked ? 'bg-cream border-accent ring-1 ring-accent' : 'bg-card border-border'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border transition-all ${
                              checked ? 'bg-primary border-primary text-white' : 'bg-card border-border text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <span className="text-sm font-semibold text-foreground">{topping.name}</span>
                        </span>
                        <span className={`text-sm font-bold ${soldOut ? 'text-muted-foreground' : 'text-accent'}`}>
                          {soldOut ? 'Tạm hết' : `+${topping.price.toLocaleString('vi-VN')}đ`}
                        </span>
                      </button>
                    );
                  })}
                </section>
              )}
            </div>

            {/* Số lượng + nút xác nhận: luôn hiện ở đáy bảng */}
            <div className="px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-border bg-card rounded-t-3xl space-y-3">
              <p className="text-xs text-muted-foreground">
                {sugarLabel(sugar)} · {ICE_LABELS[ice]}
                {toppings.length > 0 && ` · ${toppings.map((t) => t.name).join(', ')}`}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Số lượng</span>
                <div className="flex items-center gap-3 bg-background rounded-full p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                    className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm active:scale-90 transition disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-black text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    aria-label="Tăng số lượng"
                    className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm active:scale-90 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button onClick={confirm} className="primary-btn gap-2 py-4 rounded-2xl font-bold">
                <ShoppingBag className="w-5 h-5" />
                Thêm vào giỏ · {total.toLocaleString('vi-VN')}đ
              </button>
            </div>
          </div>
        </div>
      )}
    </Portal>
  );

  return { pick, overlay };
}
