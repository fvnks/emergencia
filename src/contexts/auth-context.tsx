"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'user';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for persisted auth state
    const storedUser = localStorage.getItem('brigadeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string, role: UserRole) => {
    // Simulate login
    let name = email.split('@')[0];
    // Simple name conversion for demo
    if (email === "admin@ejemplo.cl") name = "Administrador";
    else if (email === "usuario@ejemplo.cl") name = "Usuario Demo";
    else name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize

    const newUser: User = { id: Date.now().toString(), name, email, role };
    setUser(newUser);
    localStorage.setItem('brigadeUser', JSON.stringify(newUser));
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('brigadeUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
