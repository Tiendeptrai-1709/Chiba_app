// src/components/ProductOptionModal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ShoppingCart } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";


interface ProductOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productPrice: number;
  availableToppings: { id: string; name: string; price: number }[];
  selectedToppings: { id: string; name: string; price: number }[];
  onToggleTopping: (topping: { id: string; name: string; price: number }) => void;
  drinkQuantity: number;
  onChangeQuantity: (qty: number) => void;
  currentTotalPrice: number;
  onConfirm: () => void;
}

export default function ProductOptionModal({
  isOpen,
  onClose,
  productName,
  productPrice,
  availableToppings,
  selectedToppings,
  onToggleTopping,
  drinkQuantity,
  onChangeQuantity,
  currentTotalPrice,
  onConfirm,
}: ProductOptionModalProps) {
  useLockBodyScroll(isOpen);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    // ModalOverlay — luôn phủ kín viewport, canh giữa nội dung bên trong
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      style={{ position: "fixed" }}
      onClick={onClose}
    >
      {/* ModalContent */}
      <div
        className="bg-card w-full max-w-md max-h-[90vh] rounded-2xl border border-border shadow-modal overflow-hidden flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ModalHeader */}
        <div className="p-4 border-b border-border flex items-start justify-between bg-[#FAF7F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-2xl rounded-xl">
              ☕
            </div>
            <div>
              <h3 className="font-black text-foreground text-base tracking-tight leading-tight">
                {productName}
              </h3>
              <p className="text-xs text-primary font-extrabold mt-0.5">
                Đơn giá: {productPrice.toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
          {/* ModalCloseButton */}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 border border-border/80 text-muted-foreground rounded-full active:scale-90 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ModalBody */}
        <div className="p-5 overflow-y-auto space-y-4 flex-grow min-h-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Thêm Topping Highlands
            </span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              Đã chọn: {selectedToppings.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {availableToppings.map((topping) => {
              const isChecked = selectedToppings.some((t) => t.id === topping.id);
              return (
                <div
                  key={topping.id}
                  onClick={() => onToggleTopping(topping)}
                  className={`flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/70 border rounded-xl cursor-pointer select-none transition-all duration-200 ${
                    isChecked
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isChecked
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-border text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                    <span className="text-xs font-bold text-foreground">{topping.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-primary">
                    +{topping.price.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ModalFooter */}
        <div className="p-5 border-t border-border bg-[#FAF7F5] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Số lượng cốc:</span>
            <div className="flex items-center gap-2 bg-white border border-border px-2 py-1 rounded-xl shadow-sm">
              <button
                onClick={() => onChangeQuantity(Math.max(1, drinkQuantity - 1))}
                className="w-7 h-7 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground rounded-lg font-bold transition active:scale-90"
              >
                −
              </button>
              <span className="w-8 text-center font-black text-sm text-foreground">
                {drinkQuantity}
              </span>
              <button
                onClick={() => onChangeQuantity(drinkQuantity + 1)}
                className="w-7 h-7 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground rounded-lg font-bold transition active:scale-90"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={onConfirm}
            className="primary-btn flex items-center justify-center gap-2 shadow-premium font-black py-4 w-full"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            Thêm Vào Giỏ — {currentTotalPrice.toLocaleString("vi-VN")} đ
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}