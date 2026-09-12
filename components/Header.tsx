'use client';

import React, { useRef } from 'react';
import { 
  CalendarDays, 
  Search, 
  Download, 
  Upload, 
  RotateCcw, 
  SlidersHorizontal,
  TableProperties,
  LayoutGrid,
  Clock,
  Tag,
  Database
} from 'lucide-react';
import { SlotStatus, ScheduleConfig } from '@/types/appointments';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: 'all' | SlotStatus;
  onStatusFilterChange: (status: 'all' | SlotStatus) => void;
  scheduleConfig: ScheduleConfig;
  onOpenScheduleConfigModal: () => void;
  viewMode: 'single' | 'all';
  onViewModeChange: (mode: 'single' | 'all') => void;
  onOpenBulkModal: () => void;
  onOpenCategoriesModal: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onReset: () => void;
  isCloud?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  scheduleConfig,
  onOpenScheduleConfigModal,
  viewMode,
  onViewModeChange,
  onOpenBulkModal,
  onOpenCategoriesModal,
  onExport,
  onImport,
  onReset,
  isCloud = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-rose-200 dark:border-rose-950 shadow-2xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-900/25">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-rose-900 dark:text-rose-100 leading-tight">
                Gestión de Turnos
              </h1>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <p className="text-xs text-rose-800/80 dark:text-rose-300/80 font-medium">
                  Horario: {scheduleConfig.startHour} a {scheduleConfig.endHour} • 15 min • Domingos no laborables
                </p>
                {isCloud ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <Database className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                    Supabase Conectado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100/70 text-rose-900 dark:bg-zinc-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                    <Database className="w-3 h-3 text-rose-700 dark:text-rose-400" />
                    Modo Local
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative min-w-[170px] flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar turno o motivo..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-rose-400/70 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Custom User-Defined Schedule Trigger Button */}
            <button
              onClick={onOpenScheduleConfigModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-100/70 dark:bg-rose-950/50 text-rose-950 dark:text-rose-100 hover:bg-rose-200/80 dark:hover:bg-rose-900/60 shadow-2xs transition-all active:scale-98"
              title="Haz clic para definir el horario de inicio y final"
            >
              <Clock className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
              <span>Horario: {scheduleConfig.startHour} - {scheduleConfig.endHour}</span>
              <span className="text-[10px] uppercase tracking-wider bg-rose-700 text-white px-1.5 py-0.5 rounded-md font-bold ml-0.5">
                Cambiar
              </span>
            </button>

            {/* View Mode Toggle: Single Day vs All Days */}
            <div className="flex items-center rounded-2xl bg-rose-50/70 dark:bg-zinc-800 p-1 border border-rose-200 dark:border-rose-900 text-xs">
              <button
                onClick={() => onViewModeChange('single')}
                className={`flex items-center gap-1 px-2.5 py-1 font-semibold rounded-xl transition-all ${
                  viewMode === 'single'
                    ? 'bg-white dark:bg-zinc-900 text-rose-800 dark:text-rose-200 shadow-2xs font-bold'
                    : 'text-zinc-500 hover:text-rose-700'
                }`}
                title="Ver un día a la vez"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Por Día</span>
              </button>
              <button
                onClick={() => onViewModeChange('all')}
                className={`flex items-center gap-1 px-2.5 py-1 font-semibold rounded-xl transition-all ${
                  viewMode === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-rose-800 dark:text-rose-200 shadow-2xs font-bold'
                    : 'text-zinc-500 hover:text-rose-700'
                }`}
                title="Ver todas las tablas de los días"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Todos</span>
              </button>
            </div>

            {/* Categories Management Button */}
            <button
              onClick={onOpenCategoriesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all active:scale-98"
              title="Administrar, agregar y eliminar categorías"
            >
              <Tag className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
              <span>Categorías</span>
            </button>

            {/* Bulk Actions Button */}
            <button
              onClick={onOpenBulkModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all active:scale-98"
              title="Deshabilitar o habilitar horarios por rangos"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
              <span>Rangos</span>
            </button>

            {/* Export, Import, Reset */}
            <div className="flex items-center gap-1">
              <button
                onClick={onExport}
                className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Exportar respaldo JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Importar turnos desde JSON"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onReset}
                className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 hover:text-rose-900 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
                title="Restablecer valores predeterminados"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters Bar */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-rose-100 dark:border-rose-950 overflow-x-auto text-xs">
          <span className="text-rose-800/80 dark:text-rose-300/80 font-semibold mr-1">Filtrar:</span>
          
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1 rounded-xl font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-zinc-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => onStatusFilterChange('disponible')}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl font-semibold transition-all ${
              statusFilter === 'disponible'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Disponibles
          </button>

          <button
            onClick={() => onStatusFilterChange('ocupado')}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl font-semibold transition-all ${
              statusFilter === 'ocupado'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Ocupados
          </button>

          <button
            onClick={() => onStatusFilterChange('deshabilitado')}
            className={`flex items-center gap-1 px-3 py-1 rounded-xl font-semibold transition-all ${
              statusFilter === 'deshabilitado'
                ? 'bg-zinc-700 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Deshabilitados
          </button>
        </div>
      </div>
    </header>
  );
};
