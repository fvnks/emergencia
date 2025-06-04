
export type MaintenanceItemType = 'ERA' | 'Extintor' | 'Vehículo' | 'Monitor Médico' | 'Equipo Diverso' | 'Infraestructura' | 'Otro';
export const ALL_MAINTENANCE_ITEM_TYPES: MaintenanceItemType[] = ['ERA', 'Extintor', 'Vehículo', 'Monitor Médico', 'Equipo Diverso', 'Infraestructura', 'Otro'];

export type MaintenanceStatus = 'Programada' | 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada' | 'Atrasada';
export const ALL_MAINTENANCE_STATUSES: MaintenanceStatus[] = ['Programada', 'Pendiente', 'En Progreso', 'Completada', 'Cancelada', 'Atrasada'];

export interface MaintenanceTask {
  id_mantencion: number;
  nombre_item_mantenimiento: string;
  tipo_item: MaintenanceItemType;
  descripcion_mantencion?: string | null;
  fecha_programada?: string | null; // YYYY-MM-DD
  id_usuario_responsable?: number | null;
  estado_mantencion: MaintenanceStatus;
  fecha_ultima_realizada?: string | null; // YYYY-MM-DD
  fecha_completada?: string | null; // YYYY-MM-DD
  notas_mantencion?: string | null;
  id_usuario_creador: number;
  fecha_creacion: string;
  fecha_actualizacion: string;

  // Campos unidos (opcional, para visualización)
  nombre_usuario_responsable?: string | null;
  nombre_usuario_creador?: string;
}

export interface MaintenanceTaskCreateInput {
  nombre_item_mantenimiento: string;
  tipo_item: MaintenanceItemType;
  descripcion_mantencion?: string;
  fecha_programada?: string | null; // YYYY-MM-DD
  id_usuario_responsable?: number | null;
  estado_mantencion: MaintenanceStatus;
  fecha_ultima_realizada?: string | null; // YYYY-MM-DD
  // fecha_completada se establecerá al completar la tarea
  notas_mantencion?: string;
  // id_usuario_creador se pasará como argumento a la función de creación
}

export interface MaintenanceTaskUpdateInput {
  nombre_item_mantenimiento?: string;
  tipo_item?: MaintenanceItemType;
  descripcion_mantencion?: string | null;
  fecha_programada?: string | null;
  id_usuario_responsable?: number | null;
  estado_mantencion?: MaintenanceStatus;
  fecha_ultima_realizada?: string | null;
  fecha_completada?: string | null; // Permitir actualizarla si es necesario
  notas_mantencion?: string | null;
}
