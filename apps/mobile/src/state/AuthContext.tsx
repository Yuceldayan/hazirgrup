import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SessionUser } from '@hazirgrup/core';
import { getRepository } from '@/data/repository';
import { clearSession, readSession, saveSession } from '@/data/session';

/** Oturum bağlamı — uygulama genelinde tek kaynak. */

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (displayName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restore = useCallback(async () => {
    try {
      const userId = await readSession();
      if (!userId) {
        setUser(null);
        return;
      }
      const repo = await getRepository();
      setUser(await repo.getSessionUser(userId));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restore();
  }, [restore]);

  const signIn = useCallback(async (email: string, password: string) => {
    const repo = await getRepository();
    const { user: signedIn } = await repo.signIn({ email, password });
    await saveSession(signedIn.id);
    setUser(signedIn);
  }, []);

  const signUp = useCallback(
    async (displayName: string, email: string, password: string) => {
      const repo = await getRepository();
      const { user: created } = await repo.signUp({ displayName, email, password });
      await saveSession(created.id);
      setUser(created);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, isLoading, signIn, signUp, signOut, refresh: restore }),
    [user, isLoading, signIn, signUp, signOut, restore],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth, AuthProvider içinde kullanılmalıdır.');
  return context;
}
