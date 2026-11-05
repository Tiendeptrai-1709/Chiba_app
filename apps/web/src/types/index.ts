export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

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

// ----- Sản phẩm -----

export type ProductCategory = 'MON_NUOC' | 'TOPPING' | 'BANH';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string | null;
  isAvailable: boolean;
  sortOrder?: number;
}

// ----- Tùy chọn đồ uống -----

export const SUGAR_LEVELS = [100, 70, 50, 30, 0] as const;
export type SugarLevel = (typeof SUGAR_LEVELS)[number];

export const ICE_LEVELS = ['NORMAL', 'LESS', 'NONE', 'SEPARATE'] as const;
export type IceLevel = (typeof ICE_LEVELS)[number];

export const ICE_LABELS: Record<IceLevel, string> = {
  NORMAL: 'Đá bình thường',
  LESS: 'Ít đá',
  NONE: 'Không đá',
  SEPARATE: 'Đá để riêng',
};

export const sugarLabel = (sugar: number) => (sugar === 0 ? 'Không đường' : `${sugar}% đường`);

// ----- Giỏ hàng -----

export interface CartTopping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // khóa duy nhất theo món + topping + độ ngọt + đá
  productId: string;
  name: string;
  price: number; // đơn giá đã gồm topping
  quantity: number;
  selectedToppings?: CartTopping[];
  sugar?: SugarLevel;
  ice?: IceLevel;
}

// ----- Đơn hàng -----

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'DELIVERY' | 'STORE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đang pha chế',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
};

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  toppings: CartTopping[];
  sugar: number | null;
  ice: IceLevel | null;
  lineTotal: number;
}

export interface Order {
  id: string;
  code: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  storeId: string | null;
  storeName: string | null;
  orderType: OrderType;
  address: string | null;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  pointsUsed: number;
  discountAmount: number;
  total: number;
  pointsEarned: number;
  status: OrderStatus;
  createdAt: string;
  user?: { customerCode: string; email: string } | null;
}

// ----- Điểm thưởng -----

export type PointTransactionType =
  | 'EARNED_ORDER'
  | 'EARNED_STORE'
  | 'REDEEMED_APP'
  | 'REDEEMED_STORE'
  | 'REFUND'
  | 'ADMIN_ADJUST';

export const POINT_TYPE_LABELS: Record<PointTransactionType, string> = {
  EARNED_ORDER: 'Tích đơn online',
  EARNED_STORE: 'Tích tại quầy',
  REDEEMED_APP: 'Dùng điểm app',
  REDEEMED_STORE: 'Đổi quà tại quầy',
  REFUND: 'Hoàn điểm',
  ADMIN_ADJUST: 'Admin chỉnh',
};

export interface PointTransaction {
  id: string;
  userId: string;
  points: number; // dương = cộng, âm = trừ
  pointsBefore: number;
  pointsAfter: number;
  type: PointTransactionType;
  description: string;
  createdAt: string;
  user?: { id: string; email: string; fullName: string; customerCode: string };
}
