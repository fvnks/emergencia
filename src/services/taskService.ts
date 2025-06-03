
'use server';

import { query } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

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

// Estados que consideramos como "activos" para el resumen en la página de personal
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
    // Asegúrate de que tu tabla Tareas exista y tenga las columnas referenciadas.
    const rows = await query(sql, [userId, ACTIVE_TASK_STATUSES_FOR_SUMMARY]) as Task[];
    return rows;
  } catch (error) {
    console.error(`Error fetching active tasks for user ${userId}:`, error);
    // Si la tabla Tareas no existe, esto fallará. Devolvemos un array vacío para que la UI no se rompa.
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'Tareas' no existe en la base de datos. No se pueden cargar las tareas.");
      return [];
    }
    throw error; // Re-lanzar otros errores
  }
}

// --- Funciones para la página de Tareas (a implementar completamente) ---

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
    ORDER BY t.fecha_vencimiento ASC, t.descripcion_tarea ASC
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

// TODO: Implementar createTask, updateTask, deleteTask
// export async function createTask(data: Omit<Task, 'id_tarea' | 'fecha_creacion' | 'fecha_actualizacion' | 'nombre_usuario_asignado' | 'nombre_usuario_creador'>): Promise<Task | null> { ... }
// export async function updateTask(id_tarea: number, data: Partial<Omit<Task, 'id_tarea' | 'fecha_creacion' | 'fecha_actualizacion' | 'nombre_usuario_asignado' | 'nombre_usuario_creador'>>): Promise<Task | null> { ... }
// export async function deleteTask(id_tarea: number): Promise<boolean> { ... }
