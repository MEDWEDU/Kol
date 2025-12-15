import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import * as authApi from '../api/auth';
import * as usersApi from '../api/users';
import type { User } from '../types';

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export type AuthStore = {
  user: User | null;
  status: AuthStatus;
  isRefreshing: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  setStatus: (status: AuthStatus) => void;

  login: (payload: authApi.LoginPayload) => Promise<User>;
  register: (
    payload: authApi.RegisterPayload,
    opts?: Parameters<typeof authApi.register>[1],
  ) => Promise<User>;
  logout: () => Promise<void>;

  refreshSession: () => Promise<boolean>;
  getMe: () => Promise<User>;
  updateMe: (
    payload: usersApi.UpdateMePayload,
    opts?: Parameters<typeof usersApi.updateMe>[1],
  ) => Promise<User>;

  clear: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'unknown',
      isRefreshing: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setStatus: (status) => set({ status }),

      clear: () => set({ user: null, status: 'unauthenticated' }),

      login: async (payload) => {
        const { user } = await authApi.login(payload);
        set({ user, status: 'authenticated' });
        return user;
      },

      register: async (payload, opts) => {
        const { user } = await authApi.register(payload, opts);
        set({ user, status: 'authenticated' });
        return user;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          get().clear();
        }
      },

      refreshSession: async () => {
        if (get().isRefreshing) return get().status === 'authenticated';

        set({ isRefreshing: true });
        try {
          const { user } = await authApi.refresh();
          set({ user, status: 'authenticated' });
          return true;
        } catch {
          set({ user: null, status: 'unauthenticated' });
          return false;
        } finally {
          set({ isRefreshing: false });
        }
      },

      getMe: async () => {
        const { user } = await usersApi.getMe();
        set({ user, status: 'authenticated' });
        return user;
      },

      updateMe: async (payload, opts) => {
        const { user } = await usersApi.updateMe(payload, opts);
        set({ user, status: 'authenticated' });
        return user;
      },
    }),
    {
      name: 'koltechat-auth',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.setStatus(state.user ? 'authenticated' : 'unauthenticated');
      },
    },
  ),
);
