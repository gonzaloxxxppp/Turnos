-- ==============================================================================
-- SISTEMA DE GESTIÓN DE TURNOS MULTI-CUENTA - ESQUEMA RELACIONAL PARA SUPABASE
-- ==============================================================================

-- 1. Tabla: Perfiles y Cuentas de Organizaciones (profiles)
create table if not exists public.profiles (
  id text primary key, -- ID de auth.users o uuid de cuenta
  email text not null,
  name text not null,        -- Nombre del titular / profesional
  org_name text not null,    -- Nombre de la organización / estudio / consultorio
  slug text unique,          -- Identificador amigable para URL
  bio text default '',       -- Descripción de la organización y servicios
  avatar_url text default '',-- Foto o avatar
  phone text default '',     -- Teléfono / WhatsApp de contacto
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla: Configuración de Horarios por Cuenta (schedule_config)
create table if not exists public.schedule_config (
  id text primary key default 'default', -- ID de la cuenta o 'default'
  account_id text default 'default',
  start_hour text not null default '14:00',
  end_hour text not null default '20:00',
  interval_minutes integer not null default 15 check (interval_minutes in (15, 20, 25, 30, 45)),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabla: Categorías Dinámicas (categories)
create table if not exists public.categories (
  id text primary key,
  account_id text default 'default',
  name text not null,
  color text not null default 'rose',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabla: Días del Calendario (days)
create table if not exists public.days (
  date_key text primary key, -- Formato ISO: YYYY-MM-DD
  day_name text not null,
  formatted_date text not null,
  is_sunday boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabla: Turnos de Horario por Cuenta (slots)
create table if not exists public.slots (
  id text primary key, -- Formato: 'accountId_YYYY-MM-DD_HH:MM' o 'YYYY-MM-DD_HH:MM'
  account_id text default 'default',
  date_key text not null,
  slot_id text not null,  -- '14:00'
  start_time text not null, -- '14:00'
  end_time text not null,   -- '14:15'
  status text not null default 'disponible' check (status in ('disponible', 'ocupado', 'deshabilitado')),
  client_name text default '',
  client_phone text default '',
  description text default '',
  category_id text references public.categories(id) on delete set null on update cascade,
  category text default '',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices de consulta rápida
create index if not exists idx_slots_account_id on public.slots(account_id);
create index if not exists idx_slots_date_key on public.slots(date_key);
create index if not exists idx_slots_status on public.slots(status);
create index if not exists idx_profiles_slug on public.profiles(slug);

-- ==============================================================================
-- SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.schedule_config enable row level security;
alter table public.categories enable row level security;
alter table public.days enable row level security;
alter table public.slots enable row level security;

-- Políticas de lectura pública (cualquier persona puede ver organizaciones y sus turnos)
create policy "Permitir lectura publica de perfiles" on public.profiles for select using (true);
create policy "Permitir modificacion de perfiles" on public.profiles for all using (true) with check (true);

create policy "Permitir lectura publica de schedule_config" on public.schedule_config for select using (true);
create policy "Permitir modificacion de schedule_config" on public.schedule_config for all using (true) with check (true);

create policy "Permitir lectura publica de categories" on public.categories for select using (true);
create policy "Permitir modificacion de categories" on public.categories for all using (true) with check (true);

create policy "Permitir lectura publica de days" on public.days for select using (true);
create policy "Permitir modificacion de days" on public.days for all using (true) with check (true);

create policy "Permitir lectura publica de slots" on public.slots for select using (true);
create policy "Permitir modificacion de slots" on public.slots for all using (true) with check (true);
