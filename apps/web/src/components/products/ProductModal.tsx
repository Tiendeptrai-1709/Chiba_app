"use client";

import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Product, Topping } from "@chiba/api-client";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  availableToppings: Topping[];
  selectedToppings: Topping[];
  onToggleTopping: (topping: Topping) => void;
  drinkQuantity: number;
  onChangeQuantity: (qty: number) => void;
  currentTotalPrice: number;
  onConfirm: () => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
  availableToppings,
  selectedToppings,
  onToggleTopping,
  drinkQuantity,
  onChangeQuantity,
  currentTotalPrice,
  onConfirm,
}: ProductModalProps) {

  const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")} đ`;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden rounded-2xl p-0 shadow-modal sm:max-w-lg"
      >
        <DialogHeader className="border-b border-border bg-[#FAF7F5] p-5 pr-14">
          <div className="flex items-center gap-3">
            <div className=" rounded-xl bg-primary/10">
              {product?.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <span className="rounded-xl bg-primary/10 text-5xl">
                  {product?.category === "MON_NUOC"
                    ? 
                      "☕"
                    : product?.category === "TOPPING"
                      ? "🥛"
                      : "🍰"
                  }
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-base font-black">
                {product?.name}
              </DialogTitle>
              <p className="mt-1 text-xs font-extrabold text-primary">
                Đơn giá: {formatPrice(product?.price ?? 0)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="max-h-[55vh] bg-background overflow-y-auto p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Thêm Topping Highlands
            </p>
            <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
              Đã chọn: {selectedToppings.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {availableToppings.map((topping) => {
              const isChecked = selectedToppings.some(
                (selectedTopping) => selectedTopping.id === topping.id
              );

              return (
                <button
                  key={topping.id}
                  type="button"
                  aria-pressed={isChecked}
                  onClick={() => onToggleTopping(topping)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isChecked
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/30 hover:bg-muted/60"
                    }`}
                >
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-black ${isChecked
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background"
                        }`}
                    >
                      {isChecked ? "✓" : ""}
                    </span>
                    <span className="truncate text-xs font-bold text-foreground">
                      {topping.name}
                    </span>
                  </span>
                  <span className="ml-2 shrink-0 text-xs font-extrabold text-primary">
                    +{formatPrice(topping.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 border-t border-border bg-[#FAF7F5] p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-bold text-foreground">Số lượng cốc:</span>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-2 py-1">
              <button
                type="button"
                onClick={() => onChangeQuantity(Math.max(1, drinkQuantity - 1))}
                aria-label="Giảm số lượng"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-black text-foreground">
                {drinkQuantity}
              </span>
              <button
                type="button"
                onClick={() => onChangeQuantity(drinkQuantity + 1)}
                aria-label="Tăng số lượng"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShoppingCart className="h-[17px] w-[17px]" />
            <span>Thêm Vào Giỏ - {formatPrice(currentTotalPrice)}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}