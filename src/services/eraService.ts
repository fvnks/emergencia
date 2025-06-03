
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2/promise';
import type { EraEquipment, EraEquipmentCreateInput, EraEquipmentUpdateInput, EraEquipmentStatus } from '@/components/equipment/era-types';

// Helper para formatear fechas para la base de datos (YYYY-MM-DD o null)
const formatDateForDb = (dateString?: string | null): string | null => {
  if (!dateString) return null;
  // Asume que la fecha ya está en formato YYYY-MM-DD o es inválida si no
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : null;
};

export async function getAllEraEquipments(): Promise<EraEquipment[]> {
  const sql = `
    SELECT 
      e.*,
      DATE_FORMAT(e.fecha_fabricacion, '%Y-%m-%d') as fecha_fabricacion,
      DATE_FORMAT(e.fecha_adquisicion, '%Y-%m-%d') as fecha_adquisicion,
      DATE_FORMAT(e.fecha_ultima_mantencion, '%Y-%m-%d') as fecha_ultima_mantencion,
      DATE_FORMAT(e.fecha_proxima_inspeccion, '%Y-%m-%d') as fecha_proxima_inspeccion,
      u.nombre_completo AS nombre_usuario_asignado
    FROM ERA_Equipos e
    LEFT JOIN Usuarios u ON e.id_usuario_asignado = u.id_usuario
    ORDER BY e.codigo_era ASC
  `;
  try {
    const rows = await query(sql) as EraEquipment[];
    return rows;
  } catch (error) {
    console.error('Error fetching all ERA equipments:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'ERA_Equipos' no existe. Devolviendo array vacío.");
      return [];
    }
    throw error;
  }
}

export async function getEraEquipmentById(id_era: number): Promise<EraEquipment | null> {
  const sql = `
    SELECT 
      e.*,
      DATE_FORMAT(e.fecha_fabricacion, '%Y-%m-%d') as fecha_fabricacion,
      DATE_FORMAT(e.fecha_adquisicion, '%Y-%m-%d') as fecha_adquisicion,
      DATE_FORMAT(e.fecha_ultima_mantencion, '%Y-%m-%d') as fecha_ultima_mantencion,
      DATE_FORMAT(e.fecha_proxima_inspeccion, '%Y-%m-%d') as fecha_proxima_inspeccion,
      u.nombre_completo AS nombre_usuario_asignado
    FROM ERA_Equipos e
    LEFT JOIN Usuarios u ON e.id_usuario_asignado = u.id_usuario
    WHERE e.id_era = ?
  `;
  try {
    const rows = await query(sql, [id_era]) as EraEquipment[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching ERA equipment by ID:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      return null;
    }
    throw error;
  }
}

export async function createEraEquipment(data: EraEquipmentCreateInput): Promise<EraEquipment | null> {
  const {
    codigo_era, descripcion, marca, modelo, numero_serie,
    fecha_fabricacion, fecha_adquisicion, fecha_ultima_mantencion, fecha_proxima_inspeccion,
    estado_era, id_usuario_asignado, notas
  } = data;

  const sql = `
    INSERT INTO ERA_Equipos (
      codigo_era, descripcion, marca, modelo, numero_serie,
      fecha_fabricacion, fecha_adquisicion, fecha_ultima_mantencion, fecha_proxima_inspeccion,
      estado_era, id_usuario_asignado, notas
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    codigo_era, descripcion || null, marca || null, modelo || null, numero_serie || null,
    formatDateForDb(fecha_fabricacion), formatDateForDb(fecha_adquisicion),
    formatDateForDb(fecha_ultima_mantencion), formatDateForDb(fecha_proxima_inspeccion),
    estado_era, id_usuario_asignado || null, notas || null
  ];

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      return getEraEquipmentById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error creating ERA equipment:', error);
    if (error instanceof Error && (error as any).code === 'ER_DUP_ENTRY' && (error as any).sqlMessage?.includes('codigo_era')) {
      throw new Error("El código de ERA '" + codigo_era + "' ya existe.");
    }
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'ERA_Equipos' no existe. No se pudo crear el equipo.");
    }
    throw error;
  }
}

export async function updateEraEquipment(id_era: number, data: EraEquipmentUpdateInput): Promise<EraEquipment | null> {
  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  const addField = (field: keyof EraEquipmentUpdateInput, value?: string | number | null) => {
    if (value !== undefined) {
      fieldsToUpdate.push(`${field} = ?`);
      if (field.startsWith('fecha_')) {
        params.push(formatDateForDb(value as string | undefined | null));
      } else {
        params.push(value === '' ? null : value);
      }
    }
  };
  
  addField('codigo_era', data.codigo_era);
  addField('descripcion', data.descripcion);
  addField('marca', data.marca);
  addField('modelo', data.modelo);
  addField('numero_serie', data.numero_serie);
  addField('fecha_fabricacion', data.fecha_fabricacion);
  addField('fecha_adquisicion', data.fecha_adquisicion);
  addField('fecha_ultima_mantencion', data.fecha_ultima_mantencion);
  addField('fecha_proxima_inspeccion', data.fecha_proxima_inspeccion);
  addField('estado_era', data.estado_era);
  addField('id_usuario_asignado', data.id_usuario_asignado);
  addField('notas', data.notas);


  if (fieldsToUpdate.length === 0) {
    return getEraEquipmentById(id_era); // No fields to update
  }

  fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  params.push(id_era);

  const sql = `UPDATE ERA_Equipos SET ${fieldsToUpdate.join(', ')} WHERE id_era = ?`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getEraEquipmentById(id_era);
    }
    const existingItem = await getEraEquipmentById(id_era);
    if (!existingItem) throw new Error (`Equipo ERA con ID ${id_era} no encontrado para actualizar.`);
    return existingItem; 
  } catch (error) {
    console.error(`Error updating ERA equipment ${id_era}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_DUP_ENTRY' && (error as any).sqlMessage?.includes('codigo_era') && data.codigo_era) {
      throw new Error("El código de ERA '" + data.codigo_era + "' ya existe para otro equipo.");
    }
     if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'ERA_Equipos' no existe. No se pudo actualizar el equipo.");
    }
    throw error;
  }
}

export async function deleteEraEquipment(id_era: number): Promise<boolean> {
  const sql = 'DELETE FROM ERA_Equipos WHERE id_era = ?';
  try {
    const result = await query(sql, [id_era]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting ERA equipment ${id_era}:`, error);
     if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'ERA_Equipos' no existe. No se pudo eliminar el equipo.");
    }
    throw error;
  }
}

export async function assignEra(id_era: number, id_usuario: number | null): Promise<EraEquipment | null> {
  const era = await getEraEquipmentById(id_era);
  if (!era) {
    throw new Error(`Equipo ERA con ID ${id_era} no encontrado.`);
  }

  let nuevoEstado: EraEquipmentStatus = era.estado_era;

  if (id_usuario !== null) { // Asignando
    if (!['Disponible', 'Operativo'].includes(era.estado_era)) {
      throw new Error(`No se puede asignar el ERA. Estado actual: ${era.estado_era}. Debe estar 'Disponible' u 'Operativo'.`);
    }
    // Opcional: Verificar si el usuario ya tiene otro ERA asignado
    // const existingAssignment = await query('SELECT id_era FROM ERA_Equipos WHERE id_usuario_asignado = ? AND id_era != ?', [id_usuario, id_era]);
    // if (existingAssignment.length > 0) {
    //   throw new Error(`El usuario ya tiene otro ERA asignado (ID: ${existingAssignment[0].id_era}).`);
    // }
    nuevoEstado = 'Operativo';
  } else { // Desasignando
    if (era.id_usuario_asignado === null) {
      // No estaba asignado, no hacer nada o devolver error leve
      console.warn(`ERA ${id_era} ya estaba desasignado.`);
      return era;
    }
    nuevoEstado = 'Disponible';
  }

  const sql = 'UPDATE ERA_Equipos SET id_usuario_asignado = ?, estado_era = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_era = ?';
  const params = [id_usuario, nuevoEstado, id_era];

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getEraEquipmentById(id_era);
    }
    return era; // Devolver el era original si no hubo cambios (poco probable aquí)
  } catch (error) {
    console.error(`Error al ${id_usuario ? 'asignar' : 'desasignar'} ERA ${id_era}:`, error);
    throw error;
  }
}

export async function getEraAssignedToUser(userId: number): Promise<EraEquipment | null> {
  const sql = `
    SELECT 
      e.*,
      DATE_FORMAT(e.fecha_fabricacion, '%Y-%m-%d') as fecha_fabricacion,
      DATE_FORMAT(e.fecha_adquisicion, '%Y-%m-%d') as fecha_adquisicion,
      DATE_FORMAT(e.fecha_ultima_mantencion, '%Y-%m-%d') as fecha_ultima_mantencion,
      DATE_FORMAT(e.fecha_proxima_inspeccion, '%Y-%m-%d') as fecha_proxima_inspeccion
    FROM ERA_Equipos e
    WHERE e.id_usuario_asignado = ? AND e.estado_era = 'Operativo'
    LIMIT 1
  `;
  try {
    const rows = await query(sql, [userId]) as EraEquipment[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error fetching ERA assigned to user ${userId}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      return null;
    }
    throw error;
  }
}
