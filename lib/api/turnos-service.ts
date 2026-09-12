import { 
  ScheduleStore, 
  ScheduleConfig, 
  CategoryItem, 
  TimeSlot 
} from '@/types/appointments';
import { 
  loadSchedule, 
  saveSchedule, 
  loadScheduleConfig, 
  saveScheduleConfig 
} from '@/lib/storage';
import { 
  loadCategories, 
  saveCategories 
} from '@/lib/categories';

/**
 * Servicio de datos que interactúa con las rutas de API de Supabase (/api/*)
 * con fallback transparente a localStorage si la base de datos no está disponible.
 */
export const turnosService = {
  /**
   * Obtiene la configuración de horarios (inicio, fin, intervalo)
   */
  async getConfig(): Promise<{ config: ScheduleConfig; isCloud: boolean }> {
    try {
      const res = await fetch('/api/schedule-config', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.configured && json.data) {
          saveScheduleConfig(json.data);
          return { config: json.data, isCloud: true };
        }
      }
    } catch {
      // Fallback a localStorage
    }
    return { config: loadScheduleConfig(), isCloud: false };
  },

  /**
   * Guarda la configuración de horarios
   */
  async saveConfig(config: ScheduleConfig): Promise<boolean> {
    saveScheduleConfig(config);
    try {
      const res = await fetch('/api/schedule-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Obtiene la lista de categorías
   */
  async getCategories(): Promise<{ categories: CategoryItem[]; isCloud: boolean }> {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.configured && json.data && json.data.length > 0) {
          saveCategories(json.data);
          return { categories: json.data, isCloud: true };
        }
      }
    } catch {
      // Fallback a localStorage
    }
    return { categories: loadCategories(), isCloud: false };
  },

  /**
   * Crea una nueva categoría
   */
  async createCategory(cat: Omit<CategoryItem, 'id'> & { id?: string }): Promise<CategoryItem> {
    const localId = cat.id || `cat-${Date.now()}`;
    const newCat: CategoryItem = { ...cat, id: localId };

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Manejo en fallback
    }
    return newCat;
  },

  /**
   * Actualiza una categoría existente
   */
  async updateCategory(cat: CategoryItem): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(cat.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cat.name, color: cat.color }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Elimina una categoría
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Carga los turnos para un rango de fechas (ej: la semana visible)
   */
  async getSlotsForRange(
    startDate: string,
    endDate: string
  ): Promise<{ slotsByDate: Record<string, TimeSlot[]>; isCloud: boolean }> {
    try {
      const res = await fetch(`/api/slots?startDate=${startDate}&endDate=${endDate}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.configured && Array.isArray(json.data) && json.data.length > 0) {
          const grouped: Record<string, TimeSlot[]> = {};
          json.data.forEach((row: TimeSlot & { dateKey: string }) => {
            if (!grouped[row.dateKey]) grouped[row.dateKey] = [];
            grouped[row.dateKey].push(row);
          });
          return { slotsByDate: grouped, isCloud: true };
        }
      }
    } catch {
      // Fallback
    }

    // Fallback a localStorage
    const localStore = loadSchedule();
    const result: Record<string, TimeSlot[]> = {};
    Object.keys(localStore).forEach((dk) => {
      if (dk >= startDate && dk <= endDate) {
        result[dk] = localStore[dk].slots;
      }
    });
    return { slotsByDate: result, isCloud: false };
  },

  /**
   * Guarda o actualiza un turno individual
   */
  async saveSlot(dateKey: string, slot: TimeSlot): Promise<boolean> {
    try {
      const res = await fetch('/api/slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateKey,
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          clientName: slot.clientName,
          description: slot.description,
          category: slot.category,
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Aplica cambios masivos de turnos (bloqueo por rangos, etc.)
   */
  async bulkUpdateSlots(
    slots: Array<{
      dateKey: string;
      slotId: string;
      startTime: string;
      endTime: string;
      status: 'disponible' | 'ocupado' | 'deshabilitado';
      clientName?: string;
      description?: string;
      category?: string;
    }>
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Restablece un turno o el día completo
   */
  async resetSlot(dateKey: string, slotId?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/slots/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey, slotId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
