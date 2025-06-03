
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
  avatar_seed?: string;
}

export interface UserUpdateInput {
  nombre_completo?: string;
  email?: string;
  rol?: UserRole;
  telefono?: string | null;
  avatar_seed?: string | null;
}

const SALT_ROUNDS = 10;

export async function createUser(userData: UserCreateInput): Promise<User | null> {
  const { nombre_completo, email, password_plaintext, rol, telefono, avatar_seed } = userData;
  
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  const password_hash = await bcrypt.hash(password_plaintext, SALT_ROUNDS);

  const sql = `
    INSERT INTO Usuarios (nombre_completo, email, password_hash, rol, telefono, avatar_seed)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [nombre_completo, email, password_hash, rol, telefono || null, avatar_seed || null];
  
  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      return getUserById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error; // O manejar de forma más específica
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
  // Notar que no devolvemos password_hash por defecto al obtener por ID por seguridad, a menos que sea necesario explícitamente.
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
  const { nombre_completo, email, rol, telefono, avatar_seed } = data;

  // Construir la consulta dinámicamente para solo actualizar campos provistos
  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  if (nombre_completo !== undefined) {
    fieldsToUpdate.push('nombre_completo = ?');
    params.push(nombre_completo);
  }
  if (email !== undefined) {
    // Verificar si el nuevo email ya existe para otro usuario
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
    params.push(telefono);
  }
   if (avatar_seed !== undefined) {
    fieldsToUpdate.push('avatar_seed = ?');
    params.push(avatar_seed);
  }

  if (fieldsToUpdate.length === 0) {
    return getUserById(id_usuario); // No hay nada que actualizar
  }

  params.push(id_usuario);
  const sql = `UPDATE Usuarios SET ${fieldsToUpdate.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_usuario = ?`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getUserById(id_usuario);
    }
    return null; // O el usuario no existe o no hubo cambios
  } catch (error) {
    console.error(`Error al actualizar perfil del usuario ${id_usuario}:`, error);
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
  // Considerar si esto debe ser un borrado lógico (marcar como inactivo)
  // Por ahora, implementamos borrado físico.
  // También, manejar las FK: ¿qué pasa con las tareas, EPP asignados, etc.?
  // La BD tiene ON DELETE SET NULL o RESTRICT para varias relaciones.
  // Si un usuario se borra, las tareas que creó (id_creador_tarea) podrían causar un error si la FK es RESTRICT y no hay CASCADE o SET NULL.
  // Para la tabla `Usuarios` específicamente, las FK de otras tablas apuntan a ella con SET NULL o CASCADE en algunos casos.
  // Ej: Equipos_ERA.id_usuario_asignado -> SET NULL
  // Ej: EPP_Asignaciones_Actuales.id_usuario -> CASCADE (se borra la asignación)
  // Ej: Tareas_Operativas.id_usuario_asignado -> SET NULL
  // Ej: Tareas_Operativas.id_creador_tarea -> RESTRICT (esto podría fallar si el usuario creó tareas)
  // Por seguridad, antes de borrar un usuario, se deberían reasignar o eliminar sus tareas creadas.
  // O modificar la FK de Tareas_Operativas.id_creador_tarea a ON DELETE SET NULL o ON DELETE CASCADE.
  // Por simplicidad, aquí solo intentamos el borrado.

  // Verificación preliminar (opcional, pero buena práctica para feedback):
  // const tasksCreated = await query('SELECT 1 FROM Tareas_Operativas WHERE id_creador_tarea = ? LIMIT 1', [id_usuario]) as RowDataPacket[];
  // if (tasksCreated.length > 0) {
  //   throw new Error('No se puede eliminar el usuario porque ha creado tareas. Reasigne o elimine esas tareas primero.');
  // }

  const sql = 'DELETE FROM Usuarios WHERE id_usuario = ?';
  try {
    const result = await query(sql, [id_usuario]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error al eliminar usuario ${id_usuario}:`, error);
    // Aquí se podría verificar si el error es por una restricción de FK
    // if (error.code === 'ER_ROW_IS_REFERENCED_2') { // Código de error específico de MySQL
    //   throw new Error('No se puede eliminar el usuario porque está referenciado en otras tablas (ej. creó tareas).');
    // }
    throw error;
  }
}

// Función de utilidad para comparar contraseñas (usada en el login)
export async function verifyPassword(password_plaintext: string, password_hash: string): Promise<boolean> {
  return bcrypt.compare(password_plaintext, password_hash);
}
