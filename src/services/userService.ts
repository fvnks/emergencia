
'use server';

import { query, getPool } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import type { Role } from './roleService';

// Este es el tipo de rol que usa la UI y el AuthContext
export type UserRole = "admin" | "usuario";

// Este representa el nombre del rol como está en la BD (tabla Roles)
export type UserRoleNameFromDb = string; // ej: "Administrador", "Usuario Estándar"

export interface User {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  password_hash?: string;
  id_rol_fk?: number | null;
  nombre_rol?: UserRoleNameFromDb | null; // Nombre del rol de la tabla Roles
  telefono?: string | null;
  avatar_seed?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UserCreateInput {
  nombre_completo: string;
  email: string;
  password_plaintext: string;
  id_rol_fk: number; // Se espera el ID del rol
  telefono?: string;
  // avatar_seed se genera automáticamente
}

export interface UserUpdateInput {
  nombre_completo?: string;
  email?: string;
  id_rol_fk?: number | null;
  telefono?: string | null;
  avatar_seed?: string | null; // Permitir actualizarlo si se desea
}

const SALT_ROUNDS = 10;

function generateAvatarSeed(name: string): string {
    if (!name) return 'NA';
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export async function createUser(userData: UserCreateInput): Promise<User | null> {
  const { nombre_completo, email, password_plaintext, id_rol_fk, telefono } = userData;

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  const password_hash = await bcrypt.hash(password_plaintext, SALT_ROUNDS);
  const avatar_seed = generateAvatarSeed(nombre_completo);

  const sql = `
    INSERT INTO Usuarios (nombre_completo, email, password_hash, id_rol_fk, telefono, avatar_seed)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [nombre_completo, email, password_hash, id_rol_fk, telefono || null, avatar_seed];

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      return getUserById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error instanceof Error && (error as any).code === 'ER_DUP_ENTRY') {
         throw new Error('El correo electrónico ya está registrado.');
    }
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = `
    SELECT u.id_usuario, u.nombre_completo, u.email, u.password_hash, u.id_rol_fk, u.telefono, u.avatar_seed, u.fecha_creacion, u.fecha_actualizacion, r.nombre_rol
    FROM Usuarios u
    LEFT JOIN Roles r ON u.id_rol_fk = r.id_rol
    WHERE u.email = ?
  `;
  try {
    const rows = await query(sql, [email]) as User[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error al obtener usuario por email ${email}:`, error);
    throw error;
  }
}

export async function getUserById(id_usuario: number): Promise<User | null> {
  const sql = `
    SELECT u.id_usuario, u.nombre_completo, u.email, u.password_hash, u.id_rol_fk, u.telefono, u.avatar_seed, u.fecha_creacion, u.fecha_actualizacion, r.nombre_rol
    FROM Usuarios u
    LEFT JOIN Roles r ON u.id_rol_fk = r.id_rol
    WHERE u.id_usuario = ?
  `;
  // Password_hash se incluye aquí por si alguna lógica de "cambio de contraseña"
  // lo necesitara del lado del servidor, aunque generalmente no se expone a la UI.
  // Para la mayoría de los casos (GET para UI), password_hash no es necesario.
  try {
    const rows = await query(sql, [id_usuario]) as User[];
    if (rows.length > 0) {
        const user = rows[0];
        // No enviar el password_hash al cliente, excepto en el flujo de login.
        // Para fines generales de obtener usuario, lo omitimos.
        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }
    return null;
  } catch (error) {
    console.error(`Error al obtener usuario por ID ${id_usuario}:`, error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  const sql = `
    SELECT u.id_usuario, u.nombre_completo, u.email, u.id_rol_fk, u.telefono, u.avatar_seed, u.fecha_creacion, u.fecha_actualizacion, r.nombre_rol
    FROM Usuarios u
    LEFT JOIN Roles r ON u.id_rol_fk = r.id_rol
    ORDER BY u.nombre_completo ASC
  `;
  try {
    const rows = await query(sql) as User[];
    return rows;
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    throw error;
  }
}

export async function updateUserProfile(id_usuario: number, data: UserUpdateInput): Promise<User | null> {
  const { nombre_completo, email, id_rol_fk, telefono } = data;
  let { avatar_seed } = data;

  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  if (nombre_completo !== undefined) {
    fieldsToUpdate.push('nombre_completo = ?');
    params.push(nombre_completo);
    if (avatar_seed === undefined || avatar_seed === null) { // Solo regenerar si no se provee explícitamente
        avatar_seed = generateAvatarSeed(nombre_completo);
    }
  }
  if (email !== undefined) {
    const existingUser = await query('SELECT id_usuario FROM Usuarios WHERE email = ? AND id_usuario != ?', [email, id_usuario]) as RowDataPacket[];
    if (existingUser.length > 0) {
        throw new Error('El nuevo correo electrónico ya está en uso por otro usuario.');
    }
    fieldsToUpdate.push('email = ?');
    params.push(email);
  }
  if (id_rol_fk !== undefined) {
    fieldsToUpdate.push('id_rol_fk = ?');
    params.push(id_rol_fk);
  }
  if (telefono !== undefined) {
    fieldsToUpdate.push('telefono = ?');
    params.push(telefono);
  }
   if (avatar_seed !== undefined) {
    fieldsToUpdate.push('avatar_seed = ?');
    params.push(avatar_seed);
   }

  if (fieldsToUpdate.length === 0) {
    return getUserById(id_usuario);
  }

  params.push(id_usuario);
  const sql = `UPDATE Usuarios SET ${fieldsToUpdate.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = ?`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getUserById(id_usuario);
    }
    const existingUser = await getUserById(id_usuario);
    if (!existingUser) throw new Error(`Usuario con ID ${id_usuario} no encontrado para actualizar.`);
    return existingUser;
  } catch (error) {
    console.error(`Error al actualizar perfil del usuario ${id_usuario}:`, error);
     if (error instanceof Error && (error as any).code === 'ER_DUP_ENTRY' && (error as any).sqlMessage.includes('email')) {
        throw new Error('El nuevo correo electrónico ya está en uso por otro usuario.');
    }
    throw error;
  }
}

export async function assignRoleToUser(userId: number, roleId: number | null): Promise<boolean> {
  const sql = 'UPDATE Usuarios SET id_rol_fk = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = ?';
  try {
    const result = await query(sql, [roleId, userId]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error asignando rol ${roleId} al usuario ${userId}:`, error);
    throw error;
  }
}

export async function updateUserPassword(id_usuario: number, password_plaintext: string): Promise<boolean> {
  const password_hash = await bcrypt.hash(password_plaintext, SALT_ROUNDS);
  const sql = 'UPDATE Usuarios SET password_hash = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = ?';
  try {
    const result = await query(sql, [password_hash, id_usuario]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error al actualizar contraseña del usuario ${id_usuario}:`, error);
    throw error;
  }
}

export async function deleteUser(id_usuario: number): Promise<boolean> {
  const sql = 'DELETE FROM Usuarios WHERE id_usuario = ?';
  try {
    const result = await query(sql, [id_usuario]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error)
{
    console.error(`Error al eliminar usuario ${id_usuario}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error(`No se puede eliminar el usuario porque está referenciado en otros registros (ej. creó tareas o movimientos de inventario). Reasigne o elimine esos registros primero.`);
    }
    throw error;
  }
}

export async function verifyPassword(password_plaintext: string, password_hash: string): Promise<boolean> {
  return bcrypt.compare(password_plaintext, password_hash);
}

