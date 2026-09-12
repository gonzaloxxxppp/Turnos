'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleConfig } from '@/types/appointments';
import { formatMinutesToTime, parseTimeToMinutes } from '@/lib/time-utils';
import { X, Check, Clock, SlidersHorizontal, AlertCircle } from 'lucide-react';

interface ScheduleConfigModalProps {
  isOpen: boolean;
  currentConfig: ScheduleConfig;
  onClose: () => void;
  onSaveConfig: (newConfig: ScheduleConfig) => void;
}

export const ScheduleConfigModal: React.FC<ScheduleConfigModalProps> = ({
  isOpen,
  currentConfig,
  onClose,
  onSaveConfig,
}) => {
  const [startHour, setStartHour] = useState(currentConfig.startHour);
  const [endHour, setEndHour] = useState(currentConfig.endHour);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStartHour(currentConfig.startHour);
    setEndHour(currentConfig.endHour);
    setError(null);
  }, [currentConfig, isOpen]);

  if (!isOpen) return null;

  // Generate options from 06:00 to 23:30 in 30-min steps
  const startOptions: string[] = [];
  for (let m = 6 * 60; m <= 22 * 60; m += 30) {
    startOptions.push(formatMinutesToTime(m));
  }

  const endOptions: string[] = [];
  for (let m = 7 * 60; m <= 24 * 60; m += 30) {
    // 24:00 can be represented as 23:59 or 23:45
    if (m === 24 * 60) {
      endOptions.push('23:45');
    } else {
      endOptions.push(formatMinutesToTime(m));
    }
  }

  const startMin = parseTimeToMinutes(startHour);
  const endMin = parseTimeToMinutes(endHour);
  const totalMinutes = endMin - startMin;
  const totalSlots = totalMinutes > 0 ? Math.floor(totalMinutes / 15) : 0;

  const handleApplyPreset = (start: string, end: string) => {
    setStartHour(start);
    setEndHour(end);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startMin >= endMin) {
      setError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    onSaveConfig({
      startHour,
      endHour,
      intervalMinutes: 15,
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-900/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Definir Horario de Atención
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                Configura la hora de inicio y final de la agenda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-zinc-400 hover:text-rose-700 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
              Atajos Rápidos
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleApplyPreset('14:00', '20:00')}
                className={`p-2.5 rounded-2xl border text-left font-medium transition-all ${
                  startHour === '14:00' && endHour === '20:00'
                    ? 'border-rose-600 bg-rose-100/80 text-rose-950 font-bold ring-2 ring-rose-500/20'
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 text-zinc-800 dark:text-zinc-200 hover:bg-rose-50'
                }`}
              >
                14:00 a 20:00 (Tarde)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('08:00', '21:00')}
                className={`p-2.5 rounded-2xl border text-left font-medium transition-all ${
                  startHour === '08:00' && endHour === '21:00'
                    ? 'border-rose-600 bg-rose-100/80 text-rose-950 font-bold ring-2 ring-rose-500/20'
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 text-zinc-800 dark:text-zinc-200 hover:bg-rose-50'
                }`}
              >
                08:00 a 21:00 (Jornada Completa)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('09:00', '18:00')}
                className={`p-2.5 rounded-2xl border text-left font-medium transition-all ${
                  startHour === '09:00' && endHour === '18:00'
                    ? 'border-rose-600 bg-rose-100/80 text-rose-950 font-bold ring-2 ring-rose-500/20'
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 text-zinc-800 dark:text-zinc-200 hover:bg-rose-50'
                }`}
              >
                09:00 a 18:00 (Comercial)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('08:00', '14:00')}
                className={`p-2.5 rounded-2xl border text-left font-medium transition-all ${
                  startHour === '08:00' && endHour === '14:00'
                    ? 'border-rose-600 bg-rose-100/80 text-rose-950 font-bold ring-2 ring-rose-500/20'
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 text-zinc-800 dark:text-zinc-200 hover:bg-rose-50'
                }`}
              >
                08:00 a 14:00 (Mañana)
              </button>
            </div>
          </div>

          {/* Time selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
                <Clock className="w-3.5 h-3.5 text-rose-700" />
                Hora de Inicio
              </label>
              <select
                value={startHour}
                onChange={(e) => {
                  setStartHour(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {startOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
                <Clock className="w-3.5 h-3.5 text-rose-700" />
                Hora de Fin
              </label>
              <select
                value={endHour}
                onChange={(e) => {
                  setEndHour(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {endOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calculation summary info */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs">
            <span className="text-zinc-600 dark:text-zinc-300">
              Rango: <strong>{startHour}</strong> a <strong>{endHour}</strong>
            </span>
            <span className="text-rose-900 dark:text-rose-200 font-bold">
              {totalSlots} turnos de 15 min por día
            </span>
          </div>

          {/* Error notice */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer actions */}
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
              <span>Guardar Horario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
