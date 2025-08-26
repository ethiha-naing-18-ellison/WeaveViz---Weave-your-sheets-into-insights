import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@weaveviz/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        login: (user, token) => {
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        },
        
        logout: () => {
          set(initialState);
        },
        
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
        
        setUser: (user) => {
          set({ user });
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);
