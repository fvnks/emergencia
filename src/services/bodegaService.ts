
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface Bodega {
  id_bodega: number;
  nombre_bodega: string;
  direccion_bodega: string;
  descripcion_bodega?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface BodegaCreateInput {
  nombre_bodega: string;
  direccion_bodega: string;
  descripcion_bodega?: string;
}

export interface BodegaUpdateInput {
  nombre_bodega?: string;
  direccion_bodega?: string;
  descripcion_bodega?: string | null;
}

export async function getAllBodegas(): Promise<Bodega[]> {
  const sql = 'SELECT * FROM Bodegas ORDER BY nombre_bodega ASC';
  try {
    const rows = await query(sql) as Bodega[];
    return rows;
  } catch (error) {
    console.error('Error fetching all bodegas:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'Bodegas' no existe. Devolviendo array vacío.");
      return [];
    }
    throw error;
  }
}

export async function getBodegaById(id_bodega: number): Promise<Bodega | null> {
  const sql = 'SELECT * FROM Bodegas WHERE id_bodega = ?';
  try {
    const rows = await query(sql, [id_bodega]) as Bodega[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching bodega by ID:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      return null;
    }
    throw error;
  }
}

export async function createBodega(data: BodegaCreateInput): Promise<Bodega | null> {
  const { nombre_bodega, direccion_bodega, descripcion_bodega } = data;
  const sql = `
    INSERT INTO Bodegas (nombre_bodega, direccion_bodega, descripcion_bodega)
    VALUES (?, ?, ?)
  `;
  const params = [nombre_bodega, direccion_bodega, descripcion_bodega || null];
  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      return getBodegaById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error creating bodega:', error);
    if (error instanceof Error && (error as any).code === 'ER_DUP_ENTRY') {
      throw new Error(`El nombre de bodega '${nombre_bodega}' ya existe.`);
    }
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Bodegas' no existe. No se pudo crear la bodega.");
    }
    throw error;
  }
}

export async function updateBodega(id_bodega: number, data: BodegaUpdateInput): Promise<Bodega | null> {
  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.nombre_bodega !== undefined) {
    fieldsToUpdate.push('nombre_bodega = ?');
    params.push(data.nombre_bodega);
  }
  if (data.direccion_bodega !== undefined) {
    fieldsToUpdate.push('direccion_bodega = ?');
    params.push(data.direccion_bodega);
  }
  if (data.descripcion_bodega !== undefined) {
    fieldsToUpdate.push('descripcion_bodega = ?');
    params.push(data.descripcion_bodega);
  }

  if (fieldsToUpdate.length === 0) {
    return getBodegaById(id_bodega); // No fields to update
  }

  fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  params.push(id_bodega);

  const sql = `UPDATE Bodegas SET ${fieldsToUpdate.join(', ')} WHERE id_bodega = ?`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getBodegaById(id_bodega);
    }
    const existingBodega = await getBodegaById(id_bodega);
    if (!existingBodega) throw new Error(`Bodega con ID ${id_bodega} no encontrada para actualizar.`);
    return existingBodega; // No rows affected, but bodega exists
  } catch (error) {
    console.error(`Error updating bodega ${id_bodega}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_DUP_ENTRY' && data.nombre_bodega) {
      throw new Error(`El nombre de bodega '${data.nombre_bodega}' ya existe para otra bodega.`);
    }
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Bodegas' no existe. No se pudo actualizar la bodega.");
    }
    throw error;
  }
}

export async function deleteBodega(id_bodega: number): Promise<boolean> {
  // Primero, verificar si alguna ubicación en Inventario_Ubicaciones usa esta bodega por nombre.
  // Esta es una verificación conceptual, ya que no hay un FK directo.
  // Una implementación más robusta requeriría un FK o una lógica de desvinculación.
  // Por ahora, solo intentaremos eliminar y dejaremos que la BD maneje errores de FK si los hubiera.
  // Nota: Si Inventario_Items.id_ubicacion se refiriera directamente a Bodegas.id_bodega,
  // la BD podría impedir la eliminación si hay ítems usando la bodega.

  const sqlCheckItems = 'SELECT COUNT(*) as count FROM Inventario_Items WHERE id_ubicacion IN (SELECT id_ubicacion FROM Inventario_Ubicaciones WHERE nombre_ubicacion = (SELECT nombre_bodega FROM Bodegas WHERE id_bodega = ?))';
  // Esta consulta es compleja y podría no ser la mejor manera.
  // Una forma más simple, si Bodegas es la fuente principal de ubicaciones:
  // const sqlCheckItems = 'SELECT COUNT(*) as count FROM Inventario_Items WHERE id_bodega_fk = ?';

  // Para este ejemplo, vamos a simplificar y asumir que no hay ítems directamente
  // bloqueando la eliminación de la bodega por FK, y la advertencia al usuario es suficiente.
  // En un sistema real, se necesitaría una mejor gestión de dependencias.

  const sql = 'DELETE FROM Bodegas WHERE id_bodega = ?';
  try {
    const result = await query(sql, [id_bodega]) as ResultSetHeader;
    if (result.affectedRows === 0) {
        // Check if the bodega actually existed
        const bodega = await getBodegaById(id_bodega);
        if (!bodega) {
            throw new Error(`Bodega con ID ${id_bodega} no encontrada para eliminar.`);
        }
        // Bodega exists but was not deleted, could be due to FK constraints not directly handled here
        // or other reasons. For now, if affectedRows is 0 but no SQL error, we assume it's deletable
        // from this table's perspective, but other logic might prevent it.
        // This specific delete service doesn't have enough context to know about Inventario_Items FKs if they
        // point to Inventario_Ubicaciones rather than Bodegas directly.
    }
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting bodega ${id_bodega}:`, error);
    if (error instanceof Error) {
      if ((error as any).code === 'ER_ROW_IS_REFERENCED_2') {
        throw new Error('No se puede eliminar la bodega porque está referenciada en otros registros (ej. ítems de inventario). Por favor, reasigne o elimine esos ítems primero.');
      }
      if ((error as any).code === 'ER_NO_SUCH_TABLE') {
        throw new Error("La tabla 'Bodegas' no existe. No se pudo eliminar la bodega.");
      }
    }
    throw error;
  }
}

    
