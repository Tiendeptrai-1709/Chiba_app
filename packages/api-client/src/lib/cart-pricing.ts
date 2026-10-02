
import type { CartItem } from "@chiba/api-client/src/types";

export type OrderType = "DELIVERY" | "PICKUP";

export const POINT_VALUE = 500;
export const MAX_DISCOUNT_RATE = 0.2;
export const FREE_SHIPPING_THRESHOLD = 100_000;
export const DELIVERY_FEE = 20_000;
export const POINTS_PER_AMOUNT = 10_000;

export const calculateCartSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const toppingsPrice = (item.toppings ?? []).reduce(
      (sum, cartTopping) => sum + cartTopping.topping.price,
      0,
    );

    const unitPrice = item.product.price + toppingsPrice;

    return total + unitPrice * item.quantity;
  }, 0);
};

export const calculateCartTotals = ({
  items,
  orderType,
  pointsToUse = 0,
}: {
  items: CartItem[];
  orderType: OrderType;
  pointsToUse?: number;
}) => {
  const subtotal = calculateCartSubtotal(items);

  // Mỗi điểm tương ứng 500đ, giới hạn giảm tối đa 20% tạm tính.
  const maxDiscountAmount = Math.floor(
    subtotal * MAX_DISCOUNT_RATE,
  );

  const maxPointsAllowed = Math.floor(
    maxDiscountAmount / POINT_VALUE,
  );

  const validPointsToUse = Math.min(
    Math.max(0, Math.floor(pointsToUse)),
    maxPointsAllowed,
  );

  const discountAmount = validPointsToUse * POINT_VALUE;

  // Phí giao hàng được tính theo tạm tính trước khi giảm điểm.
  const shippingFee =
    orderType === "PICKUP"
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : DELIVERY_FEE;

  const finalPrice = subtotal - discountAmount + shippingFee;

  // Không tính phí giao hàng khi tích điểm.
  const earnedPoints = Math.floor(
    (subtotal - discountAmount) / POINTS_PER_AMOUNT,
  );

  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return {
    subtotal,
    totalItems,
    maxDiscountAmount,
    maxPointsAllowed,
    validPointsToUse,
    discountAmount,
    shippingFee,
    finalPrice,
    earnedPoints,
  };
};
