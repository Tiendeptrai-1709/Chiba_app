import { create } from 'zustand';
import { apiRequest, AuthTokens, setSessionExpiredHandler, tokenStore } from '../api';
import { User } from '../types';
import { useCart } from './cart';

interface AuthState {
  user: User | null;
  ready: boolean; // đã đọc token & kiểm tra phiên xong
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'fullName' | 'phone' | 'address'>>) => Promise<void>;
  suspendAccount: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

type AuthResponse = AuthTokens & { user: User };

export const useAuth = create<AuthState>((set, get) => {
  const signOutLocally = async () => {
    await tokenStore.clear();
    useCart.getState().clear();
    set({ user: null });
  };

  // Gia hạn token thất bại (bị đăng xuất ở thiết bị khác, khóa tài khoản...) → về màn đăng nhập
  setSessionExpiredHandler(() => set({ user: null }));

  return {
    user: null,
    ready: false,

    init: async () => {
      try {
        if (await tokenStore.load()) {
          const user = await apiRequest<User>('/auth/me');
          set({ user });
        }
      } catch {
        // Mất mạng / phiên hết hạn: coi như chưa đăng nhập
      } finally {
        set({ ready: true });
      }
    },

    login: async (email, password) => {
      const res = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email: email.trim().toLowerCase(), password },
      });
      await tokenStore.save(res);
      set({ user: res.user });
    },

    register: async ({ email, password, fullName }) => {
      const res = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        auth: false,
        body: { email: email.trim().toLowerCase(), password, fullName: fullName.trim() },
      });
      await tokenStore.save(res);
      set({ user: res.user });
    },

    logout: async () => {
      await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
      await signOutLocally();
    },

    refreshUser: async () => {
      if (!get().user) return;
      try {
        set({ user: await apiRequest<User>('/auth/me') });
      } catch {}
    },

    updateProfile: async (data) => {
      set({ user: await apiRequest<User>('/users/me', { method: 'PATCH', body: data }) });
    },

    suspendAccount: async () => {
      await apiRequest('/users/me/suspend', { method: 'POST' });
      await signOutLocally();
    },

    deleteAccount: async () => {
      await apiRequest('/users/me', { method: 'DELETE' });
      await signOutLocally();
    },
  };
});
