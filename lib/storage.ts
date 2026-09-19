import { ScheduleStore, ScheduleConfig, UserProfile } from '@/types/appointments';
import { generateInitialSchedule, DEFAULT_SCHEDULE_CONFIG } from './time-utils';

const DEFAULT_ACCOUNT_ID = 'default';
const STORAGE_KEY_SCHEDULE_PREFIX = 'hakim_schedule_account_';
const STORAGE_KEY_CONFIG_PREFIX = 'hakim_config_account_';
const STORAGE_KEY_ACCOUNTS = 'hakim_accounts_v1';
const STORAGE_KEY_CURRENT_USER = 'hakim_current_user_v1';

// Legacy keys for migration
const LEGACY_STORAGE_KEY = 'hakim_turnos_schedule_v2';
const LEGACY_CONFIG_KEY = 'hakim_turnos_config_v1';

/**
 * Purges old sample/mock appointments from any schedule
 */
function purgeMockAppointments(schedule: ScheduleStore): ScheduleStore {
  let modified = false;
  const cleaned: ScheduleStore = { ...schedule };

  Object.keys(cleaned).forEach((dateKey) => {
    const day = cleaned[dateKey];
    if (day && Array.isArray(day.slots)) {
      const newSlots = day.slots.map((slot) => {
        const isMock =
          slot.clientName === 'Mariana López' ||
          slot.clientName === 'Carlos Giménez' ||
          slot.clientName === 'Sofía Valenzuela' ||
          slot.clientName === 'Estudio Contable';

        if (isMock) {
          modified = true;
          return {
            ...slot,
            status: 'disponible' as const,
            clientName: '',
            clientPhone: '',
            description: '',
          };
        }
        return slot;
      });
      cleaned[dateKey] = { ...day, slots: newSlots };
    }
  });

  return modified ? cleaned : schedule;
}

/**
 * Gets storage key for a specific account's schedule
 */
function getScheduleKey(accountId: string = DEFAULT_ACCOUNT_ID): string {
  return `${STORAGE_KEY_SCHEDULE_PREFIX}${accountId}`;
}

/**
 * Gets storage key for a specific account's config
 */
function getConfigKey(accountId: string = DEFAULT_ACCOUNT_ID): string {
  return `${STORAGE_KEY_CONFIG_PREFIX}${accountId}`;
}

/**
 * Loads the saved schedule for a specific account or default
 */
export function loadSchedule(accountId: string = DEFAULT_ACCOUNT_ID): ScheduleStore {
  if (typeof window === 'undefined') {
    return generateInitialSchedule();
  }

  try {
    const key = getScheduleKey(accountId);
    let raw = localStorage.getItem(key);

    // Fallback/migration from legacy key if default account
    if (!raw && accountId === DEFAULT_ACCOUNT_ID) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (!raw) {
      const initial = generateInitialSchedule();
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const purged = purgeMockAppointments(parsed as ScheduleStore);
      if (purged !== parsed) {
        localStorage.setItem(key, JSON.stringify(purged));
      }
      return purged;
    }
    return generateInitialSchedule();
  } catch (error) {
    console.error('Error al cargar agenda:', error);
    return generateInitialSchedule();
  }
}

/**
 * Saves schedule for a specific account
 */
export function saveSchedule(schedule: ScheduleStore, accountId: string = DEFAULT_ACCOUNT_ID): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getScheduleKey(accountId);
    localStorage.setItem(key, JSON.stringify(schedule));
  } catch (error) {
    console.error('Error al guardar datos en localStorage:', error);
  }
}

/**
 * Loads account-specific schedule start & end hours and interval
 */
export function loadScheduleConfig(accountId: string = DEFAULT_ACCOUNT_ID): ScheduleConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_SCHEDULE_CONFIG;
  }

  try {
    const key = getConfigKey(accountId);
    let raw = localStorage.getItem(key);

    if (!raw && accountId === DEFAULT_ACCOUNT_ID) {
      raw = localStorage.getItem(LEGACY_CONFIG_KEY);
    }

    if (!raw) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_SCHEDULE_CONFIG));
      return DEFAULT_SCHEDULE_CONFIG;
    }

    const parsed = JSON.parse(raw);
    if (parsed && parsed.startHour && parsed.endHour) {
      return {
        ...DEFAULT_SCHEDULE_CONFIG,
        ...parsed,
        intervalMinutes: [15, 20, 25, 30, 45].includes(parsed.intervalMinutes)
          ? parsed.intervalMinutes
          : 15,
      } as ScheduleConfig;
    }
    return DEFAULT_SCHEDULE_CONFIG;
  } catch {
    return DEFAULT_SCHEDULE_CONFIG;
  }
}

/**
 * Saves account-specific schedule configuration
 */
export function saveScheduleConfig(config: ScheduleConfig, accountId: string = DEFAULT_ACCOUNT_ID): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getConfigKey(accountId);
    localStorage.setItem(key, JSON.stringify(config));
  } catch (error) {
    console.error('Error al guardar configuración de horarios:', error);
  }
}

/**
 * Exports current schedule to a downloadable JSON file
 */
export function exportScheduleToFile(schedule: ScheduleStore, orgName: string = 'turnos'): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(schedule, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${safeName}_respaldo_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Restores clean initial schedule for an account (without mock data)
 */
export function resetSchedule(accountId: string = DEFAULT_ACCOUNT_ID): ScheduleStore {
  const initial = generateInitialSchedule();
  if (typeof window !== 'undefined') {
    const key = getScheduleKey(accountId);
    const configKey = getConfigKey(accountId);
    localStorage.setItem(key, JSON.stringify(initial));
    localStorage.setItem(configKey, JSON.stringify(DEFAULT_SCHEDULE_CONFIG));
  }
  return initial;
}

// -------------------------------------------------------------
// LOCAL STORAGE ACCOUNTS & SESSION MANAGEMENT
// -------------------------------------------------------------

export function loadStoredAccounts(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredAccounts(accounts: UserProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (error) {
    console.error('Error al guardar cuentas en localStorage:', error);
  }
}

export function loadStoredCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredCurrentUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (error) {
    console.error('Error al guardar usuario actual:', error);
  }
}

