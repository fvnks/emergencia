
export type VehicleStatus = 'Operativo' | 'En Mantención' | 'Fuera de Servicio';
export const ALL_VEHICLE_STATUSES: VehicleStatus[] = ['Operativo', 'En Mantención', 'Fuera de Servicio'];

export type VehicleType = 'Bomba' | 'Escala' | 'Rescate' | 'Ambulancia' | 'HazMat' | 'Forestal' | 'Utilitario' | 'Transporte Personal' | 'Otro';
export const ALL_VEHICLE_TYPES: VehicleType[] = ['Bomba', 'Escala', 'Rescate', 'Ambulancia', 'HazMat', 'Forestal', 'Utilitario', 'Transporte Personal', 'Otro'];

export interface Vehicle {
  id_vehiculo: number;
  identificador_interno?: string | null;
  marca: string;
  modelo: string;
  patente?: string | null;
  tipo_vehiculo?: VehicleType | null;
  estado_vehiculo: VehicleStatus;
  ano_fabricacion?: number | null;
  fecha_adquisicion?: string | null; // YYYY-MM-DD
  proxima_mantencion_programada?: string | null; // YYYY-MM-DD
  vencimiento_documentacion?: string | null; // YYYY-MM-DD
  url_imagen?: string | null;
  ai_hint_imagen?: string | null;
  notas?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface VehicleCreateInput {
  identificador_interno?: string;
  marca: string;
  modelo: string;
  patente?: string;
  tipo_vehiculo?: VehicleType | null;
  estado_vehiculo: VehicleStatus;
  ano_fabricacion?: number;
  fecha_adquisicion?: string; // YYYY-MM-DD
  proxima_mantencion_programada?: string; // YYYY-MM-DD
  vencimiento_documentacion?: string; // YYYY-MM-DD
  url_imagen?: string;
  ai_hint_imagen?: string;
  notas?: string;
}

export interface VehicleUpdateInput {
  identificador_interno?: string | null;
  marca?: string;
  modelo?: string;
  patente?: string | null;
  tipo_vehiculo?: VehicleType | null;
  estado_vehiculo?: VehicleStatus;
  ano_fabricacion?: number | null;
  fecha_adquisicion?: string | null;
  proxima_mantencion_programada?: string | null;
  vencimiento_documentacion?: string | null;
  url_imagen?: string | null;
  ai_hint_imagen?: string | null;
  notas?: string | null;
}
