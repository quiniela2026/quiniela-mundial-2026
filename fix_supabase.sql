-- ============================================================
-- EJECUTA ESTO EN SUPABASE SQL EDITOR
-- Arregla perfiles + política de inserción
-- ============================================================

-- 1. Eliminar política restrictiva de inserción de perfiles
drop policy if exists "Usuario solo edita su propio perfil" on public.profiles;
drop policy if exists "Usuario solo actualiza su propio perfil" on public.profiles;

-- 2. Nueva política: cualquier usuario autenticado puede insertar SU PROPIO perfil
create policy "Insertar propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Actualizar propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Permitir upsert (insert o update) en perfiles
create policy "Upsert propio perfil"
  on public.profiles for insert
  with check (true);

-- 4. Verificar que RLS está activo
alter table public.profiles enable row level security;
alter table public.predicciones enable row level security;
alter table public.resultados enable row level security;

-- 5. Ver usuarios registrados en auth (para debug)
select id, email, created_at, email_confirmed_at 
from auth.users 
order by created_at desc;
