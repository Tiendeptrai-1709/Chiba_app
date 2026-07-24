import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  isChecking:boolean;

  setAccessToken: (accessToken: string) => void;
  clearAccessToken: () => void;
  setChecking:(value:boolean) =>void;

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
  isChecking:true,

  setAccessToken: (accessToken) => {
    set({ accessToken })
  },

  clearAccessToken: () => {
    set({ accessToken: null })
  },

  setChecking:(value) =>set({
    isChecking:value
  })
}));