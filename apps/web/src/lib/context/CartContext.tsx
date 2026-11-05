'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, CartTopping, IceLevel, SugarLevel } from '@/types';

export interface AddItemInput {
  product: { id: string; name: string; price: number };
  toppings?: CartTopping[];
  quantity?: number;
  sugar?: SugarLevel;
  ice?: IceLevel;
}

interface CartContextType {
  items: CartItem[];
  addItem: (input: AddItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zen_fb_cart';

// Cùng món nhưng khác topping / độ ngọt / đá là các dòng riêng trong giỏ.
function cartKey(productId: string, toppings: CartTopping[], sugar?: SugarLevel, ice?: IceLevel) {
  const toppingIds = toppings.map((t) => t.id).sort().join('.');
  return [productId, toppingIds || '-', sugar ?? '-', ice ?? '-'].join('|');
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as CartItem[];
      // Bỏ dữ liệu giỏ kiểu cũ (chưa có productId).
      setItems(Array.isArray(parsed) ? parsed.filter((i) => i && i.productId) : []);
    } catch {}
  }, []);

  const saveCart = (next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const addItem = ({ product, toppings = [], quantity = 1, sugar, ice }: AddItemInput) => {
    const id = cartKey(product.id, toppings, sugar, ice);
    const existing = items.find((i) => i.id === id);
    if (existing) {
      saveCart(items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + quantity } : i)));
      return;
    }
    saveCart([
      ...items,
      {
        id,
        productId: product.id,
        name: product.name,
        price: product.price + toppings.reduce((s, t) => s + t.price, 0),
        quantity,
        selectedToppings: toppings,
        sugar,
        ice,
      },
    ]);
  };

  const removeItem = (id: string) => saveCart(items.filter((i) => i.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    saveCart(items.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => saveCart([]);

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
