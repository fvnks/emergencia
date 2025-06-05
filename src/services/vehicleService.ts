
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
      DATE_FORMAT(v.vencimiento_documentacion, '%Y-%m-%d') as vencimiento_documentacion
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
    throw error;
  }
}

export async function getVehicleById(id_vehiculo: number): Promise<Vehicle | null> {
  const sql = `
    SELECT
      v.*,
      DATE_FORMAT(v.fecha_adquisicion, '%Y-%m-%d') as fecha_adquisicion,
      DATE_FORMAT(v.proxima_mantencion_programada, '%Y-%m-%d') as proxima_mantencion_programada,
      DATE_FORMAT(v.vencimiento_documentacion, '%Y-%m-%d') as vencimiento_documentacion
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
    throw error;
  }
}

export async function createVehicle(data: VehicleCreateInput): Promise<Vehicle | null> {
  const {
    identificador_interno, marca, modelo, patente, tipo_vehiculo, estado_vehiculo,
    ano_fabricacion, fecha_adquisicion, proxima_mantencion_programada,
    vencimiento_documentacion, url_imagen, ai_hint_imagen, notas
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
    if (result.insertId) {
      return getVehicleById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_DUP_ENTRY') {
            if (mysqlError.sqlMessage?.includes('patente') && patente) {
                throw new Error(`La patente '${patente}' ya existe para otro veh\u00edculo.`);
            }
            if (mysqlError.sqlMessage?.includes('identificador_interno') && identificador_interno) {
                throw new Error(`El identificador interno '${identificador_interno}' ya existe para otro veh\u00edculo.`);
            }
        } else if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
            throw new Error("La tabla 'Vehiculos' no existe. No se pudo crear el veh\u00edculo.");
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
    }
    throw error;
  }
}

export async function updateVehicle(id_vehiculo: number, data: VehicleUpdateInput): Promise<Vehicle | null> {
  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  const addField = (fieldKey: keyof VehicleUpdateInput, value?: string | number | null) => {
    if (value !== undefined) {
      fieldsToUpdate.push(`${fieldKey} = ?`);
      if (typeof fieldKey === 'string' && (fieldKey.startsWith('fecha_') || fieldKey === 'proxima_mantencion_programada' || fieldKey === 'vencimiento_documentacion')) {
        params.push(formatDateForDb(value as string | undefined | null));
      } else {
        params.push(value === '' ? null : value);
      }
    }
  };

  addField('identificador_interno', data.identificador_interno);
  addField('marca', data.marca);
  addField('modelo', data.modelo);
  addField('patente', data.patente);
  addField('tipo_vehiculo', data.tipo_vehiculo);
  addField('estado_vehiculo', data.estado_vehiculo);
  addField('ano_fabricacion', data.ano_fabricacion);
  addField('fecha_adquisicion', data.fecha_adquisicion);
  addField('proxima_mantencion_programada', data.proxima_mantencion_programada);
  addField('vencimiento_documentacion', data.vencimiento_documentacion);
  addField('url_imagen', data.url_imagen);
  addField('ai_hint_imagen', data.ai_hint_imagen);
  addField('notas', data.notas);

  if (fieldsToUpdate.length === 0) {
    return getVehicleById(id_vehiculo);
  }

  fieldsToUpdate.push('fecha_actualizacion = CURRENT_TIMESTAMP');
  params.push(id_vehiculo);

  const sql = `UPDATE Vehiculos SET ${fieldsToUpdate.join(', ')} WHERE id_vehiculo = ?`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getVehicleById(id_vehiculo);
    }
    const existingItem = await getVehicleById(id_vehiculo);
    if (!existingItem) throw new Error (`Veh\u00edculo con ID ${id_vehiculo} no encontrado para actualizar.`);
    return existingItem;
  } catch (error) {
    console.error(`Error updating vehicle ${id_vehiculo}:`, error);
    if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_DUP_ENTRY') {
             if (mysqlError.sqlMessage?.includes('patente') && data.patente) {
                throw new Error(`La patente '${data.patente}' ya existe para otro veh\u00edculo.`);
            }
            if (mysqlError.sqlMessage?.includes('identificador_interno') && data.identificador_interno) {
                throw new Error(`El identificador interno '${data.identificador_interno}' ya existe para otro veh\u00edculo.`);
            }
        } else if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
            throw new Error("La tabla 'Vehiculos' no existe. No se pudo actualizar el veh\u00edculo.");
        }
        handleMissingColumnError(mysqlError, 'identificador_interno', 'Vehiculos', 'actualizar');
        handleMissingColumnError(mysqlError, 'tipo_vehiculo', 'Vehiculos', 'actualizar');
        handleMissingColumnError(mysqlError, 'estado_vehiculo', 'Vehiculos', 'actualizar');
        handleMissingColumnError(mysqlError, 'ano_fabricacion', 'Vehiculos', 'actualizar');
        handleMissingColumnError(mysqlError, 'fecha_adquisicion', 'Vehiculos', 'actualizar');
        handleMissingColumnError(mysqlError, 'proxima_mantencion_programada', 'Vehiculos', 'actualizar');
        handleMissingColumnError(mysqlError, 'vencimiento_documentacion', 'Vehiculos', 'actualizar');
        handleMissingColumnError(mysqlError, 'url_imagen', 'Vehiculos', 'actualizar');
        handleMissingColumnError(mysqlError, 'ai_hint_imagen', 'Vehiculos', 'actualizar');
    }
    throw error;
  }
}

export async function deleteVehicle(id_vehiculo: number): Promise<boolean> {
  const sql = 'DELETE FROM Vehiculos WHERE id_vehiculo = ?';
  try {
    const result = await query(sql, [id_vehiculo]) as ResultSetHeader;
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting vehicle ${id_vehiculo}:`, error);
     if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Vehiculos' no existe. No se pudo eliminar el veh\u00edculo.");
    }
    if (error instanceof Error && (error as any).code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error('No se puede eliminar el veh\u00edculo porque est\u00e1 referenciado en otros registros (ej. tareas de mantenimiento). Por favor, reasigne o elimine esos registros primero.');
    }
    throw error;
  }
}

