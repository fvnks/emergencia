
export type EraEquipmentStatus = 'Disponible' | 'Operativo' | 'En Mantención' | 'Requiere Inspección' | 'Fuera de Servicio';

export const ALL_ERA_STATUSES: EraEquipmentStatus[] = ['Disponible', 'Operativo', 'En Mantención', 'Requiere Inspección', 'Fuera de Servicio'];

export interface EraEquipment {
  id_era: number;
  codigo_era: string;
  descripcion?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numero_serie?: string | null;
  fecha_fabricacion?: string | null; // YYYY-MM-DD
  fecha_adquisicion?: string | null; // YYYY-MM-DD
  fecha_ultima_mantencion?: string | null; // YYYY-MM-DD
  fecha_proxima_inspeccion?: string | null; // YYYY-MM-DD
  estado_era: EraEquipmentStatus;
  id_usuario_asignado?: number | null;
  notas?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;

  // Campos unidos (opcional, para visualización)
  nombre_usuario_asignado?: string | null;
}

export interface EraEquipmentCreateInput {
  codigo_era: string;
  descripcion?: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  fecha_fabricacion?: string; // YYYY-MM-DD
  fecha_adquisicion?: string; // YYYY-MM-DD
  fecha_ultima_mantencion?: string; // YYYY-MM-DD
  fecha_proxima_inspeccion?: string; // YYYY-MM-DD
  estado_era: EraEquipmentStatus;
  id_usuario_asignado?: number | null; // Permitir asignar al crear, aunque la UI principal de asignación vendrá después
  notas?: string;
}

export interface EraEquipmentUpdateInput {
  codigo_era?: string;
  descripcion?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numero_serie?: string | null;
  fecha_fabricacion?: string | null;
  fecha_adquisicion?: string | null;
  fecha_ultima_mantencion?: string | null;
  fecha_proxima_inspeccion?: string | null;
  estado_era?: EraEquipmentStatus;
  id_usuario_asignado?: number | null; // Para desasignar o reasignar (aunque UI de asignación vendrá después)
  notas?: string | null;
}
