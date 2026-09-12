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
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-3xl p-4 text-xs text-rose-950 dark:text-rose-200">
        <p className="font-bold text-sm">
          Vista Comparativa de Tablas por Día
        </p>
        <p className="mt-1 text-rose-800/80 dark:text-rose-300/80">
          A continuación se muestran las tablas independientes de cada día de la semana con sus turnos de 15 minutos (horario: {scheduleConfig.startHour} a {scheduleConfig.endHour}) y categorías.
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};
