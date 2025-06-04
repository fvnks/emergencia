
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2/promise';
import type { MaintenanceTask, MaintenanceTaskCreateInput, MaintenanceTaskUpdateInput } from '@/types/maintenanceTypes';

// Helper para formatear fechas para la base de datos (YYYY-MM-DD o null)
const formatDateForDb = (dateString?: string | null): string | null => {
  if (!dateString || dateString.trim() === "") return null;
  // Asume que la fecha ya está en formato YYYY-MM-DD o es inválida si no
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : null;
};

export async function getAllMaintenanceTasks(): Promise<MaintenanceTask[]> {
  const sql = `
    SELECT 
      m.*,
      DATE_FORMAT(m.fecha_programada, '%Y-%m-%d') as fecha_programada,
      DATE_FORMAT(m.fecha_ultima_realizada, '%Y-%m-%d') as fecha_ultima_realizada,
      DATE_FORMAT(m.fecha_completada, '%Y-%m-%d') as fecha_completada,
      resp.nombre_completo AS nombre_usuario_responsable,
      creador.nombre_completo AS nombre_usuario_creador
    FROM Mantenciones m
    LEFT JOIN Usuarios resp ON m.id_usuario_responsable = resp.id_usuario
    JOIN Usuarios creador ON m.id_usuario_creador = creador.id_usuario
    ORDER BY m.fecha_programada ASC, m.nombre_item_mantenimiento ASC
  `;
  try {
    const rows = await query(sql) as MaintenanceTask[];
    return rows;
  } catch (error) {
    console.error('Error fetching all maintenance tasks:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'Mantenciones' no existe. Devolviendo array vacío.");
      return [];
    }
    throw error;
  }
}

export async function getMaintenanceTaskById(id_mantencion: number): Promise<MaintenanceTask | null> {
  const sql = `
    SELECT 
      m.*,
      DATE_FORMAT(m.fecha_programada, '%Y-%m-%d') as fecha_programada,
      DATE_FORMAT(m.fecha_ultima_realizada, '%Y-%m-%d') as fecha_ultima_realizada,
      DATE_FORMAT(m.fecha_completada, '%Y-%m-%d') as fecha_completada,
      resp.nombre_completo AS nombre_usuario_responsable,
      creador.nombre_completo AS nombre_usuario_creador
    FROM Mantenciones m
    LEFT JOIN Usuarios resp ON m.id_usuario_responsable = resp.id_usuario
    JOIN Usuarios creador ON m.id_usuario_creador = creador.id_usuario
    WHERE m.id_mantencion = ?
  `;
  try {
    const rows = await query(sql, [id_mantencion]) as MaintenanceTask[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching maintenance task by ID:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      return null;
    }
    throw error;
  }
}

export async function createMaintenanceTask(data: MaintenanceTaskCreateInput, creatorUserId: number): Promise<MaintenanceTask | null> {
  const {
    nombre_item_mantenimiento, tipo_item, descripcion_mantencion, fecha_programada,
    id_usuario_responsable, estado_mantencion, fecha_ultima_realizada, notas_mantencion
  } = data;

  const sql = \`
    INSERT INTO Mantenciones (
      nombre_item_mantenimiento, tipo_item, descripcion_mantencion, fecha_programada,
      id_usuario_responsable, estado_mantencion, fecha_ultima_realizada, notas_mantencion,
      id_usuario_creador
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  \`;
  const params = [
    nombre_item_mantenimiento, tipo_item, descripcion_mantencion || null, formatDateForDb(fecha_programada),
    id_usuario_responsable || null, estado_mantencion, formatDateForDb(fecha_ultima_realizada),
    notas_mantencion || null, creatorUserId
  ];

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      return getMaintenanceTaskById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error creating maintenance task:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Mantenciones' no existe. No se pudo crear la tarea de mantención.");
    }
    throw error;
  }
}

export async function updateMaintenanceTask(id_mantencion: number, data: MaintenanceTaskUpdateInput): Promise<MaintenanceTask | null> {
  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  const addField = (fieldKey: keyof MaintenanceTaskUpdateInput, value?: string | number | null) => {
    if (value !== undefined) {
      fieldsToUpdate.push(\`\${fieldKey} = ?\`);
      if (typeof fieldKey === 'string' && fieldKey.startsWith('fecha_')) {
        params.push(formatDateForDb(value as string | undefined | null));
      } else {
        params.push(value === '' ? null : value);
      }
    }
  };
  
  addField('nombre_item_mantenimiento', data.nombre_item_mantenimiento);
  addField('tipo_item', data.tipo_item);
  addField('descripcion_mantencion', data.descripcion_mantencion);
  addField('fecha_programada', data.fecha_programada);
  addField('id_usuario_responsable', data.id_usuario_responsable);
  addField('estado_mantencion', data.estado_mantencion);
  addField('fecha_ultima_realizada', data.fecha_ultima_realizada);
  addField('fecha_completada', data.fecha_completada);
  addField('notas_mantencion', data.notas_mantencion);

  if (fieldsToUpdate.length === 0) {
    return getMaintenanceTaskById(id_mantencion); // No fields to update
  }

  fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  params.push(id_mantencion);

  const sql = \`UPDATE Mantenciones SET \${fieldsToUpdate.join(', ')} WHERE id_mantencion = ?\`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getMaintenanceTaskById(id_mantencion);
    }
    const existingItem = await getMaintenanceTaskById(id_mantencion);
    if (!existingItem) throw new Error (\`Tarea de mantención con ID \${id_mantencion} no encontrada para actualizar.\`);
    return existingItem; 
  } catch (error) {
    console.error(\`Error updating maintenance task \${id_mantencion}:\`, error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Mantenciones' no existe. No se pudo actualizar la tarea.");
    }
    throw error;
  }
}

export async function deleteMaintenanceTask(id_mantencion: number): Promise<boolean> {
  const sql = 'DELETE FROM Mantenciones WHERE id_mantencion = ?';
  try {
    const result = await query(sql, [id_mantencion]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(\`Error deleting maintenance task \${id_mantencion}:\`, error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Mantenciones' no existe. No se pudo eliminar la tarea.");
    }
    throw error;
  }
}
