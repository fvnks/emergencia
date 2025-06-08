
export type ChecklistStatus = 'Nuevo' | 'En Progreso' | 'Completado';
export const ALL_CHECKLIST_STATUSES: ChecklistStatus[] = ['Nuevo', 'En Progreso', 'Completado'];

export type ChecklistCompletionStatus = 'Completado' | 'Incompleto' | 'Pendiente Revisión';
export const ALL_CHECKLIST_COMPLETION_STATUSES: ChecklistCompletionStatus[] = ['Completado', 'Incompleto', 'Pendiente Revisión'];

export interface ChecklistCompletion {
  id: string; // Unique ID for this completion instance
  checklistTemplateId: string; // FK to Checklist.id
  completionDate: string; // ISO string
  status: ChecklistCompletionStatus;
  completedByUserName: string; // Simulated user name
  notes?: string;
}
