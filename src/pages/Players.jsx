import React from 'react';
import { Star, Shield, Zap } from 'lucide-react';

export default function Players({ players }) {
  // Stats are already calculated and included in the players array
  const playerStats = players;

  return (
    <div style={{ width: '100%', maxWidth: '1200px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="title-main" style={{ color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>PLANTILLA OFICIAL</h2>
        <p className="subtitle" style={{ color: 'var(--accent-neon)' }}>Temporada Actual</p>
      </div>

      <div className="glass-panel-dark" style={{ marginBottom: '3rem', padding: '1.5rem', border: '1px solid rgba(204, 255, 0, 0.2)' }}>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-neon)' }}>
          <Zap size={20} /> ¿Cómo funciona el Ranking?
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--light-text)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li>
            <strong>OVR (Nivel General):</strong> Va del 1 al 99. Sube o baja dependiendo de tu rendimiento en la cancha. Al final de cada jornada cerrada, el administrador asigna estrellas (1 a 5) en base a la votación del equipo. Mientras mejores notas saques consistentemente, más alto será tu OVR.
          </li>
          <li>
            <strong>Goles y Asistencias:</strong> Se suman automáticamente de todas las jornadas oficiales gracias a los registros del VAR en vivo. ¡Cada gol cuenta para la bota de oro!
          </li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
        {playerStats.map(player => (
          <div key={player.id} style={{ 
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2rem 1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Top decorative shapes */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(204, 255, 0, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
            
            {/* Rating Shield */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-warning)', lineHeight: 1 }}>
                 {Math.round((player.stars / 5) * 99)}
               </span>
               <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--dark-text-muted)' }}>OVR</span>
            </div>

            {/* Avatar */}
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-neon), var(--accent-warning))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '4rem', fontWeight: '900', color: '#000',
              marginBottom: '1rem',
              border: '4px solid #0f172a',
              boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
            }}>
              {player.firstName.charAt(0)}
            </div>
            
            {/* Name */}
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
              {player.firstName}
            </h3>
            {player.nickname && <h4 style={{ color: 'var(--accent-neon)', fontSize: '1rem', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '0.5rem' }}>"{player.nickname}"</h4>}
            <h4 style={{ color: 'var(--dark-text-muted)', fontSize: '1rem', textTransform: 'uppercase', marginBottom: '1.5rem' }}>{player.lastName}</h4>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{player.goals}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--dark-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Goles</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{player.assists}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--dark-text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Asistencias</div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
