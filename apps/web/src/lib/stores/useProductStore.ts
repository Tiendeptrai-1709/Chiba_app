import { create } from 'zustand';
import { Product } from '@/types';
import { apiRequest } from '@/lib/api/client';

interface ProductState {
  products: Product[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetchProducts: (force?: boolean) => Promise<void>;
  getById: (id: string) => Product | undefined;
  setAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  uploadImage: (id: string, file: File) => Promise<void>;
  removeImage: (id: string) => Promise<void>;
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

    setAvailability: async (id, isAvailable) => {
      replace(await apiRequest<Product>(`/products/${id}/availability`, { method: 'PATCH', body: { isAvailable } }));
    },

    uploadImage: async (id, file) => {
      const form = new FormData();
      form.append('image', file);
      replace(await apiRequest<Product>(`/products/${id}/image`, { method: 'POST', body: form }));
    },

    removeImage: async (id) => {
      replace(await apiRequest<Product>(`/products/${id}/image`, { method: 'DELETE' }));
    },
  };
});
