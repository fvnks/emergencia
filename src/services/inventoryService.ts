
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2';
import { findOrCreateLocationByName, type InventoryLocation } from './inventoryLocationService';

export interface InventoryItem {
  id_item: number;
  codigo_item: string;
  nombre_item: string;
  descripcion_item?: string | null;
  categoria_item: string;
  id_ubicacion?: number | null;
  cantidad_actual: number;
  unidad_medida: string;
  stock_minimo?: number | null;
  es_epp: boolean; // TINYINT(1) in DB will be 0 or 1
  fecha_vencimiento_item?: string | null; // DATE
  fecha_creacion: string; // TIMESTAMP
  fecha_actualizacion: string; // TIMESTAMP
  // Joined fields
  ubicacion_nombre?: string | null;
  sub_ubicacion?: string | null;
}

export interface InventoryItemCreateInput {
  codigo_item: string;
  nombre_item: string;
  descripcion_item?: string;
  categoria_item: string;
  ubicacion_nombre?: string; // Name of the location, will be resolved to id_ubicacion
  sub_ubicacion?: string;    // Sub-location name
  cantidad_actual: number;
  unidad_medida?: string;
  stock_minimo?: number;
  es_epp: boolean;
  fecha_vencimiento_item?: string; // YYYY-MM-DD
}


export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const sql = `
    SELECT 
      i.*,
      i.es_epp = 1 as es_epp, -- Convert TINYINT to boolean
      ul.nombre_ubicacion as ubicacion_nombre,
      ul.sub_ubicacion
    FROM Inventario_Items i
    LEFT JOIN Inventario_Ubicaciones ul ON i.id_ubicacion = ul.id_ubicacion
    ORDER BY i.nombre_item ASC
  `;
  try {
    const rows = await query(sql) as InventoryItem[];
    // Ensure es_epp is boolean
    return rows.map(item => ({ ...item, es_epp: Boolean(item.es_epp) }));
  } catch (error) {
    console.error('Error fetching all inventory items:', error);
    throw error;
  }
}

export async function getInventoryItemById(id_item: number): Promise<InventoryItem | null> {
  const sql = `
    SELECT 
      i.*,
      i.es_epp = 1 as es_epp, -- Convert TINYINT to boolean
      ul.nombre_ubicacion as ubicacion_nombre,
      ul.sub_ubicacion
    FROM Inventario_Items i
    LEFT JOIN Inventario_Ubicaciones ul ON i.id_ubicacion = ul.id_ubicacion
    WHERE i.id_item = ?
  `;
  try {
    const rows = await query(sql, [id_item]) as InventoryItem[];
    if (rows.length > 0) {
      return { ...rows[0], es_epp: Boolean(rows[0].es_epp) };
    }
    return null;
  } catch (error) {
    console.error('Error fetching inventory item by ID:', error);
    throw error;
  }
}

export async function createInventoryItem(data: InventoryItemCreateInput): Promise<InventoryItem | null> {
  const {
    codigo_item,
    nombre_item,
    descripcion_item,
    categoria_item,
    ubicacion_nombre,
    sub_ubicacion,
    cantidad_actual,
    unidad_medida = 'unidad',
    stock_minimo,
    es_epp,
    fecha_vencimiento_item,
  } = data;

  let id_ubicacion: number | null = null;
  if (ubicacion_nombre && ubicacion_nombre.trim() !== "") {
    const location = await findOrCreateLocationByName(ubicacion_nombre.trim(), sub_ubicacion?.trim() || null);
    if (location) {
      id_ubicacion = location.id_ubicacion;
    }
  }

  const sql = `
    INSERT INTO Inventario_Items (
      codigo_item, nombre_item, descripcion_item, categoria_item, id_ubicacion, 
      cantidad_actual, unidad_medida, stock_minimo, es_epp, fecha_vencimiento_item
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    codigo_item,
    nombre_item,
    descripcion_item || null,
    categoria_item,
    id_ubicacion,
    cantidad_actual,
    unidad_medida,
    stock_minimo || 0,
    es_epp ? 1 : 0,
    fecha_vencimiento_item || null,
  ];

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      return getInventoryItemById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error instanceof Error && (error as any).code === 'ER_DUP_ENTRY') {
      throw new Error(`El código de ítem '${codigo_item}' ya existe.`);
    }
    throw error;
  }
}

// TODO: Add updateInventoryItem and deleteInventoryItem functions
