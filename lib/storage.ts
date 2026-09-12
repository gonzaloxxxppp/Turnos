import { ScheduleStore, ScheduleConfig } from '@/types/appointments';
import { generateInitialSchedule, DEFAULT_SCHEDULE_CONFIG } from './time-utils';

const STORAGE_KEY = 'hakim_turnos_schedule_v2';
const CONFIG_STORAGE_KEY = 'hakim_turnos_config_v1';

/**
 * Loads the saved schedule from localStorage or generates initial seed
 */
export function loadSchedule(): ScheduleStore {
  if (typeof window === 'undefined') {
    return generateInitialSchedule();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialSchedule();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as ScheduleStore;
    }
    return generateInitialSchedule();
  } catch (error) {
    console.error('Error al cargar datos desde localStorage:', error);
    return generateInitialSchedule();
  }
}

/**
 * Saves schedule to localStorage
 */
export function saveSchedule(schedule: ScheduleStore): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  } catch (error) {
    console.error('Error al guardar datos en localStorage:', error);
  }
}

/**
 * Loads user-defined schedule start & end hours
 */
export function loadScheduleConfig(): ScheduleConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_SCHEDULE_CONFIG;
  }

  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULE_CONFIG));
      return DEFAULT_SCHEDULE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (parsed && parsed.startHour && parsed.endHour) {
      return parsed as ScheduleConfig;
    }
    return DEFAULT_SCHEDULE_CONFIG;
  } catch {
    return DEFAULT_SCHEDULE_CONFIG;
  }
}

/**
 * Saves user-defined schedule start & end hours
 */
export function saveScheduleConfig(config: ScheduleConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error al guardar configuración de horarios:', error);
  }
}

/**
 * Exports current schedule to a downloadable JSON file
 */
export function exportScheduleToFile(schedule: ScheduleStore): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schedule, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `turnos_respaldo_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Restores initial sample schedule
 */
export function resetSchedule(): ScheduleStore {
  const initial = generateInitialSchedule();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_SCHEDULE_CONFIG));
  }
  return initial;
}
