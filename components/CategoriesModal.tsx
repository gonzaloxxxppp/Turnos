'use client';

import React, { useState } from 'react';
import { CategoryItem, GirlieColor } from '@/types/appointments';
import { GIRLIE_COLORS, getCategoryStyle } from '@/lib/categories';
import { X, Plus, Edit2, Trash2, Check, Tag, RotateCcw } from 'lucide-react';

interface CategoriesModalProps {
  isOpen: boolean;
  categories: CategoryItem[];
  onClose: () => void;
  onAddCategory: (category: Omit<CategoryItem, 'id'>) => void;
  onUpdateCategory: (category: CategoryItem) => void;
  onDeleteCategory: (categoryId: string) => void;
  onResetCategories: () => void;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  categories,
  onClose,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onResetCategories,
}) => {
  // New category state
  const [name, setName] = useState('');
  const [color, setColor] = useState<GirlieColor>('rose');

  // Editing category state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState<GirlieColor>('rose');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory({
      name: name.trim(),
      color,
    });

    setName('');
    setColor('rose');
  };

  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onUpdateCategory({
      id: editingId,
      name: editName.trim(),
      color: editColor,
    });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-950 px-6 py-4 bg-gradient-to-r from-rose-100/70 via-pink-100/50 to-rose-50/40 dark:from-rose-950/50 dark:via-zinc-900 dark:to-rose-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-900/20">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Administrar Categorías
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                Agrega, modifica o elimina las categorías de los turnos
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Create new category section */}
          <form 
            onSubmit={handleCreate} 
            className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3.5"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Nueva Categoría
            </span>

            <div className="flex gap-2">
              {/* Name input */}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la categoría (ej. Lifting, Masajes, Manicura...)"
                className="flex-1 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-800 px-3.5 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 active:scale-98 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-900/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Color swatches */}
            <div>
              <span className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Color de la categoría:
              </span>
              <div className="flex flex-wrap gap-2">
                {GIRLIE_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      color === c.id
                        ? `${c.badgeClass} ring-2 ring-rose-700/50 shadow-xs font-bold`
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-white text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full shadow-inner"
                      style={{ backgroundColor: c.previewColor }}
                    />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Categorías Actuales ({categories.length})
              </span>
              <button
                type="button"
                onClick={onResetCategories}
                className="text-[11px] text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Restablecer predeterminadas
              </button>
            </div>

            <div className="divide-y divide-rose-100 dark:divide-rose-950 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
              {categories.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs">
                  No hay categorías creadas. Agrega una arriba.
                </div>
              ) : (
                categories.map((cat) => {
                  const style = getCategoryStyle(cat.color);
                  const isEditing = editingId === cat.id;

                  if (isEditing) {
                    return (
                      <div key={cat.id} className="p-3 bg-rose-50/70 dark:bg-rose-950/30 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 rounded-lg border border-rose-300 dark:border-rose-800 px-3 py-1 text-xs bg-white dark:bg-zinc-800"
                          />

                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            title="Guardar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-zinc-500 hover:bg-zinc-200 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Color selection for editing */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {GIRLIE_COLORS.map((c) => (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => setEditColor(c.id)}
                              className={`w-5 h-5 rounded-full border transition-all ${
                                editColor === c.id ? 'ring-2 ring-rose-700 scale-110' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.previewColor }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.badgeClass}`}>
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {style.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-700 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Editar categoría"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Seguro que deseas eliminar la categoría "${cat.name}"?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rose-100 dark:border-rose-950 bg-rose-50/30 dark:bg-rose-950/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 active:scale-98 rounded-xl shadow-md shadow-rose-900/20 transition-all"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
