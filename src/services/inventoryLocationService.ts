
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface InventoryLocation {
  id_ubicacion: number;
  nombre_ubicacion: string;
  sub_ubicacion?: string | null;
  descripcion_ubicacion?: string | null;
  id_ubicacion_padre?: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export async function getAllInventoryLocations(): Promise<InventoryLocation[]> {
  const sql = 'SELECT * FROM Inventario_Ubicaciones ORDER BY nombre_ubicacion ASC, sub_ubicacion ASC';
  try {
    const rows = await query(sql) as InventoryLocation[];
    return rows;
  } catch (error) {
    console.error('Error fetching all inventory locations:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'Inventario_Ubicaciones' no existe. Devolviendo array vacío.");
      return [];
    }
    throw error;
  }
}

export async function findInventoryLocationByName(nombre_ubicacion: string, sub_ubicacion?: string | null): Promise<InventoryLocation | null> {
  let sql = 'SELECT * FROM Inventario_Ubicaciones WHERE nombre_ubicacion = ?';
  const params: (string | null)[] = [nombre_ubicacion];

  if (sub_ubicacion !== undefined) {
    if (sub_ubicacion === null) {
      sql += ' AND sub_ubicacion IS NULL';
    } else {
      sql += ' AND sub_ubicacion = ?';
      params.push(sub_ubicacion);
    }
  } else {
     sql += ' AND sub_ubicacion IS NULL'; // Default to no sub-location if not specified
  }
  sql += ' LIMIT 1';

  try {
    const rows = await query(sql, params) as InventoryLocation[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding inventory location by name:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      return null;
    }
    throw error;
  }
}

export async function createInventoryLocation(data: {
  nombre_ubicacion: string;
  sub_ubicacion?: string | null;
  descripcion_ubicacion?: string | null;
  id_ubicacion_padre?: number | null;
}): Promise<InventoryLocation | null> {
  const { nombre_ubicacion, sub_ubicacion, descripcion_ubicacion, id_ubicacion_padre } = data;
  const sql = `
    INSERT INTO Inventario_Ubicaciones (nombre_ubicacion, sub_ubicacion, descripcion_ubicacion, id_ubicacion_padre)
    VALUES (?, ?, ?, ?)
  `;
  const params = [nombre_ubicacion, sub_ubicacion || null, descripcion_ubicacion || null, id_ubicacion_padre || null];
  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      const newLocation = await query('SELECT * FROM Inventario_Ubicaciones WHERE id_ubicacion = ?', [result.insertId]) as InventoryLocation[];
      return newLocation.length > 0 ? newLocation[0] : null;
    }
    return null;
  } catch (error) {
    console.error('Error creating inventory location:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Inventario_Ubicaciones' no existe. No se pudo crear la ubicación.");
    }
    throw error;
  }
}

export async function findOrCreateLocationByName(
  nombre_ubicacion: string,
  sub_ubicacion?: string | null
): Promise<InventoryLocation | null> {
  if (!nombre_ubicacion || nombre_ubicacion.trim() === '') {
    return null; 
  }
  let location = await findInventoryLocationByName(nombre_ubicacion, sub_ubicacion);
  if (!location) {
    location = await createInventoryLocation({ nombre_ubicacion, sub_ubicacion });
  }
  return location;
}
