"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/auth.api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  registerUser: (name: string, email: string, role: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session from token
  const restoreSession = async () => {
    try {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('cr_access_token') : null;
      if (accessToken) {
        const profile = await authApi.getCurrentUser();
        setUser(profile);
      }
    } catch (e) {
      console.warn("Failed to restore authentication session:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();

    // Listen for global logout events triggered by api.ts interceptor
    const handleLogoutEvent = () => {
      setUser(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth_logout', handleLogoutEvent);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth_logout', handleLogoutEvent);
      }
    };
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const data = await authApi.loginWithGoogle();
      setUser(data.user);
    } catch (error) {
      console.error("Google authentication failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (name: string, email: string, role: string, phone?: string) => {
    setIsLoading(true);
    try {
      const data = await authApi.registerUser(name, email, role, phone);
      setUser(data.user);
    } catch (error) {
      console.error("User registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
    } catch (e) {
      console.error("Profile refresh failed:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, registerUser, logout, refreshProfile }}>
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
