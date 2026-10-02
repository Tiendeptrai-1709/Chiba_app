
import { api } from "@/lib/axios";
import {
  useClearCart,
  useGetCart,
  useRemoveItem,
  useUpdateItem,
} from "@chiba/api-client";
import { CartItem } from "@chiba/api-client/src/types";
import { Coffee, Trash2, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

export const CartItemsList = () => {
  const {
    data: carts,
    isLoading,
    isError,
  } = useGetCart(api);

  const {
    mutate: updateItem,
  } = useUpdateItem(api);

  const {
    mutate: removeItem,
    isPending: isRemoving,
  } = useRemoveItem(api);

  const {
    mutate: clearCart,
    isPending: isClearing,
  } = useClearCart(api);

  const [isOpen, setIsOpen] = useState(false);

  const items = carts?.items ?? [];

  const handleUpdateItem = (
    itemId: string,
    quantity: number
  ) => {
    if (quantity < 1) return;

    updateItem({
      itemId,
      quantity,
    });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleClearCart = () => {
    if (items.length === 0 || isClearing) return;

    setIsOpen(true);
  };

  const handleConfirmClearCart = () => {
    clearCart(undefined, {
      onSuccess: () => {
        setIsOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center py-10">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-3 text-sm text-gray-500">
          Đang tải giỏ hàng...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center rounded-xl bg-red-50 p-4">
        <Text className="text-center text-sm text-red-600">
          Không thể tải giỏ hàng. Vui lòng thử lại.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {/* Clear cart action */}
      {items.length > 0 && (
        <Pressable
          onPress={handleClearCart}
          disabled={isClearing}
          className="self-end py-2"
        >
          <Text className="font-medium text-red-600">
            Xóa tất cả
          </Text>
        </Pressable>
      )}

      {/* Cart items */}
      {items.map((item: CartItem) => {
        const toppingsPrice = item.toppings.reduce(
          (sum, cartTopping) =>
            sum + cartTopping.topping.price,
          0
        );

        const itemUnitPrice =
          item.product.price + toppingsPrice;

        const itemTotalPrice =
          itemUnitPrice * item.quantity;

        return (
          <View
            key={item.id}
            className="flex-row items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
          >
            {/* Product icon */}
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Coffee size={24} className="text-primary" />
            </View>

            {/* Product details */}
            <View className="min-w-0 flex-1">
              <Text
                className="font-semibold text-sm leading-snug"
                numberOfLines={2}
              >
                {item.product.name}
              </Text>

              {item.toppings.length > 0 && (
                <Text
                  className="text-[10px] text-muted-foreground mt-0.5 leading-tight italic font-medium"
                  numberOfLines={2}
                >
                  + Topping:{" "}
                  {item.toppings
                    .map(
                      (cartTopping) =>
                        cartTopping.topping.name
                    )
                    .join(", ")}
                </Text>
              )}

              <Text className="text-primary font-bold text-sm mt-1">
                {itemTotalPrice.toLocaleString("vi-VN")}₫
              </Text>
            </View>

            {/* Quantity controls */}
            <View className="flex-row items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">
              <Pressable
                onPress={() =>
                  handleUpdateItem(
                    item.id,
                    item.quantity - 1
                  )
                }
                disabled={item.quantity <= 1 }
                className="h-8 w-7 items-center justify-center"
              >
                <Text
                  className={`text-lg font-bold ${
                    item.quantity <= 1
                      ? "text-gray-300"
                      : "text-gray-800"
                  }`}
                >
                  −
                </Text>
              </Pressable>

              <Text className="w-5 text-center text-sm font-bold text-gray-900">
                {item.quantity}
              </Text>

              <Pressable
                onPress={() =>
                  handleUpdateItem(
                    item.id,
                    item.quantity + 1
                  )
                }
                className="h-8 w-7 items-center justify-center"
              >
                <Text
                  className={`text-lg font-bold $`}
                >
                  +
                </Text>
              </Pressable>
            </View>

            {/* Remove item */}
            <Pressable
              onPress={() => handleRemoveItem(item.id)}
              disabled={isRemoving}
              className="items-center justify-center p-2"
              accessibilityRole="button"
              accessibilityLabel={`Xóa ${item.product.name}`}
            >
              <Trash2 size={20} color="#dc2626" />
            </Pressable>
          </View>
        );
      })}

      {/* Empty cart */}
      {items.length === 0 && (
        <View className="items-center justify-center rounded-xl border border-dashed border-gray-300 py-10">
          <Coffee size={36} color="#9ca3af" />

          <Text className="mt-3 text-sm text-gray-500">
            Giỏ hàng của bạn đang trống
          </Text>
        </View>
      )}

      {/* Clear cart confirmation modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <View className="w-full max-w-md overflow-hidden rounded-2xl bg-white">
            {/* Modal header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 bg-[#FAF7F5] p-5">
              <Text className="flex-1 text-base font-bold text-gray-900">
                Xóa tất cả sản phẩm trong giỏ hàng
              </Text>

              <Pressable
                onPress={() => setIsOpen(false)}
                disabled={isClearing}
                className="ml-2 h-8 w-8 items-center justify-center rounded-full"
                accessibilityRole="button"
                accessibilityLabel="Đóng"
              >
                <X size={20} color="#6b7280" />
              </Pressable>
            </View>

            {/* Modal content */}
            <View className="gap-5 bg-[#FAF7F5] p-5">
              <Text className="text-sm text-gray-700">
                Bạn có chắc muốn xóa toàn bộ sản phẩm
                trong giỏ hàng không?
              </Text>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setIsOpen(false)}
                  disabled={isClearing}
                  className="flex-1 items-center rounded-xl border border-gray-300 bg-white py-3"
                >
                  <Text className="font-semibold text-gray-700">
                    Không
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmClearCart}
                  disabled={isClearing}
                  className={`flex-1 flex-row items-center justify-center rounded-xl bg-red-600 py-3 ${
                    isClearing ? "opacity-60" : ""
                  }`}
                >
                  {isClearing ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="font-semibold text-white">
                      Đồng ý
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
