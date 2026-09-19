'use client';

import React from 'react';
import { DaySchedule, TimeSlot, SlotStatus, CategoryItem, ScheduleConfig } from '@/types/appointments';
import { DayTable } from './DayTable';

interface WeekOverviewProps {
  days: DaySchedule[];
  categories?: CategoryItem[];
  scheduleConfig: ScheduleConfig;
  onToggleDisable: (dateKey: string, slotId: string) => void;
  onEditSlot: (dateKey: string, slot: TimeSlot) => void;
  onResetSlot: (dateKey: string, slotId: string) => void;
  searchQuery?: string;
  statusFilter?: 'all' | SlotStatus;
  isAdmin?: boolean;
  onPublicBookSlot?: (dateKey: string, slot: TimeSlot) => void;
}

export const WeekOverview: React.FC<WeekOverviewProps> = ({
  days,
  categories = [],
  scheduleConfig,
  onToggleDisable,
  onEditSlot,
  onResetSlot,
  searchQuery,
  statusFilter,
  isAdmin = true,
  onPublicBookSlot,
}) => {
  const interval = scheduleConfig.intervalMinutes || 15;

  return (
    <div className="space-y-8">
      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-3xl p-4 text-xs text-rose-950 dark:text-rose-200">
        <p className="font-bold text-sm">
          Vista General de la Semana
        </p>
        <p className="mt-1 text-rose-800/80 dark:text-rose-300/80">
          A continuación se muestran los horarios y turnos de cada día (turnos de {interval} min, horario: {scheduleConfig.startHour} a {scheduleConfig.endHour}).
        </p>
      </div>

      <div className="space-y-8">
        {days.map((day) => (
          <div key={day.dateKey} id={`day-section-${day.dateKey}`}>
            <DayTable
              daySchedule={day}
              categories={categories}
              scheduleConfig={scheduleConfig}
              onToggleDisable={(slotId) => onToggleDisable(day.dateKey, slotId)}
              onEditSlot={(slot) => onEditSlot(day.dateKey, slot)}
              onResetSlot={(slotId) => onResetSlot(day.dateKey, slotId)}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              isAdmin={isAdmin}
              onPublicBookSlot={(slot) => onPublicBookSlot && onPublicBookSlot(day.dateKey, slot)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
