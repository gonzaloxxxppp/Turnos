'use client';

import React, { useState, useEffect } from 'react';
import { TimeSlot, SlotStatus, CategoryItem } from '@/types/appointments';
import { getCategoryStyle } from '@/lib/categories';
import { X, Check, Trash2, Ban, Clock, Calendar, User, FileText, Settings } from 'lucide-react';

interface EditSlotModalProps {
  isOpen: boolean;
  slot: TimeSlot | null;
  dayName: string;
  formattedDate: string;
  categories: CategoryItem[];
  onClose: () => void;
  onSave: (updatedSlot: TimeSlot) => void;
  onResetSlot: (slotId: string) => void;
  onOpenManageCategories: () => void;
}

export const EditSlotModal: React.FC<EditSlotModalProps> = ({
  isOpen,
  slot,
  dayName,
  formattedDate,
  categories,
  onClose,
  onSave,
  onResetSlot,
  onOpenManageCategories,
}) => {
  const [status, setStatus] = useState<SlotStatus>('disponible');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('General');

  useEffect(() => {
    if (slot) {
      setStatus(slot.status);
      setClientName(slot.clientName || '');
      setDescription(slot.description || '');
      setCategory(slot.category || (categories[0]?.name ?? 'General'));
    }
  }, [slot, categories]);

  if (!isOpen || !slot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-switch status to 'ocupado' if user wrote description or client name and was 'disponible'
    let finalStatus = status;
    if (status === 'disponible' && (description.trim() || clientName.trim())) {
      finalStatus = 'ocupado';
    }

    onSave({
      ...slot,
      status: finalStatus,
      clientName: clientName.trim(),
      description: description.trim(),
      category,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleClear = () => {
    onResetSlot(slot.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950 px-6 py-4 bg-gradient-to-r from-rose-100/80 via-pink-50/60 to-rose-50/40 dark:from-rose-950/50 dark:via-zinc-900 dark:to-rose-950/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-rose-300">
              <Calendar className="w-4 h-4" />
              <span>{dayName}, {formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white mt-1">
              <Clock className="w-5 h-5 text-rose-700 dark:text-rose-400" />
              <span>Horario: {slot.startTime} - {slot.endTime}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 font-medium">
                15 min
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-zinc-400 hover:text-rose-700 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto scrollbar-thin">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
              Estado del Turno
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('disponible')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  status === 'disponible'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-rose-50/40 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mb-1" />
                <span>Disponible</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('ocupado')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  status === 'ocupado'
                    ? 'border-rose-600 bg-rose-100/70 dark:bg-rose-950/50 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/40 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-rose-50/40 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-700 mb-1" />
                <span>Ocupado</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('deshabilitado')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  status === 'deshabilitado'
                    ? 'border-zinc-500 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 ring-2 ring-zinc-400/30 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-rose-50/40 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Ban className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 mb-1" />
                <span>Deshabilitado</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
              <FileText className="w-3.5 h-3.5 text-rose-700" />
              Descripción o Motivo del Turno
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribe una pequeña descripción para recordar para qué era este turno..."
              className="w-full rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
            />
            <p className="text-[11px] text-rose-800/70 dark:text-rose-400/70 mt-1">
              Esta nota se mostrará en la tabla para recordar los detalles del turno.
            </p>
          </div>

          {/* Client / Person */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
              <User className="w-3.5 h-3.5 text-rose-700" />
              Cliente / Persona / Título (Opcional)
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej. Sofía, Valentina, Dra. Laura..."
              className="w-full rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-zinc-800/80 px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
          </div>

          {/* Categories with Quick Manage Link (No emojis) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300">
                Categoría
              </label>
              <button
                type="button"
                onClick={onOpenManageCategories}
                className="text-xs text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline"
              >
                <Settings className="w-3 h-3" />
                Administrar categorías
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                const style = getCategoryStyle(cat.color);

                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? `${style.badgeClass} ring-2 ring-rose-700/50 shadow-xs scale-105 font-bold`
                        : 'border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-400 hover:bg-rose-100/60'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-rose-100 dark:border-rose-950">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:text-rose-900 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Restablecer este horario a Disponible y vaciar descripción"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar turno</span>
            </button>

            <div className="flex items-center gap-2">
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
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
