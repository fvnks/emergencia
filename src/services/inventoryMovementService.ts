
'use server';

import { query } from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';

export interface InventoryMovement {
  id_movimiento: number;
  id_item: number;
  tipo_movimiento: string; // Ej: ENTRADA_COMPRA, SALIDA_USO, AJUSTE_POSITIVO, AJUSTE_NEGATIVO, ASIGNACION_EPP, DEVOLUCION_EPP
  cantidad_movimiento: number; // Positivo para entradas, negativo para salidas
  cantidad_movida: number; // Valor absoluto de la cantidad
  fecha_movimiento: string; // Formato ISO
  id_usuario_responsable?: number | null;
  id_asignacion_epp?: number | null;
  notas_movimiento?: string | null;

  // Campos unidos para visualización
  nombre_usuario_responsable?: string | null;
  nombre_usuario_epp_asignado?: string | null; // Nombre del usuario al que se asignó el EPP en este movimiento
  codigo_item_epp_asignado?: string | null; // Código del EPP asignado
}

export async function getMovementsForItem(id_item: number): Promise<InventoryMovement[]> {
  const sql = `
    SELECT 
      im.*,
      DATE_FORMAT(im.fecha_movimiento, '%Y-%m-%dT%H:%i:%S.000Z') as fecha_movimiento, -- Asegurar formato ISO para parseo
      resp.nombre_completo AS nombre_usuario_responsable,
      eppu.nombre_completo AS nombre_usuario_epp_asignado,
      eppi.codigo_item AS codigo_item_epp_asignado
    FROM Inventario_Movimientos im
    LEFT JOIN Usuarios resp ON im.id_usuario_responsable = resp.id_usuario
    LEFT JOIN EPP_Asignaciones_Actuales eaa ON im.id_asignacion_epp = eaa.id_asignacion_epp
    LEFT JOIN Usuarios eppu ON eaa.id_usuario = eppu.id_usuario
    LEFT JOIN Inventario_Items eppi ON eaa.id_item_epp = eppi.id_item
    WHERE im.id_item = ?
    ORDER BY im.fecha_movimiento DESC
  `;
  try {
    const rows = await query(sql, [id_item]) as InventoryMovement[];
    return rows;
  } catch (error) {
    console.error(`Error fetching movements for item ${id_item}:`, error);
    if (error instanceof Error) {
      const mysqlError = error as any; // Type assertion to access MySQL specific codes
      if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
        console.warn("La tabla 'Inventario_Movimientos' o tablas relacionadas no existen. Devolviendo array vacío.");
        return [];
      }
      // MySQL error code for "Unknown column" is 1054 (ER_BAD_FIELD_ERROR)
      if (mysqlError.code === 'ER_BAD_FIELD_ERROR' && mysqlError.sqlMessage && mysqlError.sqlMessage.includes("'im.id_asignacion_epp'")) {
        throw new Error(
          "Error de esquema de base de datos: La columna 'id_asignacion_epp' no existe en la tabla 'Inventario_Movimientos'. " +
          "Por favor, verifica la estructura de tu tabla. Es posible que necesites agregar esta columna. " +
          "Consulta la documentación del esquema o considera ejecutar un comando SQL similar a: " +
          "ALTER TABLE Inventario_Movimientos ADD COLUMN id_asignacion_epp INT NULL, " +
          "ADD CONSTRAINT fk_mov_asig_epp FOREIGN KEY (id_asignacion_epp) REFERENCES EPP_Asignaciones_Actuales(id_asignacion_epp) ON DELETE SET NULL;"
        );
      }
    }
    throw error;
  }
}

