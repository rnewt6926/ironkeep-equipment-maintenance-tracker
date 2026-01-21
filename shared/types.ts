export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type EquipmentType = 'tractor' | 'mower' | 'chainsaw' | 'handheld' | 'vehicle' | 'other';
export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  date: string;
  hoursAtService: number;
  description: string;
  cost: number;
  performedBy: string;
}
export interface MaintenanceTask {
  id: string;
  title: string;
  intervalHours?: number;
  intervalMonths?: number;
  lastPerformedHours?: number;
  lastPerformedDate?: string;
  nextDueHours?: number;
  nextDueDate?: string;
  urgency: 'low' | 'medium' | 'high' | 'overdue';
}
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  currentHours: number;
  status: 'operational' | 'maintenance' | 'down';
  image?: string;
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
}
// Fallback user types for compatibility with template structure
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}