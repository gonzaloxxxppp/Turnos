'use client';

import React from 'react';
import { DaySchedule, TimeSlot, SlotStatus, CategoryItem, ScheduleConfig } from '@/types/appointments';
import { getCategoryStyle } from '@/lib/categories';
import { 
  Ban, 
  CheckCircle2, 
  Edit3, 
  Clock, 
  FileText, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Bookmark
} from 'lucide-react';

interface DayTableProps {
  daySchedule: DaySchedule;
  categories?: CategoryItem[];
  scheduleConfig: ScheduleConfig;
  onToggleDisable: (slotId: string) => void;
  onEditSlot: (slot: TimeSlot) => void;
  onResetSlot: (slotId: string) => void;
  searchQuery?: string;
  statusFilter?: 'all' | SlotStatus;
  isCompact?: boolean;
}

export const DayTable: React.FC<DayTableProps> = ({
  daySchedule,
  categories = [],
  scheduleConfig,
  onToggleDisable,
  onEditSlot,
  onResetSlot,
  searchQuery = '',
  statusFilter = 'all',
  isCompact = false,
}) => {
  const isSunday = daySchedule.dayName === 'Domingo';

  // Helper to find category info
  const findCategory = (catName?: string) => {
    if (!catName) return null;
    return categories.find((c) => c.name.toLowerCase() === catName.toLowerCase()) || null;
  };

  // Filter slots based on user-defined start and end hours, status, and search query
  const filteredSlots = daySchedule.slots.filter((slot) => {
    // Check if slot falls in the user-defined [startHour, endHour) range
    if (slot.startTime < scheduleConfig.startHour || slot.startTime >= scheduleConfig.endHour) {
      return false;
    }

    // Filter by status
    if (statusFilter !== 'all' && slot.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTime = slot.startTime.includes(q) || slot.endTime.includes(q);
      const matchDesc = slot.description?.toLowerCase().includes(q);
      const matchClient = slot.clientName?.toLowerCase().includes(q);
      const matchCategory = slot.category?.toLowerCase().includes(q);
      return matchTime || matchDesc || matchClient || matchCategory;
    }

    return true;
  });

  // Calculate stats for the visible scope
  const totalSlots = filteredSlots.length;
  const disponibles = filteredSlots.filter((s) => s.status === 'disponible').length;
  const ocupados = filteredSlots.filter((s) => s.status === 'ocupado').length;
  const deshabilitados = filteredSlots.filter((s) => s.status === 'deshabilitado').length;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200/90 dark:border-rose-950 shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Table Header with Day Title & Statistics */}
      <div className="p-4 sm:p-5 border-b border-rose-100 dark:border-rose-950 bg-gradient-to-r from-rose-100/70 via-pink-50/50 to-rose-50/30 dark:from-rose-950/40 dark:via-zinc-900 dark:to-rose-950/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {daySchedule.dayName}
            </h2>
            <span className="text-xs px-3 py-0.5 rounded-full font-medium bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
              {daySchedule.formattedDate}
            </span>
            {isSunday && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 flex items-center gap-1">
                <Ban className="w-3 h-3 text-rose-600" /> Domingo Deshabilitado
              </span>
            )}
          </div>
          <p className="text-xs text-rose-900/70 dark:text-rose-300/80 mt-0.5 font-medium">
            Horario configurado: {scheduleConfig.startHour} a {scheduleConfig.endHour} (turnos de 15 min)
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span 
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-2xs"
            title="Horarios libres para asignar"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
            <span className="font-bold">{disponibles}</span> Libres
          </span>

          <span 
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 shadow-2xs"
            title="Horarios con turnos reservados"
          >
            <Bookmark className="w-3 h-3 text-rose-700 fill-rose-600" />
            <span className="font-bold">{ocupados}</span> Ocupados
          </span>

          <span 
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 shadow-2xs"
            title="Horarios deshabilitados / bloqueados"
          >
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span className="font-bold">{deshabilitados}</span> Bloqueados
          </span>
        </div>
      </div>

      {/* Sunday Notice if applicable */}
      {isSunday && (
        <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              <strong>Día no laborable:</strong> Todos los horarios de este domingo están deshabilitados por defecto. Si necesitas habilitar un turno puntual, haz clic en &quot;Habilitar&quot; en su fila correspondiente.
            </span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[700px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-sm">
          {/* Table Head */}
          <thead className="sticky top-0 z-10 bg-rose-50 dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200 border-b border-rose-200 dark:border-rose-900">
            <tr>
              <th className="py-3 px-4 w-36">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-700" />
                  <span>Horario</span>
                </div>
              </th>
              <th className="py-3 px-4 w-32">Estado</th>
              {!isCompact && <th className="py-3 px-4 w-52">Cliente y Categoría</th>}
              <th className="py-3 px-4 min-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-rose-700" />
                  <span>Descripción / Nota</span>
                </div>
              </th>
              <th className="py-3 px-4 w-44 text-right">Acciones</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-rose-100 dark:divide-zinc-800">
            {filteredSlots.length === 0 ? (
              <tr>
                <td colSpan={isCompact ? 4 : 5} className="py-12 text-center text-zinc-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-rose-400" />
                  <p className="font-medium text-zinc-600 dark:text-zinc-300">No se encontraron turnos con los filtros actuales.</p>
                  <p className="text-xs mt-1 text-zinc-400">Prueba cambiando el horario de atención, buscador o filtro de estado.</p>
                </td>
              </tr>
            ) : (
              filteredSlots.map((slot) => {
                const isDeshabilitado = slot.status === 'deshabilitado';
                const isOcupado = slot.status === 'ocupado';
                const isDisponible = slot.status === 'disponible';
                const categoryObj = findCategory(slot.category);
                const categoryStyle = categoryObj ? getCategoryStyle(categoryObj.color) : null;

                return (
                  <tr
                    key={slot.id}
                    className={`group transition-colors ${
                      isDeshabilitado
                        ? 'bg-zinc-50/70 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-500'
                        : isOcupado
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-950/40'
                        : 'hover:bg-rose-50/30 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* Time Slot Range */}
                    <td className="py-2.5 px-4 font-mono font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={isDeshabilitado ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100 font-bold'}>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {isDisponible && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Disponible
                        </span>
                      )}
                      {isOcupado && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-200/80 dark:bg-rose-950 text-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800 font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-700" />
                          Ocupado
                        </span>
                      )}
                      {isDeshabilitado && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400">
                          <Ban className="w-3 h-3 text-rose-600" />
                          Deshabilitado
                        </span>
                      )}
                    </td>

                    {/* Client & Dynamic Category */}
                    {!isCompact && (
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col gap-1">
                          {slot.clientName ? (
                            <span className="font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
                              {slot.clientName}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-xs italic">-</span>
                          )}

                          {slot.category && (
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                                  categoryStyle ? categoryStyle.badgeClass : 'bg-rose-100 text-rose-900 border-rose-300'
                                }`}
                              >
                                {slot.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Description */}
                    <td className="py-2.5 px-4">
                      {slot.description ? (
                        <div 
                          onClick={() => onEditSlot(slot)}
                          className="cursor-pointer group/desc hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                          title="Haz clic para modificar la descripción"
                        >
                          <p className="text-zinc-800 dark:text-zinc-200 line-clamp-2 text-xs leading-relaxed font-normal">
                            {slot.description}
                          </p>
                        </div>
                      ) : isDeshabilitado ? (
                        <span className="text-xs text-zinc-400 italic">Horario no disponible</span>
                      ) : (
                        <button
                          onClick={() => onEditSlot(slot)}
                          className="text-xs text-rose-700 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 italic flex items-center gap-1 hover:underline font-medium"
                        >
                          <Edit3 className="w-3 h-3 text-rose-600" />
                          + Agregar descripción
                        </button>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Disable / Enable */}
                        <button
                          onClick={() => onToggleDisable(slot.id)}
                          className={`p-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                            isDeshabilitado
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                              : 'border-rose-200 text-zinc-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400'
                          }`}
                          title={isDeshabilitado ? 'Habilitar horario' : 'Deshabilitar horario'}
                        >
                          {isDeshabilitado ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden sm:inline">Habilitar</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span className="hidden sm:inline">Deshabilitar</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditSlot(slot)}
                          className="p-1.5 rounded-xl text-xs font-semibold border border-rose-300 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 bg-rose-100/70 dark:bg-rose-950/50 hover:bg-rose-200/80 dark:hover:bg-rose-900/60 transition-all flex items-center gap-1 shadow-2xs"
                          title="Modificar turno, cliente y descripción"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
                          <span className="hidden sm:inline">Modificar</span>
                        </button>

                        {/* Reset / Clear Button */}
                        {(slot.description || slot.clientName || isOcupado) && (
                          <button
                            onClick={() => onResetSlot(slot.id)}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Limpiar datos de este turno"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="p-3.5 border-t border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-zinc-800/30 text-xs text-rose-900/80 dark:text-rose-300/80 flex items-center justify-between">
        <span>
          Mostrando {totalSlots} turnos ({scheduleConfig.startHour} a {scheduleConfig.endHour})
        </span>
        <span className="text-[11px] text-rose-700/70 dark:text-rose-400/70 font-medium">15 min por turno</span>
      </div>
    </div>
  );
};
