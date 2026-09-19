'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/appointments';
import { authService, PRESET_AVATARS } from '@/lib/auth-service';
import { X, Check, Building2, User, Phone, FileText, Image as ImageIcon, Upload } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setOrgName(user.orgName || '');
      setBio(user.bio || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || PRESET_AVATARS[0].url);
      setCustomAvatarInput('');
      setError(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        setCustomAvatarInput('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) throw new Error('El nombre es obligatorio.');
      if (!orgName.trim()) throw new Error('El nombre de la organización es obligatorio.');

      const finalAvatar = customAvatarInput.trim() || avatarUrl;

      const updated = await authService.updateProfile({
        name: name.trim(),
        orgName: orgName.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        avatarUrl: finalAvatar,
      });

      onSave(updated);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el perfil.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden flex flex-col max-h-[94vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950 px-6 py-4 bg-gradient-to-r from-rose-100/80 via-pink-50/60 to-rose-50/40 dark:from-rose-950/50 dark:via-zinc-900 dark:to-rose-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-900/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Editar Perfil y Organización
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                Actualiza tu foto, descripción y datos de la cuenta
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Current Avatar preview */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-rose-400 shadow-md flex-shrink-0 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={customAvatarInput.trim() || avatarUrl || PRESET_AVATARS[0].url}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs">
              <p className="font-bold text-zinc-900 dark:text-white text-sm">{orgName || 'Mi Organización'}</p>
              <p className="text-zinc-500 dark:text-zinc-400">{user.email}</p>
              <p className="text-rose-700 dark:text-rose-400 mt-1 font-semibold">Foto visible en la página principal</p>
            </div>
          </div>

          {/* Organization Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-1">
              <Building2 className="w-3.5 h-3.5 text-rose-700" />
              Nombre de la Organización o Cuenta
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Titular Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-1">
              <User className="w-3.5 h-3.5 text-rose-700" />
              Nombre del Titular o Profesional
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Bio / Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-1">
              <FileText className="w-3.5 h-3.5 text-rose-700" />
              Descripción y Servicios
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-1">
              <Phone className="w-3.5 h-3.5 text-rose-700" />
              Teléfono / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Change Avatar / Presets */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900/80 dark:text-rose-300 mb-2">
              <ImageIcon className="w-3.5 h-3.5 text-rose-700" />
              Cambiar Foto / Avatar
            </label>

            <div className="mt-2 flex items-center gap-2">
              <input
                type="url"
                placeholder="O pega el enlace de tu foto (https://...)"
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                className="flex-1 rounded-2xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <label className="cursor-pointer px-3 py-1.5 rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
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
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
