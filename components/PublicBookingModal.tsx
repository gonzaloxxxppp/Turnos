'use client';

import React, { useState } from 'react';
import { TimeSlot, UserProfile } from '@/types/appointments';
import { X, Calendar, Clock, User, Phone, FileText, CheckCircle2, Building2 } from 'lucide-react';

interface PublicBookingModalProps {
  isOpen: boolean;
  slot: TimeSlot | null;
  dayName: string;
  formattedDate: string;
  organization: UserProfile | null;
  onClose: () => void;
  onConfirmBooking: (bookingData: { clientName: string; clientPhone: string; description: string }) => Promise<void>;
}

export const PublicBookingModal: React.FC<PublicBookingModalProps> = ({
  isOpen,
  slot,
  dayName,
  formattedDate,
  organization,
  onClose,
  onConfirmBooking,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !slot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Por favor ingresa tu nombre y apellido.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await onConfirmBooking({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        description: description.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setClientName('');
        setClientPhone('');
        setDescription('');
        onClose();
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al confirmar la reserva.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950 px-6 py-4 bg-gradient-to-r from-rose-100/80 via-pink-50/60 to-rose-50/40 dark:from-rose-950/50 dark:via-zinc-900 dark:to-rose-950/20">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
              <Building2 className="w-3.5 h-3.5" />
              <span>{organization?.orgName || 'Organización'}</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
              Reservar Turno
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-zinc-400 hover:text-rose-700 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slot details pill */}
        <div className="p-4 mx-6 mt-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-700" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {dayName}, {formattedDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-xl shadow-2xs font-bold text-rose-800 dark:text-rose-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{slot.startTime} - {slot.endTime}</span>
          </div>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white">¡Turno Reservado con Éxito!</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Tu turno ha sido registrado para el {dayName} a las {slot.startTime} hs.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Client Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-1">
                <User className="w-3.5 h-3.5 text-rose-700" />
                Tu Nombre y Apellido *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Lucía Gómez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Client Phone */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-1">
                <Phone className="w-3.5 h-3.5 text-rose-700" />
                Teléfono / WhatsApp (para confirmación)
              </label>
              <input
                type="text"
                placeholder="+54 9 11 1234-5678"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Note / Reason */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-1">
                <FileText className="w-3.5 h-3.5 text-rose-700" />
                Motivo de Consulta o Nota
              </label>
              <input
                type="text"
                placeholder="Ej: Primera consulta, revisión, presupuesto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Footer */}
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
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 active:scale-98 rounded-xl shadow-md shadow-rose-900/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Turno</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
