-- =============================================================================
-- 013_fix_user_delete_cascade.sql
-- Asegura que borrar un usuario de auth.users elimina en cascada todos sus datos.
-- Ejecuta este script en Supabase → SQL Editor → New query → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Recrear el FK de almuerzos.user_id con ON DELETE CASCADE
--    (por si la migración 002 se saltó el constraint al existir ya la columna)
-- -----------------------------------------------------------------------------
do $$
begin
  -- Eliminar el FK actual si existe (con cualquier nombre)
  perform 1
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
  where tc.table_schema = 'public'
    and tc.table_name   = 'almuerzos'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'user_id';

  if found then
    -- Obtener el nombre real del constraint y eliminarlo
    declare
      v_name text;
    begin
      select tc.constraint_name into v_name
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on tc.constraint_name = kcu.constraint_name
      where tc.table_schema = 'public'
        and tc.table_name   = 'almuerzos'
        and tc.constraint_type = 'FOREIGN KEY'
        and kcu.column_name = 'user_id'
      limit 1;

      execute format('alter table public.almuerzos drop constraint %I', v_name);
    end;
  end if;
end;
$$;

alter table public.almuerzos
  add constraint almuerzos_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

-- -----------------------------------------------------------------------------
-- 2. Recrear el FK de profiles.id con ON DELETE CASCADE
-- -----------------------------------------------------------------------------
do $$
declare
  v_name text;
begin
  select tc.constraint_name into v_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
  where tc.table_schema = 'public'
    and tc.table_name   = 'profiles'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'id'
  limit 1;

  if v_name is not null then
    execute format('alter table public.profiles drop constraint %I', v_name);
  end if;
end;
$$;

alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

-- -----------------------------------------------------------------------------
-- 3. Función de limpieza explícita antes de borrar el usuario
--    (segunda línea de defensa: borra fotos de Storage y datos del usuario)
-- -----------------------------------------------------------------------------
create or replace function public.handle_user_deletion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Borrar almuerzos (las fotos de Storage se borran por la app o manualmente)
  delete from public.almuerzos where user_id = old.id;
  -- Borrar perfil
  delete from public.profiles where id = old.id;
  return old;
end;
$$;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  before delete on auth.users
  for each row execute procedure public.handle_user_deletion();

-- -----------------------------------------------------------------------------
-- 4. Verificación: mostrar los FK actuales de ambas tablas
-- -----------------------------------------------------------------------------
select
  tc.table_name,
  kcu.column_name,
  rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.referential_constraints rc
  on tc.constraint_name = rc.constraint_name
where tc.table_schema = 'public'
  and tc.table_name in ('almuerzos', 'profiles')
  and tc.constraint_type = 'FOREIGN KEY'
order by tc.table_name, kcu.column_name;
