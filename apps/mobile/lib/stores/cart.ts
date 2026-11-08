import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CartItem, CartTopping, IceLevel, Product, Store, SugarLevel } from '../types';

export type SelectedStore = Pick<Store, 'id' | 'name' | 'address'>;

interface AddItemInput {
  product: Product;
  quantity?: number;
  toppings?: CartTopping[];
  sugar?: SugarLevel;
  ice?: IceLevel;
}

interface CartState {
  items: CartItem[];
  store: SelectedStore | null; // chi nhánh đang chọn
  addItem: (input: AddItemInput) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  setStore: (store: SelectedStore | null) => void;
}

// Món giống hệt (cùng topping, độ ngọt, đá) thì gộp chung một dòng
const lineKey = (productId: string, toppings: CartTopping[], sugar?: number, ice?: string) =>
  [productId, toppings.map((t) => t.id).sort().join(','), sugar ?? '', ice ?? ''].join('|');

// Giỏ hàng lưu trên máy (giống web lưu trong trình duyệt), giữ lại khi tắt app.
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      store: null,

      addItem: ({ product, quantity = 1, toppings = [], sugar, ice }) => {
        const id = lineKey(product.id, toppings, sugar, ice);
        const existing = get().items.find((i) => i.id === id);
        if (existing) {
          set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + quantity } : i)) });
          return;
        }
        const price = product.price + toppings.reduce((s, t) => s + t.price, 0);
        set({
          items: [
            ...get().items,
            { id, productId: product.id, name: product.name, price, quantity, selectedToppings: toppings, sugar, ice },
          ],
        });
      },

      setQuantity: (id, quantity) => {
        if (quantity <= 0) return get().removeItem(id);
        set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: Math.min(quantity, 50) } : i)) });
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      setStore: (store) => set({ store }),
    }),
    { name: 'chiba-cart', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const cartTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((s, i) => s + i.quantity, 0),
  totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
});

// Giống backend (stockNeeded): mỗi ly trừ 1, mỗi topping trừ 1 theo số ly
export function cartStockNeeded(items: CartItem[]): Map<string, number> {
  const needed = new Map<string, number>();
  const add = (id: string, qty: number) => needed.set(id, (needed.get(id) ?? 0) + qty);
  for (const item of items) {
    add(item.productId, item.quantity);
    for (const t of item.selectedToppings ?? []) add(t.id, item.quantity);
  }
  return needed;
}

// Các món trong giỏ đang vượt số lượng còn lại / đã hết / đã bị xóa khỏi menu
export function cartStockProblems(items: CartItem[], getById: (id: string) => Product | undefined) {
  const problems: { productId: string; name: string; needed: number; stock: number }[] = [];
  for (const [productId, needed] of cartStockNeeded(items)) {
    const product = getById(productId);
    const stock = product?.stock ?? 0;
    if (needed > stock) problems.push({ productId, name: product?.name ?? 'Món đã bị xóa', needed, stock });
  }
  return problems;
}
