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
 * Soporta multi-tenancy / aislamiento por accountId.
 */
export const turnosService = {
  /**
   * Obtiene la configuración de horarios de una cuenta (inicio, fin, intervalo)
   */
  async getConfig(accountId: string = 'default'): Promise<{ config: ScheduleConfig; isCloud: boolean }> {
    try {
      const res = await fetch(`/api/schedule-config?accountId=${encodeURIComponent(accountId)}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.configured && json.data) {
          saveScheduleConfig(json.data, accountId);
          return { config: json.data, isCloud: true };
        }
      }
    } catch {
      // Fallback a localStorage
    }
    return { config: loadScheduleConfig(accountId), isCloud: false };
  },

  /**
   * Guarda la configuración de horarios para una cuenta
   */
  async saveConfig(config: ScheduleConfig, accountId: string = 'default'): Promise<boolean> {
    const configWithAccount = { ...config, accountId };
    saveScheduleConfig(configWithAccount, accountId);
    try {
      const res = await fetch('/api/schedule-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...configWithAccount, accountId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Obtiene la lista de categorías
   */
  async getCategories(accountId: string = 'default'): Promise<{ categories: CategoryItem[]; isCloud: boolean }> {
    try {
      const res = await fetch(`/api/categories?accountId=${encodeURIComponent(accountId)}`, { cache: 'no-store' });
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
  async createCategory(cat: Omit<CategoryItem, 'id'> & { id?: string }, accountId: string = 'default'): Promise<CategoryItem> {
    const localId = cat.id || `cat-${Date.now()}`;
    const newCat: CategoryItem = { ...cat, id: localId, accountId };

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
   * Carga los turnos para un rango de fechas y una cuenta específica
   */
  async getSlotsForRange(
    startDate: string,
    endDate: string,
    accountId: string = 'default'
  ): Promise<{ slotsByDate: Record<string, TimeSlot[]>; isCloud: boolean }> {
    try {
      const res = await fetch(
        `/api/slots?startDate=${startDate}&endDate=${endDate}&accountId=${encodeURIComponent(accountId)}`,
        { cache: 'no-store' }
      );
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

    // Fallback a localStorage por cuenta
    const localStore = loadSchedule(accountId);
    const result: Record<string, TimeSlot[]> = {};
    Object.keys(localStore).forEach((dk) => {
      if (dk >= startDate && dk <= endDate) {
        result[dk] = localStore[dk].slots;
      }
    });
    return { slotsByDate: result, isCloud: false };
  },

  /**
   * Guarda o actualiza un turno individual para una cuenta
   */
  async saveSlot(dateKey: string, slot: TimeSlot, accountId: string = 'default'): Promise<boolean> {
    try {
      const res = await fetch('/api/slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: slot.accountId || accountId,
          dateKey,
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          clientName: slot.clientName,
          clientPhone: slot.clientPhone,
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
   * Reserva pública de un turno (realizada por cualquier visitante en la página principal)
   */
  async bookPublicSlot(
    accountId: string,
    dateKey: string,
    slot: TimeSlot,
    booking: { clientName: string; clientPhone?: string; description?: string }
  ): Promise<TimeSlot> {
    const updatedSlot: TimeSlot = {
      ...slot,
      accountId,
      status: 'ocupado',
      clientName: booking.clientName.trim(),
      clientPhone: booking.clientPhone?.trim() || '',
      description: booking.description?.trim() || 'Reserva web',
      updatedAt: new Date().toISOString(),
    };

    // Actualizar en localStorage
    const localSchedule = loadSchedule(accountId);
    if (localSchedule[dateKey]) {
      const daySlots = localSchedule[dateKey].slots.map((s) => (s.id === slot.id ? updatedSlot : s));
      localSchedule[dateKey] = { ...localSchedule[dateKey], slots: daySlots };
      saveSchedule(localSchedule, accountId);
    }

    // Actualizar en nube
    await this.saveSlot(dateKey, updatedSlot, accountId);

    return updatedSlot;
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
      clientPhone?: string;
      description?: string;
      category?: string;
    }>,
    accountId: string = 'default'
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/slots/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots, accountId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Restablece un turno o el día completo para una cuenta
   */
  async resetSlot(dateKey: string, slotId?: string, accountId: string = 'default'): Promise<boolean> {
    try {
      const res = await fetch('/api/slots/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey, slotId, accountId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
