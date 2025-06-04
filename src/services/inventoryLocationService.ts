
'use server';

// Este archivo ya no es necesario para la gestión de bodegas principales,
// ya que ahora se manejan a través de la tabla 'Bodegas' y 'bodegaService.ts'.
// Se puede eliminar o mantener si hay otros usos específicos para 'Inventario_Ubicaciones'
// que no sean las bodegas principales. Por ahora, para evitar errores de importación
// si alguna parte del código aún lo referenciara (aunque debería haberse actualizado),
// lo dejo con un comentario y funciones vacías o que lanzan error.

// Lo ideal es eliminar este archivo si ya no se usa.

export interface InventoryLocation {
  id_ubicacion: number;
  nombre_ubicacion: string;
  sub_ubicacion?: string | null;
  descripcion_ubicacion?: string | null;
  id_ubicacion_padre?: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export async function getAllInventoryLocations(): Promise<InventoryLocation[]> {
  console.warn("inventoryLocationService.getAllInventoryLocations no debería usarse para bodegas principales.");
  return [];
}

export async function findInventoryLocationByName(nombre_ubicacion: string, sub_ubicacion?: string | null): Promise<InventoryLocation | null> {
  console.warn("inventoryLocationService.findInventoryLocationByName no debería usarse para bodegas principales.");
  return null;
}

export async function createInventoryLocation(data: {
  nombre_ubicacion: string;
  sub_ubicacion?: string | null;
  descripcion_ubicacion?: string | null;
  id_ubicacion_padre?: number | null;
}): Promise<InventoryLocation | null> {
   console.warn("inventoryLocationService.createInventoryLocation no debería usarse para bodegas principales.");
  return null;
}

export async function findOrCreateLocationByName(
  nombre_ubicacion: string,
  sub_ubicacion?: string | null
): Promise<InventoryLocation | null> {
  console.warn("inventoryLocationService.findOrCreateLocationByName no debería usarse para bodegas principales.");
  return null;
}

export async function getUniqueMainLocations(): Promise<string[]> {
  console.warn("inventoryLocationService.getUniqueMainLocations no debería usarse, usar getAllBodegas de bodegaService en su lugar.");
  return [];
}

    