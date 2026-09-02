import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================
// useSupabaseTable - Hook genérico para sincronizar con Supabase
// Mantiene compatibilidad con la API de useLocalStorage
// ============================================================
export function useSupabaseTable(tableName, defaultValue = []) {
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem(`cache_${tableName}`);
    return cached ? JSON.parse(cached) : defaultValue;
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const orderByCol = tableName === 'historical_tournaments' ? 'saved_at' : 'created_at';
      const isAscending = tableName !== 'historical_tournaments';
      const { data: rows, error } = await supabase
        .from(tableName)
        .select('*')
        .order(orderByCol, { ascending: isAscending });

      if (error) throw error;

      if (rows) {
        const mappedData = mapFromDB(tableName, rows);
        setData(mappedData);
        localStorage.setItem(`cache_${tableName}`, JSON.stringify(mappedData));
      }
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err.message);
      const cached = localStorage.getItem(`cache_${tableName}`);
      if (cached) {
        console.log(`Loaded ${tableName} from offline cache`);
        setData(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Suscripción en tiempo real
    const subscription = supabase
      .channel(`realtime-${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData(); // Re-fetch al detectar cualquier cambio
      })
      .subscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [tableName]);

  // Función para actualizar los datos (reemplaza el setter de useState/localStorage)
  const setDataAndSync = useCallback(async (newValueOrFn) => {
    const newValue = typeof newValueOrFn === 'function' ? newValueOrFn(data) : newValueOrFn;
    
    // Bail out to prevent infinite loops if state hasn't changed
    if (newValue === data) return;
    
    // Update local state immediately (optimistic)
    setData(newValue);
    localStorage.setItem(`cache_${tableName}`, JSON.stringify(newValue));
    
    // Sync to Supabase
    await syncToDB(tableName, newValue);
  }, [tableName, data]);

  return [data, setDataAndSync, loading];
}

// ============================================================
// useSupabaseConfig - Para valores únicos (no arrays)
// ej: activeSessionId, mvpVotes, isMvpClosed
// ============================================================
export function useSupabaseConfig(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const cached = localStorage.getItem(`cache_config_${key}`);
    return cached ? JSON.parse(cached) : defaultValue;
  });

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase.from('app_config').select('value').eq('key', key).single();
      if (data) {
        let parsed = data.value;
        try { parsed = JSON.parse(data.value); } catch(e) {}
        setValue(parsed);
        localStorage.setItem(`cache_config_${key}`, JSON.stringify(parsed));
      } else if (error && error.code !== 'PGRST116') {
        console.error(`Error fetching config ${key}:`, error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfig();
    const sub = supabase.channel(`realtime-config-${key}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_config', filter: `key=eq.${key}` }, () => {
        fetchConfig();
      }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [key]);

  const updateConfig = async (newValue) => {
    setValue(newValue);
    localStorage.setItem(`cache_config_${key}`, JSON.stringify(newValue));
    const stringValue = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue);
    await supabase.from('app_config').upsert({ key, value: stringValue, updated_at: new Date() });
  };

  return [value, updateConfig];
}

// ============================================================
// Auth & Presence Hooks
// ============================================================

export function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("Supabase auth error:", error);
      setUser(session?.user || null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    }).catch(err => {
      console.error("Exception getting session:", err);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      } else if (error) {
        console.error("Supabase error fetching profile:", error);
      }
    } catch (err) {
      console.error("Exception fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return { user, profile, loading };
}

export function useSupabasePresence(userId, userName) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userId || !userName) return;

    const channel = supabase.channel('online-users', {
      config: { presence: { key: userId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.values(newState).map(u => u[0].userName);
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userName, onlineAt: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userName]);

  return onlineUsers;
}

// ============================================================
// Mappers: DB row format -> App format
// ============================================================
function mapFromDB(tableName, rows) {
  switch (tableName) {
    case 'players':
      return rows.map(r => ({
        id: r.id,
        firstName: r.first_name,
        lastName: r.last_name || '',
        nickname: r.nickname || '',
        position: r.position || 'MCO',
        ratings: r.ratings || [],
        historicalGoals: r.historical_goals || 0,
        historicalAssists: r.historical_assists || 0,
        historicalFouls: r.historical_fouls || 0,
        historicalChampionships: r.historical_championships || 0,
        email: r.email || '',
        photoUrl: r.photo_url || ''
      }));

    case 'sessions':
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        date: r.date,
        confirmedIds: r.confirmed_ids || [],
        status: r.status || 'open',
        pitchCost: r.pitch_cost || 0,
        playerCost: r.player_cost || 0,
        payments: r.payments || [],
        isClosed: r.is_closed || false
      }));

    case 'teams':
      return rows.map(r => ({
        id: r.id,
        name: r.name,
        captainId: r.captain_id,
        players: r.players || [],
        color: r.color || '#ccff00'
      }));

    case 'matches':
      return rows.map(r => ({
        id: r.id,
        team1Id: r.team1_id,
        team2Id: r.team2_id,
        status: r.status || 'pending',
        isFinal: r.is_final || false
      }));

    case 'match_events':
      return rows.map(r => ({
        id: r.id,
        matchId: r.match_id,
        type: r.type,
        player: r.player,
        team: r.team,
        details: r.details || '',
        timeString: r.time_string || '00:00',
        timestamp: r.timestamp_str || ''
      }));

    case 'historical_tournaments':
      return rows.map(r => ({
        id: r.id,
        sessionId: r.session_id,
        sessionName: r.session_name,
        date: r.date,
        championTeam: r.champion_team,
        teams: r.teams || [],
        matches: r.matches || [],
        matchEvents: r.match_events || [],
        mvpVotes: r.mvp_votes || {},
        savedAt: r.saved_at
      }));

    default:
      return rows;
  }
}

// ============================================================
// Sync: App format -> DB rows (upsert)
// ============================================================
async function syncToDB(tableName, items) {
  if (!Array.isArray(items)) return;
  
  // Para arrays vacíos, borramos todo el contenido de la tabla
  if (items.length === 0) {
    await supabase.from(tableName).delete().neq('id', 0);
    return;
  }

  const rows = mapToDB(tableName, items);
  
  if (rows.length === 0) return;

  // Upsert todos los registros
  const { error } = await supabase
    .from(tableName)
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: false });

  if (error) {
    console.error(`Supabase sync error for ${tableName}:`, error);
  }

  // Borrar registros que ya no existen (sincronización)
  const currentIds = rows.map(r => r.id);
  await supabase
    .from(tableName)
    .delete()
    .not('id', 'in', `(${currentIds.join(',')})`);
}

function mapToDB(tableName, items) {
  switch (tableName) {
    case 'players':
      return items.map(p => ({
        id: p.id,
        first_name: p.firstName,
        last_name: p.lastName || '',
        nickname: p.nickname || '',
        position: p.position || 'MCO',
        ratings: p.ratings || [],
        historical_goals: p.historicalGoals || 0,
        historical_assists: p.historicalAssists || 0,
        historical_fouls: p.historicalFouls || 0,
        historical_championships: p.historicalChampionships || 0,
        email: p.email || '',
        photo_url: p.photoUrl || ''
      }));

    case 'sessions':
      return items.map(s => ({
        id: s.id,
        name: s.name,
        date: s.date,
        confirmed_ids: s.confirmedIds || [],
        status: s.status || 'open',
        pitch_cost: s.pitchCost || 0,
        player_cost: s.playerCost || 0,
        payments: s.payments || [],
        is_closed: s.isClosed || false
      }));

    case 'teams':
      return items.map(t => ({
        id: t.id,
        name: t.name,
        captain_id: t.captainId || null,
        players: t.players || [],
        color: t.color || '#ccff00'
      }));

    case 'matches':
      return items.map(m => ({
        id: m.id,
        team1_id: m.team1Id,
        team2_id: m.team2Id,
        status: m.status || 'pending',
        is_final: m.isFinal || false
      }));

    case 'match_events':
      return items.map(e => ({
        id: e.id,
        match_id: e.matchId,
        type: e.type,
        player: e.player,
        team: e.team,
        details: e.details || '',
        time_string: e.timeString || '00:00',
        timestamp_str: e.timestamp || ''
      }));

    case 'historical_tournaments':
      return items.map(r => ({
        id: r.id,
        session_id: r.sessionId,
        session_name: r.sessionName,
        date: r.date,
        champion_team: r.championTeam,
        teams: r.teams || [],
        matches: r.matches || [],
        match_events: r.matchEvents || [],
        mvp_votes: r.mvpVotes || {},
        saved_at: r.savedAt || new Date().toISOString()
      }));

    default:
      return items;
  }
}
