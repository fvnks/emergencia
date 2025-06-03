
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

export type TaskStatus = 'Pendiente' | 'En Proceso' | 'Completada' | 'Atrasada' | 'Programada';

export interface Task {
  id_tarea: number;
  descripcion_tarea: string;
  id_usuario_asignado: number | null;
  fecha_vencimiento: string | null; // YYYY-MM-DD
  estado_tarea: TaskStatus;
  fecha_creacion: string;
  fecha_actualizacion: string;
  id_usuario_creador: number;
  // Campos unidos opcionales
  nombre_usuario_asignado?: string | null;
  nombre_usuario_creador?: string;
}

export interface TaskCreateInput {
  descripcion_tarea: string;
  id_usuario_asignado?: number | null;
  fecha_vencimiento?: string | null; // YYYY-MM-DD
  estado_tarea: TaskStatus;
  // id_usuario_creador se pasará como argumento separado a la función createTask
}

export interface TaskUpdateInput {
  descripcion_tarea?: string;
  id_usuario_asignado?: number | null; // Para reasignar o quitar asignación
  fecha_vencimiento?: string | null; // Para actualizar o quitar fecha
  estado_tarea?: TaskStatus;
}


const ACTIVE_TASK_STATUSES_FOR_SUMMARY: TaskStatus[] = ['Pendiente', 'En Proceso', 'Atrasada', 'Programada'];

export async function getActiveTasksForUser(userId: number): Promise<Task[]> {
  const sql = `
    SELECT
      t.id_tarea,
      t.descripcion_tarea,
      t.id_usuario_asignado,
      DATE_FORMAT(t.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
      t.estado_tarea,
      t.fecha_creacion,
      t.fecha_actualizacion,
      t.id_usuario_creador,
      asignado.nombre_completo AS nombre_usuario_asignado,
      creador.nombre_completo AS nombre_usuario_creador
    FROM Tareas t
    LEFT JOIN Usuarios asignado ON t.id_usuario_asignado = asignado.id_usuario
    JOIN Usuarios creador ON t.id_usuario_creador = creador.id_usuario
    WHERE t.id_usuario_asignado = ?
      AND t.estado_tarea IN (?)
    ORDER BY t.fecha_vencimiento ASC, t.descripcion_tarea ASC
  `;
  try {
    const rows = await query(sql, [userId, ACTIVE_TASK_STATUSES_FOR_SUMMARY]) as Task[];
    return rows;
  } catch (error) {
    console.error(`Error fetching active tasks for user ${userId}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'Tareas' no existe en la base de datos. No se pueden cargar las tareas activas.");
      return [];
    }
    throw error;
  }
}

export async function getAllTasks(): Promise<Task[]> {
  const sql = `
    SELECT
      t.id_tarea,
      t.descripcion_tarea,
      t.id_usuario_asignado,
      DATE_FORMAT(t.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
      t.estado_tarea,
      t.fecha_creacion,
      t.fecha_actualizacion,
      t.id_usuario_creador,
      asignado.nombre_completo AS nombre_usuario_asignado,
      creador.nombre_completo AS nombre_usuario_creador
    FROM Tareas t
    LEFT JOIN Usuarios asignado ON t.id_usuario_asignado = asignado.id_usuario
    JOIN Usuarios creador ON t.id_usuario_creador = creador.id_usuario
    ORDER BY t.fecha_vencimiento ASC, t.fecha_creacion DESC
  `;
  try {
    const rows = await query(sql) as Task[];
    return rows;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
     if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'Tareas' no existe en la base de datos. Devolviendo array vacío para getAllTasks.");
      return [];
    }
    throw error;
  }
}

export async function getTaskById(taskId: number): Promise<Task | null> {
  const sql = `
    SELECT
      t.id_tarea,
      t.descripcion_tarea,
      t.id_usuario_asignado,
      DATE_FORMAT(t.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
      t.estado_tarea,
      t.fecha_creacion,
      t.fecha_actualizacion,
      t.id_usuario_creador,
      asignado.nombre_completo AS nombre_usuario_asignado,
      creador.nombre_completo AS nombre_usuario_creador
    FROM Tareas t
    LEFT JOIN Usuarios asignado ON t.id_usuario_asignado = asignado.id_usuario
    JOIN Usuarios creador ON t.id_usuario_creador = creador.id_usuario
    WHERE t.id_tarea = ?
  `;
  try {
    const rows = await query(sql, [taskId]) as Task[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error fetching task by ID ${taskId}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn(`La tabla 'Tareas' no existe en la base de datos. No se pudo encontrar la tarea ${taskId}.`);
      return null;
    }
    throw error;
  }
}

export async function createTask(data: TaskCreateInput, creatorUserId: number): Promise<Task | null> {
  const {
    descripcion_tarea,
    id_usuario_asignado,
    fecha_vencimiento,
    estado_tarea,
  } = data;

  const sql = `
    INSERT INTO Tareas (
      descripcion_tarea, id_usuario_asignado, fecha_vencimiento, estado_tarea, id_usuario_creador
    ) VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    descripcion_tarea,
    id_usuario_asignado === undefined ? null : id_usuario_asignado,
    fecha_vencimiento === undefined ? null : fecha_vencimiento,
    estado_tarea,
    creatorUserId,
  ];

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      return getTaskById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Tareas' no existe en la base de datos. No se pudo crear la tarea.");
    }
    throw error;
  }
}

export async function updateTask(taskId: number, data: TaskUpdateInput): Promise<Task | null> {
  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.descripcion_tarea !== undefined) {
    fieldsToUpdate.push('descripcion_tarea = ?');
    params.push(data.descripcion_tarea);
  }
  // Si id_usuario_asignado es explícitamente null, se desasigna. Si es undefined, no se toca.
  if (data.id_usuario_asignado !== undefined) {
    fieldsToUpdate.push('id_usuario_asignado = ?');
    params.push(data.id_usuario_asignado);
  }
  if (data.fecha_vencimiento !== undefined) {
    fieldsToUpdate.push('fecha_vencimiento = ?');
    params.push(data.fecha_vencimiento);
  }
  if (data.estado_tarea !== undefined) {
    fieldsToUpdate.push('estado_tarea = ?');
    params.push(data.estado_tarea);
  }

  if (fieldsToUpdate.length === 0) {
    return getTaskById(taskId); // No fields to update
  }

  fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  params.push(taskId);

  const sql = `UPDATE Tareas SET ${fieldsToUpdate.join(', ')} WHERE id_tarea = ?`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getTaskById(taskId);
    }
    const existingTask = await getTaskById(taskId);
    if (!existingTask) throw new Error(`Tarea con ID ${taskId} no encontrada para actualizar.`);
    return existingTask; // Devuelve la tarea existente si no hubo filas afectadas (ej. datos idénticos)
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
     if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error(`La tabla 'Tareas' no existe en la base de datos. No se pudo actualizar la tarea ${taskId}.`);
    }
    throw error;
  }
}

export async function deleteTask(taskId: number): Promise<boolean> {
  const sql = 'DELETE FROM Tareas WHERE id_tarea = ?';
  try {
    const result = await query(sql, [taskId]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error(`La tabla 'Tareas' no existe en la base de datos. No se pudo eliminar la tarea ${taskId}.`);
    }
    throw error;
  }
}
