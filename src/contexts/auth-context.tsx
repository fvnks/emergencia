
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByEmail, verifyPassword, User as DbUser, UserRole } from '@/services/userService';

// User type for the context, derived from DbUser but without password_hash
export interface AuthUser {
  id: number; // Corresponds to id_usuario
  name: string; // Corresponds to nombre_completo
  email: string;
  role: UserRole;
  avatarSeed?: string | null; // Added from DbUser
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password_plaintext: string) => Promise<void>; // Now takes password
  logout: () => void;
  loading: boolean;
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('brigadeUser');
    if (storedUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(storedUser);
        // Basic validation of stored user structure
        if (parsedUser && typeof parsedUser.id === 'number' && parsedUser.email && parsedUser.role) {
           setUser(parsedUser);
        } else {
          localStorage.removeItem('brigadeUser'); // Clear invalid stored user
        }
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('brigadeUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password_plaintext: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const dbUser = await getUserByEmail(email);
      if (!dbUser || !dbUser.password_hash) {
        throw new Error('Usuario no encontrado o cuenta no activa.');
      }

      const passwordMatch = await verifyPassword(password_plaintext, dbUser.password_hash);
      if (!passwordMatch) {
        throw new Error('Contraseña incorrecta.');
      }

      const authUser: AuthUser = {
        id: dbUser.id_usuario,
        name: dbUser.nombre_completo,
        email: dbUser.email,
        role: dbUser.rol,
        avatarSeed: dbUser.avatar_seed,
      };

      setUser(authUser);
      localStorage.setItem('brigadeUser', JSON.stringify(authUser));
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError('Ocurrió un error desconocido durante el inicio de sesión.');
      }
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthError(null);
    localStorage.removeItem('brigadeUser');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, authError, setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
