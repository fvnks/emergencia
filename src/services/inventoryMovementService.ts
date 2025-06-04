
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
    if (error instanceof Error && (error as any).code === 'ER_NO_SUCH_TABLE') {
      console.warn("La tabla 'Inventario_Movimientos' o tablas relacionadas no existen. Devolviendo array vacío.");
      return [];
    }
    throw error;
  }
}
