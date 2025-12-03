import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser } from '@/lib/models/User';

interface LoginResult {
  voiceMatch: boolean;
  faceMatch: boolean;
  voiceSimilarity: number | null;
  faceScore: number | null;
  isNewUser: boolean;
}

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (phoneNumber: string, voicePrint: string, faceImage: string) => Promise<LoginResult>;
  logout: () => void;
  setUser: (user: IUser | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (phoneNumber: string, voicePrint: string, faceImage: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber, voicePrint, faceImage }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data?.error || 'Login failed');
          }
          
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return {
            voiceMatch: Boolean(data.voiceMatch ?? true),
            faceMatch: Boolean(data.faceMatch ?? true),
            voiceSimilarity: typeof data.voiceSimilarity === 'number' ? data.voiceSimilarity : null,
            faceScore: typeof data.faceScore === 'number' ? data.faceScore : null,
            isNewUser: Boolean(data.isNewUser),
          };
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error instanceof Error ? error : new Error('Login failed');
        }
      },

      logout: () => {
        // Clear session by calling logout API
        fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
        
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: IUser | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
