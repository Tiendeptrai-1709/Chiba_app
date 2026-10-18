export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  customerCode: string;
  zenPoints: number;
  role: UserRole;
  isSuspended?: boolean;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  category: string;
}

export type ProductCategory = "ALL" | "MON_NUOC" | "TOPPING" | "BANH";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: ProductCategory;
  isAvailable?: boolean;
}

export interface CartItemTopping {
  id: string;
  cartItemId: string;
  toppingId: string;
  topping: Product;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
  toppings: CartItemTopping[];
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

// =========================
// ORDER
// =========================

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

export type OrderType = "DELIVERY" | "PICKUP";

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  toppings: OrderItemTopping[];
}

export interface OrderItemTopping {
  id: string;
  toppingId: string | null;
  toppingName: string;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  deliveryAddress: string | null;
  customerName: string | null;
  customerPhone: string | null;
  subtotal: number;
  pointsUsed: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  earnedPoints: number;
  note: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
}

// =========================
// POINT
// =========================

export type PointTransactionType =
  "EARNED_ORDER" | "REDEEMED_APP" | "REDEEMED_STORE" | "ADMIN_ADJUST";

export interface PointTransaction {
  id: string;

  userId: string;

  userEmail: string;

  userName: string;

  points: number;

  pointsBefore: number;

  pointsAfter: number;

  type: PointTransactionType;

  description: string;
}
