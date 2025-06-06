
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2/promise';

export interface InventoryItem {
  id_item: number;
  codigo_item: string;
  nombre_item: string;
  descripcion_item?: string | null;
  categoria_item: string;
  id_bodega?: number | null; // FK a Bodegas.id_bodega
  sub_ubicacion?: string | null; // Ubicación específica dentro de la bodega
  cantidad_actual: number;
  unidad_medida: string;
  stock_minimo?: number | null;
  es_epp: boolean;
  fecha_vencimiento_item?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Joined fields
  nombre_bodega?: string | null; // Nombre de la bodega desde la tabla Bodegas
}

export interface InventoryItemCreateInput {
  codigo_item: string;
  nombre_item: string;
  descripcion_item?: string;
  categoria_item: string;
  id_bodega?: number | null; // ID de la bodega seleccionada
  sub_ubicacion?: string; // Texto libre para sub-ubicación
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
  id_bodega?: number | null; // ID de la bodega seleccionada
  sub_ubicacion?: string | null; // Texto libre para sub-ubicación
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
      CAST(i.es_epp AS UNSIGNED) as es_epp_numeric,
      b.nombre_bodega AS nombre_bodega
    FROM Inventario_Items i
    LEFT JOIN Bodegas b ON i.id_bodega = b.id_bodega
    ORDER BY i.nombre_item ASC
  `;
  try {
    const rows = await query(sql) as (InventoryItem & { es_epp_numeric: number })[];
    return rows.map(item => ({ ...item, es_epp: Boolean(item.es_epp_numeric) }));
  } catch (error) {
    console.error('Error fetching all inventory items:', error);
    if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
            if (mysqlError.message.includes("'Inventario_Items'")) {
                 throw new Error("Error de Base de Datos: La tabla 'Inventario_Items' no existe. Por favor, ejecute el script SQL para crearla.");
            } else if (mysqlError.message.includes("'Bodegas'")) {
                 throw new Error("Error de Base de Datos: La tabla 'Bodegas' no existe. Por favor, ejecute el script SQL para crearla o créela desde Configuración > Gestionar Bodegas.");
            }
        } else if (mysqlError.code === 'ER_BAD_FIELD_ERROR') {
            if (mysqlError.sqlMessage?.includes("'i.id_bodega'")) {
              throw new Error(
                  "Error de esquema de base de datos: La columna 'id_bodega' no existe en la tabla 'Inventario_Items'. " +
                  "Esta columna es necesaria para vincular los ítems a las bodegas. " +
                  "Por favor, modifica tu tabla 'Inventario_Items' para agregarla. Ejemplo SQL: " +
                  "ALTER TABLE Inventario_Items ADD COLUMN id_bodega INT NULL, ADD CONSTRAINT fk_item_bodega FOREIGN KEY (id_bodega) REFERENCES Bodegas(id_bodega) ON DELETE SET NULL;"
              );
            } else if (mysqlError.sqlMessage?.includes("'sub_ubicacion'")) {
               throw new Error(
                  "Error de esquema de base de datos: La columna 'sub_ubicacion' no existe en la tabla 'Inventario_Items'. " +
                  "Esta columna es necesaria para detallar la ubicación dentro de una bodega. " +
                  "Por favor, modifica tu tabla 'Inventario_Items' para agregarla. Ejemplo SQL: " +
                  "ALTER TABLE Inventario_Items ADD COLUMN sub_ubicacion VARCHAR(255) NULL;"
              );
            }
        }
    }
    throw error;
  }
}

export async function getInventoryItemById(id_item: number): Promise<InventoryItem | null> {
  const sql = `
    SELECT
      i.*,
      CAST(i.es_epp AS UNSIGNED) as es_epp_numeric,
      b.nombre_bodega AS nombre_bodega
    FROM Inventario_Items i
    LEFT JOIN Bodegas b ON i.id_bodega = b.id_bodega
    WHERE i.id_item = ?
  `;
  try {
    const rows = await query(sql, [id_item]) as (InventoryItem & { es_epp_numeric: number })[];
    if (rows.length > 0) {
      return { ...rows[0], es_epp: Boolean(rows[0].es_epp_numeric) };
    }
    return null;
  } catch (error) {
    console.error('Error fetching inventory item by ID:', error);
    if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
            return null; // Table doesn't exist, so item can't exist.
        } else if (mysqlError.code === 'ER_BAD_FIELD_ERROR') {
            if (mysqlError.sqlMessage?.includes("'i.id_bodega'")) {
              throw new Error(
                  "Error de esquema de base de datos: La columna 'id_bodega' no existe en la tabla 'Inventario_Items' al buscar por ID. " +
                  "Consulta el mensaje de error en la carga principal del inventario para obtener instrucciones de corrección."
              );
            } else if (mysqlError.sqlMessage?.includes("'sub_ubicacion'")) {
               throw new Error(
                  "Error de esquema de base de datos: La columna 'sub_ubicacion' no existe en la tabla 'Inventario_Items' al buscar por ID. " +
                  "Consulta el mensaje de error en la carga principal del inventario para obtener instrucciones de corrección."
              );
            }
        }
    }
    throw error;
  }
}

export async function createInventoryItem(data: InventoryItemCreateInput): Promise<InventoryItem | null> {
  const {
    codigo_item,
    nombre_item,
    descripcion_item,
    categoria_item,
    id_bodega,
    sub_ubicacion,
    cantidad_actual,
    unidad_medida = 'unidad',
    stock_minimo,
    es_epp,
    fecha_vencimiento_item,
  } = data;

  const sql = `
    INSERT INTO Inventario_Items (
      codigo_item, nombre_item, descripcion_item, categoria_item, id_bodega,
      sub_ubicacion, cantidad_actual, unidad_medida, stock_minimo, es_epp, fecha_vencimiento_item
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    codigo_item,
    nombre_item,
    descripcion_item || null,
    categoria_item,
    id_bodega || null,
    sub_ubicacion || null,
    cantidad_actual,
    unidad_medida,
    stock_minimo === undefined || stock_minimo === null ? null : stock_minimo,
    es_epp ? 1 : 0,
    (fecha_vencimiento_item && fecha_vencimiento_item.trim() !== "") ? fecha_vencimiento_item : null,
  ];

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.insertId) {
      // Registrar movimiento inicial de inventario (entrada)
      const movementSql = `
        INSERT INTO Inventario_Movimientos (id_item, tipo_movimiento, cantidad_movimiento, cantidad_movida, notas_movimiento)
        VALUES (?, ?, ?, ?, ?)
      `;
      await query(movementSql, [result.insertId, 'ENTRADA_INICIAL', cantidad_actual, cantidad_actual, 'Creación de ítem en inventario']);
      return getInventoryItemById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_DUP_ENTRY' && mysqlError.sqlMessage.includes('codigo_item')) {
            throw new Error(`El código de ítem '${codigo_item}' ya existe.`);
        } else if (mysqlError.code === 'ER_BAD_FIELD_ERROR') {
            if (mysqlError.sqlMessage?.includes("'id_bodega'")) {
                 throw new Error(
                    "Error de esquema de base de datos al crear ítem: La columna 'id_bodega' podría no existir en 'Inventario_Items'. " +
                    "Verifica la estructura de la tabla y consulta las guías de corrección en los errores de carga del inventario."
                );
            } else if (mysqlError.sqlMessage?.includes("'sub_ubicacion'")) {
                throw new Error(
                    "Error de esquema de base de datos al crear ítem: La columna 'sub_ubicacion' no existe en 'Inventario_Items'. " +
                    "Por favor, modifica tu tabla 'Inventario_Items' para agregarla. Ejemplo SQL: " +
                    "ALTER TABLE Inventario_Items ADD COLUMN sub_ubicacion VARCHAR(255) NULL;"
                );
            }
        } else if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
            throw new Error("Una o más tablas requeridas ('Inventario_Items', 'Inventario_Movimientos', 'Bodegas') no existen. No se pudo crear el ítem.");
        }
    }
    throw error;
  }
}

export async function updateInventoryItem(id_item: number, data: InventoryItemUpdateInput): Promise<InventoryItem | null> {
  const fieldsToUpdate: string[] = [];
  const params: (string | number | boolean | null)[] = [];

  const currentItem = await getInventoryItemById(id_item);
  if (!currentItem) {
    throw new Error(`Ítem con ID ${id_item} no encontrado para actualizar.`);
  }

  let cantidadActualPrevia = currentItem.cantidad_actual;

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
  if (data.id_bodega !== undefined) {
    fieldsToUpdate.push('id_bodega = ?');
    params.push(data.id_bodega);
  }
  if (data.sub_ubicacion !== undefined) {
    fieldsToUpdate.push('sub_ubicacion = ?');
    params.push(data.sub_ubicacion);
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
    params.push((data.fecha_vencimiento_item && data.fecha_vencimiento_item.trim() !== "") ? data.fecha_vencimiento_item : null);
  }

  if (fieldsToUpdate.length === 0) {
    return getInventoryItemById(id_item);
  }

  fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  params.push(id_item);

  const sql = `UPDATE Inventario_Items SET ${fieldsToUpdate.join(', ')} WHERE id_item = ?`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      // Registrar ajuste de inventario si la cantidad_actual cambió
      if (data.cantidad_actual !== undefined && data.cantidad_actual !== cantidadActualPrevia) {
        const diferencia = data.cantidad_actual - cantidadActualPrevia;
        const tipoMovimiento = diferencia > 0 ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO';
        const movementSql = `
          INSERT INTO Inventario_Movimientos (id_item, tipo_movimiento, cantidad_movimiento, cantidad_movida, notas_movimiento)
          VALUES (?, ?, ?, ?, ?)
        `;
        await query(movementSql, [id_item, tipoMovimiento, diferencia, Math.abs(diferencia), 'Ajuste manual de stock por edición']);
      }
      return getInventoryItemById(id_item);
    }
    return currentItem;

  } catch (error) {
    console.error(`Error updating inventory item ${id_item}:`, error);
     if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_DUP_ENTRY' && mysqlError.sqlMessage.includes('codigo_item') && data.codigo_item) {
            throw new Error(`El código de ítem '${data.codigo_item}' ya existe para otro ítem.`);
        } else if (mysqlError.code === 'ER_BAD_FIELD_ERROR') {
            if (mysqlError.sqlMessage?.includes("'id_bodega'")) {
                throw new Error(
                    "Error de esquema de base de datos al actualizar ítem: La columna 'id_bodega' podría no existir en 'Inventario_Items'. " +
                    "Verifica la estructura de la tabla."
                );
            } else if (mysqlError.sqlMessage?.includes("'sub_ubicacion'")) {
                 throw new Error(
                    "Error de esquema de base de datos al actualizar ítem: La columna 'sub_ubicacion' no existe en 'Inventario_Items'. " +
                    "Por favor, modifica tu tabla 'Inventario_Items' para agregarla. Ejemplo SQL: " +
                    "ALTER TABLE Inventario_Items ADD COLUMN sub_ubicacion VARCHAR(255) NULL;"
                );
            }
        } else if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
             throw new Error("Una o más tablas requeridas ('Inventario_Items', 'Inventario_Movimientos', 'Bodegas') no existen. No se pudo actualizar el ítem.");
        }
    }
    throw error;
  }
}

export async function deleteInventoryItem(id_item: number): Promise<boolean> {
  const sql = 'DELETE FROM Inventario_Items WHERE id_item = ?';
  try {
    const result = await query(sql, [id_item]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting inventory item ${id_item}:`, error);
    if (error instanceof Error && (error as any).code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error(`No se puede eliminar el ítem porque tiene movimientos de inventario registrados o asignaciones EPP. Elimine o modifique esos registros primero.`);
    }
     if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Inventario_Items' no existe. No se pudo eliminar el ítem.");
    }
    throw error;
  }
}
