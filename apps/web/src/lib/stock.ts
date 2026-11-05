import { CartItem, Product } from '@/types';

// Giống backend (order.service.ts → stockNeeded): mỗi ly/phần trừ 1,
// mỗi topping trừ 1 theo số ly; cùng món ở nhiều dòng giỏ được cộng dồn.
export function cartStockNeeded(items: CartItem[]): Map<string, number> {
  const needed = new Map<string, number>();
  const add = (id: string, qty: number) => needed.set(id, (needed.get(id) ?? 0) + qty);
  for (const item of items) {
    add(item.productId, item.quantity);
    for (const t of item.selectedToppings ?? []) add(t.id, item.quantity);
  }
  return needed;
}

export interface StockProblem {
  productId: string;
  name: string;
  needed: number;
  stock: number; // 0 = hết hàng / món không còn trong menu
}

// Các món trong giỏ đang vượt số lượng còn lại (hoặc đã hết / bị xóa khỏi menu)
export function cartStockProblems(items: CartItem[], getById: (id: string) => Product | undefined): StockProblem[] {
  const problems: StockProblem[] = [];
  for (const [productId, needed] of cartStockNeeded(items)) {
    const product = getById(productId);
    const stock = product?.stock ?? 0;
    if (needed > stock) problems.push({ productId, name: product?.name ?? 'Món đã bị xóa', needed, stock });
  }
  return problems;
}
