import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Check, Trophy, ChevronDown, ChevronUp, Crown, Activity, Star, Lock, Unlock } from 'lucide-react';

export default function Sessions({ sessions, setSessions, activeSessionId, setActiveSessionId, historicalTournaments = [], teams = [] }) {
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newSessionName || !newSessionDate) return;
    const newSession = {
      id: Date.now(),
      name: newSessionName,
      date: newSessionDate,
      confirmedIds: [],
      status: 'open'
    };
    setSessions([newSession, ...sessions]);
    setNewSessionName('');
    setNewSessionDate('');
  };

  const handleDelete = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(sessions.find(s => s.id !== id)?.id || null);
  };

  const getMatchScore = (matchId, t1Name, t2Name, matchEvents) => {
    const events = matchEvents.filter(e => e.matchId === matchId);
    const s1 = events.filter(e => e.type === 'goal' && e.team === t1Name).length +
                events.filter(e => e.type === 'own_goal' && e.team === t2Name).length;
    const s2 = events.filter(e => e.type === 'goal' && e.team === t2Name).length +
                events.filter(e => e.type === 'own_goal' && e.team === t1Name).length;
    return { s1, s2 };
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px' }}>
      {/* Crear nueva jornada */}
      <div className="glass-panel-dark" style={{ marginBottom: '2rem' }}>
        <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar color="var(--accent-neon)" /> Gestión de Jornadas
        </h2>
        
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <input className="input-dark" style={{ flex: 1, minWidth: '200px' }} placeholder="Nombre (ej. Revancha Sábado)" value={newSessionName} onChange={(e) => setNewSessionName(e.target.value)} required />
          <input type="date" className="input-dark" value={newSessionDate} onChange={(e) => setNewSessionDate(e.target.value)} required />
          <button type="submit" className="btn btn-neon"><Plus size={20} /> Crear Jornada</button>
        </form>
      </div>

      {/* Lista de Jornadas Abiertas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        {sessions.filter(s => s.status !== 'closed').map(s => {
          const hasDrawnTeams = activeSessionId === s.id && teams && teams.length > 0;
          return (
          <div key={s.id} className="glass-panel-dark" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: activeSessionId === s.id ? '2px solid var(--accent-neon)' : '1px solid var(--dark-glass-border)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'white' }}>{s.name}</h3>
              <p style={{ margin: '4px 0 0 0', color: 'var(--dark-text-muted)' }}>{s.date} • {s.confirmedIds.length} Confirmados {s.status === 'locked' && <span style={{color: 'var(--accent-danger)'}}>(CERRADA)</span>}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {activeSessionId !== s.id && (
                <button className="btn btn-dark" style={{ border: '1px solid var(--accent-neon)', color: 'var(--accent-neon)' }} onClick={() => setActiveSessionId(s.id)}>
                  Activar
                </button>
              )}
              {activeSessionId === s.id && (
                <button className="btn" style={{ background: 'var(--accent-neon)', color: 'black', fontWeight: 'bold' }} onClick={() => setActiveSessionId(null)}>
                  <Check size={18} style={{ marginRight: '5px' }} /> Activa (Ocultar)
                </button>
              )}
              <button 
                className="btn btn-dark" 
                style={{ border: s.status === 'locked' ? '1px solid var(--accent-danger)' : '1px solid var(--accent-warning)', color: s.status === 'locked' ? 'var(--accent-danger)' : 'var(--accent-warning)', padding: '0.75rem', opacity: (s.status === 'locked' && hasDrawnTeams) ? 0.5 : 1, cursor: (s.status === 'locked' && hasDrawnTeams) ? 'not-allowed' : 'pointer' }} 
                onClick={() => {
                  if (s.status === 'locked' && hasDrawnTeams) {
                    alert('No puedes reabrir esta convocatoria porque ya se han sorteado los equipos para jugar.');
                    return;
                  }
                  setSessions(sessions.map(sess => sess.id === s.id ? { ...sess, status: sess.status === 'locked' ? 'open' : 'locked' } : sess));
                }}
                title={s.status === 'locked' ? (hasDrawnTeams ? "Sorteo iniciado, no se puede reabrir" : "Abrir Inscripciones") : "Cerrar Convocatoria (Bloquear)"}
              >
                {s.status === 'locked' ? <Lock size={18} /> : <Unlock size={18} />}
              </button>
              <button className="btn btn-danger" style={{ padding: '0.75rem' }} onClick={() => handleDelete(s.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )})}
      </div>

      {/* Historial de Jornadas Cerradas */}
      {historicalTournaments.length > 0 && (
        <div>
          <h2 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'white' }}>
            <Trophy color="var(--accent-warning)" /> Historial de Torneos Pasados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {historicalTournaments.map(record => {
              const isExpanded = expandedHistoryId === record.id;

              // Calcular top scorer
              const goalsByPlayer = {};
              (record.matchEvents || []).filter(e => e.type === 'goal').forEach(e => {
                const pid = e.player.id;
                if (!goalsByPlayer[pid]) goalsByPlayer[pid] = { player: e.player, goals: 0 };
                goalsByPlayer[pid].goals++;
              });
              const topScorer = Object.values(goalsByPlayer).sort((a, b) => b.goals - a.goals)[0];

              // MVP por votos
              const votes = record.mvpVotes || {};
              const voteCount = {};
              Object.values(votes).forEach(pid => { voteCount[pid] = (voteCount[pid] || 0) + 1; });
              const topVotedId = Object.keys(voteCount).sort((a, b) => voteCount[b] - voteCount[a])[0];
              const topVotedPlayer = record.matchEvents ? record.matchEvents.find(e => String(e.player.id) === String(topVotedId))?.player : null;

              return (
                <div key={record.id} className="glass-panel-dark" style={{ border: '1px solid var(--dark-glass-border)', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedHistoryId(isExpanded ? null : record.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Crown size={32} color="var(--accent-warning)" />
                      <div>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{record.sessionName}</h3>
                        <p style={{ margin: '2px 0 0 0', color: 'var(--dark-text-muted)', fontSize: '0.85rem' }}>
                          {record.date} {record.championTeam && `• 🏆 ${record.championTeam.name}`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {topScorer && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>
                          ⚽ {topScorer.player.firstName} ({topScorer.goals})
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={20} color="var(--dark-text-muted)" /> : <ChevronDown size={20} color="var(--dark-text-muted)" />}
                    </div>
                  </div>

                  {/* Detalles expandidos */}
                  {isExpanded && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                      {/* Stats rápidas */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {record.championTeam && (
                          <div style={{ background: 'rgba(204,255,0,0.1)', border: '1px solid var(--accent-neon)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--accent-neon)', fontSize: '0.7rem', fontWeight: 'bold' }}>CAMPEÓN</div>
                            <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{record.championTeam.name}</div>
                          </div>
                        )}
                        {topScorer && (
                          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid var(--accent-warning)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--accent-warning)', fontSize: '0.7rem', fontWeight: 'bold' }}>GOLEADOR</div>
                            <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{topScorer.player.firstName}</div>
                            <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.8rem' }}>{topScorer.goals} goles</div>
                          </div>
                        )}
                        {topVotedPlayer && (
                          <div style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid var(--accent-primary)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: 'bold' }}>MVP VOTADO</div>
                            <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{topVotedPlayer.firstName}</div>
                            <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.8rem' }}>{voteCount[topVotedId]} votos</div>
                          </div>
                        )}
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                          <div style={{ color: 'var(--dark-text-muted)', fontSize: '0.7rem', fontWeight: 'bold' }}>PARTIDOS</div>
                          <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '1.5rem' }}>{(record.matches || []).length}</div>
                        </div>
                      </div>

                      {/* Resultados */}
                      <h4 style={{ color: 'var(--accent-neon)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>📋 Resultados</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {(record.matches || []).map(m => {
                          const t1 = (record.teams || []).find(t => t.id === m.team1Id);
                          const t2 = (record.teams || []).find(t => t.id === m.team2Id);
                          if (!t1 || !t2) return null;
                          const { s1, s2 } = getMatchScore(m.id, t1.name, t2.name, record.matchEvents || []);
                          const isWon1 = s1 > s2;
                          const isWon2 = s2 > s1;
                          return (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                              <span style={{ fontWeight: isWon1 ? 'bold' : 'normal', color: isWon1 ? 'var(--accent-neon)' : 'inherit', flex: 1, textAlign: 'right' }}>{t1.name}</span>
                              <span style={{ background: 'rgba(0,0,0,0.4)', color: 'white', padding: '2px 12px', borderRadius: '6px', margin: '0 0.75rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{s1} - {s2}</span>
                              <span style={{ fontWeight: isWon2 ? 'bold' : 'normal', color: isWon2 ? 'var(--accent-neon)' : 'inherit', flex: 1 }}>{t2.name}</span>
                              {m.isFinal && <span style={{ background: 'var(--accent-warning)', color: 'black', fontSize: '0.6rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>FINAL</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Plantilla campeona */}
                      {record.championTeam && (
                        <>
                          <h4 style={{ color: 'var(--accent-neon)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>🏆 Plantilla Campeona</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {(record.championTeam.players || []).map(p => (
                              <div key={p.id} style={{ background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)', borderRadius: '20px', padding: '4px 12px', fontSize: '0.85rem' }}>
                                {p.firstName} "{p.nickname}"
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
