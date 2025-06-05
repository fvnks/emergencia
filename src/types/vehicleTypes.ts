
import type { EraEquipment } from "@/components/equipment/era-types";
import type { InventoryItem } from "./inventoryService";

export type VehicleStatus = 'Operativo' | 'En Mantención' | 'Fuera de Servicio';
export const ALL_VEHICLE_STATUSES: VehicleStatus[] = ['Operativo', 'En Mantención', 'Fuera de Servicio'];

export type VehicleType = 'Bomba' | 'Escala' | 'Rescate' | 'Ambulancia' | 'HazMat' | 'Forestal' | 'Utilitario' | 'Transporte Personal' | 'Otro';
export const ALL_VEHICLE_TYPES: VehicleType[] = ['Bomba', 'Escala', 'Rescate', 'Ambulancia', 'HazMat', 'Forestal', 'Utilitario', 'Transporte Personal', 'Otro'];

export interface VehicleAssignedInventoryItem {
  itemDetails: InventoryItem; // Asumiendo que InventoryItem tiene id_item, nombre_item, codigo_item, etc.
  cantidad: number;
}

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

  // Campos para asignaciones (ahora con detalles)
  assignedEras?: EraEquipment[]; // Lista de objetos EraEquipment completos
  assignedInventoryItems?: VehicleAssignedInventoryItem[]; // Lista de objetos con detalles del ítem y cantidad

  // Campos antiguos, mantener por si el backend aún no está completamente actualizado
  // o para compatibilidad durante la transición
  assignedEraIds?: number[];
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
  url_imagen?: string | null; // Puede ser null si se sube un archivo
  ai_hint_imagen?: string;
  notas?: string;
  assignedEraIds?: number[];
  assignedInventoryItems?: { id_item: number; cantidad: number }[];
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
  assignedEraIds?: number[];
  assignedInventoryItems?: { id_item: number; cantidad: number }[];
}

