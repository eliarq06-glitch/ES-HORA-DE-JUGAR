import React from 'react';
import { Star, Shield, Zap } from 'lucide-react';
import { useSupabaseConfig } from '../hooks/useSupabase';

export default function Players({ players }) {
  const [sponsorsConfig] = useSupabaseConfig('sponsors', []);
  
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
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li>
            <strong>OVR (Nivel General):</strong> Va del 1 al 99. Sube o baja dependiendo de tu rendimiento en la cancha. Al final de cada jornada cerrada, el administrador asigna estrellas (1 a 5) en base a la votación del equipo. Mientras mejores notas saques consistentemente, más alto será tu OVR.
          </li>
          <li>
            <strong>Goles y Asistencias:</strong> Se suman automáticamente de todas las jornadas oficiales gracias a los registros del VAR en vivo. ¡Cada gol cuenta para la bota de oro!
          </li>
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem', padding: '1rem' }}>
        {playerStats.map((player) => {
          const stars = player.stars || 3;
          let bgImage = '/card_gold.png';
          let textColor = '#4a3810';
          let statsColor = '#3b2511';
          
          if (stars >= 5) {
            bgImage = '/card_legend.png'; // Blanco
            textColor = '#886d34';
            statsColor = '#886d34';
          } else if (stars === 4) {
            bgImage = '/card_toty.png'; // Azul
            textColor = '#c9b065';
            statsColor = '#c9b065';
          } else if (stars === 3) {
            // Negro - We use Silver and darken it heavily via CSS below
            bgImage = '/card_silver.png'; 
            textColor = '#e2e8f0'; 
            statsColor = '#94a3b8';
          } else if (stars === 2) {
            bgImage = '/card_gold.png'; // Dorado
            textColor = '#4a3810';
            statsColor = '#3b2511';
          } else {
            bgImage = '/card_bronze.png'; // Bronce
            textColor = '#3b2511';
            statsColor = '#3b2511';
          }

          // Darken the silver card to make it black
          const extraStyle = stars === 3 ? { filter: 'brightness(0.3) contrast(1.2)' } : {};

          const ovr = Math.round((player.stars / 5) * 99) || 50;
          const pos = player.position || 'MCO';
          
          const base = ovr - 5;
          const getStat = (offset) => Math.min(99, Math.max(1, base + offset));
          
          let pac=base, sho=base, pas=base, dri=base, def=base, phy=base;
          if(pos==='DEL' || pos==='DC' || pos==='EI' || pos==='ED') { pac=getStat(8); sho=getStat(10); dri=getStat(5); def=getStat(-20); }
          else if(pos==='MCO' || pos==='MC' || pos==='MI' || pos==='MD') { pas=getStat(10); dri=getStat(8); sho=getStat(5); def=getStat(-5); }
          else if(pos==='MCD' || pos==='DEF' || pos==='DFC' || pos==='LI' || pos==='LD') { def=getStat(12); phy=getStat(10); pac=getStat(-5); sho=getStat(-15); }
          else if(pos==='POR' || pos==='PO') { pac=getStat(-10); sho=getStat(-20); pas=getStat(5); dri=getStat(15); def=getStat(5); phy=getStat(5); }

          return (
          <div key={player.id} className="fifa-card">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${bgImage})`, backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', zIndex: 1, ...extraStyle }}></div>
            <div className="fifa-card-content">
              
              {/* Top Left OVR & Position */}
              <div className="fifa-card-top-left" style={{ color: textColor }}>
                <div className="fifa-card-ovr-new">{ovr}</div>
                <div className="fifa-card-pos-new">{pos}</div>
                <img src="https://flagcdn.com/w40/ec.png" alt="Ecuador" className="fifa-card-flag" />
              </div>

              {/* Player Image */}
              <div className="fifa-card-image-new">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.firstName} />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: textColor, fontWeight: 'bold' }}>
                    {player.firstName[0]}
                  </div>
                )}
              </div>

              {/* Name & Stats */}
              <div className="fifa-card-bottom-new">
                <div className="fifa-card-name-new" style={{ color: textColor }}>{player.firstName} {player.lastName}</div>
                
                {/* Stats Grid */}
                <div className="fifa-card-stats-grid" style={{ color: statsColor }}>
                  <div className="stat-col">
                    <div className="stat-row"><span>{pac}</span> <span>RIT</span></div>
                    <div className="stat-row"><span>{sho}</span> <span>TIR</span></div>
                    <div className="stat-row"><span>{pas}</span> <span>PAS</span></div>
                  </div>
                  <div className="stat-divider" style={{ background: statsColor }}></div>
                  <div className="stat-col">
                    <div className="stat-row"><span>{dri}</span> <span>REG</span></div>
                    <div className="stat-row"><span>{def}</span> <span>DEF</span></div>
                    <div className="stat-row"><span>{phy}</span> <span>FÍS</span></div>
                  </div>
                </div>

                {/* Real App Stats (Goals, Assists, Camp) at very bottom as a pill or removed? 
                    User asked to replace stats with the FIFA layout. I will add the real app stats as a small pill at the bottom so they don't lose that data. */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '5px', fontSize: '0.65rem', color: textColor, opacity: 0.8, fontWeight: 'bold' }}>
                  <span>{player.historicalGoals || 0} G</span>
                  <span>{player.historicalAssists || 0} A</span>
                  <span>{player.historicalChampionships || 0} 🏆</span>
                </div>

              </div>
              
            </div>
          </div>
          );
        })}
      </div>

      {/* SPONSORS SECTION - VIP BANNER */}
      <div style={{ marginTop: '4rem', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
        
        {/* HEADER VIBRANTE */}
        <div style={{ background: 'linear-gradient(to bottom, #e1c16e 0%, #b39100 100%)', padding: '4rem 2rem 2rem 2rem', textAlign: 'center', color: 'black' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '2px', fontSize: '2.5rem', fontWeight: '900' }}>
            AGRADECIMIENTO ESPECIAL
          </h3>
          <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.5', fontWeight: '500' }}>
            La <span style={{ fontStyle: 'italic' }}>magia</span> de <strong>La Catedral del Fútbol</strong> no sería posible sin el invaluable y generoso apoyo de nuestros patrocinadores. A ustedes, que confían en nuestra visión y hacen posible que el balón siga rodando con <strong>pasión</strong> cada semana: <br/><br/><span style={{ fontSize: '1.4rem', fontWeight: '900', fontStyle: 'italic' }}>¡GRACIAS POR SER PARTE DE NUESTRA FAMILIA!</span>
          </p>
        </div>

        {/* OLA (WAVE) TRANSICIÓN A BLANCO */}
        <div style={{ background: 'white' }}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px', marginTop: '-1px' }}>
            <path fill="#b39100" d="M0,0 C320,100 420,100 720,50 C1020,0 1120,0 1440,100 L1440,0 Z"></path>
          </svg>
        </div>

        {/* CONTENEDOR DE LOGOS */}
        <div style={{ background: 'white', padding: '2rem 2rem 6rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${Math.max(120, 300 - (sponsorsConfig?.length || 0) * 15)}px, 1fr))`, gap: '2.5rem', alignItems: 'center', justifyItems: 'center' }}>
            
            {sponsorsConfig && sponsorsConfig.length > 0 ? sponsorsConfig.map((sponsor, idx) => (
              <div key={sponsor.id || idx} style={{ width: '100%', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', transition: 'transform 0.3s' }} className="sponsor-card">
                <img src={sponsor.url} alt={sponsor.name || 'Auspiciante'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )) : (
              <p style={{ color: 'gray', fontStyle: 'italic', gridColumn: '1 / -1' }}>No hay auspiciantes cargados aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
