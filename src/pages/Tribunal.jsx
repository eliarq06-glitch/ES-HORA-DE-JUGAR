import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function Tribunal({ players }) {
  // Filter for players that have special statuses we want to highlight
  const bannedPlayers = players.filter(p => p.status === 'banned');
  const occasionalPlayers = players.filter(p => p.status === 'occasional');

  const renderCard = (player, color, Icon, title) => (
    <div key={player.id} style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${color}`, marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `2px solid ${color}`, flexShrink: 0 }}>
        {player.photoUrl ? (
          <img src={player.photoUrl} alt={player.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '2rem', color: color, fontWeight: 'bold' }}>{player.firstName[0]}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: '200px' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {player.firstName} {player.nickname ? `"${player.nickname}"` : ''} {player.lastName}
          <span style={{ background: color, color: 'black', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon size={12} /> {title}
          </span>
        </h3>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', borderLeft: `3px solid ${color}` }}>
          <div style={{ fontSize: '0.75rem', color: 'gray', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Motivo de la Sanción / Estado:</div>
          <div style={{ color: 'white', fontSize: '0.95rem', lineHeight: '1.4' }}>
            {player.statusReason || 'No se ha especificado un motivo.'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="glass-panel-dark" style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 className="title-main" style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '2.2rem', marginBottom: '1rem' }}>
          <ShieldAlert size={36} color="var(--accent-danger)" /> TRIBUNAL DISCIPLINARIO
        </h1>
        <p style={{ color: 'var(--light-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Esta sección es pública. Aquí se muestran los jugadores que se encuentran suspendidos o sancionados por incumplimiento de normas, faltas de respeto, o inasistencias.
        </p>
      </div>

      <div>
        <h2 style={{ color: 'var(--accent-danger)', borderBottom: '1px solid var(--accent-danger)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={24} /> JUGADORES BANEADOS (SUSPENDIDOS)
        </h2>
        {bannedPlayers.length > 0 ? (
          bannedPlayers.map(p => renderCard(p, 'var(--accent-danger)', ShieldAlert, 'BANEADO'))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--light-text-muted)' }}>
            Actualmente no hay jugadores baneados. ¡Excelente comportamiento!
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--accent-warning)', borderBottom: '1px solid var(--accent-warning)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={24} /> JUGADORES SANCIONADOS / OCASIONALES
        </h2>
        {occasionalPlayers.length > 0 ? (
          occasionalPlayers.map(p => renderCard(p, 'var(--accent-warning)', AlertTriangle, 'SANCIONADO / OCASIONAL'))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'var(--light-text-muted)' }}>
            No hay jugadores ocasionales o con sanciones leves en este momento.
          </div>
        )}
      </div>

    </div>
  );
}
