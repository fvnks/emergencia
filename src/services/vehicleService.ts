
'use server';

import { query } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2/promise';
import type { Vehicle, VehicleCreateInput, VehicleUpdateInput } from '@/types/vehicleTypes';

// Helper para formatear fechas para la base de datos (YYYY-MM-DD o null)
const formatDateForDb = (dateString?: string | null): string | null => {
  if (!dateString || dateString.trim() === "") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString) ? dateString : null;
};

const handleMissingColumnError = (error: any, columnName: string, tableName: string = 'Vehiculos') => {
  if (error instanceof Error && (error as any).code === 'ER_BAD_FIELD_ERROR' && (error as any).sqlMessage?.includes(columnName)) {
    throw new Error(
      `Error de esquema de base de datos: La columna '${columnName}' no existe en la tabla '${tableName}'. ` +
      `Por favor, verifica la estructura de tu tabla. Es posible que necesites agregar esta columna. ` +
      `Ejemplo SQL: ALTER TABLE ${tableName} ADD COLUMN ${columnName} DATE NULL;`
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
    handleMissingColumnError(error, 'fecha_adquisicion');
    handleMissingColumnError(error, 'proxima_mantencion_programada');
    handleMissingColumnError(error, 'vencimiento_documentacion');
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
    handleMissingColumnError(error, 'fecha_adquisicion');
    handleMissingColumnError(error, 'proxima_mantencion_programada');
    handleMissingColumnError(error, 'vencimiento_documentacion');
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
            if (mysqlError.sqlMessage?.includes('patente')) {
                throw new Error(`La patente '${patente}' ya existe para otro vehículo.`);
            }
            if (mysqlError.sqlMessage?.includes('identificador_interno')) {
                throw new Error(`El identificador interno '${identificador_interno}' ya existe para otro vehículo.`);
            }
        } else if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
            throw new Error("La tabla 'Vehiculos' no existe. No se pudo crear el vehículo.");
        }
        handleMissingColumnError(mysqlError, 'fecha_adquisicion');
        handleMissingColumnError(mysqlError, 'proxima_mantencion_programada');
        handleMissingColumnError(mysqlError, 'vencimiento_documentacion');
    }
    throw error;
  }
}

export async function updateVehicle(id_vehiculo: number, data: VehicleUpdateInput): Promise<Vehicle | null> {
  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  const addField = (fieldKey: keyof VehicleUpdateInput, value?: string | number | null) => {
    if (value !== undefined) {
      fieldsToUpdate.push(\`\${fieldKey} = ?\`);
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

  const sql = \`UPDATE Vehiculos SET \${fieldsToUpdate.join(', ')} WHERE id_vehiculo = ?\`;

  try {
    const result = await query(sql, params) as ResultSetHeader;
    if (result.affectedRows > 0) {
      return getVehicleById(id_vehiculo);
    }
    const existingItem = await getVehicleById(id_vehiculo);
    if (!existingItem) throw new Error (\`Vehículo con ID \${id_vehiculo} no encontrado para actualizar.\`);
    return existingItem; 
  } catch (error) {
    console.error(\`Error updating vehicle \${id_vehiculo}:\`, error);
    if (error instanceof Error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_DUP_ENTRY') {
             if (mysqlError.sqlMessage?.includes('patente') && data.patente) {
                throw new Error(\`La patente '\${data.patente}' ya existe para otro vehículo.\`);
            }
            if (mysqlError.sqlMessage?.includes('identificador_interno') && data.identificador_interno) {
                throw new Error(\`El identificador interno '\${data.identificador_interno}' ya existe para otro vehículo.\`);
            }
        } else if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
            throw new Error("La tabla 'Vehiculos' no existe. No se pudo actualizar el vehículo.");
        }
        handleMissingColumnError(mysqlError, 'fecha_adquisicion');
        handleMissingColumnError(mysqlError, 'proxima_mantencion_programada');
        handleMissingColumnError(mysqlError, 'vencimiento_documentacion');
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
    console.error(\`Error deleting vehicle \${id_vehiculo}:\`, error);
     if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      throw new Error("La tabla 'Vehiculos' no existe. No se pudo eliminar el vehículo.");
    }
    // Podríamos necesitar manejar ER_ROW_IS_REFERENCED_2 si los vehículos se enlazan con mantenimientos, etc.
    if (error instanceof Error && (error as any).code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error('No se puede eliminar el vehículo porque está referenciado en otros registros (ej. tareas de mantenimiento). Por favor, reasigne o elimine esos registros primero.');
    }
    throw error;
  }
}
