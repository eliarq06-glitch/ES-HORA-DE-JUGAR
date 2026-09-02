import React, { useState } from 'react';
import { Trophy, Activity, Target, Crown, CalendarDays, ChevronDown, ChevronUp, Star } from 'lucide-react';

export default function History({ players, historicalTournaments = [] }) {
  const [activeTab, setActiveTab] = useState('ranking');
  const [expandedId, setExpandedId] = useState(null);

  // players ya incluye historical* + stats del torneo activo (suma)
  const topScorers = [...players].sort((a, b) => b.goals - a.goals).filter(p => p.goals > 0).slice(0, 5);
  const topAssists = [...players].sort((a, b) => b.assists - a.assists).filter(p => p.assists > 0).slice(0, 5);
  const mostFouls = [...players].sort((a, b) => b.fouls - a.fouls).filter(p => p.fouls > 0).slice(0, 5);
  const topChampions = [...players].sort((a, b) => (b.historicalChampionships || 0) - (a.historicalChampionships || 0)).filter(p => (p.historicalChampionships || 0) > 0).slice(0, 5);

  const Leaderboard = ({ title, data, valueKey, valueLabel, icon, color }) => (
    <div className="glass-panel-dark" style={{ flex: 1, minWidth: '300px' }}>
      <h3 className="title-main" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {icon} {title}
      </h3>
      {data.length === 0 ? (
        <div style={{ color: 'var(--dark-text-muted)', textAlign: 'center', padding: '1rem' }}>Sin datos aún</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {data.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: i === 0 ? `rgba(${color}, 0.1)` : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: i === 0 ? `1px solid rgba(${color},0.8)` : '1px solid transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '900', color: i === 0 ? `rgba(${color},1)` : 'var(--dark-text-muted)' }}>{i + 1}</span>
                <div>
                  <div style={{ fontWeight: '600' }}>{p.firstName} "{p.nickname}" {p.lastName}</div>
                  {p.historicalChampionships > 0 && valueKey !== 'historicalChampionships' && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-warning)', marginTop: '2px' }}>👑 x{p.historicalChampionships}</div>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900' }}>{p[valueKey]}</span>
                {valueLabel && <div style={{ fontSize: '0.7rem', color: 'var(--dark-text-muted)' }}>{valueLabel}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="title-main" style={{ color: 'white' }}>Historial General</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button className={`btn ${activeTab === 'ranking' ? 'btn-neon' : 'btn-dark'}`} onClick={() => setActiveTab('ranking')}>
            <Crown size={18} /> Ranking Global
          </button>
          <button className={`btn ${activeTab === 'jornadas' ? 'btn-neon' : 'btn-dark'}`} onClick={() => setActiveTab('jornadas')}>
            <CalendarDays size={18} /> Jornadas Pasadas
          </button>
        </div>
      </div>

      {activeTab === 'ranking' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          <Leaderboard 
            title="Goleadores" 
            data={topScorers} 
            valueKey="goals" 
            valueLabel="goles"
            icon={<Trophy color="var(--accent-warning)" />}
            color="245,158,11"
          />
          <Leaderboard 
            title="Máx. Asistidores" 
            data={topAssists} 
            valueKey="assists"
            valueLabel="asist."
            icon={<Activity color="var(--accent-neon)" />}
            color="204,255,0"
          />
          <Leaderboard 
            title="Más Rudos (Faltas)" 
            data={mostFouls} 
            valueKey="fouls"
            valueLabel="faltas"
            icon={<Target color="var(--accent-danger)" />}
            color="239,68,68"
          />
          {topChampions.length > 0 && (
            <Leaderboard 
              title="Más Campeones" 
              data={topChampions} 
              valueKey="historicalChampionships"
              valueLabel="títulos"
              icon={<Crown color="var(--accent-warning)" />}
              color="245,158,11"
            />
          )}
        </div>
      )}

      {activeTab === 'jornadas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {historicalTournaments.length === 0 ? (
            <div className="glass-panel-light" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--dark-text-muted)' }}>No hay jornadas finalizadas aún.</p>
            </div>
          ) : (
            historicalTournaments.map(t => (
              <div key={t.id} className="glass-panel-dark" style={{ border: '1px solid var(--dark-glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: 'white' }}>{t.sessionName}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-muted)' }}>{t.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {t.championTeam && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-warning)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        <Crown size={16} /> {t.championTeam.name}
                      </div>
                    )}
                    {expandedId === t.id ? <ChevronUp size={20} color="var(--dark-text-muted)" /> : <ChevronDown size={20} color="var(--dark-text-muted)" />}
                  </div>
                </div>

                {expandedId === t.id && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {t.mvpWinner && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--accent-primary)' }}>
                        <Star size={24} color="var(--accent-primary)" />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>MVP DE LA JORNADA</div>
                          <div style={{ fontSize: '1.1rem', color: 'white' }}>{t.mvpWinner.firstName} "{t.mvpWinner.nickname}"</div>
                        </div>
                      </div>
                    )}

                    <h4 style={{ margin: '0 0 1rem 0', color: 'white' }}>Resultados del Torneo</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {t.matches?.filter(m => m.status === 'finished').map(m => {
                        const t1 = t.teams.find(team => team.id === m.team1Id);
                        const t2 = t.teams.find(team => team.id === m.team2Id);
                        const events = t.matchEvents.filter(e => e.matchId === m.id);
                        const s1 = events.filter(e => e.type === 'goal' && e.team === t1?.name).length;
                        const s2 = events.filter(e => e.type === 'goal' && e.team === t2?.name).length;

                        return (
                          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                            <div style={{ flex: 1, textAlign: 'right', fontWeight: s1 > s2 ? 'bold' : 'normal', color: s1 > s2 ? 'var(--accent-neon)' : 'white' }}>{t1?.name}</div>
                            <div style={{ margin: '0 1rem', fontWeight: 'bold' }}>{s1} - {s2}</div>
                            <div style={{ flex: 1, textAlign: 'left', fontWeight: s2 > s1 ? 'bold' : 'normal', color: s2 > s1 ? 'var(--accent-neon)' : 'white' }}>{t2?.name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
