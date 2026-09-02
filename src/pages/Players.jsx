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
            bgImage = '/card_legend.png';
            textColor = '#886d34';
            statsColor = '#886d34';
          } else if (stars === 4) {
            bgImage = '/card_toty.png';
            textColor = '#c9b065';
            statsColor = '#c9b065';
          } else if (stars === 3) {
            bgImage = '/card_gold.png';
            textColor = '#4a3810';
            statsColor = '#3b2511';
          } else {
            bgImage = '/card_bronze.png';
            textColor = '#3b2511';
            statsColor = '#3b2511';
          }

          return (
          <div key={player.id} className="fifa-card" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="fifa-card-content">
              
              <div className="fifa-card-top">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="fifa-card-ovr" style={{ color: textColor }}>{Math.round((player.stars / 5) * 99) || 50}</div>
                  <div className="fifa-card-pos" style={{ color: textColor }}>OVR</div>
                </div>
              </div>

              <div className="fifa-card-image">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.firstName} />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: textColor, fontWeight: 'bold', marginBottom: '1rem' }}>
                    {player.firstName[0]}
                  </div>
                )}
              </div>

              <div className="fifa-card-bottom">
                <div className="fifa-card-name" style={{ color: textColor }}>{player.firstName} {player.lastName}</div>
                {player.historicalChampionships > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '8px' }}>
                    {Array.from({ length: Math.min(player.historicalChampionships, 5) }).map((_, i) => (
                      <Star key={i} size={12} fill={textColor} color={textColor} />
                    ))}
                  </div>
                )}
                <div className="fifa-card-stats" style={{ color: statsColor }}>
                  <div className="fifa-card-stat">
                    <span>{player.historicalGoals || 0}</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>GLS</span>
                  </div>
                  <div className="fifa-card-stat">
                    <span>{player.historicalAssists || 0}</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>AST</span>
                  </div>
                  <div className="fifa-card-stat">
                    <span>{player.historicalChampionships || 0}</span>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>CAMP</span>
                  </div>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* CUADRADOS (160x160) */}
            <div style={{ width: '160px', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
              <img src="/sponsors/fittown.jpg" alt="FitTown" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ width: '160px', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
              <img src="/sponsors/parrilla.jpg" alt="La Parrilla Burger" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ width: '160px', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
              <img src="/sponsors/bochiphone.jpg" alt="Bochi Phone" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ width: '160px', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.15)' }}>
              <img src="/sponsors/agrolvera.jpg" alt="Agrolvera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* RECTÁNGULOS (340x160) */}
            <div style={{ width: '100%', maxWidth: '340px', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.15)', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/sponsors/odorisio.jpg" alt="Constructora Odorisio" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(0.9)' }} />
            </div>
            
            <div style={{ width: '100%', maxWidth: '340px', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.15)', backgroundColor: '#f3f6f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/sponsors/eliarq.png" alt="ELIARQ" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ width: '100%', maxWidth: '340px', height: '160px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.15)', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/sponsors/graficok.jpg" alt="Graficok" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.1)' }} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
