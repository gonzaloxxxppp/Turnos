'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ScheduleStore, 
  TimeSlot, 
  SlotStatus, 
  DaySchedule,
  CategoryItem,
  ScheduleConfig,
  UserProfile
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
import { authService } from '@/lib/auth-service';
import { turnosService } from '@/lib/api/turnos-service';

import { Header } from '@/components/Header';
import { DaySelector } from '@/components/DaySelector';
import { DayTable } from '@/components/DayTable';
import { WeekOverview } from '@/components/WeekOverview';
import { EditSlotModal } from '@/components/EditSlotModal';
import { BulkActionsModal } from '@/components/BulkActionsModal';
import { CategoriesModal } from '@/components/CategoriesModal';
import { ScheduleConfigModal } from '@/components/ScheduleConfigModal';
import { OrganizationDirectory } from '@/components/OrganizationDirectory';
import { LoginModal } from '@/components/LoginModal';
import { RegisterModal } from '@/components/RegisterModal';
import { ProfileModal } from '@/components/ProfileModal';
import { PublicBookingModal } from '@/components/PublicBookingModal';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isCloud, setIsCloud] = useState(false);

  // Accounts & Navigation state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<UserProfile[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'directory' | 'schedule' | 'management'>('directory');

  // Schedule & Agenda state for active account
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
  const [publicBookingInfo, setPublicBookingInfo] = useState<{ dateKey: string; slot: TimeSlot } | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isScheduleConfigModalOpen, setIsScheduleConfigModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Check if current user is owner / admin of the active view
  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    if (currentView === 'management') return true;
    if (activeOrganization && currentUser.id === activeOrganization.id) return true;
    return false;
  }, [currentUser, currentView, activeOrganization]);

  // Load account data helper
  const loadAccountScheduleData = useCallback(async (accountId: string) => {
    const loadedSchedule = loadSchedule(accountId);
    setSchedule(loadedSchedule);

    const loadedConfig = loadScheduleConfig(accountId);
    setScheduleConfig(loadedConfig);

    const loadedCategories = loadCategories();
    setCategories(loadedCategories);

    // Initial active date key
    const today = new Date();
    const todayKey = formatDateToKey(today);
    if (loadedSchedule[todayKey] && today.getDay() !== 0) {
      setActiveDateKey(todayKey);
    } else {
      const week = getWeekDates(today);
      setActiveDateKey(week[0].dateKey);
    }

    // Try cloud sync
    try {
      const [configRes, catRes] = await Promise.all([
        turnosService.getConfig(accountId),
        turnosService.getCategories(accountId),
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
  }, []);

  // Initialize and load from storage / Supabase
  useEffect(() => {
    setIsClient(true);

    const init = async () => {
      // Load current user and registered organizations
      const user = authService.getCurrentUser();
      setCurrentUser(user);

      const orgs = await authService.getAllOrganizations();
      setOrganizations(orgs);

      // Set initial view: Directory by default for all visitors
      setCurrentView('directory');

      // Pre-load default schedule
      const targetAccId = user?.id || 'default';
      loadAccountScheduleData(targetAccId);
    };

    init();
  }, [loadAccountScheduleData]);

  // Save whenever schedule changes for current active account
  const updateAndPersistSchedule = (newSchedule: ScheduleStore) => {
    const accountId = activeOrganization?.id || currentUser?.id || 'default';
    setSchedule(newSchedule);
    saveSchedule(newSchedule, accountId);
  };

  // Schedule Config Handler
  const handleSaveScheduleConfig = (newConfig: ScheduleConfig) => {
    const accountId = activeOrganization?.id || currentUser?.id || 'default';
    const configWithAccount: ScheduleConfig = { ...newConfig, accountId };

    setScheduleConfig(configWithAccount);
    saveScheduleConfig(configWithAccount, accountId);
    turnosService.saveConfig(configWithAccount, accountId);

    // Ensure all days in the schedule contain slots for the new range and new interval
    const updatedSchedule: ScheduleStore = { ...schedule };
    Object.keys(updatedSchedule).forEach((dateKey) => {
      const day = updatedSchedule[dateKey];
      const isSunday = day.dayName === 'Domingo';
      const updatedSlots = ensureSlotsForRange(
        day.slots,
        configWithAccount.startHour,
        configWithAccount.endHour,
        isSunday,
        configWithAccount.intervalMinutes
      );
      updatedSchedule[dateKey] = {
        ...day,
        slots: updatedSlots,
      };
    });

    updateAndPersistSchedule(updatedSchedule);
  };

  // Select an organization from the directory
  const handleSelectOrganization = (org: UserProfile) => {
    setActiveOrganization(org);
    loadAccountScheduleData(org.id);

    if (currentUser?.id === org.id) {
      setCurrentView('management');
    } else {
      setCurrentView('schedule');
    }
  };

  // Navigation handlers
  const handleNavigateToDirectory = () => {
    setCurrentView('directory');
  };

  const handleNavigateToManagement = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setActiveOrganization(currentUser);
    loadAccountScheduleData(currentUser.id);
    setCurrentView('management');
  };

  const handleAuthSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setActiveOrganization(user);
    const updatedOrgs = await authService.getAllOrganizations();
    setOrganizations(updatedOrgs);
    loadAccountScheduleData(user.id);
    setCurrentView('management');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setCurrentView('directory');
  };

  const handleProfileSave = (updated: UserProfile) => {
    setCurrentUser(updated);
    if (activeOrganization?.id === updated.id) {
      setActiveOrganization(updated);
    }
    setOrganizations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Public Booking Confirmation
  const handleConfirmPublicBooking = async (bookingData: { clientName: string; clientPhone: string; description: string }) => {
    if (!publicBookingInfo || !activeOrganization) return;
    const { dateKey, slot } = publicBookingInfo;

    const updatedSlot = await turnosService.bookPublicSlot(
      activeOrganization.id,
      dateKey,
      slot,
      bookingData
    );

    // Update local schedule state
    const day = schedule[dateKey];
    if (day) {
      const updatedSlots = day.slots.map((s) => (s.id === slot.id ? updatedSlot : s));
      const updatedSchedule = {
        ...schedule,
        [dateKey]: {
          ...day,
          slots: updatedSlots,
        },
      };
      setSchedule(updatedSchedule);
    }
  };

  // Category CRUD Handlers
  const handleAddCategory = (newCat: Omit<CategoryItem, 'id'>) => {
    const accountId = activeOrganization?.id || currentUser?.id || 'default';
    const created: CategoryItem = {
      ...newCat,
      id: `cat-${Date.now()}`,
      accountId,
    };
    const updated = [...categories, created];
    setCategories(updated);
    saveCategories(updated);
    turnosService.createCategory(created, accountId);
  };

  const handleUpdateCategory = (updatedCat: CategoryItem) => {
    const oldCat = categories.find((c) => c.id === updatedCat.id);
    const updated = categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
    setCategories(updated);
    saveCategories(updated);
    turnosService.updateCategory(updatedCat);

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

  // Current week days for reference date
  const currentWeekDays = useMemo(() => {
    return getWeekDates(currentReferenceDate);
  }, [currentReferenceDate]);

  // Ensure all days of the current week exist in schedule
  const activeWeekSchedule: DaySchedule[] = useMemo(() => {
    return currentWeekDays.map((dayItem) => {
      if (schedule[dayItem.dateKey]) {
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
        slots: generateDaySlots(dayItem.isSunday, scheduleConfig.intervalMinutes),
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
        slots: generateDaySlots(false, scheduleConfig.intervalMinutes),
      }
    );
  }, [activeWeekSchedule, activeDateKey, scheduleConfig.intervalMinutes]);

  // Toggle disable for a specific slot (Admin only)
  const handleToggleDisable = (dateKey: string, slotId: string) => {
    if (!isAdmin) return;
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
            ? (slot.description || 'Horario bloqueado') 
            : (slot.description === 'Horario bloqueado' || slot.description === 'Fuera de horario de atención' ? '' : slot.description),
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
      const accountId = activeOrganization?.id || currentUser?.id || 'default';
      turnosService.saveSlot(dateKey, toggledSlot, accountId);
    }
  };

  // Open edit modal for slot (Admin only)
  const handleOpenEditSlot = (dateKey: string, slot: TimeSlot) => {
    if (!isAdmin) return;
    setEditingInfo({ dateKey, slot });
  };

  // Save changes from EditSlotModal (Admin only)
  const handleSaveSlot = (updatedSlot: TimeSlot) => {
    if (!editingInfo) return;
    const { dateKey } = editingInfo;
    const day = schedule[dateKey] || activeWeekSchedule.find((d) => d.dateKey === dateKey);
    if (!day) return;

    const accountId = activeOrganization?.id || currentUser?.id || 'default';
    const finalSlot = { ...updatedSlot, accountId };
    const updatedSlots = day.slots.map((s) => (s.id === updatedSlot.id ? finalSlot : s));

    const updatedSchedule: ScheduleStore = {
      ...schedule,
      [dateKey]: {
        ...day,
        slots: updatedSlots,
      },
    };

    updateAndPersistSchedule(updatedSchedule);
    turnosService.saveSlot(dateKey, finalSlot, accountId);
    setEditingInfo(null);
  };

  // Reset a slot to blank/disponible (Admin only)
  const handleResetSlot = (dateKey: string, slotId: string) => {
    if (!isAdmin) return;
    const day = schedule[dateKey] || activeWeekSchedule.find((d) => d.dateKey === dateKey);
    if (!day) return;

    const updatedSlots = day.slots.map((s) => {
      if (s.id === slotId) {
        return {
          ...s,
          status: 'disponible' as SlotStatus,
          clientName: '',
          clientPhone: '',
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

    const accountId = activeOrganization?.id || currentUser?.id || 'default';
    updateAndPersistSchedule(updatedSchedule);
    turnosService.resetSlot(dateKey, slotId, accountId);
  };

  // Bulk actions (Admin only)
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
    if (!isAdmin) return;
    const targetDates =
      targetDays === 'current'
        ? [currentDaySchedule.dateKey]
        : activeWeekSchedule.map((d) => d.dateKey);

    const accountId = activeOrganization?.id || currentUser?.id || 'default';
    const updatedSchedule: ScheduleStore = { ...schedule };
    const bulkSlotsPayload: Array<{
      dateKey: string;
      slotId: string;
      startTime: string;
      endTime: string;
      status: SlotStatus;
      clientName?: string;
      clientPhone?: string;
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
            accountId,
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
            clientPhone: updated.clientPhone,
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
      turnosService.bulkUpdateSlots(bulkSlotsPayload, accountId);
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

  // Reset to default clean data (without sample bookings)
  const handleResetData = () => {
    if (confirm('¿Restablecer los turnos a los valores predeterminados? Se eliminarán bloqueos y quedarán los turnos libres sin datos de muestra.')) {
      const accountId = activeOrganization?.id || currentUser?.id || 'default';
      const resetted = resetSchedule(accountId);
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

  // Public booking click handler
  const handleOpenPublicBooking = (dateKey: string, slot: TimeSlot) => {
    setPublicBookingInfo({ dateKey, slot });
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
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        activeOrganization={activeOrganization}
        currentView={currentView}
        onNavigateToDirectory={handleNavigateToDirectory}
        onNavigateToManagement={handleNavigateToManagement}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenRegister={() => setIsRegisterModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
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
        onExport={() => exportScheduleToFile(schedule, activeOrganization?.orgName || 'turnos')}
        onImport={handleImportJson}
        onReset={handleResetData}
        isCloud={isCloud}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: Directory of Organizations (Main Page) */}
        {currentView === 'directory' && (
          <OrganizationDirectory
            organizations={organizations}
            currentUser={currentUser}
            onSelectOrganization={handleSelectOrganization}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
            onGoToMyDashboard={handleNavigateToManagement}
          />
        )}

        {/* VIEW 2 & 3: Organization Schedule (Public View or Owner Management View) */}
        {(currentView === 'schedule' || currentView === 'management') && (
          <div className="space-y-6">
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
                isAdmin={isAdmin}
                onPublicBookSlot={(slot) => handleOpenPublicBooking(currentDaySchedule.dateKey, slot)}
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
                isAdmin={isAdmin}
                onPublicBookSlot={(dateKey, slot) => handleOpenPublicBooking(dateKey, slot)}
              />
            )}
          </div>
        )}
      </main>

      {/* Separate Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Separate Register Modal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        user={currentUser}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleProfileSave}
      />

      {/* Public Booking Modal */}
      {publicBookingInfo && (
        <PublicBookingModal
          isOpen={true}
          slot={publicBookingInfo.slot}
          dayName={schedule[publicBookingInfo.dateKey]?.dayName || 'Día'}
          formattedDate={schedule[publicBookingInfo.dateKey]?.formattedDate || ''}
          organization={activeOrganization}
          onClose={() => setPublicBookingInfo(null)}
          onConfirmBooking={handleConfirmPublicBooking}
        />
      )}

      {/* Edit Slot Modal (Admin only) */}
      {editingInfo && isAdmin && (
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

      {/* Bulk Actions Modal (Admin only) */}
      {isAdmin && (
        <BulkActionsModal
          isOpen={isBulkModalOpen}
          activeDayName={currentDaySchedule.dayName}
          onClose={() => setIsBulkModalOpen(false)}
          onApplyRange={handleApplyBulkRange}
        />
      )}

      {/* Categories CRUD Management Modal (Admin only) */}
      {isAdmin && (
        <CategoriesModal
          isOpen={isCategoriesModalOpen}
          categories={categories}
          onClose={() => setIsCategoriesModalOpen(false)}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onResetCategories={handleResetCategories}
        />
      )}

      {/* User-Defined Schedule Start & End Time & Interval Modal (Admin only) */}
      {isAdmin && (
        <ScheduleConfigModal
          isOpen={isScheduleConfigModalOpen}
          currentConfig={scheduleConfig}
          onClose={() => setIsScheduleConfigModalOpen(false)}
          onSaveConfig={handleSaveScheduleConfig}
        />
      )}
    </div>
  );
}
