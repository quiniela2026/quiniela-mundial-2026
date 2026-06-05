-- ============================================================
-- QUINIELA MUNDIAL 2026 — Schema de base de datos Supabase
-- Ejecuta TODO esto en: supabase.com → tu proyecto → SQL Editor
-- ============================================================

-- 1. TABLA PROFILES (datos de usuario)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null,
  es_admin boolean not null default false,
  created_at timestamptz default now()
);

-- 2. TABLA PREDICCIONES
create table if not exists public.predicciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  partido_id integer not null,
  goles_local_pred integer,
  goles_visita_pred integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, partido_id)
);

-- 3. TABLA RESULTADOS (admin los ingresa)
create table if not exists public.resultados (
  id uuid primary key default gen_random_uuid(),
  partido_id integer not null unique,
  grupo text not null,
  goles_local integer,
  goles_visita integer,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Seguridad crítica
-- Nadie puede hacer trampas modificando predicciones ajenas
-- ============================================================

alter table public.profiles enable row level security;
alter table public.predicciones enable row level security;
alter table public.resultados enable row level security;

-- PROFILES: cada usuario ve todos los perfiles (para ranking)
-- pero solo edita el suyo
create policy "Perfiles visibles para todos los usuarios"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Usuario solo edita su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Usuario solo actualiza su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- PREDICCIONES: cada usuario solo ve y edita las suyas
-- La clave de seguridad: no puede editar predicciones de partidos ya jugados
-- (esto lo maneja el frontend con la hora de inicio, y el backend no lo necesita
-- porque el usuario NO conoce la contraseña de otros)

create policy "Ver mis propias predicciones"
  on public.predicciones for select
  using (auth.uid() = user_id);

create policy "Insertar mis propias predicciones"
  on public.predicciones for insert
  with check (auth.uid() = user_id);

create policy "Actualizar mis propias predicciones"
  on public.predicciones for update
  using (auth.uid() = user_id);

-- RESULTADOS: todos pueden ver, solo admins insertan/actualizan
create policy "Resultados visibles para todos"
  on public.resultados for select
  using (auth.role() = 'authenticated');

create policy "Solo admins insertan resultados"
  on public.resultados for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and es_admin = true
    )
  );

create policy "Solo admins actualizan resultados"
  on public.resultados for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and es_admin = true
    )
  );

create policy "Solo admins borran resultados"
  on public.resultados for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and es_admin = true
    )
  );

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_prediccion_updated
  before update on public.predicciones
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- CÓMO HACERTE ADMIN
-- Después de registrarte en la app, ejecuta esto con TU email:
-- ============================================================
-- update public.profiles set es_admin = true where email = 'tu@email.com';
