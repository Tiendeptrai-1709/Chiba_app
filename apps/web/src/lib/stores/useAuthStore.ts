import { create } from 'zustand';
import { User, PointTransaction, PointTransactionType } from '@/types';

interface AuthState {
  accessToken: string | null;

  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
  // login: (email: string, password: string) => Promise<void>;
  // register: (email: string, password: string, fullName: string) => Promise<void>;
  // logout: () => void;
  // updateProfileName: (fullName: string) => Promise<void>;
  // updateProfilePhone: (phone: string) => Promise<void>;
  // updateProfileAddress: (address: string) => Promise<void>;
  // getAllUsers: () => User[];
  // updateUserPoints: (userId: string, pointsChange: number, type: PointTransactionType, description: string) => Promise<void>;
  // getPointHistory: (userId?: string) => PointTransaction[];
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,

  setAccessToken: (accessToken) => {
    set({ accessToken })
  },

  clearAccessToken: () => {
    set({ accessToken: null })
  }
  // login: async (email, password) => {
  //   set({ loading: false });
  //   try {
  //     const users = getMockUsers();
  //     const foundUser = users[email.toLowerCase().trim()];

  //     if (!foundUser || foundUser.password !== password) {
  //       set({ loading: false });
  //       throw new Error('Sai tài khoản hoặc mật khẩu');
  //     }

  //     if (foundUser.isSuspended) {
  //       set({ loading: false });
  //       throw new Error('Tài khoản này đang tạm ngưng hoạt động');
  //     }

  //     const { password: _, ...safeUser } = foundUser;
  //     const mockToken = `mock_jwt_token_${foundUser.id}_${Date.now()}`;

  //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  //     localStorage.setItem(TOKEN_KEY, mockToken);
  //     set({ user: safeUser as User, token: mockToken, isAuthenticated: true, loading: false });
  //   } catch (error) {
  //     console.log("error Login /lib/stores/useAuthStore", error)
  //     set({ isAuthenticated: false, loading: false })
  //   }
  //   // await new Promise((r) => setTimeout(r, 800));


  // },

  // register: async (email, password, fullName) => {
  //   set({ loading: true });
  //   await new Promise((r) => setTimeout(r, 800));

  //   const users = getMockUsers();
  //   const normalizedEmail = email.toLowerCase().trim();

  //   if (users[normalizedEmail]) {
  //     set({ loading: false });
  //     throw new Error('Email đã được đăng ký trên hệ thống');
  //   }

  //   const invites = JSON.parse(localStorage.getItem(STAFF_INVITES_KEY) || '[]');
  //   const isInvited = invites.includes(normalizedEmail);
  //   const role = isInvited ? 'STAFF' : 'CUSTOMER';

  //   const randomCode = 'Z00' + Math.floor(100000 + Math.random() * 900000);
  //   const mockUser = {
  //     id: `user_${Date.now()}`,
  //     email: normalizedEmail,
  //     password,
  //     fullName: fullName.trim() || (role === 'STAFF' ? 'Nhân Viên Chiba' : 'Khách Hàng Chiba'),
  //     phone: '09' + Math.floor(10000000 + Math.random() * 90000000),
  //     customerCode: randomCode,
  //     zenPoints: role === 'STAFF' ? 10 : 0,
  //     role,
  //     isSuspended: false,
  //   };

  //   users[normalizedEmail] = mockUser;
  //   saveMockUsers(users);

  //   let remainingInvites = invites;
  //   if (isInvited) {
  //     remainingInvites = invites.filter((e: string) => e !== normalizedEmail);
  //     localStorage.setItem(STAFF_INVITES_KEY, JSON.stringify(remainingInvites));
  //   }

  //   const activeStaff = Object.values(users)
  //     .filter((u: any) => u.role === 'STAFF')
  //     .map(({ password: _, ...safeUser }: any) => safeUser as User);

  //   const { password: __, ...safeUser } = mockUser;
  //   const mockToken = `mock_jwt_token_${mockUser.id}_${Date.now()}`;

  //   localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  //   localStorage.setItem(TOKEN_KEY, mockToken);

  //   set({
  //     user: safeUser as User,
  //     token: mockToken,
  //     isAuthenticated: true,
  //     invitedStaffEmails: remainingInvites,
  //     activeStaffList: activeStaff,
  //     loading: false,
  //   });
  // },

  // logout: () => {
  //   localStorage.removeItem(CURRENT_USER_KEY);
  //   localStorage.removeItem(TOKEN_KEY);
  //   set({ user: null, token: null, isAuthenticated: false });
  // },

  // updateProfileName: async (fullName) => {
  //   const { user } = get();
  //   if (!user) throw new Error('Chưa đăng nhập');
  //   await new Promise((r) => setTimeout(r, 500));

  //   const users = getMockUsers();
  //   const normalizedEmail = user.email.toLowerCase().trim();

  //   if (users[normalizedEmail]) {
  //     users[normalizedEmail].fullName = fullName.trim();
  //     saveMockUsers(users);

  //     const updatedUser = { ...user, fullName: fullName.trim() };
  //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  //     set({ user: updatedUser });
  //   }
  // },

  // updateProfilePhone: async (phone) => {
  //   const { user } = get();
  //   if (!user) throw new Error('Chưa đăng nhập');
  //   await new Promise((r) => setTimeout(r, 500));

  //   const users = getMockUsers();
  //   const normalizedEmail = user.email.toLowerCase().trim();

  //   if (users[normalizedEmail]) {
  //     users[normalizedEmail].phone = phone.trim();
  //     saveMockUsers(users);

  //     const updatedUser = { ...user, phone: phone.trim() };
  //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  //     set({ user: updatedUser });
  //   }
  // },

  // updateProfileAddress: async (address) => {
  //   const { user } = get();
  //   if (!user) throw new Error('Chưa đăng nhập');
  //   await new Promise((r) => setTimeout(r, 500));

  //   const users = getMockUsers();
  //   const normalizedEmail = user.email.toLowerCase().trim();

  //   if (users[normalizedEmail]) {
  //     users[normalizedEmail].address = address.trim();
  //     saveMockUsers(users);

  //     const updatedUser = { ...user, address: address.trim() };
  //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  //     set({ user: updatedUser });
  //   }
  // },

  // getAllUsers: () => {
  //   const users = getMockUsers();
  //   return Object.values(users).map(({ password, ...safeUser }: any) => safeUser as User);
  // },

  // getPointHistory: (userId) => {
  //   if (typeof window === 'undefined') return [];
  //   const stored = localStorage.getItem(POINT_HISTORY_KEY);
  //   const history: PointTransaction[] = stored ? JSON.parse(stored) : [];
  //   return userId ? history.filter((tx) => tx.userId === userId) : history;
  // },

  // updateUserPoints: async (userId, pointsChange, type, description) => {
  //   await new Promise((r) => setTimeout(r, 300));
  //   const users = getMockUsers();

  //   const userEmailKey = Object.keys(users).find((key) => users[key].id === userId);
  //   if (!userEmailKey) throw new Error('Không tìm thấy người dùng này');

  //   const targetUser = users[userEmailKey];
  //   const oldPoints = targetUser.zenPoints || 0;
  //   const newPoints = Math.max(0, oldPoints + pointsChange);
  //   targetUser.zenPoints = newPoints;

  //   saveMockUsers(users);

  //   const newTransaction: PointTransaction = {
  //     id: `TX_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
  //     userId,
  //     userEmail: targetUser.email,
  //     userName: targetUser.fullName,
  //     points: pointsChange,
  //     pointsBefore: oldPoints,
  //     pointsAfter: newPoints,
  //     type,
  //     description,
  //     createdAt: new Date().toISOString(),
  //   };

  //   const storedHistory = localStorage.getItem(POINT_HISTORY_KEY);
  //   const history = storedHistory ? JSON.parse(storedHistory) : [];
  //   history.unshift(newTransaction);
  //   localStorage.setItem(POINT_HISTORY_KEY, JSON.stringify(history));

  //   const currentLoggedInUser = get().user;
  //   if (currentLoggedInUser && currentLoggedInUser.id === userId) {
  //     const updatedUser = { ...currentLoggedInUser, zenPoints: newPoints };
  //     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  //     set({ user: updatedUser });
  //   }
  // },
}));