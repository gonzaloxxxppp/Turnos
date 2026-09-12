import { DaySchedule, TimeSlot, ScheduleConfig } from '@/types/appointments';

export const FULL_START_HOUR = 8;
export const FULL_END_HOUR = 21;
export const START_HOUR = FULL_START_HOUR;
export const END_HOUR = FULL_END_HOUR;
export const ACTIVE_START_HOUR = 14;
export const ACTIVE_END_HOUR = 20;
export const INTERVAL_MINUTES = 15;

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  startHour: '14:00',
  endHour: '20:00',
  intervalMinutes: 15,
};

export const DAY_NAMES_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Formats minutes from midnight to "HH:mm"
 */
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Parses "HH:mm" to minutes from midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return h * 60 + m;
}

/**
 * Generates slots for a user-defined range (e.g. from 14:00 to 20:00 or 08:00 to 21:00)
 */
export function generateSlotsForRange(
  startHour: string = '14:00',
  endHour: string = '20:00',
  isSunday: boolean = false,
  intervalMinutes: number = 15
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startMin = parseTimeToMinutes(startHour);
  const endMin = parseTimeToMinutes(endHour);

  for (let current = startMin; current < endMin; current += intervalMinutes) {
    const startTime = formatMinutesToTime(current);
    const endTime = formatMinutesToTime(current + intervalMinutes);

    slots.push({
      id: startTime,
      startTime,
      endTime,
      status: isSunday ? 'deshabilitado' : 'disponible',
      description: isSunday ? 'Domingo no laborable' : '',
      clientName: '',
      category: 'General',
    });
  }

  return slots;
}

/**
 * Merges existing slots with the user-defined range:
 * - Preserves any appointment status, clientName, description, and category.
 * - Adds new slots for any newly included times.
 * - Filters to only the slots within [startHour, endHour).
 */
export function ensureSlotsForRange(
  existingSlots: TimeSlot[] = [],
  startHour: string = '14:00',
  endHour: string = '20:00',
  isSunday: boolean = false,
  intervalMinutes: number = 15
): TimeSlot[] {
  const startMin = parseTimeToMinutes(startHour);
  const endMin = parseTimeToMinutes(endHour);

  const existingMap = new Map<string, TimeSlot>();
  existingSlots.forEach((slot) => {
    existingMap.set(slot.startTime, slot);
  });

  const merged: TimeSlot[] = [];
  for (let current = startMin; current < endMin; current += intervalMinutes) {
    const startTime = formatMinutesToTime(current);
    const endTime = formatMinutesToTime(current + intervalMinutes);

    if (existingMap.has(startTime)) {
      merged.push(existingMap.get(startTime)!);
    } else {
      merged.push({
        id: startTime,
        startTime,
        endTime,
        status: isSunday ? 'deshabilitado' : 'disponible',
        description: isSunday ? 'Domingo no laborable' : '',
        clientName: '',
        category: 'General',
      });
    }
  }

  return merged;
}

/**
 * Backwards-compatible day slots generation (full range 08:00 to 21:00)
 */
export function generateDaySlots(isSunday: boolean = false): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startMinutes = FULL_START_HOUR * 60;
  const endMinutes = FULL_END_HOUR * 60;

  for (let current = startMinutes; current < endMinutes; current += INTERVAL_MINUTES) {
    const startTime = formatMinutesToTime(current);
    const endTime = formatMinutesToTime(current + INTERVAL_MINUTES);

    if (isSunday) {
      slots.push({
        id: startTime,
        startTime,
        endTime,
        status: 'deshabilitado',
        description: 'Domingo no laborable',
        clientName: '',
        category: 'General',
      });
    } else {
      const currentHour = current / 60;
      const isOutsideActiveHours = currentHour < ACTIVE_START_HOUR || currentHour >= ACTIVE_END_HOUR;

      slots.push({
        id: startTime,
        startTime,
        endTime,
        status: isOutsideActiveHours ? 'deshabilitado' : 'disponible',
        description: isOutsideActiveHours ? 'Fuera de horario de atención' : '',
        clientName: '',
        category: 'General',
      });
    }
  }

  return slots;
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateToKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date to readable Spanish string (e.g., "Lunes, 7 de Septiembre")
 */
export function formatHumanDate(date: Date): { dayName: string; formattedDate: string } {
  const dayName = DAY_NAMES_ES[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = MONTH_NAMES_ES[date.getMonth()];
  const year = date.getFullYear();

  return {
    dayName,
    formattedDate: `${dayNumber} de ${monthName} ${year}`,
  };
}

/**
 * Returns Monday to Sunday for the week containing referenceDate
 */
export function getWeekDates(referenceDate: Date = new Date()): { date: Date; dateKey: string; dayName: string; formattedDate: string; isSunday: boolean }[] {
  const current = new Date(referenceDate);
  const day = current.getDay();
  // Adjust so Monday is first (day 0 in JS is Sunday, so if Sunday (0), diff is -6)
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    const dateKey = formatDateToKey(nextDay);
    const { dayName, formattedDate } = formatHumanDate(nextDay);
    weekDays.push({
      date: nextDay,
      dateKey,
      dayName,
      formattedDate,
      isSunday: nextDay.getDay() === 0,
    });
  }

  return weekDays;
}

/**
 * Generates an initial schedule with default slots and sample appointments
 */
export function generateInitialSchedule(config: ScheduleConfig = DEFAULT_SCHEDULE_CONFIG): Record<string, DaySchedule> {
  const week = getWeekDates(new Date());
  const schedule: Record<string, DaySchedule> = {};

  week.forEach((item) => {
    // Generate full range so user can switch between ranges without losing slots
    const slots = generateDaySlots(item.isSunday);

    // Sample appointments
    if (item.dayName === 'Lunes') {
      const slot1400 = slots.find((s) => s.id === '14:00');
      if (slot1400) {
        slot1400.status = 'ocupado';
        slot1400.clientName = 'Mariana López';
        slot1400.description = 'Reunión de coordinación y expedientes';
        slot1400.category = 'Consulta y Sesión';
      }

      const slot1430 = slots.find((s) => s.id === '14:30');
      if (slot1430) {
        slot1430.status = 'ocupado';
        slot1430.clientName = 'Carlos Giménez';
        slot1430.description = 'Consulta de control y entrega de documentación';
        slot1430.category = 'General';
      }

      const slot1715 = slots.find((s) => s.id === '17:15');
      if (slot1715) {
        slot1715.status = 'ocupado';
        slot1715.clientName = 'Sofía Valenzuela';
        slot1715.description = 'Firma de acuerdo de servicio';
        slot1715.category = 'Maquillaje y Estética';
      }
    }

    if (item.dayName === 'Martes') {
      const slot1500 = slots.find((s) => s.id === '15:00');
      if (slot1500) {
        slot1500.status = 'ocupado';
        slot1500.clientName = 'Estudio Contable';
        slot1500.description = 'Balance mensual y auditoría';
        slot1500.category = 'General';
      }
    }

    schedule[item.dateKey] = {
      dateKey: item.dateKey,
      dayName: item.dayName,
      formattedDate: item.formattedDate,
      slots,
    };
  });

  return schedule;
}
