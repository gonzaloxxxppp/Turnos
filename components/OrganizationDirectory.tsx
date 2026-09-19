'use client';

import React, { useState, useMemo } from 'react';
import { UserProfile } from '@/types/appointments';
import { 
  Building2, 
  Search, 
  User, 
  CalendarDays, 
  ArrowRight, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  UserPlus,
  Clock
} from 'lucide-react';

interface OrganizationDirectoryProps {
  organizations: UserProfile[];
  currentUser: UserProfile | null;
  onSelectOrganization: (org: UserProfile) => void;
  onOpenRegister: () => void;
  onGoToMyDashboard: () => void;
}

export const OrganizationDirectory: React.FC<OrganizationDirectoryProps> = ({
  organizations,
  currentUser,
  onSelectOrganization,
  onOpenRegister,
  onGoToMyDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrgs = useMemo(() => {
    if (!searchQuery.trim()) return organizations;
    const q = searchQuery.toLowerCase();
    return organizations.filter(
      (org) =>
        org.orgName.toLowerCase().includes(q) ||
        org.name.toLowerCase().includes(q) ||
        (org.bio && org.bio.toLowerCase().includes(q))
    );
  }, [organizations, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-900 via-rose-800 to-zinc-950 text-white p-8 sm:p-10 shadow-xl border border-rose-700/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistema Integral de Cuentas y Agendas</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Encuentra y Consulta los Turnos de Cada Organización
          </h2>

          <p className="text-sm sm:text-base text-rose-100/80 leading-relaxed max-w-2xl">
            Cada cuenta posee sus propios turnos y horarios configurados. Explora el directorio de profesionales y organizaciones para ver su disponibilidad y reservar tu turno.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {currentUser ? (
              <button
                onClick={onGoToMyDashboard}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-rose-950 font-bold text-xs sm:text-sm hover:bg-rose-50 transition-all shadow-lg active:scale-98"
              >
                <CalendarDays className="w-4 h-4 text-rose-700" />
                <span>Ir a Gestionar Mi Agenda ({currentUser.orgName})</span>
                <ArrowRight className="w-4 h-4 text-rose-700" />
              </button>
            ) : (
              <button
                onClick={onOpenRegister}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-rose-950 font-bold text-xs sm:text-sm hover:bg-rose-50 transition-all shadow-lg active:scale-98"
              >
                <UserPlus className="w-4 h-4 text-rose-700" />
                <span>Crear Cuenta para Mi Organización</span>
                <ArrowRight className="w-4 h-4 text-rose-700" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-950 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por organización, profesional o servicio..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-rose-400/70 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="text-xs font-semibold text-rose-900/80 dark:text-rose-300/80 flex items-center gap-2">
          <span>{filteredOrgs.length} {filteredOrgs.length === 1 ? 'organización registrada' : 'organizaciones registradas'}</span>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => {
          const isMyOrg = currentUser?.id === org.id;

          return (
            <div
              key={org.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200/80 dark:border-rose-950 shadow-sm hover:shadow-md hover:border-rose-400 transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Card Header with Avatar & Org details */}
                <div className="p-5 border-b border-rose-100 dark:border-rose-950 bg-gradient-to-r from-rose-50/60 to-pink-50/30 dark:from-rose-950/20 dark:to-zinc-900">
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-rose-300 dark:border-rose-800 shadow-xs flex-shrink-0 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={org.avatarUrl || 'https://images.unsplash.com/photo-1594824813501-48c952b04757?auto=format&fit=crop&w=300&q=80'}
                        alt={org.orgName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                          Cuenta Verificada
                        </span>
                        {isMyOrg && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                            Mi Organización
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-white mt-1 truncate">
                        {org.orgName}
                      </h3>
                      <p className="text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-1 truncate mt-0.5">
                        <User className="w-3 h-3 text-rose-600 flex-shrink-0" />
                        <span>{org.name}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Description & Meta */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                    {org.bio || 'Consultorio y atención especializada con turnos y horarios programados.'}
                  </p>

                  {org.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      <Phone className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Action */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectOrganization(org)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-700 text-rose-900 hover:text-white dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-700 dark:hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-rose-700 group-hover:text-white shadow-xs active:scale-98"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Ver Turnos de {org.orgName}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrgs.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-rose-200 dark:border-rose-950 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              {searchQuery ? 'No se encontraron organizaciones con esa búsqueda' : '¡Aún no hay organizaciones registradas!'}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {searchQuery
                ? 'Prueba modificando los términos de búsqueda.'
                : 'Sé el primero en registrar tu cuenta u organización para comenzar a publicar y gestionar tus turnos.'}
            </p>
          </div>
          {!currentUser && !searchQuery && (
            <div>
              <button
                onClick={onOpenRegister}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md shadow-rose-900/25 transition-all active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrar Mi Organización</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
