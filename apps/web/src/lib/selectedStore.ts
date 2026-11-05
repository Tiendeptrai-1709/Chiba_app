import { Store } from '@/types';

// Chi nhánh khách đang chọn — chỉ là lựa chọn trên máy này, lưu trong localStorage.
const KEY = 'chiba_selected_store';

export type SelectedStore = Pick<Store, 'id' | 'name' | 'address'>;

export function getSelectedStore(): SelectedStore | null {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as SelectedStore) : null;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSelectedStore(store: SelectedStore | null) {
  try {
    if (store) localStorage.setItem(KEY, JSON.stringify({ id: store.id, name: store.name, address: store.address }));
    else localStorage.removeItem(KEY);
    // Dọn khóa kiểu cũ (chỉ lưu tên, không có id)
    localStorage.removeItem('zen_selected_store');
    localStorage.removeItem('zen_selected_store_address');
  } catch {}
}
