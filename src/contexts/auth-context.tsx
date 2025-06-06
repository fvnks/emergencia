
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserByEmail, verifyPassword, User as DbUser, UserRole as UserRoleKey } from '@/services/userService'; // Renombrado UserRole a UserRoleKey para claridad

// User type for the context
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRoleKey; // 'admin' | 'usuario'
  avatarSeed?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  login: (email: string, password_plaintext: string) => Promise<void>;
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
        if (parsedUser && typeof parsedUser.id === 'number' && parsedUser.email && parsedUser.role) {
           setUser(parsedUser);
        } else {
          localStorage.removeItem('brigadeUser');
        }
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('brigadeUser');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password_plaintext: string) => {
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

      // Mapear el nombre_rol de la BD al UserRoleKey del contexto
      let roleKey: UserRoleKey = 'usuario'; // Default to 'usuario'
      if (dbUser.nombre_rol === 'Administrador') {
        roleKey = 'admin';
      }
      // Se podrían añadir más mapeos si hubiera más roles que equivalen a 'admin' o 'usuario' en la UI

      const authUser: AuthUser = {
        id: dbUser.id_usuario,
        name: dbUser.nombre_completo,
        email: dbUser.email,
        role: roleKey, // Usar el roleKey mapeado
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
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    setAuthError(null);
    localStorage.removeItem('brigadeUser');
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, authError, setAuthError }}>
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
