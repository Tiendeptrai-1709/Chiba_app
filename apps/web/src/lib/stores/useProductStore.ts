import { create } from 'zustand';
import { Product, ProductCategory } from '@/types';
import { apiRequest } from '@/lib/api/client';

interface ProductState {
  products: Product[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetchProducts: (force?: boolean) => Promise<void>;
  getById: (id: string) => Product | undefined;
  // Nhân viên đặt số lượng còn bán được (0 = hết hàng)
  setStock: (id: string, stock: number) => Promise<void>;
  uploadImage: (id: string, file: File) => Promise<void>;
  removeImage: (id: string) => Promise<void>;
  // Admin
  createProduct: (data: ProductInput) => Promise<Product>;
  updateProduct: (id: string, data: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export interface ProductInput {
  name: string;
  price: number;
  category: ProductCategory;
  stock?: number; // chỉ dùng khi thêm món mới
}

// Menu dùng chung cho trang khách, giỏ hàng và dashboard.
export const useProductStore = create<ProductState>((set, get) => {
  const replace = (updated: Product) =>
    set({ products: get().products.map((p) => (p.id === updated.id ? updated : p)) });

  return {
    products: [],
    loaded: false,
    loading: false,
    error: null,

    fetchProducts: async (force = false) => {
      if (get().loading || (get().loaded && !force)) return;
      set({ loading: true, error: null });
      try {
        const products = await apiRequest<Product[]>('/products', { auth: false });
        set({ products, loaded: true });
      } catch (e: any) {
        set({ error: e?.message ?? 'Không tải được menu' });
      } finally {
        set({ loading: false });
      }
    },

    getById: (id) => get().products.find((p) => p.id === id),

    setStock: async (id, stock) => {
      replace(await apiRequest<Product>(`/products/${id}/stock`, { method: 'PATCH', body: { stock } }));
    },

    uploadImage: async (id, file) => {
      const form = new FormData();
      form.append('image', file);
      replace(await apiRequest<Product>(`/products/${id}/image`, { method: 'POST', body: form }));
    },

    removeImage: async (id) => {
      replace(await apiRequest<Product>(`/products/${id}/image`, { method: 'DELETE' }));
    },

    createProduct: async (data) => {
      const created = await apiRequest<Product>('/products', { method: 'POST', body: data });
      set({ products: [...get().products, created] });
      return created;
    },

    updateProduct: async (id, data) => {
      replace(await apiRequest<Product>(`/products/${id}`, { method: 'PATCH', body: data }));
    },

    deleteProduct: async (id) => {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      set({ products: get().products.filter((p) => p.id !== id) });
    },
  };
});
