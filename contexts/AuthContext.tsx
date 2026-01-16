'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  user_id: string;
  user_name: string;
  user_email: string;
  org_id: string;
  role?: {
    role_name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user: User; access_token: string }>;
  register: (data: {
    user_name: string;
    user_email: string;
    user_password: string;
    organization_name: string;
    role_name?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with localStorage on mount and when storage changes
  useEffect(() => {
    const syncAuth = () => {
      const currentUser = authAPI.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    // Initial sync
    syncAuth();

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        syncAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for focus events (when user returns to tab)
    const handleFocus = () => {
      syncAuth();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    // Immediately sync after login
    const currentUser = authAPI.getCurrentUser();
    setUser(currentUser);
    return response;
  };

  const register = async (data: {
    user_name: string;
    user_email: string;
    user_password: string;
    organization_name: string;
    role_name?: string;
  }) => {
    await authAPI.register(data);
    // Auto login after registration
    await login(data.user_email, data.user_password);
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

