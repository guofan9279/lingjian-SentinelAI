'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_EXPIRED_EVENT, AUTH_STORAGE_KEY, clearStoredAuth } from '@/lib/auth';
import { api, isAuthExpiredError } from '@/lib/api';
import type { LoginResult, User } from '@/lib/types';
import { JUDGE_DEMO_TOKEN, useJudgeMode } from '@/components/judge-mode-provider';

type AuthContextValue = {
  token: string;
  user: User | null;
  loading: boolean;
  error: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isJudgeMode } = useJudgeMode();

  useEffect(() => {
    queueMicrotask(async () => {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as LoginResult;
          setToken(parsed.access_token);
          setUser(parsed.user);
          void api.dashboard(parsed.access_token).catch((err) => {
            if (!isAuthExpiredError(err)) {
              console.error('Session validation failed', err);
            }
          });
        } catch {
          clearStoredAuth();
          setToken('');
          setUser(null);
        }
      } else {
        try {
          const result = await api.login('admin', 'admin123');
          window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
          setToken(result.access_token);
          setUser(result.user);
        } catch (err) {
          console.error('Auto login failed', err);
        }
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleExpired = (event: Event) => {
      const detail = event instanceof CustomEvent ? (event.detail as { message?: string } | undefined) : undefined;
      clearStoredAuth();
      setToken('');
      setUser(null);
      setError(detail?.message ?? '登录已过期，请重新登录。');
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    };
  }, []);

  async function login(username: string, password: string) {
    const result = await api.login(username, password);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result));
    setToken(result.access_token);
    setUser(result.user);
    setError('');
  }

  function logout() {
    clearStoredAuth();
    setToken('');
    setUser(null);
    setError('');
  }

  const judgeUser: User = { id: 2026, username: 'judge', display_name: '大赛评委演示用户', role: 'admin' };

  const value = useMemo(
    () => ({
      token: isJudgeMode ? JUDGE_DEMO_TOKEN : token,
      user: isJudgeMode ? judgeUser : user,
      loading: isJudgeMode ? false : loading,
      error: isJudgeMode ? '' : error,
      login: async (username: string, password: string) => {
        try {
          await login(username, password);
        } catch (err) {
          setError(err instanceof Error ? err.message : '登录失败');
          throw err;
        }
      },
      logout,
    }),
    [error, isJudgeMode, loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

