'use client';

import React, { useState } from 'react';
import { X, Check, Ban, CheckCircle2, Clock, SlidersHorizontal } from 'lucide-react';
import { FULL_START_HOUR, FULL_END_HOUR, formatMinutesToTime, INTERVAL_MINUTES } from '@/lib/time-utils';

interface BulkActionsModalProps {
  isOpen: boolean;
  activeDayName: string;
  onClose: () => void;
  onApplyRange: (params: {
    targetDays: 'current' | 'all';
    fromTime: string;
    toTime: string;
    action: 'disable' | 'enable';
    description?: string;
  }) => void;
}

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  activeDayName,
  onClose,
  onApplyRange,
}) => {
  const [targetDays, setTargetDays] = useState<'current' | 'all'>('current');
  const [fromTime, setFromTime] = useState('13:00');
  const [toTime, setToTime] = useState('14:00');
  const [action, setAction] = useState<'disable' | 'enable'>('disable');
  const [bulkReason, setBulkReason] = useState('Pausa o Almuerzo');

  if (!isOpen) return null;

  // Generate list of possible times from 08:00 to 21:00
  const timeOptions: string[] = [];
  for (let m = FULL_START_HOUR * 60; m <= FULL_END_HOUR * 60; m += INTERVAL_MINUTES) {
    timeOptions.push(formatMinutesToTime(m));
  }

  const handleApplyPreset = (from: string, to: string, reason: string) => {
    setFromTime(from);
    setToTime(to);
    setBulkReason(reason);
    setAction('disable');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyRange({
      targetDays,
      fromTime,
      toTime,
      action,
      description: action === 'disable' ? bulkReason.trim() : '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950 px-6 py-4 bg-gradient-to-r from-rose-100/80 via-pink-50/60 to-rose-50/40 dark:from-rose-950/50 dark:via-zinc-900 dark:to-rose-950/20">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>Gestión de Horarios en Lote</span>
              <SlidersHorizontal className="w-4 h-4 text-rose-700" />
            </h3>
            <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
              Deshabilita o habilita múltiples turnos al mismo tiempo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-zinc-400 hover:text-rose-700 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets (No emojis) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
              Atajos Rápidos (Presets)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleApplyPreset('13:00', '14:00', 'Horario de almuerzo')}
                className="p-2.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 hover:border-rose-400 bg-rose-50/40 dark:bg-zinc-800/50 text-left font-medium text-zinc-800 dark:text-zinc-200 transition-all hover:bg-rose-50"
              >
                Almuerzo (13:00 - 14:00)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('08:00', '14:00', 'Mañana no disponible')}
                className="p-2.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 hover:border-rose-400 bg-rose-50/40 dark:bg-zinc-800/50 text-left font-medium text-zinc-800 dark:text-zinc-200 transition-all hover:bg-rose-50"
              >
                Toda la Mañana (08:00 - 14:00)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('20:00', '21:00', 'Cierre de jornada')}
                className="p-2.5 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 hover:border-rose-400 bg-rose-50/40 dark:bg-zinc-800/50 text-left font-medium text-zinc-800 dark:text-zinc-200 transition-all hover:bg-rose-50"
              >
                Noche (20:00 - 21:00)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('08:00', '21:00', 'Día cerrado / Feriado')}
                className="p-2.5 rounded-xl border border-rose-200/80 dark:border-rose-900/60 hover:border-rose-400 bg-rose-50/40 dark:bg-zinc-800/50 text-left font-medium text-zinc-800 dark:text-zinc-200 transition-all hover:bg-rose-50"
              >
                Día Completo (08:00 - 21:00)
              </button>
            </div>
          </div>

          {/* Action selection: Enable or Disable */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
              Acción a Realizar
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAction('disable')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  action === 'disable'
                    ? 'border-rose-700 bg-rose-100/70 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 ring-2 ring-rose-600/30 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50/30'
                }`}
              >
                <Ban className="w-4 h-4 text-rose-700" />
                <span>Deshabilitar Rango</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('enable')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  action === 'enable'
                    ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-50/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Habilitar Rango</span>
              </button>
            </div>
          </div>

          {/* Target Days */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
              Aplicar en
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetDays('current')}
                className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                  targetDays === 'current'
                    ? 'border-rose-600 bg-rose-100/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                Solo para {activeDayName}
              </button>
              <button
                type="button"
                onClick={() => setTargetDays('all')}
                className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                  targetDays === 'all'
                    ? 'border-rose-600 bg-rose-100/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                Toda la semana
              </button>
            </div>
          </div>

          {/* Time range selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-700" />
                Desde
              </label>
              <select
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white"
              >
                {timeOptions.slice(0, -1).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-700" />
                Hasta
              </label>
              <select
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-white"
              >
                {timeOptions.slice(1).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description for disabled slots */}
          {action === 'disable' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-1.5">
                Motivo / Descripción de la Deshabilitación
              </label>
              <input
                type="text"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Ej. Almuerzo, Pausa, Mantenimiento..."
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2 text-sm text-zinc-900 dark:text-white"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-rose-100 dark:border-rose-950">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 active:scale-98 rounded-xl shadow-md shadow-rose-900/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
