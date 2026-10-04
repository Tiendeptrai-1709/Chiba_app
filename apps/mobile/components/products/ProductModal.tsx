import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { X, ShoppingCart } from "lucide-react-native";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product, Topping } from "@chiba/api-client";



interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  availableToppings: Topping[];
  selectedToppings: Topping[];
  onToggleTopping: (topping: Topping) => void;
  drinkQuantity: number;
  onChangeQuantity: (qty: number) => void;
  currentTotalPrice: number;
  onConfirm: () => void;
  isAddingToCart: boolean;
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
  isAddingToCart
}: ProductModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="w-[92%] max-w-md rounded-2xl p-0 overflow-hidden">
        {/* ================= HEADER ================= */}
        <DialogHeader className="p-4 border-b border-border bg-[#FAF7F5]">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3 pr-3">
              {/* Product icon */}
              <View className="w-10 h-10 items-center justify-center rounded-xl bg-primary/10">
                <Text className="text-2xl">☕</Text>
              </View>

              <View className="flex-1">
                <DialogTitle className="text-base font-black">
                  {product.name}
                </DialogTitle>

                <Text className="text-xs text-primary font-extrabold mt-0.5">
                  Đơn giá: {product.price.toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-full border border-border/80 active:bg-muted"
            >
              <X size={16} className="text-muted-foreground" />
            </Pressable>
          </View>
        </DialogHeader>

        {/* ================= BODY ================= */}
        <ScrollView
          className="max-h-[55vh]"
          contentContainerClassName="p-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Topping header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Thêm Topping Highlands
            </Text>

            <View className="bg-primary/10 px-2 py-1 rounded">
              <Text className="text-[10px] font-bold text-primary">
                Đã chọn: {selectedToppings.length}
              </Text>
            </View>
          </View>

          {/* Topping list */}
          <View className="gap-2.5">
            {availableToppings.map((topping) => {
              const isChecked = selectedToppings.some(
                (t) => t.id === topping.id
              );

              return (
                <Pressable
                  key={topping.id}
                  onPress={() => onToggleTopping(topping)}
                  className={`flex-row items-center justify-between p-3.5 rounded-xl border ${isChecked
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/30"
                    }`}
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    {/* Checkbox */}
                    <View
                      className={`w-5 h-5 rounded-md items-center justify-center border ${isChecked
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                        }`}
                    >
                      {isChecked && (
                        <Text className="text-white text-xs font-black">
                          ✓
                        </Text>
                      )}
                    </View>

                    <Text className="flex-1 text-xs font-bold text-foreground">
                      {topping.name}
                    </Text>
                  </View>

                  <Text className="text-xs font-extrabold text-primary ml-2">
                    +{topping.price.toLocaleString("vi-VN")} đ
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* ================= FOOTER ================= */}
        <View className="p-5 border-t border-border bg-[#FAF7F5] gap-4">
          {/* Quantity */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-foreground">
              Số lượng cốc:
            </Text>

            <View className="flex-row items-center gap-2 bg-background border border-border px-2 py-1 rounded-xl">
              {/* Minus */}
              <Pressable
                onPress={() =>
                  onChangeQuantity(Math.max(1, drinkQuantity - 1))
                }
                className="w-8 h-8 items-center justify-center bg-muted rounded-lg border border-border active:opacity-70"
              >
                <Text className="text-base font-bold text-foreground">
                  −
                </Text>
              </Pressable>

              {/* Quantity */}
              <Text className="w-8 text-center text-sm font-black text-foreground">
                {drinkQuantity}
              </Text>

              {/* Plus */}
              <Pressable
                onPress={() => onChangeQuantity(drinkQuantity + 1)}
                className="w-8 h-8 items-center justify-center bg-muted rounded-lg border border-border active:opacity-70"
              >
                <Text className="text-base font-bold text-foreground">
                  +
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Confirm */}
          <Pressable
            onPress={onConfirm}
            className="w-full flex-row items-center justify-center gap-2 bg-primary rounded-xl py-4 active:opacity-80"
            disabled={isAddingToCart}
          >
            <ShoppingCart size={17} className="text-primary-foreground" />

            <Text className="text-sm font-black text-primary-foreground">
              {isAddingToCart
                ? "Đang thêm..."
                : `Thêm Vào Giỏ - ${currentTotalPrice.toLocaleString("vi-VN")} đ`}
            </Text>
          </Pressable>
        </View>
      </DialogContent>
    </Dialog>

  );
}