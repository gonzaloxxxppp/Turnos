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

export type AllowedInterval = 15 | 20 | 25 | 30 | 45;

export interface CategoryItem {
  id: string;
  name: string;
  color: GirlieColor;
  icon?: string;
  accountId?: string;
}

export interface TimeSlot {
  id: string; // e.g. "08:00"
  accountId?: string; // ID de la cuenta/organización propietaria
  startTime: string; // "08:00"
  endTime: string; // "08:15"
  status: SlotStatus;
  clientName?: string;
  clientPhone?: string; // Teléfono o WhatsApp de quien reserva
  description?: string; // Pequeña descripción o motivo de consulta
  category?: string; // Nombre o ID de la categoría dinámica
  updatedAt?: string;
}

export interface DaySchedule {
  dateKey: string; // YYYY-MM-DD
  dayName: string; // "Lunes", "Martes", etc.
  formattedDate: string; // "07 Sep 2026"
  slots: TimeSlot[];
}

export type ScheduleStore = Record<string, DaySchedule>;

export interface ScheduleConfig {
  startHour: string; // e.g. "14:00"
  endHour: string;   // e.g. "20:00"
  intervalMinutes: AllowedInterval; // 15 | 20 | 25 | 30 | 45
  accountId?: string;
}

export interface UserProfile {
  id: string; // ID único de cuenta / usuario
  email: string;
  name: string; // Nombre del profesional / titular
  orgName: string; // Nombre de la organización o cuenta (ej: "Clínica Estética Ramos")
  slug: string; // Identificador amigable (ej: "clinica-ramos")
  bio: string; // Descripción del perfil o especialidades
  avatarUrl?: string; // Foto o avatar
  phone?: string; // Teléfono de contacto / WhatsApp
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterOptions {
  searchQuery: string;
  statusFilter: 'all' | SlotStatus;
  categoryFilter?: string;
  timeRangeFilter: 'active' | 'full';
}

