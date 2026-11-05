// OWNER (chủ quán) = mọi quyền của ADMIN + đổi vai trò người dùng. Chỉ đặt OWNER trong database.
export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'OWNER';

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: 'Khách hàng',
  STAFF: 'Nhân viên',
  ADMIN: 'Admin',
  OWNER: 'Chủ quán',
};

// ADMIN hoặc OWNER
export const isManager = (role?: UserRole | null) => role === 'ADMIN' || role === 'OWNER';
// Nhân sự cửa hàng (vào được bảng điều khiển)
export const isStaffMember = (role?: UserRole | null) => role === 'STAFF' || isManager(role);

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
  stock: number; // số phần còn bán được
  isAvailable: boolean; // = stock > 0 (server tính sẵn)
  sortOrder?: number;
}

// Từ ngưỡng này trở xuống thì báo "Sắp hết"
export const LOW_STOCK = 5;

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

// Luồng: PENDING → PREPARING → (READY nếu nhận tại quán | DELIVERING nếu giao) → COMPLETED
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'DELIVERY' | 'STORE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  PREPARING: 'Đang pha chế',
  READY: 'Sẵn sàng — mời đến lấy',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  READY: 'bg-emerald-100 text-emerald-800',
  DELIVERING: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-neutral-200 text-neutral-600',
};

export const isActiveOrder = (s: OrderStatus) => s !== 'COMPLETED' && s !== 'CANCELLED';

// Các bước hiển thị cho khách theo hình thức nhận hàng
export const orderSteps = (orderType: OrderType): OrderStatus[] =>
  orderType === 'STORE'
    ? ['PENDING', 'PREPARING', 'READY', 'COMPLETED']
    : ['PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED'];

// Bước tiếp theo nhân viên bấm (khớp backend: allowedNextStatuses)
export function nextStaffStep(order: Pick<Order, 'status' | 'orderType'>): { status: OrderStatus; label: string } | null {
  switch (order.status) {
    case 'PENDING':
      return { status: 'PREPARING', label: 'Nhận đơn & pha chế' };
    case 'PREPARING':
      return order.orderType === 'STORE'
        ? { status: 'READY', label: 'Đã xong — báo khách đến lấy' }
        : { status: 'DELIVERING', label: 'Bắt đầu giao hàng' };
    case 'READY':
      return { status: 'COMPLETED', label: 'Khách đã nhận ✓' };
    case 'DELIVERING':
      return { status: 'COMPLETED', label: 'Đã giao xong ✓' };
    default:
      return null;
  }
}

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
  completedAt?: string | null;
  cancelledAt?: string | null;
  paidAt?: string | null; // cửa hàng xác nhận đã nhận tiền
  cancelledBy?: string | null; // "CUSTOMER" nếu khách tự hủy
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
