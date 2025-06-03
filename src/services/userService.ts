
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'usuario';

export interface User {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  password_hash?: string; // No siempre se devuelve
  rol: UserRole;
  telefono?: string | null;
  avatar_seed?: string | null;
  fecha_creacion: string; // O Date, dependiendo de cómo se procese
  fecha_actualizacion: string; // O Date
}

export interface UserCreateInput {
  nombre_completo: string;
  email: string;
  password_plaintext: string;
  rol: UserRole;
  telefono?: string;
  // avatar_seed ya no es parte del input directo, se genera si no se provee
}

export interface UserUpdateInput {
  nombre_completo?: string;
  email?: string;
  rol?: UserRole;
  telefono?: string | null;
  avatar_seed?: string | null;
}

const SALT_ROUNDS = 10;

// Helper para generar avatar_seed a partir de iniciales si no se provee
function generateAvatarSeed(name: string): string {
    if (!name) return 'NA';
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export async function createUser(userData: UserCreateInput): Promise<User | null> {
  const { nombre_completo, email, password_plaintext, rol, telefono } = userData;
  
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  const password_hash = await bcrypt.hash(password_plaintext, SALT_ROUNDS);
  const avatar_seed = generateAvatarSeed(nombre_completo); // Generar avatar_seed

  const sql = `
    INSERT INTO Usuarios (nombre_completo, email, password_hash, rol, telefono, avatar_seed)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [nombre_completo, email, password_hash, rol, telefono || null, avatar_seed];
  
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
  const sql = 'SELECT id_usuario, nombre_completo, email, password_hash, rol, telefono, avatar_seed, fecha_creacion, fecha_actualizacion FROM Usuarios WHERE email = ?';
  try {
    const rows = await query(sql, [email]) as User[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error al obtener usuario por email ${email}:`, error);
    throw error;
  }
}

export async function getUserById(id_usuario: number): Promise<User | null> {
  const sql = 'SELECT id_usuario, nombre_completo, email, rol, telefono, avatar_seed, fecha_creacion, fecha_actualizacion FROM Usuarios WHERE id_usuario = ?';
  try {
    const rows = await query(sql, [id_usuario]) as User[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error al obtener usuario por ID ${id_usuario}:`, error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  const sql = 'SELECT id_usuario, nombre_completo, email, rol, telefono, avatar_seed, fecha_creacion, fecha_actualizacion FROM Usuarios ORDER BY nombre_completo ASC';
  try {
    const rows = await query(sql) as User[];
    return rows;
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    throw error;
  }
}

export async function updateUserProfile(id_usuario: number, data: UserUpdateInput): Promise<User | null> {
  const { nombre_completo, email, rol, telefono } = data;
  let { avatar_seed } = data;


  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  if (nombre_completo !== undefined) {
    fieldsToUpdate.push('nombre_completo = ?');
    params.push(nombre_completo);
    if (avatar_seed === undefined) { // Si avatar_seed no se está actualizando explícitamente, regenerarlo si el nombre cambia
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
  if (rol !== undefined) {
    fieldsToUpdate.push('rol = ?');
    params.push(rol);
  }
  if (telefono !== undefined) {
    fieldsToUpdate.push('telefono = ?');
    params.push(telefono); // Puede ser null
  }
   if (avatar_seed !== undefined) { // Si se proporcionó explícitamente
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

// La re-exportación de getPool se elimina de aquí.
// Los módulos que necesiten getPool deben importarlo directamente de '@/lib/db'.
