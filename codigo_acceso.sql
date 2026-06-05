-- Ejecuta esto en Supabase SQL Editor
-- Agrega tabla de configuración con código de acceso

create table if not exists public.configuracion (
  clave text primary key,
  valor text not null,
  updated_at timestamptz default now()
);

alter table public.configuracion enable row level security;

-- Todos los usuarios autenticados pueden leer la config
create policy "config_select" on public.configuracion
  for select using (auth.role() = 'authenticated');

-- Solo admins pueden modificar
create policy "config_update" on public.configuracion
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

create policy "config_insert" on public.configuracion
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

-- Insertar código de acceso por defecto (cámbialo después desde el panel Admin)
insert into public.configuracion (clave, valor)
values ('codigo_acceso', 'MUNDIAL2026')
on conflict (clave) do nothing;

-- También agregar campo codigo_usado en profiles para saber quién entró con código
alter table public.profiles 
  add column if not exists codigo_usado text;

select * from public.configuracion;
