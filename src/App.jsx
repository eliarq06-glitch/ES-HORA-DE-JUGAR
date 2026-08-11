import React, { useState } from 'react';
import { Trophy, LogOut, CheckSquare, Gamepad2, Award, Users as UsersIcon, BarChart3, CalendarDays, Star, Play, Crown, RotateCcw } from 'lucide-react';
import Confirm from './pages/Confirm';
import Login from './pages/Login';
import Draw from './pages/Draw';
import Match from './pages/Match';
import MVP from './pages/MVP';
import Players from './pages/Players';
import History from './pages/History';
import Sessions from './pages/Sessions';
import Ratings from './pages/Ratings';
import Tournament from './pages/Tournament';
import Champion from './pages/Champion';
import Finances from './pages/Finances';
import { DollarSign, Loader, Activity } from 'lucide-react';
import { useSupabaseTable, useSupabaseConfig, useSupabaseAuth, useSupabasePresence } from './hooks/useSupabase';
import { supabase } from './lib/supabase';

// 24 Mock Players
const MOCK_PLAYERS = [
  { id: 1, firstName: 'Alex', nickname: 'La Bala', lastName: 'García', ratings: [] },
  { id: 2, firstName: 'Juan', nickname: 'El Muro', lastName: 'Pérez', ratings: [] },
  { id: 3, firstName: 'Carlos', nickname: 'El Mago', lastName: 'López', ratings: [] },
  { id: 4, firstName: 'Luis', nickname: 'Rayo', lastName: 'Martínez', ratings: [] },
  { id: 5, firstName: 'Andrés', nickname: 'Capi', lastName: 'Silva', ratings: [] },
  { id: 6, firstName: 'Diego', nickname: 'Tanque', lastName: 'Ruiz', ratings: [] },
  { id: 7, firstName: 'Fernando', nickname: 'Motor', lastName: 'Gómez', ratings: [] },
  { id: 8, firstName: 'Gabriel', nickname: 'Araña', lastName: 'Torres', ratings: [] },
  { id: 9, firstName: 'Hugo', nickname: 'Hacha', lastName: 'Flores', ratings: [] },
  { id: 10, firstName: 'Javier', nickname: 'Chita', lastName: 'Díaz', ratings: [] },
  { id: 11, firstName: 'Kevin', nickname: 'Flash', lastName: 'Rojas', ratings: [] },
  { id: 12, firstName: 'Leo', nickname: 'Pulga', lastName: 'Vargas', ratings: [] },
  { id: 13, firstName: 'Mario', nickname: 'Káiser', lastName: 'Morales', ratings: [] },
  { id: 14, firstName: 'Nico', nickname: 'Ninja', lastName: 'Castro', ratings: [] },
  { id: 15, firstName: 'Oscar', nickname: 'Toro', lastName: 'Ortiz', ratings: [] },
  { id: 16, firstName: 'Pablo', nickname: 'Mago', lastName: 'Reyes', ratings: [] },
  { id: 17, firstName: 'Roberto', nickname: 'Cañón', lastName: 'Mendoza', ratings: [] },
  { id: 18, firstName: 'Sergio', nickname: 'Muro', lastName: 'Castillo', ratings: [] },
  { id: 19, firstName: 'Tomás', nickname: 'Locomotora', lastName: 'Peña', ratings: [] },
  { id: 20, firstName: 'Víctor', nickname: 'Depredador', lastName: 'Herrera', ratings: [] },
  { id: 21, firstName: 'Walter', nickname: 'Tanque', lastName: 'Medina', ratings: [] },
  { id: 22, firstName: 'Xavier', nickname: 'Xavi', lastName: 'Aguilar', ratings: [] },
  { id: 23, firstName: 'Yair', nickname: 'Pantera', lastName: 'Suárez', ratings: [] },
  { id: 24, firstName: 'Zacarías', nickname: 'Zaca', lastName: 'Ríos', ratings: [] }
];

function App() {
  const [route, setRoute] = useState('confirm');
  
  // Auth & Presence
  const { user, profile, loading: authLoading } = useSupabaseAuth();
  const onlineUsers = useSupabasePresence(user?.id, profile?.full_name);
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'global_admin';
  const isGlobalAdmin = profile?.role === 'global_admin';
  
  // Datos sincronizados con Supabase en tiempo real
  const [playersDB, setPlayersDB, loadingPlayers] = useSupabaseTable('players', []);
  const [sessions, setSessions, loadingSessions] = useSupabaseTable('sessions', []);
  const [activeSessionId, setActiveSessionId] = useSupabaseConfig('activeSessionId', 1);
  const [initialFund, setInitialFund] = useSupabaseConfig('initialFund', 0);
  const [teams, setTeams] = useSupabaseTable('teams', []);
  const [matchEvents, setMatchEvents] = useSupabaseTable('match_events', []);
  const [matches, setMatches] = useSupabaseTable('matches', []);
  const [historicalTournaments, setHistoricalTournaments] = useSupabaseTable('historical_tournaments', []);

  const isLoading = loadingPlayers || loadingSessions;

  const updateSession = (updatedSession) => {
    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const getPlayersWithStats = () => {
    return playersDB.map(p => {
      const validRatings = (p.ratings || []).map(r => typeof r === 'object' ? r.rating : r);
      const avgRating = validRatings.length > 0 ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length) : 5;
      const ovr = validRatings.length > 0 ? Math.round(avgRating * 10) : 50;
      
      const events = matchEvents.filter(e => e.player.id === p.id);
      const goals = (p.historicalGoals || 0) + events.filter(e => e.type === 'goal').length;
      const assists = (p.historicalAssists || 0) + events.filter(e => e.type === 'assist').length;
      const fouls = (p.historicalFouls || 0) + events.filter(e => e.type === 'foul').length;
      const championships = p.historicalChampionships || 0;

      return { ...p, ovr, stars: Math.round(avgRating / 2), goals, assists, fouls };
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleResetAll = () => {
    if(window.confirm('¿Estás seguro de borrar todos los datos del torneo? Esto no se puede deshacer y borrará los equipos y goles.')) {
      setPlayersDB(MOCK_PLAYERS);
      setSessions([{ id: 1, name: 'Jornada Inaugural', date: new Date().toLocaleDateString(), confirmedIds: [1,2,3,4,5,6,7,8,9,10], status: 'open' }]);
      setActiveSessionId(1);
      setTeams([]);
      setMatchEvents([]);
      setMatches([]);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const allPlayers = getPlayersWithStats();
  // Preserve confirmation order for Titulares (1-24) vs Alternos (25+)
  const confirmedPlayers = activeSession 
    ? activeSession.confirmedIds.map(id => allPlayers.find(p => p.id === id)).filter(p => p) 
    : [];

  const updateConfirmedPlayers = (newIds) => {
    setSessions(sessions.map(s => s.id === activeSessionId ? { ...s, confirmedIds: newIds } : s));
  };

  const updatePlayerRating = (playerId, rating, sessionId) => {
    setPlayersDB(playersDB.map(p => {
      if (p.id === playerId) {
        // Remover calificación anterior de esta misma jornada si existe
        const otherRatings = (p.ratings || []).filter(r => (typeof r === 'object' ? r.sessionId : null) !== sessionId);
        return { ...p, ratings: [...otherRatings, { sessionId, rating }] };
      }
      return p;
    }));
  };

  const [championId, setChampionId] = useState(null);

  const handleFinalizeTournament = () => {
    // 1. Guardar stats en histórico de jugadores
    const champTeam = teams.find(t => t.id === championId);
    
    setPlayersDB(playersDB.map(p => {
      const events = matchEvents.filter(e => e.player.id === p.id);
      const isChampion = champTeam?.players.find(cp => cp.id === p.id);
      
      return {
        ...p,
        historicalGoals: (p.historicalGoals || 0) + events.filter(e => e.type === 'goal').length,
        historicalAssists: (p.historicalAssists || 0) + events.filter(e => e.type === 'assist').length,
        historicalFouls: (p.historicalFouls || 0) + events.filter(e => e.type === 'foul').length,
        historicalChampionships: (p.historicalChampionships || 0) + (isChampion ? 1 : 0)
      };
    }));

    // 2. Guardar snapshot completo del torneo en el historial
    const tournamentRecord = {
      id: Date.now(),
      sessionId: activeSession?.id,
      sessionName: activeSession?.name || 'Jornada',
      date: activeSession?.date || new Date().toLocaleDateString(),
      championTeam: champTeam || null,
      teams: teams,
      matches: matches,
      matchEvents: matchEvents,
      mvpVotes: JSON.parse(localStorage.getItem('ehdj_mvp_votes') || '{}'),
      savedAt: new Date().toISOString()
    };
    setHistoricalTournaments(prev => [tournamentRecord, ...prev]);

    // 3. Cerrar sesión actual
    if (activeSession) {
      updateSession({ ...activeSession, status: 'closed' });
    }

    // 4. Limpiar variables del torneo actual
    setTeams([]);
    setMatches([]);
    setMatchEvents([]);
    setChampionId(null);
    localStorage.removeItem('ehdj_mvp_votes'); // Clean up votes for next time
    localStorage.setItem('ehdj_mvp_closed', 'false'); // Reset voting status

    setActiveSessionId(sessions.find(s => s.status !== 'closed')?.id || 1);
    
    alert('¡Torneo finalizado! El historial ha sido guardado. Ve a "Jornadas" para consultarlo.');
    setRoute('sessions');
  };

  const isPitch = route === 'confirm' || route === 'mvp' || route === 'champion';

  console.log("Loading states:", { loadingPlayers, loadingSessions, authLoading, isLoading });

  // Loading screen mientras carga Supabase
  if (isLoading || authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', gap: '1.5rem' }}>
        <Trophy size={64} color="#ccff00" style={{ filter: 'drop-shadow(0 0 20px #ccff00)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Es Hora de Jugar</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#888' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Conectando con el servidor...
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="night-bg" style={{ minHeight: '100vh' }}><Login /></div>;
  }

  return (
    <div className={isPitch ? 'pitch-bg' : 'night-bg'}>
      <nav className="top-nav" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 0 }}>
        
        {/* ROW 1: Public & Profile */}
        <div className="nav-row-1" style={{ display: 'flex', width: '100%', padding: '1rem', alignItems: 'center', justifyContent: 'space-between', borderBottom: isAdmin ? '1px solid rgba(255,255,255,0.05)' : 'none', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setRoute('confirm')}>
            <Trophy color="var(--accent-neon)" /> EHDJ
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className={`btn ${route === 'confirm' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.5rem 1rem' }} onClick={() => setRoute('confirm')}>
              <CheckSquare size={16} /> Confirmar
            </button>
            <button className={`btn ${route === 'players' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.5rem 1rem' }} onClick={() => setRoute('players')}>
              <UsersIcon size={16} /> Ranking
            </button>
            <button className={`btn ${route === 'history' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.5rem 1rem' }} onClick={() => setRoute('history')}>
              <BarChart3 size={16} /> Historial
            </button>
            <button className={`btn ${route === 'mvp' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.5rem 1rem' }} onClick={() => setRoute('mvp')}>
              <Award size={16} /> Votar MVP
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(204, 255, 0, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid rgba(204, 255, 0, 0.3)' }} title="Usuarios en línea">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ccff00', boxShadow: '0 0 8px #ccff00' }}></div>
              <span style={{ color: '#ccff00', fontSize: '0.85rem', fontWeight: 'bold' }}>{onlineUsers.length}</span>
            </div>
            
            <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.9rem', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-neon)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ color: 'white', fontWeight: 'bold', lineHeight: '1' }}>{profile?.full_name?.split(' ')[0]}</span>
                <span style={{ fontSize: '0.7rem', color: isGlobalAdmin ? 'var(--accent-danger)' : 'var(--accent-neon)', lineHeight: '1', marginTop: '2px' }}>
                  {profile?.role.replace('_', ' ')}
                </span>
              </div>
            </div>

            {isGlobalAdmin && (
              <button className="btn" style={{ padding: '0.5rem', background: 'transparent', color: 'var(--accent-danger)' }} onClick={handleResetAll} title="Reiniciar Todos los Datos">
                <RotateCcw size={20} />
              </button>
            )}
            <button className="btn btn-danger" style={{ padding: '0.5rem', background: 'transparent' }} onClick={handleLogout} title="Salir">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* ROW 2: Admin Tools */}
        {isAdmin && (
          <div className="admin-tools-row" style={{ display: 'flex', width: '100%', padding: '0.75rem 1rem', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-neon)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '1rem', fontWeight: 'bold' }}>Panel Admin:</div>
            
            <button className={`btn ${route === 'sessions' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setRoute('sessions')}>
              <CalendarDays size={14} /> Jornadas
            </button>
            <button className={`btn ${route === 'finances' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setRoute('finances')}>
              <DollarSign size={14} /> Finanzas
            </button>
            
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 0.5rem' }}></div>
            
            <button className={`btn ${route === 'draw' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setRoute('draw')}>
              Sorteo
            </button>
            <button className={`btn ${route === 'tournament' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setRoute('tournament')}>
              <Play size={14} /> Torneo
            </button>
            <button className={`btn ${route === 'match' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setRoute('match')}>
              <Gamepad2 size={14} /> VAR en Vivo
            </button>
            <button className={`btn ${route === 'champion' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setRoute('champion')}>
              <Crown size={14} /> Campeón
            </button>
            <button className={`btn ${route === 'ratings' ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setRoute('ratings')}>
              <Star size={14} /> Notas
            </button>
          </div>
        )}
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
        {route === 'confirm' && <Confirm isAdmin={isAdmin} activeSession={activeSession} confirmedPlayers={confirmedPlayers} allPlayers={allPlayers} updateConfirmedPlayers={updateConfirmedPlayers} setPlayersDB={setPlayersDB} />}
        {route === 'sessions' && isAdmin && <Sessions sessions={sessions} setSessions={setSessions} activeSessionId={activeSessionId} setActiveSessionId={setActiveSessionId} historicalTournaments={historicalTournaments} />}
        {route === 'finances' && <Finances sessions={sessions} setSessions={setSessions} activeSessionId={activeSessionId} allPlayers={playersDB} initialFund={initialFund} setInitialFund={setInitialFund} />}

        {route === 'draw' && isAdmin && <Draw players={confirmedPlayers} teams={teams} setTeams={setTeams} />}
        {route === 'tournament' && isAdmin && <Tournament teams={teams} matches={matches} setMatches={setMatches} matchEvents={matchEvents} />}
        {route === 'match' && isAdmin && <Match teams={teams} matchEvents={matchEvents} setMatchEvents={setMatchEvents} matches={matches} setMatches={setMatches} />}
        {route === 'ratings' && isAdmin && <Ratings players={confirmedPlayers} updatePlayerRating={updatePlayerRating} matchEvents={matchEvents} activeSessionId={activeSessionId} />}
        {route === 'mvp' && <MVP isAdmin={isAdmin} historicalTournaments={historicalTournaments} setHistoricalTournaments={setHistoricalTournaments} />}
        {route === 'champion' && isAdmin && <Champion teams={teams} matches={matches} matchEvents={matchEvents} onFinalize={handleFinalizeTournament} />}
        {route === 'players' && <Players players={allPlayers} />}
        {route === 'history' && <History players={allPlayers} />}
      </main>
    </div>
  );
}

export default App;
