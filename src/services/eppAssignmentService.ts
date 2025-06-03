
'use server';

import { query, getPool } from '@/lib/db'; 
import type { ResultSetHeader, PoolConnection } from 'mysql2/promise';
import type { InventoryItem } from './inventoryService';
import type { User } from './userService';

// Tipos de Movimiento de Inventario para EPP
export type EppMovementType = 'ASIGNACION_EPP' | 'DEVOLUCION_EPP';

// Estados de Asignación de EPP
export type EppAssignmentStatus = 'Asignado' | 'Devuelto Parcialmente' | 'Devuelto Totalmente' | 'Perdido' | 'Dañado';

export interface EppAssignment {
  id_asignacion_epp: number;
  id_usuario: number;
  id_item_epp: number;
  // fecha_asignacion: string; // Columna eliminada temporalmente
  cantidad_asignada: number;
  estado_asignacion: EppAssignmentStatus;
  notas?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Campos unidos
  nombre_item_epp?: string;
  codigo_item_epp?: string;
  nombre_usuario?: string;
}

export interface EppAssignmentCreateInput {
  id_usuario: number; // ID del usuario al que se asigna
  id_item_epp: number; // ID del ítem de inventario (que es EPP)
  cantidad_asignada: number;
  // fecha_asignacion: string; // Columna eliminada temporalmente
  notas?: string;
}

async function executeTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const pool = await getPool(); 
  if (!pool) {
    throw new Error('MySQL Pool is not available after awaiting getPool.');
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed, rolled back:', error);
    throw error;
  } finally {
    connection.release();
  }
}


export async function assignEppToUser(
  data: EppAssignmentCreateInput,
  responsibleUserId: number // ID del usuario que realiza la acción (admin/logueado)
): Promise<EppAssignment | null> {
  return executeTransaction(async (connection) => {
    const { id_usuario, id_item_epp, cantidad_asignada, notas } = data; // fecha_asignacion eliminada

    if (cantidad_asignada <= 0) {
      throw new Error("La cantidad asignada debe ser mayor que cero.");
    }

    // 1. Verificar si el ítem es EPP y si hay stock suficiente (LOCKING READ)
    const [itemRows] = await connection.execute(
      'SELECT * FROM Inventario_Items WHERE id_item = ? FOR UPDATE',
      [id_item_epp]
    ) as [InventoryItem[], any];

    if (!itemRows || itemRows.length === 0) {
      throw new Error(`Ítem de EPP con ID ${id_item_epp} no encontrado.`);
    }
    const item = itemRows[0];

    if (!item.es_epp) {
      throw new Error(`El ítem "${item.nombre_item}" no está marcado como EPP.`);
    }
    if (item.cantidad_actual < cantidad_asignada) {
      throw new Error(`Stock insuficiente para "${item.nombre_item}". Disponible: ${item.cantidad_actual}, Solicitado: ${cantidad_asignada}.`);
    }

    // 2. Reducir la cantidad_actual en Inventario_Items
    const newQuantity = item.cantidad_actual - cantidad_asignada;
    await connection.execute(
      'UPDATE Inventario_Items SET cantidad_actual = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_item = ?',
      [newQuantity, id_item_epp]
    );

    // 3. Crear registro en EPP_Asignaciones_Actuales
    const assignmentStatus: EppAssignmentStatus = 'Asignado';
    const [assignmentResult] = await connection.execute(
      `INSERT INTO EPP_Asignaciones_Actuales 
       (id_usuario, id_item_epp, cantidad_asignada, estado_asignacion, notas) 
       VALUES (?, ?, ?, ?, ?)`, // fecha_asignacion eliminada de la query y params
      [id_usuario, id_item_epp, cantidad_asignada, assignmentStatus, notas || null]
    ) as [ResultSetHeader, any];
    const newAssignmentId = assignmentResult.insertId;

    // 4. Crear registro en Inventario_Movimientos
    const movementType: EppMovementType = 'ASIGNACION_EPP';
    await connection.execute(
      `INSERT INTO Inventario_Movimientos 
       (id_item, tipo_movimiento, cantidad_movimiento, id_usuario_responsable, id_usuario_destino, notas_movimiento) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_item_epp, movementType, -cantidad_asignada, responsibleUserId, id_usuario, notas || `Asignación EPP a usuario ID ${id_usuario}`]
    );

    // 5. Obtener y devolver la nueva asignación (opcional, pero útil)
    const [newAssignmentRows] = await connection.execute(
      'SELECT * FROM EPP_Asignaciones_Actuales WHERE id_asignacion_epp = ?',
      [newAssignmentId]
    ) as [EppAssignment[], any];
    
    return newAssignmentRows.length > 0 ? newAssignmentRows[0] : null;
  });
}

export async function getEppAssignedToUser(userId: number): Promise<EppAssignment[]> {
  const sql = `
    SELECT 
      ea.*,
      ii.nombre_item AS nombre_item_epp,
      ii.codigo_item AS codigo_item_epp
    FROM EPP_Asignaciones_Actuales ea
    JOIN Inventario_Items ii ON ea.id_item_epp = ii.id_item
    WHERE ea.id_usuario = ? AND ea.estado_asignacion = 'Asignado' 
    ORDER BY ea.fecha_creacion DESC, ii.nombre_item ASC 
  `; // Orden cambiado a fecha_creacion en lugar de fecha_asignacion
  try {
    const rows = await query(sql, [userId]) as EppAssignment[];
    return rows;
  } catch (error) {
    console.error(`Error fetching EPP assigned to user ${userId}:`, error);
    throw error;
  }
}

// TODO: Implementar returnEppFromUser, updateEppAssignment, getAssignmentsForItem
// Estas funciones también requerirán manejo de transacciones.

