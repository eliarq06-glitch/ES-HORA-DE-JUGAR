import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Crown, Upload, Share2, Trophy, Medal, Star, Map, Download } from 'lucide-react';
import TacticalPitch from '../components/TacticalPitch';

export default function Champion({ teams, matches, matchEvents, onFinalize }) {
  const [championPhoto, setChampionPhoto] = useState(null);
  const [showPitch, setShowPitch] = useState(true);

  const finalMatch = matches.find(m => m.isFinal) || (matches.length === 1 ? matches[0] : null);
  const isTournamentActive = matches.length > 0;
  
  if (!isTournamentActive) {
    return <div className="glass-panel-dark" style={{ textAlign: 'center' }}>No hay torneo activo. Ve a la pestaña "Torneo" para generar uno.</div>;
  }

  if (finalMatch && finalMatch.status !== 'finished') {
    return (
      <div className="glass-panel-dark" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Crown size={64} color="var(--dark-text-muted)" style={{ margin: '0 auto 2rem auto' }} />
        <h2 className="title-main" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--dark-text-muted)' }}>La Gran Final Aún No Termina</h2>
        <p style={{ color: 'var(--dark-text-muted)' }}>Ve al VAR en Vivo, termina el partido final y vuelve aquí para coronar al campeón.</p>
      </div>
    );
  }

  const flyerRef = useRef(null);

  const handleDownloadFlyer = async () => {
    if (flyerRef.current) {
      try {
        const canvas = await html2canvas(flyerRef.current, { useCORS: true, backgroundColor: '#0a0a0a' });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.download = `LCDF_Campeon_${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Error generating flyer", err);
        alert("Hubo un error al generar el flyer.");
      }
    }
  };

  const getMatchScore = (matchId, t1Name, t2Name) => {
    const events = matchEvents.filter(e => e.matchId === matchId);
    const score1 = events.filter(e => e.type === 'goal' && e.team === t1Name).length;
    const score2 = events.filter(e => e.type === 'goal' && e.team === t2Name).length;
    const og1 = events.filter(e => e.type === 'own_goal' && e.team === t1Name).length;
    const og2 = events.filter(e => e.type === 'own_goal' && e.team === t2Name).length;
    return { s1: score1 + og2, s2: score2 + og1 };
  };

  let finalT1 = null;
  let finalT2 = null;
  let s1 = 0;
  let s2 = 0;
  let championTeam = null;

  if (finalMatch) {
    finalT1 = teams.find(t => t.id === finalMatch.team1Id);
    finalT2 = teams.find(t => t.id === finalMatch.team2Id);
    if(finalT1 && finalT2) {
      const score = getMatchScore(finalMatch.id, finalT1.name, finalT2.name);
      s1 = score.s1;
      s2 = score.s2;
      if (s1 > s2) championTeam = finalT1;
      else if (s2 > s1) championTeam = finalT2;
    }
  }

  const getTopScorers = () => {
    const goalsByPlayer = {};
    matchEvents.filter(e => e.type === 'goal').forEach(e => {
        const pId = e.player.id;
        if(!goalsByPlayer[pId]) {
            goalsByPlayer[pId] = { player: e.player, goals: 0 };
        }
        goalsByPlayer[pId].goals++;
    });
    return Object.values(goalsByPlayer).sort((a,b) => b.goals - a.goals).slice(0, 5);
  };

  const topScorers = getTopScorers();
  const topScorer = topScorers.length > 0 ? topScorers[0] : null;

  // Encontrar al mejor jugador del equipo campeón por rating Sofascore
  let mvpChampion = null;
  if (championTeam && championTeam.players.length > 0) {
     mvpChampion = [...championTeam.players].sort((a, b) => {
       const calcRating = (p) => {
         const evts = matchEvents.filter(e => e.player.id === p.id);
         const goals = evts.filter(e => e.type === 'goal').length;
         const assists = evts.filter(e => e.type === 'assist').length;
         const yellows = evts.filter(e => e.type === 'yellow_card').length;
         const reds = evts.filter(e => e.type === 'red_card').length;
         const base = (p.ovr || 50) / 10;
         return base + (goals * 1.0) + (assists * 0.5) - (yellows * 0.5) - (reds * 1.0);
       };
       return calcRating(b) - calcRating(a);
     })[0];
  }

  const finalEvents = finalMatch ? matchEvents.filter(e => e.matchId === finalMatch.id) : [];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setChampionPhoto(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const generateWhatsAppText = () => {
    let text = `🏆 *¡TORNEO FINALIZADO!* 🏆\n\n`;
    if(championTeam) {
        text += `👑 *EL CAMPEÓN ES: ${championTeam.name.toUpperCase()}* 👑\n\n`;
        text += `*Resultado de la Gran Final:*\n`;
        text += `⚽ ${finalT1.name} [${s1}] - [${s2}] ${finalT2.name}\n\n`;
        text += `🛡️ *PLANTILLA CAMPEONA:*\n`;
        championTeam.players.forEach(p => {
            const evts = matchEvents.filter(e => e.player.id === p.id);
            const goals = evts.filter(e => e.type === 'goal').length;
            const assists = evts.filter(e => e.type === 'assist').length;
            const base = (p.ovr || 50) / 10;
            const yellows = evts.filter(e => e.type === 'yellow_card').length;
            const reds = evts.filter(e => e.type === 'red_card').length;
            const rating = Math.min(10.0, Math.max(3.0, base + goals - (yellows*0.5) - (reds*1.0) + (assists*0.5))).toFixed(1);
            text += `- ${p.firstName} "${p.nickname}" — ⭐${rating}`;
            if(goals > 0) text += ` ⚽x${goals}`;
            if(assists > 0) text += ` 👟x${assists}`;
            text += `\n`;
        });
        if(mvpChampion) {
            text += `\n⭐ *FIGURA DEL CAMPEÓN:* ${mvpChampion.firstName} "${mvpChampion.nickname}"\n`;
        }
    } else {
        text += `*El torneo aún no tiene un campeón definitivo.*\n\n`;
    }

    if(topScorer) {
        text += `\n🔥 *GOLEADOR DEL TORNEO:* ${topScorer.player.firstName} (${topScorer.goals} Goles)\n`;
    }
    
    text += `\n¡Gracias a todos por jugar! ⚽🔥`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert("¡Texto copiado al portapapeles! Ya puedes pegarlo en WhatsApp.");
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div className="glass-panel-dark" style={{ textAlign: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, rgba(204,255,0,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, pointerEvents: 'none' }}></div>
        
        <Crown size={80} color="var(--accent-neon)" style={{ margin: '0 auto 1.5rem auto', filter: 'drop-shadow(0 0 20px var(--accent-neon))', position: 'relative', zIndex: 1 }} />
        
        <h1 className="title-main" style={{ fontSize: '3rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
          {championTeam ? `¡${championTeam.name.toUpperCase()} CAMPEÓN!` : 'GRAN FINAL'}
        </h1>
        
        {finalT1 && finalT2 && (
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                <span>{finalT1.name}</span>
                <span style={{ fontSize: '2.5rem', color: 'var(--accent-neon)', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 1rem', borderRadius: '12px' }}>{s1} - {s2}</span>
                <span>{finalT2.name}</span>
            </div>
        )}

        {/* Stats Row */}
        {championTeam && (
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {mvpChampion && (
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--accent-neon)' }}>
                <div style={{ color: 'var(--accent-neon)', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '2px' }}>⭐ FIGURA</div>
                <div style={{ fontWeight: 'bold' }}>{mvpChampion.firstName} "{mvpChampion.nickname}"</div>
              </div>
            )}
            {topScorer && (
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--accent-warning)' }}>
                <div style={{ color: 'var(--accent-warning)', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '2px' }}>⚽ GOLEADOR</div>
                <div style={{ fontWeight: 'bold' }}>{topScorer.player.firstName} — {topScorer.goals} Goles</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tactical Pitch del Campeón */}
      {championTeam && (
        <div className="glass-panel-dark" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Map size={20} color="var(--accent-neon)" /> Alineación Campeona
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`btn btn-sm ${showPitch ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowPitch(true)}>Vista Cancha</button>
              <button className={`btn btn-sm ${!showPitch ? 'btn-neon' : 'btn-dark'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setShowPitch(false)}>Foto Grupal</button>
            </div>
          </div>
          
          {showPitch ? (
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <TacticalPitch team={championTeam} events={finalEvents} selectedPlayerId={null} onPlayerClick={null} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              {championPhoto ? (
                <>
                  {/* Contenedor del Flyer */}
                  <div ref={flyerRef} style={{ width: '100%', maxWidth: '700px', background: 'radial-gradient(ellipse at top, #1e3a8a, #020617)', padding: '3rem 2rem', position: 'relative', border: 'none', overflow: 'hidden' }}>
                    
                    {/* Elementos de fondo decorativos */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', zIndex: 0 }}></div>
                    <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '400px', height: '400px', background: championTeam.color || 'var(--accent-neon)', filter: 'blur(150px)', opacity: 0.3, zIndex: 0, borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '400px', height: '400px', background: '#38bdf8', filter: 'blur(150px)', opacity: 0.2, zIndex: 0, borderRadius: '50%' }}></div>

                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      
                      {/* Logo y Header */}
                      <img src="/logo.png" alt="LCDF" style={{ height: '80px', objectFit: 'contain', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
                      
                      <div style={{ fontSize: '0.8rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        LA CANCHA DE LOS FINOS
                      </div>

                      {/* Título CAMPEÓN gigante */}
                      <h2 style={{ 
                        fontFamily: 'var(--font-heading)', 
                        color: 'white', 
                        fontSize: 'clamp(4rem, 10vw, 6.5rem)', 
                        lineHeight: 1,
                        margin: '0 0 0.5rem 0', 
                        textTransform: 'uppercase',
                        textShadow: `0px 4px 0px #0f172a, 0px 8px 15px rgba(0,0,0,0.8), 0px 0px 40px ${championTeam.color || 'var(--accent-neon)'}`
                      }}>
                        CAMPEÓN
                      </h2>
                      
                      <div style={{ fontSize: '1.2rem', color: 'white', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: '900', marginBottom: '2rem', padding: '0.5rem 2rem', background: 'rgba(0,0,0,0.5)', borderRadius: '100px', border: `1px solid ${championTeam.color || 'var(--accent-neon)'}` }}>
                        {championTeam.name}
                      </div>
                      
                      {/* Foto del Equipo */}
                      <div style={{ border: '8px solid white', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem', background: '#000', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', transform: 'rotate(-1deg)', position: 'relative', width: '100%', maxWidth: '550px' }}>
                        <img src={championPhoto} alt="Campeón" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                      </div>
                      
                      {/* Nombres de los Jugadores */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', maxWidth: '90%', marginBottom: '1.5rem' }}>
                        {[...championTeam.players].map((p, idx) => (
                          <React.Fragment key={p.id}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e2e8f0', letterSpacing: '0.5px' }}>
                              {p.firstName} {p.lastName}
                            </span>
                            {idx < championTeam.players.length - 1 && (
                              <span style={{ color: 'var(--accent-neon)', fontWeight: 'bold' }}>•</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Footer */}
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', width: '80%', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                        <span>FECHA: {new Date().toLocaleDateString()}</span>
                        <span>RESULTADO FINAL: {s1} - {s2}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones del Flyer */}
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-dark" style={{ border: '1px solid var(--accent-neon)', color: 'var(--accent-neon)' }} onClick={handleDownloadFlyer}>
                      <Download size={18} style={{ marginRight: '8px' }} /> Descargar Flyer
                    </button>
                    <button className="btn" style={{ background: 'transparent', color: 'var(--dark-text-muted)', fontSize: '0.9rem' }} onClick={() => setChampionPhoto(null)}>
                      Cambiar Foto
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ width: '100%', maxWidth: '400px', border: '2px dashed rgba(255,255,255,0.2)', padding: '3rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center' }} onClick={() => document.getElementById('photoUpload').click()}>
                  <Upload size={32} color="var(--dark-text-muted)" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: 'var(--dark-text-muted)' }}>Sube una foto del equipo campeón para armar el Flyer</p>
                  <input type="file" id="photoUpload" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Plantilla con Ratings */}
      {championTeam && (
        <div className="glass-panel-dark" style={{ marginBottom: '2rem' }}>
          <h3 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Trophy size={20} color="var(--accent-neon)" /> Plantilla Campeona — Calificaciones Finales
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {[...championTeam.players].map(p => {
              const evts = finalEvents.filter(e => e.player.id === p.id);
              const goals = evts.filter(e => e.type === 'goal').length;
              const assists = evts.filter(e => e.type === 'assist').length;
              const yellows = evts.filter(e => e.type === 'yellow_card').length;
              const reds = evts.filter(e => e.type === 'red_card').length;
              const base = (p.ovr || 50) / 10;
              const rating = Math.min(10.0, Math.max(3.0, base + (goals * 1.0) + (assists * 0.5) - (yellows * 0.5) - (reds * 1.0))).toFixed(1);
              let ratingColor = '#f59e0b';
              if (rating >= 7.5) ratingColor = '#10b981';
              if (rating < 6.0) ratingColor = '#ef4444';
              
              return (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: `1px solid ${ratingColor}30` }}>
                  <div style={{ background: ratingColor, color: 'white', borderRadius: '10px', padding: '4px 10px', fontWeight: '900', fontSize: '1.1rem', minWidth: '44px', textAlign: 'center' }}>{rating}</div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{p.firstName} "{p.nickname}"</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--dark-text-muted)' }}>
                      {goals > 0 && `⚽${goals} `}{assists > 0 && `👟${assists} `}{yellows > 0 && `🟨${yellows} `}{reds > 0 && `🟥${reds}`}
                      {goals === 0 && assists === 0 && yellows === 0 && reds === 0 && 'Sin eventos'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="glass-panel-dark">
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-neon" style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }} onClick={generateWhatsAppText}>
            <Share2 size={20} /> Compartir (Copiar Texto)
          </button>
          <button className="btn btn-danger" style={{ padding: '1rem 2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--accent-danger)', color: 'black' }} onClick={() => {
            if(window.confirm('¿Estás seguro de Finalizar el Torneo? Esto guardará las estadísticas en el Historial General y borrará el progreso para empezar una nueva jornada.')) {
              onFinalize();
            }
          }}>
            <Crown size={20} /> Cerrar Jornada y Guardar Historial
          </button>
        </div>
      </div>
    </div>
  );
}
