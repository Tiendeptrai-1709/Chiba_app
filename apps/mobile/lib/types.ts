// Kiểu dữ liệu & quy tắc dùng chung — giữ khớp với apps/web/src/types/index.ts và backend.

export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'OWNER';

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: 'Khách hàng',
  STAFF: 'Nhân viên',
  ADMIN: 'Admin',
  OWNER: 'Chủ quán',
};

export const isManager = (role?: UserRole | null) => role === 'ADMIN' || role === 'OWNER';
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

// ----- Menu -----

export type ProductCategory = 'MON_NUOC' | 'TOPPING' | 'BANH';

export interface MenuGroup {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  groupId?: string | null;
  imageUrl?: string | null;
  stock: number;
  isAvailable: boolean;
}

export const LOW_STOCK = 5;

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
  id: string; // khóa theo món + topping + độ ngọt + đá
  productId: string;
  name: string;
  price: number; // đơn giá đã gồm topping
  quantity: number;
  selectedToppings?: CartTopping[];
  sugar?: SugarLevel;
  ice?: IceLevel;
}

// ----- Đơn hàng -----

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

// [nền, chữ] cho nhãn trạng thái
export const ORDER_STATUS_COLORS: Record<OrderStatus, [string, string]> = {
  PENDING: ['#FEF9C3', '#854D0E'],
  PREPARING: ['#DBEAFE', '#1E40AF'],
  READY: ['#D1FAE5', '#065F46'],
  DELIVERING: ['#E0E7FF', '#3730A3'],
  COMPLETED: ['#DCFCE7', '#166534'],
  CANCELLED: ['#E5E5E5', '#525252'],
};

export const isActiveOrder = (s: OrderStatus) => s !== 'COMPLETED' && s !== 'CANCELLED';

export const orderSteps = (orderType: OrderType): OrderStatus[] =>
  orderType === 'STORE'
    ? ['PENDING', 'PREPARING', 'READY', 'COMPLETED']
    : ['PENDING', 'PREPARING', 'DELIVERING', 'COMPLETED'];

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
  paidAt?: string | null;
  cancelledBy?: string | null;
}

// Quy tắc tính tiền — phải khớp backend (apps/api/src/services/order.service.ts, points.service.ts)
export const FREE_SHIP_THRESHOLD = 100_000;
export const SHIPPING_FEE = 20_000;
export const VND_PER_REDEEMED_POINT = 500;
export const MAX_DISCOUNT_RATIO = 0.2;

// ----- Điểm -----

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
  ADMIN_ADJUST: 'Điều chỉnh',
};

export interface PointTransaction {
  id: string;
  points: number;
  pointsBefore: number;
  pointsAfter: number;
  type: PointTransactionType;
  description: string;
  createdAt: string;
}

export const money = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
};

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

// Đơn của nhân viên có thêm thông tin khách
export type StaffOrder = Order & { user?: { customerCode: string; email: string } | null };

export const POINT_TYPE_COLORS: Record<PointTransactionType, [string, string]> = {
  EARNED_ORDER: ['#F0FDF4', '#15803D'],
  EARNED_STORE: ['#ECFDF5', '#047857'],
  REDEEMED_APP: ['#EFF6FF', '#1D4ED8'],
  REDEEMED_STORE: ['#FFF7ED', '#C2410C'],
  REFUND: ['#F0F9FF', '#0369A1'],
  ADMIN_ADJUST: ['#FAF5FF', '#7E22CE'],
};

// Giao dịch điểm trong nhật ký của Admin (kèm thông tin khách)
export type AdminPointTransaction = PointTransaction & {
  user?: { id: string; email: string; fullName: string; customerCode: string } | null;
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  MON_NUOC: 'Đồ uống',
  BANH: 'Bánh & đồ ăn',
  TOPPING: 'Topping',
};

// Thống kê món bán (GET /stats/menu)
export interface MenuStats {
  from: string;
  to: string;
  orderCount: number;
  revenue: number;
  itemRevenue: number;
  groups: { groupId: string | null; name: string; quantity: number; revenue: number }[];
  products: { productId: string; name: string; groupId: string | null; groupName: string; quantity: number; revenue: number }[];
}
