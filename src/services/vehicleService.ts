
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2/promise';
import type { Vehicle, VehicleCreateInput, VehicleUpdateInput, VehicleStatus, VehicleType } from '@/types/vehicleTypes';

// Helper para formatear fechas para la base de datos (YYYY-MM-DD o null)
const formatDateForDb = (dateString?: string | null): string | null => {
  if (!dateString || dateString.trim() === "") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : null;
};

const handleMissingColumnError = (error: any, columnName: string, tableName: string = 'Vehiculos', operation: string = 'seleccionar') => {
  if (error instanceof Error &&
      ((error as any).code === 'ER_BAD_FIELD_ERROR' || (error as any).message?.toLowerCase().includes(`unknown column '${columnName.toLowerCase()}'`)) &&
      (error as any).sqlMessage?.toLowerCase().includes(columnName.toLowerCase())) {
    let suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} VARCHAR(255) NULL;`; // Default suggestion
    if (columnName === 'fecha_adquisicion' || columnName === 'proxima_mantencion_programada' || columnName === 'vencimiento_documentacion') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} DATE NULL;`;
    } else if (columnName === 'ano_fabricacion') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} INT NULL;`;
    } else if (columnName === 'identificador_interno') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} VARCHAR(50) NULL UNIQUE;`;
    } else if (columnName === 'patente') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} VARCHAR(20) NULL UNIQUE;`;
    } else if (columnName === 'tipo_vehiculo') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} VARCHAR(100) NULL;`;
    } else if (columnName === 'estado_vehiculo') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ENUM('Operativo', 'En Mantención', 'Fuera de Servicio') DEFAULT 'Operativo';`;
    } else if (columnName === 'url_imagen') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} VARCHAR(255) NULL;`;
    } else if (columnName === 'ai_hint_imagen') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} VARCHAR(100) NULL;`;
    } else if (columnName === 'notas') {
      suggestion = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} TEXT NULL;`;
    }

    throw new Error(
      `Error de esquema de base de datos: La columna '${columnName}' no existe en la tabla '${tableName}' al intentar ${operation} datos. ` +
      `Por favor, verifica la estructura de tu tabla. Es posible que necesites agregar esta columna. ` +
      `Ejemplo SQL: ${suggestion} (Ajusta el tipo de dato y las restricciones si es necesario)`
    );
  }
};

export async function getAllVehicles(): Promise<Vehicle[]> {
  const sql = `
    SELECT
      v.*,
      DATE_FORMAT(v.fecha_adquisicion, '%Y-%m-%d') as fecha_adquisicion,
      DATE_FORMAT(v.proxima_mantencion_programada, '%Y-%m-%d') as proxima_mantencion_programada,
      DATE_FORMAT(v.vencimiento_documentacion, '%Y-%m-%d') as vencimiento_documentacion,
      DATE_FORMAT(v.fecha_creacion, '%Y-%m-%dT%H:%i:%SZ') as fecha_creacion,
      DATE_FORMAT(v.fecha_actualizacion, '%Y-%m-%dT%H:%i:%SZ') as fecha_actualizacion
    FROM Vehiculos v
    ORDER BY v.marca ASC, v.modelo ASC
  `;
  try {
    const rows = await query(sql) as Vehicle[];
    return rows;
  } catch (error) {
    console.error('Error fetching all vehicles:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'Vehiculos' no existe. Devolviendo array vacío.");
      return [];
    }
    handleMissingColumnError(error, 'fecha_adquisicion', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'proxima_mantencion_programada', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'vencimiento_documentacion', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'ano_fabricacion', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'tipo_vehiculo', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'estado_vehiculo', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'identificador_interno', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'url_imagen', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'ai_hint_imagen', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'notas', 'Vehiculos', 'seleccionar');
    throw error;
  }
}

export async function getVehicleById(id_vehiculo: number): Promise<Vehicle | null> {
  const sql = `
    SELECT
      v.*,
      DATE_FORMAT(v.fecha_adquisicion, '%Y-%m-%d') as fecha_adquisicion,
      DATE_FORMAT(v.proxima_mantencion_programada, '%Y-%m-%d') as proxima_mantencion_programada,
      DATE_FORMAT(v.vencimiento_documentacion, '%Y-%m-%d') as vencimiento_documentacion,
      DATE_FORMAT(v.fecha_creacion, '%Y-%m-%dT%H:%i:%SZ') as fecha_creacion,
      DATE_FORMAT(v.fecha_actualizacion, '%Y-%m-%dT%H:%i:%SZ') as fecha_actualizacion
    FROM Vehiculos v
    WHERE v.id_vehiculo = ?
  `;
  try {
    const rows = await query(sql, [id_vehiculo]) as Vehicle[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      return null;
    }
    handleMissingColumnError(error, 'fecha_adquisicion', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'proxima_mantencion_programada', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'vencimiento_documentacion', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'ano_fabricacion', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'tipo_vehiculo', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'estado_vehiculo', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'identificador_interno', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'url_imagen', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'ai_hint_imagen', 'Vehiculos', 'seleccionar');
    handleMissingColumnError(error, 'notas', 'Vehiculos', 'seleccionar');
    throw error;
  }
}

export async function createVehicle(data: VehicleCreateInput): Promise<Vehicle | null> {
  const {
    identificador_interno, marca, modelo, patente, tipo_vehiculo, estado_vehiculo,
    ano_fabricacion, fecha_adquisicion, proxima_mantencion_programada,
    vencimiento_documentacion, url_imagen, ai_hint_imagen, notas,
    assignedEraIds, assignedInventoryItems
  } = data;

  const sql = `
    INSERT INTO Vehiculos (
      identificador_interno, marca, modelo, patente, tipo_vehiculo, estado_vehiculo,
      ano_fabricacion, fecha_adquisicion, proxima_mantencion_programada,
      vencimiento_documentacion, url_imagen, ai_hint_imagen, notas
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    identificador_interno || null, marca, modelo, patente || null, tipo_vehiculo || null, estado_vehiculo,
    ano_fabricacion || null, formatDateForDb(fecha_adquisicion), formatDateForDb(proxima_mantencion_programada),
    formatDateForDb(vencimiento_documentacion), url_imagen || null, ai_hint_imagen || null, notas || null
  ];

  try {
    const result = await query(sql, params) as ResultSetHeader;
    const newVehicleId = result.insertId;

    if (newVehicleId) {
      // Lógica de backend para tablas de unión (Vehiculos_ERA, Vehiculos_Inventario_Items)
      // Esta parte es responsabilidad del desarrollador del backend.
      if (assignedEraIds && assignedEraIds.length > 0) {
        console.log(`Vehículo ${newVehicleId} creado. Backend debe asignar ERAs:`, assignedEraIds);
        // Ejemplo: for (const eraId of assignedEraIds) { await query('INSERT INTO Vehiculos_ERA ...'); }
      }
      if (assignedInventoryItems && assignedInventoryItems.length > 0) {
        console.log(`Vehículo ${newVehicleId} creado. Backend debe asignar ítems de inventario:`, assignedInventoryItems);
        // Ejemplo: for (const item of assignedInventoryItems) { await query('INSERT INTO Vehiculos_Inventario_Items ...'); }
      }
      return getVehicleById(newVehicleId);
    }
    return null;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_DUP_ENTRY') {
            if (mysqlError.sqlMessage?.includes('patente') && patente) {
                throw new Error(`La patente '${patente}' ya existe para otro vehículo.`);
            }
            if (mysqlError.sqlMessage?.includes('identificador_interno') && identificador_interno) {
                throw new Error(`El identificador interno '${identificador_interno}' ya existe para otro vehículo.`);
            }
        } else if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
            throw new Error("La tabla 'Vehiculos' no existe. No se pudo crear el vehículo.");
        }
        handleMissingColumnError(mysqlError, 'identificador_interno', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'tipo_vehiculo', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'estado_vehiculo', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'ano_fabricacion', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'fecha_adquisicion', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'proxima_mantencion_programada', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'vencimiento_documentacion', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'url_imagen', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'ai_hint_imagen', 'Vehiculos', 'insertar');
        handleMissingColumnError(mysqlError, 'notas', 'Vehiculos', 'insertar');
    }
    throw error;
  }
}

export async function updateVehicle(id_vehiculo: number, data: VehicleUpdateInput): Promise<Vehicle | null> {
  const {
    assignedEraIds, assignedInventoryItems, // Extract new fields
    ...vehicleData // Rest of the vehicle data
  } = data;

  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  const addField = (fieldKey: keyof Omit<VehicleUpdateInput, 'assignedEraIds' | 'assignedInventoryItems'>, value?: string | number | null) => {
    if (value !== undefined) {
      fieldsToUpdate.push(`${fieldKey} = ?`);
      if (typeof fieldKey === 'string' && (fieldKey.startsWith('fecha_') || fieldKey === 'proxima_mantencion_programada' || fieldKey === 'vencimiento_documentacion')) {
        params.push(formatDateForDb(value as string | undefined | null));
      } else {
        params.push(value === '' ? null : value);
      }
    }
  };

  addField('identificador_interno', vehicleData.identificador_interno);
  addField('marca', vehicleData.marca);
  addField('modelo', vehicleData.modelo);
  addField('patente', vehicleData.patente);
  addField('tipo_vehiculo', vehicleData.tipo_vehiculo);
  addField('estado_vehiculo', vehicleData.estado_vehiculo);
  addField('ano_fabricacion', vehicleData.ano_fabricacion);
  addField('fecha_adquisicion', vehicleData.fecha_adquisicion);
  addField('proxima_mantencion_programada', vehicleData.proxima_mantencion_programada);
  addField('vencimiento_documentacion', vehicleData.vencimiento_documentacion);
  addField('url_imagen', vehicleData.url_imagen);
  addField('ai_hint_imagen', vehicleData.ai_hint_imagen);
  addField('notas', vehicleData.notas);

  if (fieldsToUpdate.length === 0 && !assignedEraIds && !assignedInventoryItems) {
    return getVehicleById(id_vehiculo); // No fields to update
  }

  if (fieldsToUpdate.length > 0) {
    fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
    params.push(id_vehiculo);

    const sql = `UPDATE Vehiculos SET ${fieldsToUpdate.join(', ')} WHERE id_vehiculo = ?`;
    try {
      const result = await query(sql, params) as ResultSetHeader;
      if (result.affectedRows === 0) {
        const existingItem = await getVehicleById(id_vehiculo);
        if (!existingItem) throw new Error (`Vehículo con ID ${id_vehiculo} no encontrado para actualizar.`);
      }
    } catch (error) {
      console.error(`Error updating vehicle ${id_vehiculo} (main data):`, error);
        if (error instanceof Error) {
            const mysqlError = error as any;
            if (mysqlError.code === 'ER_DUP_ENTRY') {
                 if (mysqlError.sqlMessage?.includes('patente') && vehicleData.patente) {
                    throw new Error(`La patente '${vehicleData.patente}' ya existe para otro vehículo.`);
                }
                if (mysqlError.sqlMessage?.includes('identificador_interno') && vehicleData.identificador_interno) {
                    throw new Error(`El identificador interno '${vehicleData.identificador_interno}' ya existe para otro vehículo.`);
                }
            } else if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
                throw new Error("La tabla 'Vehiculos' no existe. No se pudo actualizar el vehículo.");
            }
            // Handle other missing column errors
        }
        throw error;
    }
  }

  // Lógica de backend para actualizar asignaciones de ERA e Inventario
  // Esta parte es responsabilidad del desarrollador del backend.
  // Debería implicar:
  // 1. Eliminar asignaciones antiguas para este vehículo (ej. DELETE FROM Vehiculos_ERA WHERE id_vehiculo = ?)
  // 2. Insertar las nuevas asignaciones de assignedEraIds y assignedInventoryItems
  if (assignedEraIds) {
    console.log(`Backend debe actualizar ERAs para vehículo ${id_vehiculo}:`, assignedEraIds);
  }
  if (assignedInventoryItems) {
    console.log(`Backend debe actualizar ítems de inventario para vehículo ${id_vehiculo}:`, assignedInventoryItems);
  }

  return getVehicleById(id_vehiculo);
}

export async function deleteVehicle(id_vehiculo: number): Promise<boolean> {
  const sql = 'DELETE FROM Vehiculos WHERE id_vehiculo = ?';
  try {
    const result = await query(sql, [id_vehiculo]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting vehicle ${id_vehiculo}:`, error);
     if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Vehiculos' no existe. No se pudo eliminar el vehículo.");
    }
    if (error instanceof Error && (error as any).code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error('No se puede eliminar el vehículo porque está referenciado en otros registros (ej. tareas de mantenimiento, asignaciones ERA/Inventario). Por favor, reasigne o elimine esos registros primero.');
    }
    throw error;
  }
}
