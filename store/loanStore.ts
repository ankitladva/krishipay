import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ILoanApplication } from '@/lib/models/LoanApplication';
import { IScheme } from '@/lib/models/Scheme';

interface LoanState {
  currentApplication: Partial<ILoanApplication> | null;
  matchedScheme: IScheme | null;
  allSchemes: IScheme[];
  isLoading: boolean;
  error: string | null;
  
  // Actions 
  setMatchedScheme: (scheme: IScheme | null) => void;
  updateApplication: (data: Partial<ILoanApplication>) => void;
  resetApplication: () => void;
  fetchSchemes: () => Promise<void>;
  matchSchemeByIntent: (intent: string) => Promise<IScheme | null>;
  submitApplication: () => Promise<string>;
  clearError: () => void;
}

export const useLoanStore = create<LoanState>()(
  persist(
    (set, get) => ({
      currentApplication: null,
      matchedScheme: null,
      allSchemes: [],
      isLoading: false,
      error: null,

      setMatchedScheme: (scheme: IScheme | null) => {
        set({ matchedScheme: scheme });
        
        if (scheme) {
          const current = get().currentApplication || {};
          set({
            currentApplication: {
              ...current,
              loanCategory: scheme.loanType,
              matchedSchemeId: scheme._id,
            },
          });
        }
      },

      updateApplication: (data: Partial<ILoanApplication>) => {
        const current = get().currentApplication || {};
        set({
          currentApplication: {
            ...current,
            ...data,
          },
        });
      },

      resetApplication: () => {
        set({
          currentApplication: null,
          matchedScheme: null,
          error: null,
        });
      },

      fetchSchemes: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/schemes');
          
          if (!response.ok) {
            throw new Error('Failed to fetch schemes');
          }

          const data = await response.json();
          set({ allSchemes: data.schemes, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch schemes',
            isLoading: false,
          });
        }
      },

      matchSchemeByIntent: async (intent: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/schemes/match', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIntent: intent }),
          });

          if (!response.ok) {
            throw new Error('Failed to match scheme');
          }

          const data = await response.json();
          const scheme = data.matchedScheme;
          
          if (scheme) {
            get().setMatchedScheme(scheme);
          }
          
          set({ isLoading: false });
          return scheme;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to match scheme',
            isLoading: false,
          });
          return null;
        }
      },

      submitApplication: async () => {
        const application = get().currentApplication;
        
        if (!application) {
          throw new Error('No application data');
        }

        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/loan/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(application),
          });

          if (!response.ok) {
            throw new Error('Failed to submit application');
          }

          const data = await response.json();
          set({ isLoading: false });
          
          // Reset application after successful submission
          get().resetApplication();
          
          return data.applicationId;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to submit application',
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'loan-storage',
      partialize: (state) => ({
        currentApplication: state.currentApplication,
        matchedScheme: state.matchedScheme,
      }),
    }
  )
);

