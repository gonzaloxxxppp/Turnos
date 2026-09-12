export type SlotStatus = 'disponible' | 'ocupado' | 'deshabilitado';

export type GirlieColor = 
  | 'pink'
  | 'rose'
  | 'fuchsia'
  | 'purple'
  | 'violet'
  | 'peach'
  | 'mint'
  | 'amber';

export interface CategoryItem {
  id: string;
  name: string;
  color: GirlieColor;
  icon?: string;
}

export interface TimeSlot {
  id: string; // e.g. "08:00"
  startTime: string; // "08:00"
  endTime: string; // "08:15"
  status: SlotStatus;
  clientName?: string;
  description?: string; // Pequeña descripción para recordar para qué era el turno
  category?: string; // Nombre o ID de la categoría dinámica
  updatedAt?: string;
}

export interface DaySchedule {
  dateKey: string; // YYYY-MM-DD or standard id
  dayName: string; // "Lunes", "Martes", etc.
  formattedDate: string; // "07 Sep 2026"
  slots: TimeSlot[];
}

export type ScheduleStore = Record<string, DaySchedule>;

export interface ScheduleConfig {
  startHour: string; // e.g. "14:00"
  endHour: string;   // e.g. "20:00"
  intervalMinutes: number; // 15
}

export interface FilterOptions {
  searchQuery: string;
  statusFilter: 'all' | SlotStatus;
  categoryFilter?: string;
  timeRangeFilter: 'active' | 'full';
}
