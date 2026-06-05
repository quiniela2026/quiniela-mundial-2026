-- ============================================================
-- FIX TOTAL — Ejecuta esto completo en SQL Editor
-- ============================================================

-- 1. Eliminar TODAS las políticas existentes para empezar limpio
drop policy if exists "Perfiles visibles para todos los usuarios" on public.profiles;
drop policy if exists "Usuario solo edita su propio perfil" on public.profiles;
drop policy if exists "Usuario solo actualiza su propio perfil" on public.profiles;
drop policy if exists "Insertar propio perfil" on public.profiles;
drop policy if exists "Actualizar propio perfil" on public.profiles;
drop policy if exists "Upsert propio perfil" on public.profiles;

drop policy if exists "Ver mis propias predicciones" on public.predicciones;
drop policy if exists "Insertar mis propias predicciones" on public.predicciones;
drop policy if exists "Actualizar mis propias predicciones" on public.predicciones;

drop policy if exists "Resultados visibles para todos" on public.resultados;
drop policy if exists "Solo admins insertan resultados" on public.resultados;
drop policy if exists "Solo admins actualizan resultados" on public.resultados;
drop policy if exists "Solo admins borran resultados" on public.resultados;

-- 2. PROFILES — políticas limpias
create policy "profiles_select" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- 3. PREDICCIONES — políticas limpias
-- SELECT: cada usuario ve TODAS las predicciones (necesario para ranking)
create policy "predicciones_select" on public.predicciones
  for select using (auth.role() = 'authenticated');

-- INSERT: solo tu propia predicción
create policy "predicciones_insert" on public.predicciones
  for insert with check (auth.uid() = user_id);

-- UPDATE: solo tu propia predicción
create policy "predicciones_update" on public.predicciones
  for update using (auth.uid() = user_id);

-- DELETE: solo tu propia predicción
create policy "predicciones_delete" on public.predicciones
  for delete using (auth.uid() = user_id);

-- 4. RESULTADOS — políticas limpias
create policy "resultados_select" on public.resultados
  for select using (auth.role() = 'authenticated');

create policy "resultados_insert" on public.resultados
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

create policy "resultados_update" on public.resultados
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

create policy "resultados_delete" on public.resultados
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

-- 5. Verificar que RLS está activo
alter table public.profiles enable row level security;
alter table public.predicciones enable row level security;
alter table public.resultados enable row level security;

-- 6. Confirmar todo OK
select 
  schemaname, tablename, policyname, cmd
from pg_policies 
where schemaname = 'public'
order by tablename, cmd;
