
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
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
  ubicacion_nombre?: string;
  sub_ubicacion?: string;
  cantidad_actual: number;
  unidad_medida?: string;
  stock_minimo?: number;
  es_epp: boolean;
  fecha_vencimiento_item?: string; // YYYY-MM-DD
}

export interface InventoryItemUpdateInput {
  codigo_item?: string;
  nombre_item?: string;
  descripcion_item?: string | null;
  categoria_item?: string;
  ubicacion_nombre?: string | null; // Pass null to clear location
  sub_ubicacion?: string | null;    // Pass null to clear sub_location
  cantidad_actual?: number;
  unidad_medida?: string;
  stock_minimo?: number | null;
  es_epp?: boolean;
  fecha_vencimiento_item?: string | null; // YYYY-MM-DD or null to clear
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
    stock_minimo === undefined || stock_minimo === null ? null : stock_minimo,
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
      if ((error as any).sqlMessage.includes('codigo_item')) {
        throw new Error(`El código de ítem '${codigo_item}' ya existe.`);
      }
    }
    throw error;
  }
}

export async function updateInventoryItem(id_item: number, data: InventoryItemUpdateInput): Promise<InventoryItem | null> {
  const fieldsToUpdate: string[] = [];
  const params: (string | number | boolean | null)[] = [];

  let id_ubicacion_resolved: number | null | undefined = undefined; // undefined means no change to location

  if (data.ubicacion_nombre !== undefined) {
    if (data.ubicacion_nombre === null || data.ubicacion_nombre.trim() === "") {
      id_ubicacion_resolved = null; // Clear location
    } else {
      const location = await findOrCreateLocationByName(data.ubicacion_nombre.trim(), data.sub_ubicacion?.trim() || null);
      if (location) {
        id_ubicacion_resolved = location.id_ubicacion;
      } else {
        id_ubicacion_resolved = null; 
      }
    }
    fieldsToUpdate.push('id_ubicacion = ?');
    params.push(id_ubicacion_resolved);
  }


  if (data.codigo_item !== undefined) {
    fieldsToUpdate.push('codigo_item = ?');
    params.push(data.codigo_item);
  }
  if (data.nombre_item !== undefined) {
    fieldsToUpdate.push('nombre_item = ?');
    params.push(data.nombre_item);
  }
  if (data.descripcion_item !== undefined) {
    fieldsToUpdate.push('descripcion_item = ?');
    params.push(data.descripcion_item);
  }
  if (data.categoria_item !== undefined) {
    fieldsToUpdate.push('categoria_item = ?');
    params.push(data.categoria_item);
  }
  if (data.cantidad_actual !== undefined) {
    fieldsToUpdate.push('cantidad_actual = ?');
    params.push(data.cantidad_actual);
  }
  if (data.unidad_medida !== undefined) {
    fieldsToUpdate.push('unidad_medida = ?');
    params.push(data.unidad_medida);
  }
  if (data.stock_minimo !== undefined) {
    fieldsToUpdate.push('stock_minimo = ?');
    params.push(data.stock_minimo);
  }
  if (data.es_epp !== undefined) {
    fieldsToUpdate.push('es_epp = ?');
    params.push(data.es_epp ? 1 : 0);
  }
  if (data.fecha_vencimiento_item !== undefined) {
    fieldsToUpdate.push('fecha_vencimiento_item = ?');
    params.push(data.fecha_vencimiento_item);
  }

  if (fieldsToUpdate.length === 0) {
    return getInventoryItemById(id_item); // No fields to update
  }

  fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  params.push(id_item);

  const sql = `UPDATE Inventario_Items SET ${fieldsToUpdate.join(', ')} WHERE id_item = ?`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getInventoryItemById(id_item);
    }
    const existingItem = await getInventoryItemById(id_item);
    if (!existingItem) throw new Error (`Ítem con ID ${id_item} no encontrado para actualizar.`);
    return existingItem; 

  } catch (error) {
    console.error(`Error updating inventory item ${id_item}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_DUP_ENTRY') {
       if ((error as any).sqlMessage.includes('codigo_item')) {
        throw new Error(`El código de ítem '${data.codigo_item}' ya existe para otro ítem.`);
      }
    }
    throw error;
  }
}

export async function deleteInventoryItem(id_item: number): Promise<boolean> {
  // Considerar que Inventario_Movimientos y EPP_Asignaciones_Actuales podrían tener FK a id_item.
  // Si las FKs son RESTRICT, esta operación fallará si existen registros relacionados.
  // Si son CASCADE, los registros relacionados se eliminarán.
  // Si son SET NULL, el id_item en las tablas referenciadoras se establecerá a NULL.
  // La BD está configurada con ON DELETE RESTRICT para Inventario_Movimientos.id_item
  // y ON DELETE CASCADE para EPP_Asignaciones_Actuales.id_item_epp.
  // Esto significa que si hay movimientos, el borrado fallará.
  // Si hay asignaciones de EPP, se borrarán las asignaciones.
  const sql = 'DELETE FROM Inventario_Items WHERE id_item = ?';
  try {
    const result = await query(sql, [id_item]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting inventory item ${id_item}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error(`No se puede eliminar el ítem porque tiene movimientos de inventario registrados. Elimine o modifique los movimientos primero.`);
    }
    throw error;
  }
}
