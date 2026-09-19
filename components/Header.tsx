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
  Database,
  Building2,
  User,
  LogIn,
  LogOut,
  UserPlus,
  ArrowLeft,
  Settings,
  Sparkles
} from 'lucide-react';
import { SlotStatus, ScheduleConfig, UserProfile } from '@/types/appointments';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeOrganization: UserProfile | null;
  currentView: 'directory' | 'schedule' | 'management';
  onNavigateToDirectory: () => void;
  onNavigateToManagement: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenProfileModal: () => void;
  onLogout: () => void;
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
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeOrganization,
  currentView,
  onNavigateToDirectory,
  onNavigateToManagement,
  onOpenLogin,
  onOpenRegister,
  onOpenProfileModal,
  onLogout,
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
  isAdmin = false,
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

  const isScheduleOrManagement = currentView === 'schedule' || currentView === 'management';

  return (
    <header className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-rose-200 dark:border-rose-950 shadow-2xs sticky top-0 z-30">
      {/* Top Bar: Brand, Session & Global Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-b border-rose-100/70 dark:border-rose-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Directory Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToDirectory}
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left"
            >
              <div className="w-9 h-9 rounded-2xl bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-900/25">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-rose-950 dark:text-rose-100 leading-tight">
                  Hakim Turnos
                </h1>
                <p className="text-[10px] text-rose-800/80 dark:text-rose-300/80 font-medium">
                  Gestión de Turnos & Organizaciones
                </p>
              </div>
            </button>

            <button
              onClick={onNavigateToDirectory}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-2xl transition-all ${
                currentView === 'directory'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                  : 'text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-rose-700" />
              <span>Directorio Principal</span>
            </button>
          </div>

          {/* Account Status / Auth Actions */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Active user profile pill */}
                <button
                  onClick={onOpenProfileModal}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-zinc-800 hover:bg-rose-100/70 transition-all text-left"
                  title="Editar perfil y foto"
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden border border-rose-300 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1594824813501-48c952b04757?auto=format&fit=crop&w=300&q=80'}
                      alt={currentUser.orgName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight truncate max-w-[140px]">
                      {currentUser.orgName}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight truncate max-w-[140px]">
                      {currentUser.name}
                    </p>
                  </div>
                </button>

                {/* Switch to My Dashboard / Agenda */}
                {currentView !== 'management' ? (
                  <button
                    onClick={onNavigateToManagement}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-2xl bg-rose-700 hover:bg-rose-800 text-white shadow-md shadow-rose-900/20 active:scale-98 transition-all"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mi Panel de Gestión</span>
                    <span className="sm:hidden">Mi Agenda</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                    Modo Administración
                  </span>
                )}

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-2xl text-rose-900 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-zinc-800 border border-rose-200 dark:border-rose-900 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  onClick={onOpenRegister}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-2xl text-white bg-rose-700 hover:bg-rose-800 shadow-md shadow-rose-900/20 active:scale-98 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Specific Context (Schedule Controls, Filters, Organization Title) */}
      {isScheduleOrManagement && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
            {/* Organization Info Banner */}
            <div className="flex items-center gap-3">
              <button
                onClick={onNavigateToDirectory}
                className="p-2 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-700 hover:bg-rose-50 transition-colors"
                title="Volver al Directorio de Organizaciones"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-rose-300 dark:border-rose-800 shadow-xs flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    activeOrganization?.avatarUrl ||
                    'https://images.unsplash.com/photo-1594824813501-48c952b04757?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={activeOrganization?.orgName || 'Organización'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white leading-tight">
                    {activeOrganization?.orgName || 'Organización'}
                  </h2>
                  {isAdmin && (
                    <span className="text-[10px] uppercase tracking-wider bg-rose-700 text-white px-2 py-0.5 rounded-full font-bold">
                      Propietario
                    </span>
                  )}
                </div>
                <p className="text-xs text-rose-800/90 dark:text-rose-300/90 font-medium">
                  Titular: {activeOrganization?.name || 'Profesional'} • Turnos de {scheduleConfig.intervalMinutes || 15} min
                </p>
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
                  placeholder="Buscar turno..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-rose-400/70 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Custom Schedule Trigger Button (Admin only) */}
              {isAdmin && (
                <button
                  onClick={onOpenScheduleConfigModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-100/70 dark:bg-rose-950/50 text-rose-950 dark:text-rose-100 hover:bg-rose-200/80 dark:hover:bg-rose-900/60 shadow-2xs transition-all active:scale-98"
                  title="Configurar horario de atención y duración del turno"
                >
                  <Clock className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
                  <span>{scheduleConfig.startHour} - {scheduleConfig.endHour} ({scheduleConfig.intervalMinutes}m)</span>
                  <span className="text-[10px] uppercase tracking-wider bg-rose-700 text-white px-1.5 py-0.5 rounded-md font-bold ml-0.5">
                    Cambiar
                  </span>
                </button>
              )}

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
                  title="Ver todas las tablas de la semana"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Todos</span>
                </button>
              </div>

              {/* Admin Actions: Categories & Bulk */}
              {isAdmin && (
                <>
                  <button
                    onClick={onOpenCategoriesModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all active:scale-98"
                    title="Administrar categorías"
                  >
                    <Tag className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
                    <span>Categorías</span>
                  </button>

                  <button
                    onClick={onOpenBulkModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 shadow-2xs transition-all active:scale-98"
                    title="Deshabilitar o habilitar por rangos"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300" />
                    <span>Rangos</span>
                  </button>
                </>
              )}

              {/* Export, Import, Reset */}
              {isAdmin && (
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
                    title="Restablecer turnos predeterminados"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
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
      )}
    </header>
  );
};
