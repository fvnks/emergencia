
'use server';

import { query, getPool } from '@/lib/db';
import type { ResultSetHeader, PoolConnection, RowDataPacket } from 'mysql2/promise';
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
  fecha_asignacion: string;
  cantidad_asignada: number;
  estado_asignacion: EppAssignmentStatus;
  notas?: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  id_usuario_responsable?: number | null;

  // Campos unidos
  nombre_item_epp?: string;
  codigo_item_epp?: string;
  nombre_usuario?: string;
}

export interface EppAssignmentCreateInput {
  id_usuario: number; // ID del usuario al que se asigna
  id_item_epp: number; // ID del ítem de inventario (que es EPP)
  cantidad_asignada: number;
  fecha_asignacion: string; // YYYY-MM-DD
  notas?: string;
}

interface ExistingAssignment extends RowDataPacket {
  id_asignacion_epp: number;
  cantidad_asignada: number;
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
    const { id_usuario, id_item_epp, cantidad_asignada: cantidad_a_asignar_ahora, fecha_asignacion, notas } = data;

    if (cantidad_a_asignar_ahora <= 0) {
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
    if (item.cantidad_actual < cantidad_a_asignar_ahora) {
      throw new Error(`Stock insuficiente para "${item.nombre_item}". Disponible: ${item.cantidad_actual}, Solicitado: ${cantidad_a_asignar_ahora}.`);
    }

    // 2. Reducir la cantidad_actual en Inventario_Items
    const newStockQuantity = item.cantidad_actual - cantidad_a_asignar_ahora;
    await connection.execute(
      'UPDATE Inventario_Items SET cantidad_actual = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_item = ?',
      [newStockQuantity, id_item_epp]
    );

    // 3. Verificar si ya existe una asignación activa para este usuario y EPP
    const [existingAssignments] = await connection.execute<ExistingAssignment[]>(
        `SELECT id_asignacion_epp, cantidad_asignada FROM EPP_Asignaciones_Actuales 
         WHERE id_usuario = ? AND id_item_epp = ? AND estado_asignacion = 'Asignado' FOR UPDATE`,
        [id_usuario, id_item_epp]
    );
    
    let newAssignmentId: number;
    const assignmentStatus: EppAssignmentStatus = 'Asignado';

    if (existingAssignments.length > 0) {
        // Actualizar la asignación existente
        const existingAssignment = existingAssignments[0];
        const nuevaCantidadTotalAsignada = existingAssignment.cantidad_asignada + cantidad_a_asignar_ahora;
        await connection.execute(
            `UPDATE EPP_Asignaciones_Actuales 
             SET cantidad_asignada = ?, fecha_asignacion = ?, notas = ?, id_usuario_responsable = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
             WHERE id_asignacion_epp = ?`,
            [nuevaCantidadTotalAsignada, fecha_asignacion, notas || null, responsibleUserId, existingAssignment.id_asignacion_epp]
        );
        newAssignmentId = existingAssignment.id_asignacion_epp;
    } else {
        // Crear nueva asignación
        const [assignmentResult] = await connection.execute(
          `INSERT INTO EPP_Asignaciones_Actuales
           (id_usuario, id_item_epp, fecha_asignacion, cantidad_asignada, estado_asignacion, notas, id_usuario_responsable)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id_usuario, id_item_epp, fecha_asignacion, cantidad_a_asignar_ahora, assignmentStatus, notas || null, responsibleUserId]
        ) as [ResultSetHeader, any];
        newAssignmentId = assignmentResult.insertId;
    }


    // 4. Crear registro en Inventario_Movimientos
    const movementType: EppMovementType = 'ASIGNACION_EPP';
    await connection.execute(
      `INSERT INTO Inventario_Movimientos
       (id_item, tipo_movimiento, cantidad_movida, id_usuario_responsable, notas_movimiento)
       VALUES (?, ?, ?, ?, ?)`,
      [id_item_epp, movementType, -cantidad_a_asignar_ahora, responsibleUserId, notas || `Asignación EPP a usuario ID ${id_usuario}`]
    );


    // 5. Obtener y devolver la asignación (nueva o actualizada)
    const [newAssignmentRows] = await connection.execute(
      `SELECT
        ea.id_asignacion_epp, ea.id_usuario, ea.id_item_epp, ea.fecha_asignacion,
        ea.cantidad_asignada, ea.estado_asignacion, ea.notas,
        ea.fecha_creacion, ea.fecha_actualizacion, ea.id_usuario_responsable,
        ii.nombre_item AS nombre_item_epp, ii.codigo_item AS codigo_item_epp,
        u.nombre_completo AS nombre_usuario
      FROM EPP_Asignaciones_Actuales ea
      JOIN Inventario_Items ii ON ea.id_item_epp = ii.id_item
      JOIN Usuarios u ON ea.id_usuario = u.id_usuario
      WHERE ea.id_asignacion_epp = ?`,
      [newAssignmentId]
    ) as [EppAssignment[], any];
    
    return newAssignmentRows.length > 0 ? newAssignmentRows[0] : null;
  });
}

export async function getEppAssignedToUser(userId: number): Promise<EppAssignment[]> {
  const sql = `
    SELECT
      ea.id_asignacion_epp,
      ea.id_usuario,
      ea.id_item_epp,
      ea.fecha_asignacion,
      ea.cantidad_asignada,
      ea.estado_asignacion,
      ea.notas,
      ea.fecha_creacion,
      ea.fecha_actualizacion,
      ea.id_usuario_responsable,
      ii.nombre_item AS nombre_item_epp,
      ii.codigo_item AS codigo_item_epp,
      u.nombre_completo AS nombre_usuario
    FROM EPP_Asignaciones_Actuales ea
    JOIN Inventario_Items ii ON ea.id_item_epp = ii.id_item
    JOIN Usuarios u ON ea.id_usuario = u.id_usuario
    WHERE ea.id_usuario = ? AND ea.estado_asignacion = 'Asignado'
    ORDER BY ea.fecha_asignacion DESC, ii.nombre_item ASC
  `;
  try {
    const rows = await query(sql, [userId]) as EppAssignment[];
    return rows;
  } catch (error) {
    console.error(`Error fetching EPP assigned to user ${userId}:`, error);
    throw error;
  }
}

