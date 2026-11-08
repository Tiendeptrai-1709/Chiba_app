import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { create } from 'zustand';
import { apiRequest } from '../api';
import { MenuGroup, Product, ProductCategory } from '../types';

export interface ProductInput {
  name: string;
  price: number;
  category: ProductCategory;
  groupId?: string | null;
  stock?: number; // chỉ dùng khi thêm món mới
}

// Ảnh chọn từ máy (expo-image-picker)
export interface PickedImage {
  uri: string;
  name: string;
  type: string; // image/jpeg | image/png | image/webp
}

interface ProductState {
  products: Product[];
  groups: MenuGroup[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  getById: (id: string) => Product | undefined;
  // Nhân viên đặt số lượng còn bán được (0 = hết hàng)
  setStock: (id: string, stock: number) => Promise<void>;
  // Admin
  createProduct: (data: ProductInput) => Promise<Product>;
  updateProduct: (id: string, data: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (id: string, image: PickedImage) => Promise<void>;
  removeImage: (id: string) => Promise<void>;
  createGroup: (name: string) => Promise<MenuGroup>;
  renameGroup: (id: string, name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  moveGroup: (id: string, direction: -1 | 1) => Promise<void>;
}

// Menu dùng chung cho trang chủ, bảng chọn món, giỏ hàng và bảng điều khiển (giống web: useProductStore)
export const useProducts = create<ProductState>((set, get) => {
  const replace = (updated: Product) => set({ products: get().products.map((p) => (p.id === updated.id ? updated : p)) });

  return {
    products: [],
    groups: [],
    loaded: false,
    loading: false,
    error: null,

    fetch: async () => {
      if (get().loading) return;
      set({ loading: true, error: null });
      try {
        const [products, groups] = await Promise.all([
          apiRequest<Product[]>('/products', { auth: false }),
          apiRequest<MenuGroup[]>('/menu-groups', { auth: false }),
        ]);
        set({ products, groups, loaded: true });
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

    uploadImage: async (id, image) => {
      const form = new FormData();
      if (Platform.OS === 'web') {
        // Bản web: ảnh chọn được là blob: URL → đọc thành Blob
        const blob = await (await fetch(image.uri)).blob();
        form.append('image', blob, image.name);
      } else {
        // Expo SDK 58 thay fetch bằng expo/fetch: KHÔNG nhận kiểu { uri, name, type } cũ của React Native,
        // phải gửi đối tượng File (expo-file-system) — nó tự đọc nội dung file.
        form.append('image', new File(image.uri) as unknown as Blob, image.name);
      }
      replace(await apiRequest<Product>(`/products/${id}/image`, { method: 'POST', body: form }));
    },

    removeImage: async (id) => {
      replace(await apiRequest<Product>(`/products/${id}/image`, { method: 'DELETE' }));
    },

    createGroup: async (name) => {
      const created = await apiRequest<MenuGroup>('/menu-groups', { method: 'POST', body: { name } });
      set({ groups: [...get().groups, created] });
      return created;
    },

    renameGroup: async (id, name) => {
      const updated = await apiRequest<MenuGroup>(`/menu-groups/${id}`, { method: 'PATCH', body: { name } });
      set({ groups: get().groups.map((g) => (g.id === id ? updated : g)) });
    },

    deleteGroup: async (id) => {
      await apiRequest(`/menu-groups/${id}`, { method: 'DELETE' });
      // Món trong danh mục này chuyển về "Chưa phân danh mục" (giống server)
      set({
        groups: get().groups.filter((g) => g.id !== id),
        products: get().products.map((p) => (p.groupId === id ? { ...p, groupId: null } : p)),
      });
    },

    moveGroup: async (id, direction) => {
      const ids = get().groups.map((g) => g.id);
      const from = ids.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= ids.length) return;
      [ids[from], ids[to]] = [ids[to], ids[from]];
      set({ groups: await apiRequest<MenuGroup[]>('/menu-groups/reorder', { method: 'PATCH', body: { ids } }) });
    },
  };
});
