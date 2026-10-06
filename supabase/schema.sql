-- ════════════════════════════════════════════════════════════════════════════
--  Cerrojo — esquema de base de datos (Supabase / PostgreSQL)
--  Ejecutar una vez en: Supabase Dashboard → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════════════════

-- Perfil público de cada usuario (1:1 con auth.users).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) between 2 and 80),
  bio         text not null default '' check (char_length(bio) <= 280),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de usuario. Protegido con RLS: cada usuario solo ve y edita el suyo.';

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Con RLS activado, la clave publishable (pública) no da acceso a ningún dato
-- que no autoricen explícitamente las políticas.
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No hay políticas de INSERT ni DELETE: los perfiles los crea el trigger y se borran en cascada.

-- El rol anónimo no tiene ningún permiso sobre la tabla.
revoke all on public.profiles from anon;
-- Los usuarios autenticados solo pueden leer y modificar las columnas editables.
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, bio) on public.profiles to authenticated;

-- ── updated_at automático ───────────────────────────────────────────────────
create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.tocar_updated_at();

-- ── Crear el perfil al registrarse ──────────────────────────────────────────
-- security definer + search_path vacío: se ejecuta con permisos del dueño, sin
-- riesgo de que un esquema malicioso intercepte las referencias.
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nombre text := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
begin
  if nombre is not null and char_length(nombre) not between 2 and 80 then
    nombre := left(nombre, 80);
    if char_length(nombre) < 2 then nombre := null; end if;
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, nombre)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.crear_perfil_nuevo_usuario() from public, anon, authenticated;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();
