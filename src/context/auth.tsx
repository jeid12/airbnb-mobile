import React, { createContext, useCallback, useContext, useState } from 'react';

import { api, type ApiUser, type ApiBooking } from '@/services/api';

export type UserRole = 'GUEST' | 'HOST' | 'ADMIN';
type AuthUser = ApiUser & { bookings?: ApiBooking[] };

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; username: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      const me = await api.getMe(res.token);
      setUser(me);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; username: string; phone: string; password: string }) => {
      setIsLoading(true);
      try {
        await api.register(data);
        const res = await api.login(data.email, data.password);
        setToken(res.token);
        const me = await api.getMe(res.token);
        setUser(me);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const me = await api.getMe(token);
    setUser(me);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
