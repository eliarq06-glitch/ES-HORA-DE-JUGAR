-- ============================================
-- EHDJ - Es Hora de Jugar - Schema SQL
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- 1. JUGADORES
create table if not exists players (
  id bigint primary key,
  first_name text not null,
  last_name text default '',
  nickname text default '',
  ratings jsonb default '[]',
  historical_goals int default 0,
  historical_assists int default 0,
  historical_fouls int default 0,
  historical_championships int default 0,
  created_at timestamptz default now()
);

-- 2. JORNADAS/SESIONES
create table if not exists sessions (
  id bigint primary key,
  name text not null,
  date text,
  confirmed_ids jsonb default '[]',
  status text default 'open',
  pitch_cost numeric default 0,
  player_cost numeric default 0,
  payments jsonb default '[]',
  is_closed boolean default false,
  created_at timestamptz default now()
);

-- 3. EQUIPOS
create table if not exists teams (
  id bigint primary key,
  name text not null,
  captain_id bigint,
  players jsonb default '[]',
  color text default '#ccff00',
  created_at timestamptz default now()
);

-- 4. PARTIDOS (FIXTURE)
create table if not exists matches (
  id bigint primary key,
  team1_id bigint,
  team2_id bigint,
  status text default 'pending',
  is_final boolean default false,
  created_at timestamptz default now()
);

-- 5. EVENTOS DE PARTIDO (VAR)
create table if not exists match_events (
  id bigint primary key,
  match_id bigint,
  type text,
  player jsonb,
  team text,
  details text default '',
  time_string text default '00:00',
  timestamp_str text,
  created_at timestamptz default now()
);

-- 6. HISTORIAL DE TORNEOS
create table if not exists historical_tournaments (
  id bigint primary key,
  session_id bigint,
  session_name text,
  date text,
  champion_team jsonb,
  teams jsonb,
  matches jsonb,
  match_events jsonb,
  mvp_votes jsonb default '{}',
  saved_at timestamptz default now()
);

-- 7. CONFIGURACION GLOBAL (active session, mvp votes, etc.)
create table if not exists app_config (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- ============================================
-- DESHABILITAR ROW LEVEL SECURITY (acceso público)
-- ============================================
alter table players disable row level security;
alter table sessions disable row level security;
alter table teams disable row level security;
alter table matches disable row level security;
alter table match_events disable row level security;
alter table historical_tournaments disable row level security;
alter table app_config disable row level security;

-- ============================================
-- HABILITAR REALTIME en todas las tablas
-- ============================================
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table match_events;
alter publication supabase_realtime add table historical_tournaments;
alter publication supabase_realtime add table app_config;

-- ============================================
-- DATOS INICIALES - 24 Jugadores Mock
-- ============================================
insert into players (id, first_name, last_name, nickname) values
(1, 'Alex', 'García', 'La Bala'),
(2, 'Juan', 'Pérez', 'El Muro'),
(3, 'Carlos', 'López', 'El Mago'),
(4, 'Luis', 'Martínez', 'Rayo'),
(5, 'Andrés', 'Silva', 'Capi'),
(6, 'Diego', 'Ruiz', 'Tanque'),
(7, 'Fernando', 'Gómez', 'Motor'),
(8, 'Gabriel', 'Torres', 'Araña'),
(9, 'Hugo', 'Flores', 'Hacha'),
(10, 'Javier', 'Díaz', 'Chita'),
(11, 'Kevin', 'Rojas', 'Flash'),
(12, 'Leo', 'Vargas', 'Pulga'),
(13, 'Mario', 'Morales', 'Káiser'),
(14, 'Nico', 'Castro', 'Ninja'),
(15, 'Oscar', 'Ortiz', 'Toro'),
(16, 'Pablo', 'Reyes', 'Mago'),
(17, 'Roberto', 'Mendoza', 'Cañón'),
(18, 'Sergio', 'Castillo', 'Muro'),
(19, 'Tomás', 'Peña', 'Locomotora'),
(20, 'Víctor', 'Herrera', 'Depredador'),
(21, 'Walter', 'Medina', 'Tanque'),
(22, 'Xavier', 'Aguilar', 'Xavi'),
(23, 'Yair', 'Suárez', 'Pantera'),
(24, 'Zacarías', 'Ríos', 'Zaca')
on conflict (id) do nothing;

-- Jornada inicial
insert into sessions (id, name, date, confirmed_ids, status)
values (1, 'Jornada Inaugural', '2026-08-11', '[1,2,3,4,5,6,7,8,9,10]', 'open')
on conflict (id) do nothing;

-- Configuración: sesión activa
insert into app_config (key, value) values ('activeSessionId', '1')
on conflict (key) do update set value = excluded.value;
