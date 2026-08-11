import React from 'react';
import { Trophy, Activity, Target, Crown } from 'lucide-react';

export default function History({ players }) {
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
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="title-main" style={{ color: 'white' }}>Estadísticas Históricas</h2>
        <p className="subtitle" style={{ color: 'var(--dark-text-muted)' }}>Récords acumulados de todas las jornadas</p>
      </div>

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
    </div>
  );
}
