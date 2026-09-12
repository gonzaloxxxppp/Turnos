-- ==============================================================================
-- SISTEMA DE GESTIÓN DE TURNOS - ESQUEMA RELACIONAL PARA SUPABASE (POSTGRESQL)
-- ==============================================================================

-- 1. Tabla: Configuración Global de Horarios (schedule_config)
create table if not exists public.schedule_config (
  id text primary key default 'default',
  start_hour text not null default '14:00',
  end_hour text not null default '20:00',
  interval_minutes integer not null default 15,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insertar configuración inicial predeterminada
insert into public.schedule_config (id, start_hour, end_hour, interval_minutes)
values ('default', '14:00', '20:00', 15)
on conflict (id) do update 
set updated_at = timezone('utc'::text, now());

-- 2. Tabla: Categorías Dinámicas (categories)
-- Paleta en tonos oscuros (rose, fuchsia, purple, violet, pink, etc.)
create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  color text not null default 'rose',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categorías por defecto del sistema
insert into public.categories (id, name, color)
values
  ('cat-1', 'Consulta General', 'rose'),
  ('cat-2', 'Evaluación', 'fuchsia'),
  ('cat-3', 'Tratamiento', 'purple'),
  ('cat-4', 'Control', 'violet'),
  ('cat-5', 'Prioritario', 'pink')
on conflict (id) do nothing;

-- 3. Tabla: Días del Calendario (days)
-- Relación Maestro (1 a N con slots)
create table if not exists public.days (
  date_key text primary key, -- Formato ISO: YYYY-MM-DD (ej: '2026-09-07')
  day_name text not null,     -- 'Lunes', 'Martes', 'Domingo', etc.
  formatted_date text not null, -- '07 Sep 2026'
  is_sunday boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabla: Turnos de Horario (slots)
-- Relaciones:
--   - Foreign Key 'date_key' -> days(date_key) [ON DELETE CASCADE]
--   - Foreign Key 'category_id' -> categories(id) [ON DELETE SET NULL ON UPDATE CASCADE]
create table if not exists public.slots (
  id text primary key, -- Clave primaria: 'YYYY-MM-DD_HH:MM' (ej: '2026-09-07_14:00')
  date_key text not null references public.days(date_key) on delete cascade on update cascade,
  slot_id text not null,  -- '14:00'
  start_time text not null, -- '14:00'
  end_time text not null,   -- '14:15'
  status text not null default 'disponible' check (status in ('disponible', 'ocupado', 'deshabilitado')),
  client_name text default '',
  description text default '',
  category_id text references public.categories(id) on delete set null on update cascade,
  category text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint slots_date_slot_unique unique (date_key, slot_id)
);

-- Índices relacionales para máxima velocidad de consulta y ordenamiento
create index if not exists idx_slots_date_key on public.slots(date_key);
create index if not exists idx_slots_category_id on public.slots(category_id);
create index if not exists idx_slots_status on public.slots(status);
create index if not exists idx_slots_start_time on public.slots(start_time);
create index if not exists idx_days_is_sunday on public.days(is_sunday);

-- ==============================================================================
-- SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

alter table public.schedule_config enable row level security;
alter table public.categories enable row level security;
alter table public.days enable row level security;
alter table public.slots enable row level security;

-- Políticas para schedule_config
drop policy if exists "Permitir lectura publica de schedule_config" on public.schedule_config;
create policy "Permitir lectura publica de schedule_config"
  on public.schedule_config for select using (true);

drop policy if exists "Permitir modificacion de schedule_config" on public.schedule_config;
create policy "Permitir modificacion de schedule_config"
  on public.schedule_config for all using (true) with check (true);

-- Políticas para categories
drop policy if exists "Permitir lectura publica de categories" on public.categories;
create policy "Permitir lectura publica de categories"
  on public.categories for select using (true);

drop policy if exists "Permitir modificacion de categories" on public.categories;
create policy "Permitir modificacion de categories"
  on public.categories for all using (true) with check (true);

-- Políticas para days
drop policy if exists "Permitir lectura publica de days" on public.days;
create policy "Permitir lectura publica de days"
  on public.days for select using (true);

drop policy if exists "Permitir modificacion de days" on public.days;
create policy "Permitir modificacion de days"
  on public.days for all using (true) with check (true);

-- Políticas para slots
drop policy if exists "Permitir lectura publica de slots" on public.slots;
create policy "Permitir lectura publica de slots"
  on public.slots for select using (true);

drop policy if exists "Permitir modificacion de slots" on public.slots;
create policy "Permitir modificacion de slots"
  on public.slots for all using (true) with check (true);
