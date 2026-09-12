'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ScheduleStore, 
  TimeSlot, 
  SlotStatus, 
  DaySchedule,
  CategoryItem,
  ScheduleConfig
} from '@/types/appointments';
import { 
  loadSchedule, 
  saveSchedule, 
  loadScheduleConfig,
  saveScheduleConfig,
  exportScheduleToFile, 
  resetSchedule 
} from '@/lib/storage';
import { 
  getWeekDates, 
  generateDaySlots, 
  formatDateToKey,
  DEFAULT_SCHEDULE_CONFIG,
  ensureSlotsForRange
} from '@/lib/time-utils';
import { 
  loadCategories, 
  saveCategories, 
  resetCategoriesToDefault 
} from '@/lib/categories';
import { Header } from '@/components/Header';
import { DaySelector } from '@/components/DaySelector';
import { DayTable } from '@/components/DayTable';
import { WeekOverview } from '@/components/WeekOverview';
import { EditSlotModal } from '@/components/EditSlotModal';
import { BulkActionsModal } from '@/components/BulkActionsModal';
import { CategoriesModal } from '@/components/CategoriesModal';
import { ScheduleConfigModal } from '@/components/ScheduleConfigModal';
import { turnosService } from '@/lib/api/turnos-service';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isCloud, setIsCloud] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleStore>({});
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE_CONFIG);
  const [currentReferenceDate, setCurrentReferenceDate] = useState<Date>(new Date());
  const [activeDateKey, setActiveDateKey] = useState<string>('');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SlotStatus>('all');
  
  // Modal states
  const [editingInfo, setEditingInfo] = useState<{ dateKey: string; slot: TimeSlot } | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isScheduleConfigModalOpen, setIsScheduleConfigModalOpen] = useState(false);

  // Initialize and load from storage / Supabase
  useEffect(() => {
    setIsClient(true);
    const loadedSchedule = loadSchedule();
    setSchedule(loadedSchedule);

    const loadedCategories = loadCategories();
    setCategories(loadedCategories);

    const loadedConfig = loadScheduleConfig();
    setScheduleConfig(loadedConfig);

    // Set initial active date key (default to today, or Monday if today is Sunday)
    const today = new Date();
    const todayKey = formatDateToKey(today);
    if (loadedSchedule[todayKey] && today.getDay() !== 0) {
      setActiveDateKey(todayKey);
    } else {
      const week = getWeekDates(today);
      setActiveDateKey(week[0].dateKey);
    }

    // Sincronizar de forma asíncrona con Supabase
    const syncWithCloud = async () => {
      try {
        const [configRes, catRes] = await Promise.all([
          turnosService.getConfig(),
          turnosService.getCategories(),
        ]);

        if (configRes.isCloud) {
          setIsCloud(true);
          setScheduleConfig(configRes.config);
        }
        if (catRes.isCloud && catRes.categories.length > 0) {
          setIsCloud(true);
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.warn('Modo local activo:', err);
      }
    };
    syncWithCloud();
  }, []);

  // Save whenever schedule changes
  const updateAndPersistSchedule = (newSchedule: ScheduleStore) => {
    setSchedule(newSchedule);
    saveSchedule(newSchedule);
  };

  // Schedule Config Handler (User defines start and end hours)
  const handleSaveScheduleConfig = (newConfig: ScheduleConfig) => {
    setScheduleConfig(newConfig);
    saveScheduleConfig(newConfig);
    turnosService.saveConfig(newConfig);

    // Ensure all days in the schedule contain slots for the new range
    const updatedSchedule: ScheduleStore = { ...schedule };
    Object.keys(updatedSchedule).forEach((dateKey) => {
      const day = updatedSchedule[dateKey];
      const isSunday = day.dayName === 'Domingo';
      const updatedSlots = ensureSlotsForRange(
        day.slots,
        newConfig.startHour,
        newConfig.endHour,
        isSunday,
        newConfig.intervalMinutes
      );
      updatedSchedule[dateKey] = {
        ...day,
        slots: updatedSlots,
      };
    });

    updateAndPersistSchedule(updatedSchedule);
  };

  // Category CRUD Handlers
  const handleAddCategory = (newCat: Omit<CategoryItem, 'id'>) => {
    const created: CategoryItem = {
      ...newCat,
      id: `cat-${Date.now()}`,
    };
    const updated = [...categories, created];
    setCategories(updated);
    saveCategories(updated);
    turnosService.createCategory(created);
  };

  const handleUpdateCategory = (updatedCat: CategoryItem) => {
    const oldCat = categories.find((c) => c.id === updatedCat.id);
    const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    setCategories(updated);
    saveCategories(updated);
    turnosService.updateCategory(updatedCat);

    // If the category name changed, update all slots using the old name
    if (oldCat && oldCat.name !== updatedCat.name) {
      const updatedSchedule: ScheduleStore = { ...schedule };
      Object.keys(updatedSchedule).forEach((dateKey) => {
        const day = updatedSchedule[dateKey];
        const updatedSlots = day.slots.map((s) => {
          if (s.category === oldCat.name) {
            return { ...s, category: updatedCat.name };
          }
          return s;
        });
        updatedSchedule[dateKey] = { ...day, slots: updatedSlots };
      });
      updateAndPersistSchedule(updatedSchedule);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = categories.filter((c) => c.id !== categoryId);
    setCategories(updated);
    saveCategories(updated);
    turnosService.deleteCategory(categoryId);
  };

  const handleResetCategories = () => {
    if (confirm('¿Restablecer las categorías a los valores predeterminados?')) {
      const resetted = resetCategoriesToDefault();
      setCategories(resetted);
    }
  };

  // Get current week days for the reference date
  const currentWeekDays = useMemo(() => {
    return getWeekDates(currentReferenceDate);
  }, [currentReferenceDate]);

  // Ensure all days of the current week exist in schedule
  const activeWeekSchedule: DaySchedule[] = useMemo(() => {
    return currentWeekDays.map((dayItem) => {
      if (schedule[dayItem.dateKey]) {
        // Ensure slots exist for the current range
        const existing = schedule[dayItem.dateKey];
        const ensuredSlots = ensureSlotsForRange(
          existing.slots,
          scheduleConfig.startHour,
          scheduleConfig.endHour,
          dayItem.isSunday,
          scheduleConfig.intervalMinutes
        );
        return {
          ...existing,
          slots: ensuredSlots,
        };
      }
      return {
        dateKey: dayItem.dateKey,
        dayName: dayItem.dayName,
        formattedDate: dayItem.formattedDate,
        slots: generateDaySlots(dayItem.isSunday),
      };
    });
  }, [currentWeekDays, schedule, scheduleConfig]);

  // Active day schedule for single-day view
  const currentDaySchedule = useMemo(() => {
    return (
      activeWeekSchedule.find((d) => d.dateKey === activeDateKey) ||
      activeWeekSchedule[0] || {
        dateKey: formatDateToKey(new Date()),
        dayName: 'Lunes',
        formattedDate: '',
        slots: generateDaySlots(false),
      }
    );
  }, [activeWeekSchedule, activeDateKey]);

  // Toggle disable for a specific slot
  const handleToggleDisable = (dateKey: string, slotId: string) => {
    const day = schedule[dateKey] || activeWeekSchedule.find((d) => d.dateKey === dateKey);
    if (!day) return;

    let toggledSlot: TimeSlot | undefined;
    const updatedSlots = day.slots.map((slot) => {
      if (slot.id === slotId) {
        const nextStatus: SlotStatus = slot.status === 'deshabilitado' ? 'disponible' : 'deshabilitado';
        const updated = {
          ...slot,
          status: nextStatus,
          description: nextStatus === 'deshabilitado' 
            ? (slot.description || 'Horario no disponible') 
            : (slot.description === 'Horario no disponible' || slot.description === 'Fuera de horario de atención' ? '' : slot.description),
          updatedAt: new Date().toISOString(),
        };
        toggledSlot = updated;
        return updated;
      }
      return slot;
    });

    const updatedSchedule: ScheduleStore = {
      ...schedule,
      [dateKey]: {
        ...day,
        slots: updatedSlots,
      },
    };

    updateAndPersistSchedule(updatedSchedule);
    if (toggledSlot) {
      turnosService.saveSlot(dateKey, toggledSlot);
    }
  };

  // Open edit modal for slot
  const handleOpenEditSlot = (dateKey: string, slot: TimeSlot) => {
    setEditingInfo({ dateKey, slot });
  };

  // Save changes from EditSlotModal
  const handleSaveSlot = (updatedSlot: TimeSlot) => {
    if (!editingInfo) return;
    const { dateKey } = editingInfo;
    const day = schedule[dateKey] || activeWeekSchedule.find((d) => d.dateKey === dateKey);
    if (!day) return;

    const updatedSlots = day.slots.map((s) => (s.id === updatedSlot.id ? updatedSlot : s));

    const updatedSchedule: ScheduleStore = {
      ...schedule,
      [dateKey]: {
        ...day,
        slots: updatedSlots,
      },
    };

    updateAndPersistSchedule(updatedSchedule);
    turnosService.saveSlot(dateKey, updatedSlot);
    setEditingInfo(null);
  };

  // Reset a slot to blank/disponible
  const handleResetSlot = (dateKey: string, slotId: string) => {
    const day = schedule[dateKey] || activeWeekSchedule.find((d) => d.dateKey === dateKey);
    if (!day) return;

    const updatedSlots = day.slots.map((s) => {
      if (s.id === slotId) {
        return {
          ...s,
          status: 'disponible' as SlotStatus,
          clientName: '',
          description: '',
          category: categories[0]?.name || 'General',
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    const updatedSchedule: ScheduleStore = {
      ...schedule,
      [dateKey]: {
        ...day,
        slots: updatedSlots,
      },
    };

    updateAndPersistSchedule(updatedSchedule);
    turnosService.resetSlot(dateKey, slotId);
  };

  // Bulk actions
  const handleApplyBulkRange = ({
    targetDays,
    fromTime,
    toTime,
    action,
    description,
  }: {
    targetDays: 'current' | 'all';
    fromTime: string;
    toTime: string;
    action: 'disable' | 'enable';
    description?: string;
  }) => {
    const targetDates =
      targetDays === 'current'
        ? [currentDaySchedule.dateKey]
        : activeWeekSchedule.map((d) => d.dateKey);

    const updatedSchedule: ScheduleStore = { ...schedule };
    const bulkSlotsPayload: Array<{
      dateKey: string;
      slotId: string;
      startTime: string;
      endTime: string;
      status: SlotStatus;
      clientName?: string;
      description?: string;
      category?: string;
    }> = [];

    targetDates.forEach((dKey) => {
      const day = updatedSchedule[dKey] || activeWeekSchedule.find((d) => d.dateKey === dKey);
      if (!day) return;

      const updatedSlots = day.slots.map((slot) => {
        if (slot.startTime >= fromTime && slot.startTime < toTime) {
          const updated: TimeSlot = {
            ...slot,
            status: action === 'disable' ? ('deshabilitado' as SlotStatus) : ('disponible' as SlotStatus),
            description: action === 'disable' ? (description || 'Horario no disponible') : '',
            updatedAt: new Date().toISOString(),
          };
          bulkSlotsPayload.push({
            dateKey: dKey,
            slotId: updated.id,
            startTime: updated.startTime,
            endTime: updated.endTime,
            status: updated.status,
            clientName: updated.clientName,
            description: updated.description,
            category: updated.category,
          });
          return updated;
        }
        return slot;
      });

      updatedSchedule[dKey] = {
        ...day,
        slots: updatedSlots,
      };
    });

    updateAndPersistSchedule(updatedSchedule);
    if (bulkSlotsPayload.length > 0) {
      turnosService.bulkUpdateSlots(bulkSlotsPayload);
    }
  };

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(currentReferenceDate);
    d.setDate(d.getDate() - 7);
    setCurrentReferenceDate(d);
    const prevWeek = getWeekDates(d);
    setActiveDateKey(prevWeek[0].dateKey);
  };

  const handleNextWeek = () => {
    const d = new Date(currentReferenceDate);
    d.setDate(d.getDate() + 7);
    setCurrentReferenceDate(d);
    const nextWeek = getWeekDates(d);
    setActiveDateKey(nextWeek[0].dateKey);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentReferenceDate(now);
    const todayKey = formatDateToKey(now);
    if (now.getDay() !== 0) {
      setActiveDateKey(todayKey);
    } else {
      const week = getWeekDates(now);
      setActiveDateKey(week[0].dateKey);
    }
  };

  // Reset to sample data
  const handleResetData = () => {
    if (confirm('¿Restablecer todos los horarios a los valores predeterminados? Se deshabilitarán los domingos y los horarios habituales serán de 14:00 a 20:00.')) {
      const resetted = resetSchedule();
      setSchedule(resetted);
      setScheduleConfig(DEFAULT_SCHEDULE_CONFIG);
      const week = getWeekDates(currentReferenceDate);
      setActiveDateKey(week[0].dateKey);
    }
  };

  // Import JSON file
  const handleImportJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        updateAndPersistSchedule(parsed);
        alert('Datos importados correctamente.');
      } else {
        alert('El formato del archivo JSON no es válido.');
      }
    } catch {
      alert('Error al leer el archivo JSON.');
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-rose-50/30 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-rose-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-rose-800 dark:text-rose-300 font-semibold tracking-wide">Cargando turnos y agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-zinc-50/40 dark:from-zinc-950 dark:via-black dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col antialiased">
      {/* Top Header with search, filters, schedule config, categories and actions */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        scheduleConfig={scheduleConfig}
        onOpenScheduleConfigModal={() => setIsScheduleConfigModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onOpenCategoriesModal={() => setIsCategoriesModalOpen(true)}
        onExport={() => exportScheduleToFile(schedule)}
        onImport={handleImportJson}
        onReset={handleResetData}
        isCloud={isCloud}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Days Tab Bar */}
        <DaySelector
          days={activeWeekSchedule}
          activeDateKey={currentDaySchedule.dateKey}
          onSelectDay={(key) => setActiveDateKey(key)}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onToday={handleToday}
        />

        {/* View Content: Single Day Table or All Day Tables */}
        {viewMode === 'single' ? (
          <DayTable
            daySchedule={currentDaySchedule}
            categories={categories}
            scheduleConfig={scheduleConfig}
            onToggleDisable={(slotId) => handleToggleDisable(currentDaySchedule.dateKey, slotId)}
            onEditSlot={(slot) => handleOpenEditSlot(currentDaySchedule.dateKey, slot)}
            onResetSlot={(slotId) => handleResetSlot(currentDaySchedule.dateKey, slotId)}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
        ) : (
          <WeekOverview
            days={activeWeekSchedule}
            categories={categories}
            scheduleConfig={scheduleConfig}
            onToggleDisable={handleToggleDisable}
            onEditSlot={handleOpenEditSlot}
            onResetSlot={handleResetSlot}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
        )}
      </main>

      {/* Edit Slot Modal */}
      {editingInfo && (
        <EditSlotModal
          isOpen={true}
          slot={editingInfo.slot}
          dayName={schedule[editingInfo.dateKey]?.dayName || 'Día'}
          formattedDate={schedule[editingInfo.dateKey]?.formattedDate || ''}
          categories={categories}
          onClose={() => setEditingInfo(null)}
          onSave={handleSaveSlot}
          onResetSlot={(slotId) => {
            handleResetSlot(editingInfo.dateKey, slotId);
            setEditingInfo(null);
          }}
          onOpenManageCategories={() => {
            setEditingInfo(null);
            setIsCategoriesModalOpen(true);
          }}
        />
      )}

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={isBulkModalOpen}
        activeDayName={currentDaySchedule.dayName}
        onClose={() => setIsBulkModalOpen(false)}
        onApplyRange={handleApplyBulkRange}
      />

      {/* Categories CRUD Management Modal */}
      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        categories={categories}
        onClose={() => setIsCategoriesModalOpen(false)}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onResetCategories={handleResetCategories}
      />

      {/* User-Defined Schedule Start & End Time Modal */}
      <ScheduleConfigModal
        isOpen={isScheduleConfigModalOpen}
        currentConfig={scheduleConfig}
        onClose={() => setIsScheduleConfigModalOpen(false)}
        onSaveConfig={handleSaveScheduleConfig}
      />
    </div>
  );
}
