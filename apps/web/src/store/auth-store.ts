'use client';

import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fits_ops_token', token);
      localStorage.setItem('fits_ops_user', JSON.stringify(user));
    }
    set({ token, user });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fits_ops_token');
      localStorage.removeItem('fits_ops_user');
    }
    set({ token: null, user: null });
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fits_ops_token');
      const userStr = localStorage.getItem('fits_ops_user');
      const user = userStr ? JSON.parse(userStr) : null;
      set({ token, user, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },
}));
