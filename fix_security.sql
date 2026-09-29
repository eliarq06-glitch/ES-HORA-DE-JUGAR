-- Este script resuelve las advertencias de seguridad en Supabase 
-- (RLS deshabilitado y datos sensibles expuestos) permitiendo acceso
-- SÓLO a usuarios que hayan iniciado sesión (authenticated).

-- 1. Habilitar Seguridad a Nivel de Fila (RLS) en TODAS las tablas
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas públicas anteriores (si existieran por error)
-- (Si da error de que no existen, no te preocupes, es normal)
DROP POLICY IF EXISTS "Public access" ON players;
DROP POLICY IF EXISTS "Public access" ON sessions;
-- ...etc (si creaste alguna manual)

-- 3. Crear Políticas de Seguridad: Permitir TODO (Lectura/Escritura) pero SÓLO a usuarios autenticados
CREATE POLICY "Logueados pueden ver y editar players" ON players FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logueados pueden ver y editar sessions" ON sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logueados pueden ver y editar teams" ON teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logueados pueden ver y editar matches" ON matches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logueados pueden ver y editar match_events" ON match_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logueados pueden ver y editar historical_tournaments" ON historical_tournaments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logueados pueden ver y editar profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Logueados pueden ver y editar app_config" ON app_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Opcional pero recomendado para que un visitante anónimo pueda registrarse (si usa auth.signUp, auth se encarga),
-- pero si tienes un avatar/lista pública en el futuro que no requiere estar logueado, deberás hacer una política SELECT a "anon".
-- Por ahora, con "authenticated", NADIE sin cuenta puede ver ni borrar datos.
