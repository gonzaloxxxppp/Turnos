'use client';

import React from 'react';
import { DaySchedule } from '@/types/appointments';
import { ChevronLeft, ChevronRight, Calendar, Bookmark } from 'lucide-react';

interface DaySelectorProps {
  days: DaySchedule[];
  activeDateKey: string;
  onSelectDay: (dateKey: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  activeDateKey,
  onSelectDay,
  onPrevWeek,
  onNextWeek,
  onToday,
}) => {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-950 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-rose-100 dark:border-rose-950">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Días de la Semana
          </span>
          <span className="text-xs text-rose-800/70 dark:text-rose-400/70 hidden md:inline">
            • Selecciona un día para gestionar sus horarios
          </span>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrevWeek}
            className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 transition-colors"
            title="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-1 text-xs font-semibold rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/60 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 transition-colors"
            title="Ir a la fecha de hoy"
          >
            Hoy
          </button>
          <button
            onClick={onNextWeek}
            className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 transition-colors"
            title="Semana siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Tabs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {days.map((day) => {
          const isActive = day.dateKey === activeDateKey;
          const isSunday = day.dayName === 'Domingo';
          const ocupados = day.slots.filter((s) => s.status === 'ocupado').length;
          const deshabilitados = day.slots.filter((s) => s.status === 'deshabilitado').length;
          const disponibles = day.slots.filter((s) => s.status === 'disponible').length;

          return (
            <button
              key={day.dateKey}
              onClick={() => onSelectDay(day.dateKey)}
              className={`flex flex-col p-3 rounded-2xl text-left border transition-all relative ${
                isActive
                  ? 'border-rose-600 bg-gradient-to-b from-rose-100/90 to-pink-50/50 dark:from-rose-950/60 dark:to-zinc-900 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30 shadow-sm'
                  : 'border-rose-100 dark:border-rose-950 hover:border-rose-300 dark:hover:border-rose-800 bg-rose-50/20 dark:bg-zinc-800/30 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isActive ? 'text-rose-900 dark:text-rose-200' : ''}`}>
                  {day.dayName}
                </span>
                {isActive ? (
                  <span className="w-2 h-2 rounded-full bg-rose-600 shadow-sm animate-pulse" />
                ) : isSunday ? (
                  <span className="text-[10px] font-semibold text-rose-600">No lab.</span>
                ) : null}
              </div>

              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {day.formattedDate.replace(/ \d{4}$/, '')}
              </span>

              {/* Status chips */}
              <div className="flex items-center gap-1.5 mt-2 text-[10px]">
                {ocupados > 0 && (
                  <span 
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-200/80 dark:bg-rose-900/70 text-rose-900 dark:text-rose-200 font-bold"
                    title={`${ocupados} turnos ocupados`}
                  >
                    <Bookmark className="w-2.5 h-2.5 fill-rose-700 text-rose-700" />
                    <span>{ocupados}</span>
                  </span>
                )}
                {deshabilitados > 0 && (
                  <span 
                    className="px-1.5 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
                    title={`${deshabilitados} turnos deshabilitados`}
                  >
                    {isSunday ? 'Cerrado' : `${deshabilitados} bloq.`}
                  </span>
                )}
                {ocupados === 0 && deshabilitados === 0 && (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {disponibles} libres
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
