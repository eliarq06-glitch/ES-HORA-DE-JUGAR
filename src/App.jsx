import React, { useState } from 'react';
import { Trophy, LogOut, CheckSquare, Gamepad2, Award, Users as UsersIcon, BarChart3, CalendarDays, Star, Play, Crown, RotateCcw, UserPlus } from 'lucide-react';
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
import AdminPlayers from './pages/AdminPlayers';
import Landing from './pages/Landing';
import { DollarSign, Loader, Activity, Shield } from 'lucide-react';
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
  const [hasPassedLanding, setHasPassedLanding] = useState(false);
  
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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)', gap: '1.5rem' }}>
        <img src="/logo.png" alt="La Catedral del Fútbol" style={{ width: '150px', animation: 'pulse 1.5s ease-in-out infinite', filter: 'drop-shadow(0 0 20px rgba(232,185,49,0.3))' }} />
        <div style={{ color: 'var(--accent-warning)', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '2px' }}>LA CATEDRAL DEL FÚTBOL</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--light-text-muted)', fontWeight: 'bold' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Conectando con el servidor...
        </div>
      </div>
    );
  }

  if (!user) {
    if (!hasPassedLanding) {
      return <Landing onEnter={() => setHasPassedLanding(true)} />;
    }
    return <div className="night-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Login allPlayers={allPlayers} setPlayersDB={setPlayersDB} /></div>;
  }

  return (
    <div className={`app-container ${isPitch ? 'pitch-bg' : 'night-bg'}`}>
      
      {/* MOBILE TOP BAR (Only visible on mobile) */}
      <div className="mobile-top-bar">
        <div className="logo" onClick={() => setRoute('confirm')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <img src="/logo.png" alt="LCDF Logo" style={{ height: '45px', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-neon)', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '1px' }}>LCDF</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-neon)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div className="logo" onClick={() => setRoute('confirm')} style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="LCDF Logo" style={{ height: '70px', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-neon)', fontSize: '3rem', fontWeight: '900', letterSpacing: '2px' }}>LCDF</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Menu Principal</div>
          
          <button className={`btn ${route === 'confirm' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setRoute('confirm')}>
            <CheckSquare size={18} /> Confirmar
          </button>
          <button className={`btn ${route === 'players' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setRoute('players')}>
            <UsersIcon size={18} /> Ranking
          </button>
          <button className={`btn ${route === 'history' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setRoute('history')}>
            <BarChart3 size={18} /> Historial
          </button>
          <button className={`btn ${route === 'mvp' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setRoute('mvp')}>
            <Award size={18} /> Votar MVP
          </button>

          {isAdmin && (
            <>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-neon)', textTransform: 'uppercase', margin: '1.5rem 0 0.5rem 0', fontWeight: 'bold' }}>Panel Admin</div>
              <button className={`btn ${route === 'admin-players' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setRoute('admin-players')}>
                <UserPlus size={16} /> Jugadores
              </button>
              <button className={`btn ${route === 'sessions' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setRoute('sessions')}>
                <CalendarDays size={16} /> Jornadas
              </button>
              <button className={`btn ${route === 'finances' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setRoute('finances')}>
                <DollarSign size={16} /> Finanzas
              </button>
              <button className={`btn ${route === 'draw' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setRoute('draw')}>
                <Play size={16} /> Sorteo
              </button>
              <button className={`btn ${route === 'tournament' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setRoute('tournament')}>
                <Play size={16} /> Torneo
              </button>
              <button className={`btn ${route === 'match' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setRoute('match')}>
                <Gamepad2 size={16} /> VAR en Vivo
              </button>
              <button className={`btn ${route === 'champion' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setRoute('champion')}>
                <Crown size={16} /> Campeón
              </button>
              <button className={`btn ${route === 'ratings' ? 'btn-neon' : 'btn-dark'}`} style={{ justifyContent: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setRoute('ratings')}>
                <Star size={16} /> Notas
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--dark-glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-neon)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
              {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontWeight: 'bold', lineHeight: '1' }}>{profile?.full_name?.split(' ')[0]}</span>
              <span style={{ fontSize: '0.75rem', color: isGlobalAdmin ? 'var(--accent-danger)' : 'var(--accent-neon)', marginTop: '4px' }}>
                {profile?.role.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }} onClick={handleLogout}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      <main className="main-content" style={{ padding: '2rem 1rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {route === 'confirm' && <Confirm isAdmin={isAdmin} user={user} activeSession={activeSession} confirmedPlayers={confirmedPlayers} allPlayers={allPlayers} updateConfirmedPlayers={updateConfirmedPlayers} setPlayersDB={setPlayersDB} />}
          {route === 'admin-players' && isAdmin && <AdminPlayers allPlayers={playersDB} setPlayersDB={setPlayersDB} isGlobalAdmin={isGlobalAdmin} />}
          {route === 'sessions' && isAdmin && <Sessions sessions={sessions} setSessions={setSessions} activeSessionId={activeSessionId} setActiveSessionId={setActiveSessionId} historicalTournaments={historicalTournaments} teams={teams} />}
          {route === 'finances' && <Finances sessions={sessions} setSessions={setSessions} activeSessionId={activeSessionId} allPlayers={playersDB} initialFund={initialFund} setInitialFund={setInitialFund} />}
          {route === 'draw' && isAdmin && <Draw players={confirmedPlayers} activeSession={activeSession} teams={teams} setTeams={setTeams} />}
          {route === 'tournament' && isAdmin && <Tournament activeSession={activeSession} teams={teams} setTeams={setTeams} matchEvents={matchEvents} setMatchEvents={setMatchEvents} matches={matches} setMatches={setMatches} updateSession={updateSession} />}
          {route === 'match' && isAdmin && <Match activeSession={activeSession} teams={teams} matchEvents={matchEvents} setMatchEvents={setMatchEvents} updateSession={updateSession} matches={matches} setMatches={setMatches} />}
          {route === 'champion' && isAdmin && <Champion teams={teams} matches={matches} matchEvents={matchEvents} onFinalize={handleFinalizeTournament} />}
          {route === 'ratings' && isAdmin && <Ratings players={confirmedPlayers} updatePlayerRating={updatePlayerRating} matchEvents={matchEvents} activeSessionId={activeSessionId} />}
          {route === 'players' && <Players players={allPlayers} />}
          {route === 'history' && <History players={allPlayers} />}
          {route === 'mvp' && <MVP isAdmin={isAdmin} historicalTournaments={historicalTournaments} setHistoricalTournaments={setHistoricalTournaments} />}
          {route === 'admin-menu' && isAdmin && (
            <div className="glass-panel-dark" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
              <h2 className="title-main" style={{ color: 'var(--accent-danger)', textAlign: 'center', marginBottom: '1rem' }}><Shield size={28} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Panel de Control</h2>
              <button className="btn btn-dark" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'flex-start' }} onClick={() => setRoute('sessions')}><CalendarDays size={24} /> Jornadas y Convocatorias</button>
              <button className="btn btn-dark" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'flex-start' }} onClick={() => setRoute('admin-players')}><UserPlus size={24} /> Gestionar Jugadores</button>
              <button className="btn btn-dark" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'flex-start' }} onClick={() => setRoute('finances')}><DollarSign size={24} /> Finanzas y Pagos</button>
              <button className="btn btn-dark" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'flex-start' }} onClick={() => setRoute('draw')}><Play size={24} /> Sorteo de Equipos</button>
              <button className="btn btn-dark" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'flex-start' }} onClick={() => setRoute('tournament')}><Play size={24} /> Gestión de Torneo</button>
              <button className="btn btn-dark" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'flex-start' }} onClick={() => setRoute('match')}><Gamepad2 size={24} /> VAR en Vivo (Anotar Goles)</button>
              <button className="btn btn-dark" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'flex-start' }} onClick={() => setRoute('champion')}><Crown size={24} /> Elegir Campeón</button>
              <button className="btn btn-dark" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'flex-start' }} onClick={() => setRoute('ratings')}><Star size={24} /> Poner Notas (Ranking)</button>
              <button className="btn btn-danger" style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center', marginTop: '2rem' }} onClick={handleLogout}><LogOut size={24} /> Cerrar Sesión</button>
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="bottom-nav">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: route === 'confirm' ? 'var(--accent-neon)' : 'var(--dark-text-muted)', cursor: 'pointer' }} onClick={() => setRoute('confirm')}>
          <CheckSquare size={24} />
          <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Confirmar</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: route === 'players' ? 'var(--accent-neon)' : 'var(--dark-text-muted)', cursor: 'pointer' }} onClick={() => setRoute('players')}>
          <UsersIcon size={24} />
          <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Ranking</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: route === 'history' ? 'var(--accent-neon)' : 'var(--dark-text-muted)', cursor: 'pointer' }} onClick={() => setRoute('history')}>
          <BarChart3 size={24} />
          <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Historial</span>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: route === 'admin-menu' ? 'var(--accent-danger)' : 'var(--dark-text-muted)', cursor: 'pointer' }} onClick={() => setRoute('admin-menu')}>
            <Shield size={24} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Admin</span>
          </div>
        )}
      </nav>
    </div>
  );
}

export default App;
