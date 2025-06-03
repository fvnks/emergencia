
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

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
    // If sub_ubicacion is not provided in search, we might assume it means general location without specific sub-location.
    // For exact match, you might want to require sub_ubicacion to be explicitly null or a value.
    // This logic can be adjusted based on how unique "nombre_ubicacion" alone should be.
    // For now, we find by nombre_ubicacion and optionally by sub_ubicacion.
  }
  sql += ' LIMIT 1';

  try {
    const rows = await query(sql, params) as InventoryLocation[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding inventory location by name:', error);
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
    throw error;
  }
}

export async function findOrCreateLocationByName(
  nombre_ubicacion: string,
  sub_ubicacion?: string | null
): Promise<InventoryLocation | null> {
  if (!nombre_ubicacion || nombre_ubicacion.trim() === '') {
    return null; // Cannot create/find location without a name
  }
  let location = await findInventoryLocationByName(nombre_ubicacion, sub_ubicacion);
  if (!location) {
    location = await createInventoryLocation({ nombre_ubicacion, sub_ubicacion });
  }
  return location;
}
