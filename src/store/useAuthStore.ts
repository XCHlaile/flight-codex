import { create } from 'zustand';
import type { AuthSession, PublicUser } from '../../shared/auth';
import { clearStoredSession, loadStoredSession, saveStoredSession } from '@/lib/auth-storage';

const initialSession = loadStoredSession();

interface AuthState {
  token: string | null;
  user: PublicUser | null;
  ready: boolean;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: initialSession?.token || null,
  user: initialSession?.user || null,
  ready: false,
  setSession: (session) => {
    saveStoredSession(session);
    set({
      token: session.token,
      user: session.user,
      ready: true,
    });
  },
  clearSession: () => {
    clearStoredSession();
    set({
      token: null,
      user: null,
      ready: true,
    });
  },
  setReady: (ready) => set({ ready }),
}));
