import React, { useState, useEffect } from 'react';
import { Trophy, Play, CheckCircle2, ChevronRight, Activity, CalendarDays, BarChart3, PlusCircle } from 'lucide-react';

export default function Tournament({ activeSession, teams, matches, setMatches, matchEvents, updateSession }) {
  const [manualTeam1, setManualTeam1] = useState('');
  const [manualTeam2, setManualTeam2] = useState('');

  const generateFixture = () => {
    if (teams.length < 2) {
      alert("Necesitas al menos 2 equipos para jugar un torneo.");
      return;
    }
    
    let newMatches = [];
    let matchCounter = 1;

    // Round Robin (Todos contra todos)
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        newMatches.push({
          id: Math.floor(Math.random() * 10000000) + matchCounter++,
          team1Id: teams[i].id,
          team2Id: teams[j].id,
          status: 'pending', // pending, active, finished
          isFinal: false
        });
      }
    }

    // Add a pending Final Match if there are > 2 teams
    if (teams.length > 2) {
      newMatches.push({
        id: Math.floor(Math.random() * 10000000) + matchCounter,
        team1Id: null, // To be defined
        team2Id: null, // To be defined
        status: 'pending',
        isFinal: true
      });
    }

    setMatches(newMatches);
  };

  const handleAddManualMatch = () => {
    if (!manualTeam1 || !manualTeam2 || manualTeam1 === manualTeam2) {
      alert("Selecciona dos equipos diferentes.");
      return;
    }
    const newMatch = {
      id: Math.floor(Math.random() * 10000000),
      team1Id: parseInt(manualTeam1),
      team2Id: parseInt(manualTeam2),
      status: 'pending',
      isFinal: false
    };
    setMatches([...matches, newMatch]);
    setManualTeam1('');
    setManualTeam2('');
  };

  const clearFixture = () => {
    if(window.confirm('¿Estás seguro de borrar el torneo? Esto eliminará los partidos programados, pero los eventos del VAR (goles) seguirán existiendo en el historial.')) {
      setMatches([]);
    }
  };

  // Calcula el score de un partido específico basándose en matchEvents
  const getMatchScore = (matchId, t1Name, t2Name) => {
    const events = matchEvents.filter(e => e.matchId === matchId);
    const score1 = events.filter(e => e.type === 'goal' && e.team === t1Name).length;
    const score2 = events.filter(e => e.type === 'goal' && e.team === t2Name).length;
    
    // Autogoles (OG) suman al equipo contrario
    const og1 = events.filter(e => e.type === 'own_goal' && e.team === t1Name).length;
    const og2 = events.filter(e => e.type === 'own_goal' && e.team === t2Name).length;

    return { s1: score1 + og2, s2: score2 + og1 };
  };

  // Calcular la tabla de posiciones
  const calculateStandings = () => {
    let standings = teams.map(t => ({
      ...t, pts: 0, pld: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0
    }));

    matches.filter(m => !m.isFinal && m.status === 'finished').forEach(m => {
      const t1 = teams.find(t => t.id === m.team1Id);
      const t2 = teams.find(t => t.id === m.team2Id);
      if(!t1 || !t2) return;

      const { s1, s2 } = getMatchScore(m.id, t1.name, t2.name);
      
      const s1Data = standings.find(s => s.id === t1.id);
      const s2Data = standings.find(s => s.id === t2.id);

      s1Data.pld++; s2Data.pld++;
      s1Data.gf += s1; s1Data.ga += s2; s1Data.gd = s1Data.gf - s1Data.ga;
      s2Data.gf += s2; s2Data.ga += s1; s2Data.gd = s2Data.gf - s2Data.ga;

      if (s1 > s2) { s1Data.pts += 3; s1Data.win++; s2Data.loss++; }
      else if (s2 > s1) { s2Data.pts += 3; s2Data.win++; s1Data.loss++; }
      else { s1Data.pts += 1; s2Data.pts += 1; s1Data.draw++; s2Data.draw++; }
    });

    // Sort by Points, then GD, then GF. (Head-to-head is complex, simplified for now)
    return standings.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  };

  const setFinalTeams = () => {
    const st = calculateStandings();
    if(st.length >= 2) {
      setMatches(matches.map(m => m.isFinal ? { ...m, team1Id: st[0].id, team2Id: st[1].id } : m));
    }
  };

  const standings = calculateStandings();

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      
      {matches.length === 0 ? (
        <div className="glass-panel-light" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Trophy size={64} color="var(--accent-neon)" style={{ marginBottom: '2rem' }} />
          <h2 className="title-main" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Generar Torneo</h2>
          <p className="subtitle" style={{ color: 'var(--dark-text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            Los equipos ya están listos. Genera automáticamente un torneo todos contra todos, o arma tus propios partidos manualmente.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '400px', margin: '0 auto' }}>
            <button className="btn btn-neon" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }} onClick={generateFixture}>
              <CalendarDays size={24} /> GENERAR TODOS CONTRA TODOS
            </button>

            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'white' }}>Crear Partido Manual</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select className="input-dark" value={manualTeam1} onChange={e => setManualTeam1(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Equipo 1...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <span style={{ color: 'var(--dark-text-muted)', alignSelf: 'center', fontWeight: 'bold' }}>VS</span>
                <select className="input-dark" value={manualTeam2} onChange={e => setManualTeam2(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Equipo 2...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button className="btn btn-dark" style={{ width: '100%', border: '1px solid var(--accent-neon)', color: 'var(--accent-neon)' }} onClick={handleAddManualMatch}>
                <PlusCircle size={18} /> Agregar Partido
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Standing Table */}
          <div className="glass-panel-dark" style={{ height: 'fit-content' }}>
            <h2 className="title-main" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 color="var(--accent-neon)" /> Tabla de Posiciones
            </h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'var(--dark-text-muted)', fontSize: '0.8rem' }}>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'left' }}>EQUIPO</th>
                    <th style={{ padding: '1rem 0.5rem' }}>PJ</th>
                    <th style={{ padding: '1rem 0.5rem' }}>G</th>
                    <th style={{ padding: '1rem 0.5rem' }}>E</th>
                    <th style={{ padding: '1rem 0.5rem' }}>P</th>
                    <th style={{ padding: '1rem 0.5rem' }}>GD</th>
                    <th style={{ padding: '1rem 0.5rem', color: 'var(--accent-neon)' }}>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i < 2 && teams.length > 2 ? 'rgba(204,255,0,0.05)' : 'transparent' }}>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'left', fontWeight: 'bold' }}>
                        <span style={{ color: i < 2 && teams.length > 2 ? 'var(--accent-neon)' : 'inherit', marginRight: '8px' }}>{i+1}.</span> 
                        {t.name}
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: 'var(--dark-text-muted)' }}>{t.pld}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{t.win}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{t.draw}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{t.loss}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '900', color: 'var(--accent-neon)', fontSize: '1.2rem' }}>{t.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {teams.length > 2 && (
              <button className="btn btn-dark" style={{ width: '100%', marginTop: '1.5rem', border: '1px solid var(--accent-neon)' }} onClick={setFinalTeams}>
                Actualizar Finalistas (Top 2)
              </button>
            )}
            
            <button className="btn" style={{ width: '100%', marginTop: '1rem', background: 'transparent', color: 'var(--accent-danger)' }} onClick={clearFixture}>
              Eliminar Fixture
            </button>
          </div>

          {/* Fixture */}
          <div className="glass-panel-dark" style={{ height: 'fit-content' }}>
            <h2 className="title-main" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Play color="var(--accent-warning)" /> Partidos (Fixture)
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matches.map((m, i) => {
                const t1 = teams.find(t => t.id === m.team1Id);
                const t2 = teams.find(t => t.id === m.team2Id);
                
                const { s1, s2 } = (t1 && t2) ? getMatchScore(m.id, t1.name, t2.name) : {s1:0,s2:0};

                return (
                  <div key={m.id} style={{ 
                    padding: '1rem', 
                    background: m.status === 'active' ? 'rgba(204,255,0,0.1)' : 'rgba(255,255,255,0.05)', 
                    borderRadius: '12px',
                    borderLeft: m.isFinal ? '4px solid var(--accent-warning)' : (m.status === 'active' ? '4px solid var(--accent-neon)' : '4px solid transparent')
                  }}>
                    {m.isFinal && <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-warning)', textTransform: 'uppercase', marginBottom: '0.5rem', textAlign: 'center' }}>GRAN FINAL</div>}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: m.status === 'finished' && s1 > s2 ? 'var(--accent-neon)' : 'white' }}>
                        {t1 ? t1.name : '?'}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {m.status !== 'pending' ? (
                          <>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.8rem', borderRadius: '8px' }}>{s1}</div>
                            <span style={{ color: 'var(--dark-text-muted)' }}>-</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.8rem', borderRadius: '8px' }}>{s2}</div>
                          </>
                        ) : (
                          <div style={{ fontSize: '0.9rem', color: 'var(--dark-text-muted)', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>VS</div>
                        )}
                      </div>

                      <div style={{ flex: 1, textAlign: 'left', fontWeight: 'bold', fontSize: '1.2rem', color: m.status === 'finished' && s2 > s1 ? 'var(--accent-neon)' : 'white' }}>
                        {t2 ? t2.name : '?'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                      {m.status === 'pending' && <span style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)', textTransform: 'uppercase' }}>Pendiente</span>}
                      {m.status === 'active' && <span style={{ fontSize: '0.8rem', color: 'var(--accent-neon)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Activity size={14} /> En Vivo (Ve al VAR)</span>}
                      {m.status === 'finished' && <span style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', textTransform: 'uppercase' }}>Finalizado</span>}
                    </div>

                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'white', textAlign: 'center' }}>Agregar Partido Extra</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select className="input-dark" value={manualTeam1} onChange={e => setManualTeam1(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Equipo 1...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <span style={{ color: 'var(--dark-text-muted)', alignSelf: 'center', fontWeight: 'bold' }}>VS</span>
                <select className="input-dark" value={manualTeam2} onChange={e => setManualTeam2(e.target.value)} style={{ flex: 1 }}>
                  <option value="">Equipo 2...</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button className="btn btn-dark" style={{ width: '100%', border: '1px solid var(--accent-neon)', color: 'var(--accent-neon)' }} onClick={handleAddManualMatch}>
                <PlusCircle size={18} /> Agregar Partido
              </button>
            </div>

            {/* Hint */}
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--dark-text-muted)', textAlign: 'center' }}>
              Ve a la pestaña "VAR en Vivo" para iniciar, pausar y registrar goles en cada partido.
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
