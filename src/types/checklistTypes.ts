
export type ChecklistStatus = 'Nuevo' | 'En Progreso' | 'Completado';
export const ALL_CHECKLIST_STATUSES: ChecklistStatus[] = ['Nuevo', 'En Progreso', 'Completado'];

export type ChecklistCompletionStatus = 'Completado' | 'Incompleto' | 'Pendiente Revisión';
export const ALL_CHECKLIST_COMPLETION_STATUSES: ChecklistCompletionStatus[] = ['Completado', 'Incompleto', 'Pendiente Revisión'];

export interface ChecklistItemState {
  itemText: string;
  checked: boolean;
  notes?: string; // Para futuras implementaciones
}

export interface ChecklistCompletion {
  id: string; // Unique ID for this completion instance
  checklistTemplateId: string; // FK to Checklist.id
  completionDate: string; // ISO string
  status: ChecklistCompletionStatus; // Será 'Completado' o 'Incompleto' basado en itemStates
  itemStates: ChecklistItemState[];
  completedByUserId: number; // ID del usuario que completó
  completedByUserName: string; // Nombre del usuario que completó
  notes?: string; // Notas generales de la completitud
}
