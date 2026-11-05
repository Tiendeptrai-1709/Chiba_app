import { create } from 'zustand';
import { PointTransaction, User } from '@/types';
import { apiRequest, AuthTokens, setSessionExpiredHandler, tokenStore } from '@/lib/api/client';
import { getLocalInvites, saveLocalInvites } from '@/lib/mock/localData';

interface AuthResponse extends AuthTokens {
  user: User;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // true khi đang khôi phục phiên lúc mở trang hoặc đang đăng nhập/đăng ký.
  loading: boolean;
  allUsers: User[];
  invitedStaffEmails: string[];
  activeStaffList: User[];

  // Xác thực (API thật)
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;

  // Hồ sơ (API thật)
  updateProfileName: (fullName: string) => Promise<void>;
  updateProfilePhone: (phone: string) => Promise<void>;
  updateProfileAddress: (address: string) => Promise<void>;
  deleteAccount: (action: 'SUSPEND' | 'DELETE') => Promise<void>;

  // Quản trị (API thật, ADMIN/STAFF)
  fetchAllUsers: () => Promise<User[]>;
  getAllUsers: () => User[];

  // Lấy lại thông tin user (vd. điểm vừa được cộng tại quầy)
  refreshUser: () => Promise<void>;

  // Điểm thưởng (API thật): 'me' = của chính mình, 'all' = toàn hệ thống (ADMIN)
  fetchPointHistory: (scope: 'me' | 'all') => Promise<PointTransaction[]>;

  // TẠM THỜI lưu cục bộ — chưa có API backend
  inviteStaff: (email: string) => Promise<void>;
  revokeInvitation: (email: string) => Promise<void>;
}

const SIGNED_OUT = { user: null, isAuthenticated: false, allUsers: [], activeStaffList: [] };

export const useAuthStore = create<AuthState>((set, get) => {
  const setUser = (user: User) => set({ user, isAuthenticated: true });

  const startSession = (data: AuthResponse) => {
    tokenStore.save(data);
    setUser(data.user);
  };

  const updateProfile = async (data: Partial<Pick<User, 'fullName' | 'phone' | 'address'>>) => {
    if (!get().user) throw new Error('Chưa đăng nhập');
    const updated = await apiRequest<User>('/users/me', { method: 'PATCH', body: data });
    setUser(updated);
  };

  setSessionExpiredHandler(() => set(SIGNED_OUT));

  return {
    ...SIGNED_OUT,
    loading: true,
    invitedStaffEmails: [],

    initAuth: async () => {
      set({ invitedStaffEmails: getLocalInvites() });
      if (!tokenStore.getRefresh()) {
        set({ ...SIGNED_OUT, loading: false });
        return;
      }
      try {
        const user = await apiRequest<User>('/auth/me');
        setUser(user);
      } catch {
        tokenStore.clear();
        set(SIGNED_OUT);
      } finally {
        set({ loading: false });
      }
    },

    login: async (email, password) => {
      set({ loading: true });
      try {
        const data = await apiRequest<AuthResponse>('/auth/login', {
          method: 'POST',
          body: { email, password },
          auth: false,
        });
        startSession(data);
      } finally {
        set({ loading: false });
      }
    },

    register: async (email, password, fullName) => {
      set({ loading: true });
      try {
        const data = await apiRequest<AuthResponse>('/auth/register', {
          method: 'POST',
          body: { email, password, fullName },
          auth: false,
        });
        startSession(data);
      } finally {
        set({ loading: false });
      }
    },

    logout: async () => {
      // Thu hồi refresh token phía server; lỗi mạng cũng không chặn việc đăng xuất.
      if (tokenStore.getAccess()) {
        await apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
      }
      tokenStore.clear();
      set(SIGNED_OUT);
    },

    updateProfileName: (fullName) => updateProfile({ fullName: fullName.trim() }),
    updateProfilePhone: (phone) => updateProfile({ phone: phone.trim() }),
    updateProfileAddress: (address) => updateProfile({ address: address.trim() }),

    deleteAccount: async (action) => {
      if (!get().user) throw new Error('Chưa đăng nhập');
      if (action === 'SUSPEND') {
        await apiRequest('/users/me/suspend', { method: 'POST' });
      } else {
        await apiRequest('/users/me', { method: 'DELETE' });
      }
      tokenStore.clear();
      set(SIGNED_OUT);
    },

    fetchAllUsers: async () => {
      const users = await apiRequest<User[]>('/users');
      set({ allUsers: users, activeStaffList: users.filter((u) => u.role === 'STAFF') });
      return users;
    },

    getAllUsers: () => get().allUsers,

    inviteStaff: async (email) => {
      const normalized = email.toLowerCase().trim();
      if (!normalized) return;
      const invites = getLocalInvites();
      if (invites.includes(normalized)) throw new Error('Email này đã nằm trong danh sách được mời');
      if (get().allUsers.some((u) => u.email === normalized)) {
        throw new Error('Email này đã được đăng ký tài khoản trên hệ thống');
      }
      const next = [...invites, normalized];
      saveLocalInvites(next);
      set({ invitedStaffEmails: next });
    },

    revokeInvitation: async (email) => {
      const normalized = email.toLowerCase().trim();
      const next = getLocalInvites().filter((e) => e !== normalized);
      saveLocalInvites(next);
      set({ invitedStaffEmails: next });
    },

    refreshUser: async () => {
      if (!get().isAuthenticated) return;
      try {
        setUser(await apiRequest<User>('/auth/me'));
      } catch {}
    },

    fetchPointHistory: (scope) => apiRequest<PointTransaction[]>(scope === 'me' ? '/points/me' : '/points'),
  };
});
